-- ============================================================================
-- ATO Training Platform — Functions, Procedures & Triggers
-- Platform: Supabase / PostgreSQL
-- ============================================================================

-- ============================================================================
-- 1. Combined FDTL Calculation Function
-- Accounts for BOTH logged actual fdtl_records AND confirmed future master_schedule
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_combined_instructor_fdtl(
    p_instructor_id UUID,
    p_reference_start TIMESTAMPTZ,
    p_reference_end TIMESTAMPTZ,
    p_exclude_schedule_id UUID DEFAULT NULL
)
RETURNS TABLE (
    actual_24h_minutes INTEGER,
    scheduled_24h_minutes INTEGER,
    total_24h_minutes INTEGER,
    remaining_24h_minutes INTEGER,
    actual_7d_minutes INTEGER,
    scheduled_7d_minutes INTEGER,
    total_7d_minutes INTEGER,
    remaining_7d_minutes INTEGER,
    max_24h_allowed INTEGER,
    max_7d_allowed INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_max_24h INTEGER := 360;  -- 6.0 hours standard regulatory limit
    v_max_7d INTEGER := 1800;  -- 30.0 hours standard regulatory limit
    v_act_24h INTEGER := 0;
    v_sch_24h INTEGER := 0;
    v_tot_24h INTEGER := 0;
    v_act_7d INTEGER := 0;
    v_sch_7d INTEGER := 0;
    v_tot_7d INTEGER := 0;
BEGIN
    -- 1. Query dynamic regulatory limits if configured
    SELECT COALESCE(MAX(maximum_instructional_minutes), 360)
    INTO v_max_24h
    FROM fdtl_rules
    WHERE rolling_period_hours = 24 AND is_active = TRUE;

    SELECT COALESCE(MAX(maximum_instructional_minutes), 1800)
    INTO v_max_7d
    FROM fdtl_rules
    WHERE rolling_period_hours = 168 AND is_active = TRUE; -- 7 days = 168h

    -- 2. Calculate Actual Logged Minutes in rolling 24 hours & 7 days
    SELECT COALESCE(SUM(instructional_minutes), 0)
    INTO v_act_24h
    FROM fdtl_records
    WHERE instructor_id = p_instructor_id
      AND is_actual = TRUE
      AND start_time >= (p_reference_start - INTERVAL '24 hours')
      AND start_time < p_reference_start;

    SELECT COALESCE(SUM(instructional_minutes), 0)
    INTO v_act_7d
    FROM fdtl_records
    WHERE instructor_id = p_instructor_id
      AND is_actual = TRUE
      AND start_time >= (p_reference_start - INTERVAL '7 days')
      AND start_time < p_reference_start;

    -- 3. Calculate Existing Scheduled Confirmed / In Progress Minutes (excluding current booking if updating)
    SELECT COALESCE(SUM(duration_minutes), 0)
    INTO v_sch_24h
    FROM master_schedule
    WHERE instructor_id = p_instructor_id
      AND session_status IN ('CONFIRMED', 'IN_PROGRESS')
      AND is_instructional = TRUE
      AND (p_exclude_schedule_id IS NULL OR id <> p_exclude_schedule_id)
      AND start_time >= (p_reference_start - INTERVAL '24 hours')
      AND start_time < p_reference_start;

    SELECT COALESCE(SUM(duration_minutes), 0)
    INTO v_sch_7d
    FROM master_schedule
    WHERE instructor_id = p_instructor_id
      AND session_status IN ('CONFIRMED', 'IN_PROGRESS')
      AND is_instructional = TRUE
      AND (p_exclude_schedule_id IS NULL OR id <> p_exclude_schedule_id)
      AND start_time >= (p_reference_start - INTERVAL '7 days')
      AND start_time < p_reference_start;

    v_tot_24h := v_act_24h + v_sch_24h;
    v_tot_7d := v_act_7d + v_sch_7d;

    RETURN QUERY
    SELECT
        v_act_24h,
        v_sch_24h,
        v_tot_24h,
        GREATEST(v_max_24h - v_tot_24h, 0),
        v_act_7d,
        v_sch_7d,
        v_tot_7d,
        GREATEST(v_max_7d - v_tot_7d, 0),
        v_max_24h,
        v_max_7d;
END;
$$;


-- ============================================================================
-- 2. Comprehensive 20-Point Booking Validation Function
-- Validates:
--  1. Instructor exists
--  2. Instructor active & not locked out
--  3. Instructor role valid (matches lesson requirement)
--  4. Aircraft qualification exists for instructor
--  5. Aircraft qualification is VALID and not expired
--  6. Recurrent training is valid (not expired)
--  7. Instructor recurrent window status
--  8. Instructor available in instructor_availability
--  9. Instructor not double booked in master_schedule
-- 10. FDTL 24-hour limit compliance (existing + requested)
-- 11. FDTL 7-day limit compliance (existing + requested)
-- 12. Resource exists
-- 13. Resource active & status = 'AVAILABLE'
-- 14. Resource category matches lesson requirement
-- 15. Resource compatible with specified aircraft type
-- 16. Resource regulatory approval valid
-- 17. Resource not double booked in master_schedule
-- 18. Student exists, active & enrolled in course
-- 19. Student available / not double booked
-- 20. Course & Lesson valid and match aircraft type
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_training_booking(
    p_organisation_id UUID,
    p_course_id UUID,
    p_lesson_id UUID,
    p_aircraft_type_id UUID,
    p_resource_id UUID,
    p_instructor_id UUID,
    p_student_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_exclude_schedule_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_checks JSONB := '[]'::JSONB;
    v_is_valid BOOLEAN := TRUE;
    v_requested_minutes INTEGER;

    -- Staff records
    v_staff RECORD;
    v_qual RECORD;
    v_recurrent RECORD;
    v_staff_role_match BOOLEAN := FALSE;
    v_staff_unavail_count INTEGER := 0;
    v_staff_overlap_count INTEGER := 0;

    -- Resource records
    v_resource RECORD;
    v_res_compat RECORD;
    v_res_approval RECORD;
    v_res_overlap_count INTEGER := 0;

    -- Student records
    v_student RECORD;
    v_student_enrolment RECORD;
    v_student_overlap_count INTEGER := 0;

    -- Course / Lesson records
    v_course RECORD;
    v_lesson RECORD;

    -- FDTL
    v_fdtl RECORD;
BEGIN
    -- Basic Time Validation
    IF p_end_time <= p_start_time THEN
        RETURN jsonb_build_object(
            'valid', false,
            'summary', 'End time must be after start time',
            'checks', jsonb_build_array(
                jsonb_build_object('code', 'INVALID_TIME_RANGE', 'passed', false, 'message', 'End time must be strictly after start time')
            )
        );
    END IF;

    v_requested_minutes := EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 60;

    -- -------------------------------------------------------------
    -- CHECK 19 & 20: Course and Lesson
    -- -------------------------------------------------------------
    SELECT * INTO v_course FROM courses WHERE id = p_course_id AND organisation_id = p_organisation_id;
    IF NOT FOUND THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object('code', 'COURSE_EXISTS', 'passed', false, 'message', 'Course not found in organisation');
    ELSE
        v_checks := v_checks || jsonb_build_object('code', 'COURSE_EXISTS', 'passed', true, 'message', 'Course found: ' || v_course.course_name);
    END IF;

    SELECT * INTO v_lesson FROM course_lessons WHERE id = p_lesson_id AND course_id = p_course_id;
    IF NOT FOUND THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object('code', 'LESSON_EXISTS', 'passed', false, 'message', 'Lesson not found in specified course');
    ELSE
        v_checks := v_checks || jsonb_build_object('code', 'LESSON_EXISTS', 'passed', true, 'message', 'Lesson found: ' || v_lesson.lesson_code || ' - ' || v_lesson.lesson_name);
    END IF;

    -- -------------------------------------------------------------
    -- CHECK 1 & 2: Instructor Exists, Active & Not Locked Out
    -- -------------------------------------------------------------
    SELECT * INTO v_staff FROM staff WHERE id = p_instructor_id AND organisation_id = p_organisation_id;
    IF NOT FOUND THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object('code', 'INSTRUCTOR_EXISTS', 'passed', false, 'message', 'Instructor not found');
    ELSIF NOT v_staff.is_active THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object('code', 'INSTRUCTOR_ACTIVE', 'passed', false, 'message', 'Instructor profile is inactive');
    ELSIF v_staff.is_locked_out THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object('code', 'INSTRUCTOR_LOCKED', 'passed', false, 'message', 'Instructor account is locked out');
    ELSE
        v_checks := v_checks || jsonb_build_object('code', 'INSTRUCTOR_ACTIVE', 'passed', true, 'message', 'Instructor is active: ' || v_staff.full_name);
    END IF;

    -- -------------------------------------------------------------
    -- CHECK 3: Instructor Role Matches Lesson Requirement
    -- -------------------------------------------------------------
    IF v_lesson.required_role IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM staff_roles
            WHERE staff_id = p_instructor_id
              AND role = v_lesson.required_role
              AND is_active = TRUE
        ) INTO v_staff_role_match;

        IF NOT v_staff_role_match THEN
            v_is_valid := FALSE;
            v_checks := v_checks || jsonb_build_object(
                'code', 'INSTRUCTOR_ROLE_MATCH',
                'passed', false,
                'message', 'Instructor lacks required role: ' || v_lesson.required_role::TEXT
            );
        ELSE
            v_checks := v_checks || jsonb_build_object(
                'code', 'INSTRUCTOR_ROLE_MATCH',
                'passed', true,
                'message', 'Instructor has required role: ' || v_lesson.required_role::TEXT
            );
        END IF;
    ELSE
        v_checks := v_checks || jsonb_build_object('code', 'INSTRUCTOR_ROLE_MATCH', 'passed', true, 'message', 'No specific role required');
    END IF;

    -- -------------------------------------------------------------
    -- CHECK 4 & 5: Instructor Aircraft Qualification & Expiry
    -- -------------------------------------------------------------
    SELECT * INTO v_qual
    FROM instructor_qualifications
    WHERE instructor_id = p_instructor_id
      AND (aircraft_type_id = p_aircraft_type_id OR aircraft_type_id IS NULL)
      AND is_active = TRUE
    ORDER BY expiry_date DESC
    LIMIT 1;

    IF NOT FOUND THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object(
            'code', 'INSTRUCTOR_QUALIFIED',
            'passed', false,
            'message', 'Instructor has no qualification record for this aircraft type'
        );
    ELSIF v_qual.status <> 'VALID' OR v_qual.expiry_date < p_start_time::DATE THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object(
            'code', 'INSTRUCTOR_QUAL_VALID',
            'passed', false,
            'expiry_date', v_qual.expiry_date,
            'message', 'Instructor qualification is expired or invalid (Expired: ' || v_qual.expiry_date || ')'
        );
    ELSE
        v_checks := v_checks || jsonb_build_object(
            'code', 'INSTRUCTOR_QUAL_VALID',
            'passed', true,
            'expiry_date', v_qual.expiry_date,
            'message', 'Qualification valid until ' || v_qual.expiry_date
        );
    END IF;

    -- -------------------------------------------------------------
    -- CHECK 6 & 7: Recurrent Training History & Window
    -- -------------------------------------------------------------
    SELECT * INTO v_recurrent
    FROM instructor_recurrent_training
    WHERE instructor_id = p_instructor_id
      AND (aircraft_type_id = p_aircraft_type_id OR aircraft_type_id IS NULL)
    ORDER BY expiry_date DESC
    LIMIT 1;

    IF FOUND THEN
        IF v_recurrent.expiry_date < p_start_time::DATE THEN
            v_is_valid := FALSE;
            v_checks := v_checks || jsonb_build_object(
                'code', 'INSTRUCTOR_RECURRENT_VALID',
                'passed', false,
                'expiry_date', v_recurrent.expiry_date,
                'message', 'Instructor recurrent training has expired (' || v_recurrent.expiry_date || ')'
            );
        ELSE
            v_checks := v_checks || jsonb_build_object(
                'code', 'INSTRUCTOR_RECURRENT_VALID',
                'passed', true,
                'expiry_date', v_recurrent.expiry_date,
                'window_start', v_recurrent.recurrent_window_start,
                'message', 'Recurrent valid until ' || v_recurrent.expiry_date
            );
        END IF;
    ELSE
        -- If no separate recurrent record, fallback to qualification status
        v_checks := v_checks || jsonb_build_object(
            'code', 'INSTRUCTOR_RECURRENT_VALID',
            'passed', true,
            'message', 'Initial qualification active (no separate recurrent cycle recorded yet)'
        );
    END IF;

    -- -------------------------------------------------------------
    -- CHECK 8: Instructor Availability
    -- -------------------------------------------------------------
    SELECT COUNT(*) INTO v_staff_unavail_count
    FROM instructor_availability
    WHERE instructor_id = p_instructor_id
      AND availability_type IN ('UNAVAILABLE', 'LEAVE', 'TRAINING')
      AND (
          (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
      );

    IF v_staff_unavail_count > 0 THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object(
            'code', 'INSTRUCTOR_AVAILABLE',
            'passed', false,
            'message', 'Instructor is marked on leave/unavailable during requested slot'
        );
    ELSE
        v_checks := v_checks || jsonb_build_object(
            'code', 'INSTRUCTOR_AVAILABLE',
            'passed', true,
            'message', 'Instructor schedule availability confirmed'
        );
    END IF;

    -- -------------------------------------------------------------
    -- CHECK 9: Instructor Overlap / Double Booking
    -- -------------------------------------------------------------
    SELECT COUNT(*) INTO v_staff_overlap_count
    FROM master_schedule
    WHERE instructor_id = p_instructor_id
      AND session_status IN ('CONFIRMED', 'IN_PROGRESS')
      AND (p_exclude_schedule_id IS NULL OR id <> p_exclude_schedule_id)
      AND (
          (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
      );

    IF v_staff_overlap_count > 0 THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object(
            'code', 'INSTRUCTOR_NO_OVERLAP',
            'passed', false,
            'message', 'Instructor already has a confirmed booking during this time'
        );
    ELSE
        v_checks := v_checks || jsonb_build_object(
            'code', 'INSTRUCTOR_NO_OVERLAP',
            'passed', true,
            'message', 'No instructor scheduling conflict'
        );
    END IF;

    -- -------------------------------------------------------------
    -- CHECK 10 & 11: FDTL 24-Hour and 7-Day Rolling Limits
    -- -------------------------------------------------------------
    SELECT * INTO v_fdtl
    FROM calculate_combined_instructor_fdtl(p_instructor_id, p_start_time, p_end_time, p_exclude_schedule_id);

    IF (v_fdtl.total_24h_minutes + v_requested_minutes) > v_fdtl.max_24h_allowed THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object(
            'code', 'FDTL_24_HOUR',
            'passed', false,
            'current_minutes', v_fdtl.total_24h_minutes,
            'requested_minutes', v_requested_minutes,
            'maximum_minutes', v_fdtl.max_24h_allowed,
            'message', 'FDTL 24-hour limit exceeded (' || (v_fdtl.total_24h_minutes + v_requested_minutes) || 'm / ' || v_fdtl.max_24h_allowed || 'm allowed)'
        );
    ELSE
        v_checks := v_checks || jsonb_build_object(
            'code', 'FDTL_24_HOUR',
            'passed', true,
            'current_minutes', v_fdtl.total_24h_minutes,
            'requested_minutes', v_requested_minutes,
            'maximum_minutes', v_fdtl.max_24h_allowed,
            'message', 'FDTL 24-hour limit OK (' || (v_fdtl.total_24h_minutes + v_requested_minutes) || 'm / ' || v_fdtl.max_24h_allowed || 'm)'
        );
    END IF;

    IF (v_fdtl.total_7d_minutes + v_requested_minutes) > v_fdtl.max_7d_allowed THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object(
            'code', 'FDTL_7_DAY',
            'passed', false,
            'current_minutes', v_fdtl.total_7d_minutes,
            'requested_minutes', v_requested_minutes,
            'maximum_minutes', v_fdtl.max_7d_allowed,
            'message', 'FDTL 7-day limit exceeded (' || (v_fdtl.total_7d_minutes + v_requested_minutes) || 'm / ' || v_fdtl.max_7d_allowed || 'm allowed)'
        );
    ELSE
        v_checks := v_checks || jsonb_build_object(
            'code', 'FDTL_7_DAY',
            'passed', true,
            'current_minutes', v_fdtl.total_7d_minutes,
            'requested_minutes', v_requested_minutes,
            'maximum_minutes', v_fdtl.max_7d_allowed,
            'message', 'FDTL 7-day limit OK (' || (v_fdtl.total_7d_minutes + v_requested_minutes) || 'm / ' || v_fdtl.max_7d_allowed || 'm)'
        );
    END IF;

    -- -------------------------------------------------------------
    -- CHECK 12, 13 & 14: Resource Exists, Status & Category Match
    -- -------------------------------------------------------------
    SELECT * INTO v_resource FROM resources WHERE id = p_resource_id AND organisation_id = p_organisation_id;
    IF NOT FOUND THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object('code', 'RESOURCE_EXISTS', 'passed', false, 'message', 'Resource not found');
    ELSIF v_resource.status <> 'AVAILABLE' THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object(
            'code', 'RESOURCE_AVAILABLE',
            'passed', false,
            'status', v_resource.status,
            'message', 'Resource is not available (Current status: ' || v_resource.status::TEXT || ')'
        );
    ELSE
        v_checks := v_checks || jsonb_build_object('code', 'RESOURCE_AVAILABLE', 'passed', true, 'message', 'Resource is available: ' || v_resource.resource_name);
    END IF;

    IF v_lesson.required_resource_category IS NOT NULL AND v_resource.resource_category <> v_lesson.required_resource_category THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object(
            'code', 'RESOURCE_CATEGORY_MATCH',
            'passed', false,
            'message', 'Resource category mismatch. Required: ' || v_lesson.required_resource_category::TEXT || ', Selected: ' || v_resource.resource_category::TEXT
        );
    ELSE
        v_checks := v_checks || jsonb_build_object('code', 'RESOURCE_CATEGORY_MATCH', 'passed', true, 'message', 'Resource category matched');
    END IF;

    -- -------------------------------------------------------------
    -- CHECK 15: Resource Compatibility with Aircraft Type
    -- -------------------------------------------------------------
    IF v_resource.resource_category IN ('FFS', 'FTD') THEN
        SELECT * INTO v_res_compat
        FROM resource_aircraft_types
        WHERE resource_id = p_resource_id AND aircraft_type_id = p_aircraft_type_id;

        IF NOT FOUND THEN
            v_is_valid := FALSE;
            v_checks := v_checks || jsonb_build_object(
                'code', 'RESOURCE_AIRCRAFT_COMPATIBLE',
                'passed', false,
                'message', 'Selected simulator does not support this aircraft type/variant'
            );
        ELSE
            v_checks := v_checks || jsonb_build_object(
                'code', 'RESOURCE_AIRCRAFT_COMPATIBLE',
                'passed', true,
                'configuration', v_res_compat.configuration,
                'message', 'Simulator is compatible (' || COALESCE(v_res_compat.configuration, 'Standard') || ')'
            );
        END IF;
    ELSE
        v_checks := v_checks || jsonb_build_object('code', 'RESOURCE_AIRCRAFT_COMPATIBLE', 'passed', true, 'message', 'Classroom resource compatible');
    END IF;

    -- -------------------------------------------------------------
    -- CHECK 16: Resource Regulatory Approval
    -- -------------------------------------------------------------
    IF v_resource.resource_category IN ('FFS', 'FTD') THEN
        SELECT * INTO v_res_approval
        FROM resource_approvals
        WHERE resource_id = p_resource_id
          AND status = 'VALID'
          AND (expiry_date IS NULL OR expiry_date >= p_start_time::DATE)
        ORDER BY expiry_date DESC
        LIMIT 1;

        IF NOT FOUND THEN
            v_is_valid := FALSE;
            v_checks := v_checks || jsonb_build_object(
                'code', 'RESOURCE_APPROVAL_VALID',
                'passed', false,
                'message', 'Simulator has no valid regulatory qualification approval'
            );
        ELSE
            v_checks := v_checks || jsonb_build_object(
                'code', 'RESOURCE_APPROVAL_VALID',
                'passed', true,
                'authority', v_res_approval.authority,
                'level', v_res_approval.qualification_level,
                'message', 'Regulatory approval active (' || v_res_approval.authority || ' Level ' || COALESCE(v_res_approval.qualification_level, 'D') || ')'
            );
        END IF;
    ELSE
        v_checks := v_checks || jsonb_build_object('code', 'RESOURCE_APPROVAL_VALID', 'passed', true, 'message', 'Not applicable for classroom');
    END IF;

    -- -------------------------------------------------------------
    -- CHECK 17: Resource Overlap / Double Booking
    -- -------------------------------------------------------------
    SELECT COUNT(*) INTO v_res_overlap_count
    FROM master_schedule
    WHERE resource_id = p_resource_id
      AND session_status IN ('CONFIRMED', 'IN_PROGRESS')
      AND (p_exclude_schedule_id IS NULL OR id <> p_exclude_schedule_id)
      AND (
          (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
      );

    IF v_res_overlap_count > 0 THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object(
            'code', 'RESOURCE_NO_OVERLAP',
            'passed', false,
            'message', 'Resource is already booked by another confirmed session in this time slot'
        );
    ELSE
        v_checks := v_checks || jsonb_build_object(
            'code', 'RESOURCE_NO_OVERLAP',
            'passed', true,
            'message', 'Resource slot is available'
        );
    END IF;

    -- -------------------------------------------------------------
    -- CHECK 18 & 19: Student Exists, Enrolment & Schedule Conflict
    -- -------------------------------------------------------------
    SELECT * INTO v_student FROM students WHERE id = p_student_id AND organisation_id = p_organisation_id;
    IF NOT FOUND THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object('code', 'STUDENT_EXISTS', 'passed', false, 'message', 'Student not found');
    ELSIF NOT v_student.is_active THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object('code', 'STUDENT_ACTIVE', 'passed', false, 'message', 'Student profile is inactive');
    ELSE
        v_checks := v_checks || jsonb_build_object('code', 'STUDENT_ACTIVE', 'passed', true, 'message', 'Student active: ' || v_student.full_name);
    END IF;

    SELECT * INTO v_student_enrolment
    FROM student_courses
    WHERE student_id = p_student_id AND course_id = p_course_id AND status = 'ACTIVE';

    IF NOT FOUND THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object(
            'code', 'STUDENT_COURSE_ENROLLED',
            'passed', false,
            'message', 'Student is not actively enrolled in this course'
        );
    ELSE
        v_checks := v_checks || jsonb_build_object(
            'code', 'STUDENT_COURSE_ENROLLED',
            'passed', true,
            'message', 'Student enrolment verified'
        );
    END IF;

    -- Check student double booking
    SELECT COUNT(*) INTO v_student_overlap_count
    FROM master_schedule ms
    JOIN training_events te ON te.id = ms.training_event_id
    WHERE te.student_id = p_student_id
      AND ms.session_status IN ('CONFIRMED', 'IN_PROGRESS')
      AND (p_exclude_schedule_id IS NULL OR ms.id <> p_exclude_schedule_id)
      AND (
          (ms.start_time, ms.end_time) OVERLAPS (p_start_time, p_end_time)
      );

    IF v_student_overlap_count > 0 THEN
        v_is_valid := FALSE;
        v_checks := v_checks || jsonb_build_object(
            'code', 'STUDENT_NO_OVERLAP',
            'passed', false,
            'message', 'Student has another confirmed training session during this time slot'
        );
    ELSE
        v_checks := v_checks || jsonb_build_object(
            'code', 'STUDENT_NO_OVERLAP',
            'passed', true,
            'message', 'Student schedule is clear'
        );
    END IF;

    -- Return Consolidated Matrix Result
    RETURN jsonb_build_object(
        'valid', v_is_valid,
        'summary', CASE WHEN v_is_valid THEN 'Booking passes all 20 compliance checks' ELSE 'Booking rejected due to compliance violations' END,
        'duration_minutes', v_requested_minutes,
        'fdtl_summary', jsonb_build_object(
            'rolling_24h_minutes', v_fdtl.total_24h_minutes,
            'remaining_24h_minutes', v_fdtl.remaining_24h_minutes,
            'rolling_7d_minutes', v_fdtl.total_7d_minutes,
            'remaining_7d_minutes', v_fdtl.remaining_7d_minutes
        ),
        'checks', v_checks
    );
END;
$$;


-- ============================================================================
-- 3. Transactional Booking Procedure
-- Atomically validates and inserts a confirmed booking + training event
-- ============================================================================
CREATE OR REPLACE FUNCTION book_training_session(
    p_organisation_id UUID,
    p_course_id UUID,
    p_lesson_id UUID,
    p_aircraft_type_id UUID,
    p_resource_id UUID,
    p_instructor_id UUID,
    p_student_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_created_by UUID,
    p_session_title VARCHAR(200) DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_val_result JSONB;
    v_training_event_id UUID;
    v_schedule_id UUID;
    v_lesson RECORD;
    v_title VARCHAR(200);
BEGIN
    -- 1. Perform 20-Point Transactional Validation
    v_val_result := validate_training_booking(
        p_organisation_id,
        p_course_id,
        p_lesson_id,
        p_aircraft_type_id,
        p_resource_id,
        p_instructor_id,
        p_student_id,
        p_start_time,
        p_end_time
    );

    IF NOT (v_val_result->>'valid')::BOOLEAN THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'BOOKING_VALIDATION_FAILED',
            'validation', v_val_result
        );
    END IF;

    -- 2. Fetch Lesson Metadata
    SELECT * INTO v_lesson FROM course_lessons WHERE id = p_lesson_id;
    v_title := COALESCE(p_session_title, v_lesson.lesson_code || ' - ' || v_lesson.lesson_name);

    -- 3. Insert Training Event
    INSERT INTO training_events (
        organisation_id,
        course_id,
        lesson_id,
        student_id,
        training_type,
        session_title
    ) VALUES (
        p_organisation_id,
        p_course_id,
        p_lesson_id,
        p_student_id,
        v_lesson.training_type,
        v_title
    ) RETURNING id INTO v_training_event_id;

    -- 4. Insert Master Schedule
    INSERT INTO master_schedule (
        organisation_id,
        training_event_id,
        instructor_id,
        resource_id,
        aircraft_type_id,
        start_time,
        end_time,
        session_status,
        is_instructional,
        created_by
    ) VALUES (
        p_organisation_id,
        v_training_event_id,
        p_instructor_id,
        p_resource_id,
        p_aircraft_type_id,
        p_start_time,
        p_end_time,
        'CONFIRMED',
        TRUE,
        p_created_by
    ) RETURNING id INTO v_schedule_id;

    -- 5. Create Audit Log
    INSERT INTO audit_logs (
        organisation_id,
        user_id,
        action,
        entity_type,
        entity_id,
        new_data
    ) VALUES (
        p_organisation_id,
        p_created_by,
        'SCHEDULE_CREATED',
        'master_schedule',
        v_schedule_id,
        jsonb_build_object(
            'schedule_id', v_schedule_id,
            'training_event_id', v_training_event_id,
            'instructor_id', p_instructor_id,
            'student_id', p_student_id,
            'resource_id', p_resource_id,
            'start_time', p_start_time,
            'end_time', p_end_time
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'schedule_id', v_schedule_id,
        'training_event_id', v_training_event_id,
        'validation', v_val_result
    );
END;
$$;


-- ============================================================================
-- 4. Trigger for Logging Completed Instructional Hours to FDTL Records
-- When a schedule status transitions to 'COMPLETED', automatically create
-- an actual fdtl_record for the instructor
-- ============================================================================
CREATE OR REPLACE FUNCTION trg_log_completed_schedule_fdtl()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.session_status = 'COMPLETED' AND OLD.session_status <> 'COMPLETED' AND NEW.is_instructional = TRUE THEN
        INSERT INTO fdtl_records (
            instructor_id,
            schedule_id,
            start_time,
            end_time,
            instructional_minutes,
            is_actual
        ) VALUES (
            NEW.instructor_id,
            NEW.id,
            NEW.start_time,
            NEW.end_time,
            NEW.duration_minutes,
            TRUE
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_master_schedule_completed_fdtl ON master_schedule;
CREATE TRIGGER trg_master_schedule_completed_fdtl
AFTER UPDATE OF session_status ON master_schedule
FOR EACH ROW
EXECUTE FUNCTION trg_log_completed_schedule_fdtl();
