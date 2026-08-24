-- ============================================================================
-- ATO Training Platform — Foundational PostgreSQL Database Schema
-- Platform: Supabase / PostgreSQL
-- ============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. ENUM Types
CREATE TYPE resource_category AS ENUM (
    'FFS',
    'FTD',
    'CLASSROOM'
);

CREATE TYPE resource_status AS ENUM (
    'AVAILABLE',
    'UNDER_MAINTENANCE',
    'OUT_OF_SERVICE',
    'QUALIFICATION',
    'BLOCKED',
    'RETIRED'
);

CREATE TYPE instructor_role AS ENUM (
    'GI',
    'SFI',
    'SFE',
    'SME'
);

CREATE TYPE employment_type AS ENUM (
    'FULL_TIME',
    'CONTRACT',
    'SME'
);

CREATE TYPE qualification_status AS ENUM (
    'VALID',
    'EXPIRING',
    'EXPIRED',
    'REFRESHER_REQUIRED',
    'SUSPENDED'
);

CREATE TYPE schedule_status AS ENUM (
    'DRAFT',
    'PROPOSED',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
    'RESCHEDULED'
);

CREATE TYPE training_type AS ENUM (
    'GROUND',
    'FTD',
    'FFS',
    'BRIEFING',
    'DEBRIEFING',
    'ASSESSMENT',
    'SKILL_TEST',
    'PROFICIENCY_CHECK',
    'RECURRENT',
    'REFRESHER',
    'OTHER'
);

-- 3. Organisations (Multi-tenancy anchor)
CREATE TABLE organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_name VARCHAR(200) NOT NULL,
    trading_name VARCHAR(200),
    ato_approval_number VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Aircraft Types
CREATE TABLE aircraft_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID REFERENCES organisations(id),
    manufacturer VARCHAR(100) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    variant VARCHAR(100),
    type_rating_code VARCHAR(50),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (
        organisation_id,
        manufacturer,
        model_name,
        variant
    )
);

-- 5. Resources (FFS, FTD, Classrooms)
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id),
    resource_name VARCHAR(150) NOT NULL,
    resource_category resource_category NOT NULL,
    status resource_status NOT NULL DEFAULT 'AVAILABLE',
    location VARCHAR(200),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (
        organisation_id,
        resource_name
    )
);

-- 6. Resource - Aircraft Type Compatibility Junction
CREATE TABLE resource_aircraft_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    aircraft_type_id UUID NOT NULL REFERENCES aircraft_types(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    configuration VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (
        resource_id,
        aircraft_type_id
    )
);

-- 7. Resource Regulatory Approvals
CREATE TABLE resource_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    authority VARCHAR(100) NOT NULL,
    approval_number VARCHAR(100),
    qualification_level VARCHAR(50),
    effective_date DATE NOT NULL,
    expiry_date DATE,
    status qualification_status NOT NULL DEFAULT 'VALID',
    document_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Staff Profiles
CREATE TABLE staff (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organisation_id UUID NOT NULL REFERENCES organisations(id),
    staff_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    employment_type employment_type NOT NULL,
    department VARCHAR(100),
    job_title VARCHAR(100),
    date_of_joining DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_locked_out BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (
        organisation_id,
        staff_id
    )
);

-- 9. Staff Roles (Many-to-Many: e.g., SFI + SFE + GI)
CREATE TABLE staff_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    role instructor_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (
        staff_id,
        role
    )
);

-- 10. Qualification Types
CREATE TABLE qualification_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    validity_period_months INTEGER,
    recurrent_required BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Instructor Qualifications
CREATE TABLE instructor_qualifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    aircraft_type_id UUID REFERENCES aircraft_types(id),
    qualification_type_id UUID NOT NULL REFERENCES qualification_types(id),
    role instructor_role NOT NULL,
    approval_number VARCHAR(100),
    issue_date DATE NOT NULL,
    validity_start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    base_month DATE,
    status qualification_status NOT NULL DEFAULT 'VALID',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Instructor Recurrent Training History
CREATE TABLE instructor_recurrent_training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    aircraft_type_id UUID REFERENCES aircraft_types(id),
    training_date DATE NOT NULL,
    base_month DATE NOT NULL,
    validity_start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    recurrent_window_start DATE GENERATED ALWAYS AS (
        (expiry_date - INTERVAL '3 months')::DATE
    ) STORED,
    status qualification_status NOT NULL DEFAULT 'VALID',
    certificate_number VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Instructor Availability
CREATE TABLE instructor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    availability_type VARCHAR(30) NOT NULL CHECK (
        availability_type IN (
            'AVAILABLE',
            'UNAVAILABLE',
            'LEAVE',
            'TRAINING',
            'OTHER'
        )
    ),
    remarks TEXT,
    CONSTRAINT instructor_availability_time_check CHECK (end_time > start_time)
);

-- 14. Students
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id),
    student_number VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    operator_name VARCHAR(200),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (
        organisation_id,
        student_number
    )
);

-- 15. Student Cohorts
CREATE TABLE student_cohorts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id),
    cohort_code VARCHAR(100) NOT NULL,
    cohort_name VARCHAR(150),
    start_date DATE,
    expected_completion_date DATE,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (
        organisation_id,
        cohort_code
    )
);

-- 16. Cohort Members
CREATE TABLE cohort_members (
    cohort_id UUID NOT NULL REFERENCES student_cohorts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    PRIMARY KEY (
        cohort_id,
        student_id
    )
);

-- 17. Courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id),
    aircraft_type_id UUID REFERENCES aircraft_types(id),
    course_code VARCHAR(50) NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    course_category VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (
        organisation_id,
        course_code
    )
);

-- 18. Course Lessons
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_code VARCHAR(50) NOT NULL,
    lesson_name VARCHAR(200) NOT NULL,
    training_type training_type NOT NULL,
    sequence_number INTEGER NOT NULL,
    planned_duration_minutes INTEGER NOT NULL,
    required_role instructor_role,
    required_resource_category resource_category,
    is_assessment BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (
        course_id,
        lesson_code
    )
);

-- 19. Student Course Enrolment
CREATE TABLE student_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id),
    cohort_id UUID REFERENCES student_cohorts(id),
    enrolment_date DATE NOT NULL,
    planned_start_date DATE,
    planned_completion_date DATE,
    actual_completion_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. Training Events
CREATE TABLE training_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id),
    course_id UUID REFERENCES courses(id),
    lesson_id UUID REFERENCES course_lessons(id),
    student_id UUID REFERENCES students(id),
    cohort_id UUID REFERENCES student_cohorts(id),
    training_type training_type NOT NULL,
    session_title VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. Master Schedule
CREATE TABLE master_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id),
    training_event_id UUID REFERENCES training_events(id),
    instructor_id UUID REFERENCES staff(id),
    examiner_id UUID REFERENCES staff(id),
    resource_id UUID REFERENCES resources(id),
    aircraft_type_id UUID REFERENCES aircraft_types(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (end_time - start_time)) / 60
    ) STORED,
    session_status schedule_status NOT NULL DEFAULT 'DRAFT',
    is_instructional BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT schedule_time_check CHECK (end_time > start_time)
);

-- 22. Prevent Double Booking Constraints (PostgreSQL Exclusion Constraints)
ALTER TABLE master_schedule
ADD CONSTRAINT no_instructor_overlap
EXCLUDE USING gist (
    instructor_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
)
WHERE (
    instructor_id IS NOT NULL
    AND session_status IN ('CONFIRMED', 'IN_PROGRESS')
);

ALTER TABLE master_schedule
ADD CONSTRAINT no_resource_overlap
EXCLUDE USING gist (
    resource_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
)
WHERE (
    resource_id IS NOT NULL
    AND session_status IN ('CONFIRMED', 'IN_PROGRESS')
);

-- 23. Instructor FDTL Records
CREATE TABLE fdtl_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES master_schedule(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    instructional_minutes INTEGER NOT NULL,
    is_actual BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fdtl_time_check CHECK (end_time > start_time),
    CONSTRAINT instructional_minutes_check CHECK (instructional_minutes >= 0)
);

-- 24. FDTL Rules
CREATE TABLE fdtl_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID REFERENCES organisations(id),
    rule_name VARCHAR(100) NOT NULL,
    rolling_period_hours INTEGER NOT NULL,
    maximum_instructional_minutes INTEGER NOT NULL,
    effective_from DATE NOT NULL,
    effective_until DATE,
    authority VARCHAR(100),
    regulation_reference VARCHAR(200),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 25. FDTL Calculation Function
CREATE OR REPLACE FUNCTION calculate_instructor_fdtl(
    p_instructor_id UUID,
    p_reference_time TIMESTAMPTZ
)
RETURNS TABLE (
    rolling_24h_minutes INTEGER,
    rolling_7d_minutes INTEGER,
    remaining_24h_minutes INTEGER,
    remaining_7d_minutes INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_24h INTEGER;
    v_7d INTEGER;
BEGIN
    SELECT COALESCE(SUM(instructional_minutes), 0)
    INTO v_24h
    FROM fdtl_records
    WHERE instructor_id = p_instructor_id
      AND start_time >= p_reference_time - INTERVAL '24 hours'
      AND start_time < p_reference_time;

    SELECT COALESCE(SUM(instructional_minutes), 0)
    INTO v_7d
    FROM fdtl_records
    WHERE instructor_id = p_instructor_id
      AND start_time >= p_reference_time - INTERVAL '7 days'
      AND start_time < p_reference_time;

    RETURN QUERY
    SELECT
        v_24h,
        v_7d,
        GREATEST(360 - v_24h, 0),
        GREATEST(1800 - v_7d, 0);
END;
$$;

-- 26. Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID REFERENCES organisations(id),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 27. Indexes
CREATE INDEX idx_aircraft_types_name ON aircraft_types(model_name);
CREATE INDEX idx_resources_category ON resources(resource_category);
CREATE INDEX idx_resource_aircraft ON resource_aircraft_types(resource_id, aircraft_type_id);
CREATE INDEX idx_instructor_qualifications ON instructor_qualifications(instructor_id, aircraft_type_id, role);
CREATE INDEX idx_instructor_expiry ON instructor_qualifications(expiry_date);
CREATE INDEX idx_recurrent_expiry ON instructor_recurrent_training(expiry_date);
CREATE INDEX idx_schedule_instructor_time ON master_schedule(instructor_id, start_time, end_time);
CREATE INDEX idx_schedule_resource_time ON master_schedule(resource_id, start_time, end_time);
CREATE INDEX idx_schedule_aircraft_time ON master_schedule(aircraft_type_id, start_time);
CREATE INDEX idx_fdtl_instructor_time ON fdtl_records(instructor_id, start_time);

-- 28. Row Level Security (RLS) Baseline
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE fdtl_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY instructor_view_own_qualifications
ON instructor_qualifications FOR SELECT
USING (instructor_id = auth.uid());

CREATE POLICY instructor_view_own_schedule
ON master_schedule FOR SELECT
USING (
    instructor_id = auth.uid()
    OR examiner_id = auth.uid()
);
