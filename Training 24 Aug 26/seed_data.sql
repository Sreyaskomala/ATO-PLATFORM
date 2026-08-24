-- ============================================================================
-- ATO Training Platform — Realistic Seed Dataset
-- Platform: Supabase / PostgreSQL
-- ============================================================================

-- 1. Create Organisation
INSERT INTO organisations (id, legal_name, trading_name, ato_approval_number, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Global Aviation Training Academy Ltd.',
    'GATA Flight Academy',
    'ATO/IND/2026/042',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- 2. Aircraft Types (Master Data)
INSERT INTO aircraft_types (id, organisation_id, manufacturer, model_name, variant, type_rating_code, description)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Airbus', 'A320', 'CEO', 'A320-CEO', 'Airbus A320 Current Engine Option (CFM56 / IAE V2500)'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Airbus', 'A320', 'NEO', 'A320-NEO', 'Airbus A320 New Engine Option (LEAP-1A / PW1100G)'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Boeing', 'B737', 'NG', 'B737-NG', 'Boeing 737 Next Generation (-800 / -900ER)'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Boeing', 'B737', 'MAX', 'B737-MAX', 'Boeing 737 MAX 8 / 9 (LEAP-1B)'),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'ATR', 'ATR 72', '-600', 'ATR-72-600', 'ATR 72-600 Regional Turboprop')
ON CONFLICT DO NOTHING;

-- 3. Resources (Simulators & Classrooms)
INSERT INTO resources (id, organisation_id, resource_name, resource_category, status, location, manufacturer, model, serial_number, description)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'A320 FFS-01', 'FFS', 'AVAILABLE', 'Bay 1, Flight Sim Complex', 'CAE', 'CAE 7000XR', 'SIM-A320-01', 'Level D Full Flight Simulator with dual CEO/NEO quick-configuration switch'),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'B737 FFS-01', 'FFS', 'AVAILABLE', 'Bay 2, Flight Sim Complex', 'L3Harris', 'RealitySeven', 'SIM-B737-01', 'Level D Full Flight Simulator for B737 NG / MAX with collimated visual system'),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'A320 FTD-01', 'FTD', 'AVAILABLE', 'Bay 3, Flight Sim Complex', 'Thales', 'FTD-2', 'FTD-A320-01', 'Level 2 Flight Training Device for cockpit procedural & systems training'),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Classroom Alpha', 'CLASSROOM', 'AVAILABLE', 'Training Wing Level 2', 'N/A', 'Interactive SMART Hub', 'CR-01', '24-Seat CBT & Multi-crew briefing classroom'),
    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'A320 FFS-02 (Maintenance)', 'FFS', 'UNDER_MAINTENANCE', 'Bay 4, Flight Sim Complex', 'CAE', 'CAE 7000XR', 'SIM-A320-02', 'Under scheduled 100-hour visual actuator overhaul')
ON CONFLICT DO NOTHING;

-- 4. Resource - Aircraft Type Compatibility Matrix (Key Architectural Rule)
INSERT INTO resource_aircraft_types (id, resource_id, aircraft_type_id, is_primary, configuration)
VALUES 
    ('c1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', TRUE, 'CEO - CFM56-5B4'),
    ('c1000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', FALSE, 'NEO - LEAP-1A26'),
    ('c1000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', TRUE, 'NG - CFM56-7B26'),
    ('c1000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', FALSE, 'MAX - CFM LEAP-1B'),
    ('c1000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', TRUE, 'CEO - Fixed Base')
ON CONFLICT DO NOTHING;

-- 5. Resource Approvals (DGCA & EASA)
INSERT INTO resource_approvals (id, resource_id, authority, approval_number, qualification_level, effective_date, expiry_date, status)
VALUES 
    ('c2000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'DGCA India', 'DGCA/FSTD/A320/019', 'Level D', '2025-01-01', '2027-12-31', 'VALID'),
    ('c2000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'EASA', 'EASA.FSTD.0882', 'Level D', '2024-06-01', '2027-06-01', 'VALID'),
    ('c2000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'DGCA India', 'DGCA/FSTD/B737/022', 'Level D', '2025-03-15', '2027-03-15', 'VALID'),
    ('c2000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'DGCA India', 'DGCA/FTD/A320/004', 'Level 2', '2024-01-01', '2026-12-31', 'VALID')
ON CONFLICT DO NOTHING;

-- 6. Qualification Types (Configurable Master Data)
INSERT INTO qualification_types (id, name, description, validity_period_months, recurrent_required)
VALUES 
    ('d0000000-0000-0000-0000-000000000001', 'Synthetic Flight Instructor (SFI)', 'Authorisation to conduct simulator flight instruction for type ratings and recurrent training', 36, TRUE),
    ('d0000000-0000-0000-0000-000000000002', 'Synthetic Flight Examiner (SFE)', 'Authorisation to conduct skill tests and proficiency checks in FFS', 36, TRUE),
    ('d0000000-0000-0000-0000-000000000003', 'Ground Instructor (GI)', 'Authorisation for aircraft systems, CBT, and classroom technical lectures', 24, FALSE),
    ('d0000000-0000-0000-0000-000000000004', 'Subject Matter Expert (SME)', 'Specialist instructor for performance, navigation, and CRM training', 12, FALSE)
ON CONFLICT DO NOTHING;

-- 7. Staff Profiles (Dummy Auth Users & Instructors)
-- Using fixed UUIDs mapped to auth.users in testing
INSERT INTO staff (id, organisation_id, staff_id, full_name, email, phone, employment_type, department, job_title, date_of_joining, is_active, is_locked_out)
VALUES 
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'INS-101', 'Capt. Rahul Sharma', 'rahul.sharma@gata.aero', '+91 98111 22334', 'FULL_TIME', 'Flight Operations', 'Senior SFI / SFE - A320', '2019-04-01', TRUE, FALSE),
    ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'INS-102', 'Capt. Sarah Jenkins', 'sarah.jenkins@gata.aero', '+91 98222 33445', 'FULL_TIME', 'Flight Operations', 'Fleet Chief SFI - B737', '2020-08-15', TRUE, FALSE),
    ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'INS-103', 'Capt. Vikram Mehra', 'vikram.mehra@gata.aero', '+91 98333 44556', 'CONTRACT', 'Flight Operations', 'SFI - A320 (Recurrent Window Active)', '2021-02-10', TRUE, FALSE),
    ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'INS-104', 'Capt. Rajesh Gupta', 'rajesh.gupta@gata.aero', '+91 98444 55667', 'FULL_TIME', 'Ground & Sim Training', 'GI / SFI Dual Rated', '2018-11-01', TRUE, FALSE),
    ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'INS-105', 'Capt. Elena Rostova', 'elena.rostova@gata.aero', '+91 98555 66778', 'CONTRACT', 'Flight Operations', 'SFE - A320 (Expired Rating Scenario)', '2022-06-01', TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- 8. Staff Roles (Many-to-Many Architecture)
INSERT INTO staff_roles (staff_id, role)
VALUES 
    ('e0000000-0000-0000-0000-000000000001', 'SFI'),
    ('e0000000-0000-0000-0000-000000000001', 'SFE'),
    ('e0000000-0000-0000-0000-000000000002', 'SFI'),
    ('e0000000-0000-0000-0000-000000000003', 'SFI'),
    ('e0000000-0000-0000-0000-000000000004', 'GI'),
    ('e0000000-0000-0000-0000-000000000004', 'SFI'),
    ('e0000000-0000-0000-0000-000000000005', 'SFE')
ON CONFLICT DO NOTHING;

-- 9. Instructor Qualifications
INSERT INTO instructor_qualifications (id, instructor_id, aircraft_type_id, qualification_type_id, role, approval_number, issue_date, validity_start_date, expiry_date, base_month, status)
VALUES 
    -- Capt Rahul Sharma: Valid A320 CEO & NEO SFI/SFE
    ('e1000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'SFI', 'DGCA/SFI/A320/8812', '2023-11-15', '2023-11-15', '2026-11-14', '2023-11-01', 'VALID'),
    ('e1000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'SFI', 'DGCA/SFI/A320NEO/8813', '2023-11-15', '2023-11-15', '2026-11-14', '2023-11-01', 'VALID'),
    ('e1000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'SFE', 'DGCA/SFE/A320/4102', '2024-02-01', '2024-02-01', '2027-01-31', '2024-02-01', 'VALID'),

    -- Capt Sarah Jenkins: Valid B737 NG/MAX SFI
    ('e1000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'SFI', 'DGCA/SFI/B737/9011', '2024-05-10', '2024-05-10', '2027-05-09', '2024-05-01', 'VALID'),
    ('e1000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'SFI', 'DGCA/SFI/B737MAX/9012', '2024-05-10', '2024-05-10', '2027-05-09', '2024-05-01', 'VALID'),

    -- Capt Vikram Mehra: A320 SFI Expiring within 30 days (Active Recurrent Window)
    ('e1000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'SFI', 'DGCA/SFI/A320/7311', '2023-09-10', '2023-09-10', '2026-09-09', '2023-09-01', 'EXPIRING'),

    -- Capt Rajesh Gupta: Ground Instructor + A320 SFI
    ('e1000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'SFI', 'DGCA/SFI/A320/6654', '2024-01-10', '2024-01-10', '2027-01-09', '2024-01-01', 'VALID'),
    ('e1000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000004', NULL, 'd0000000-0000-0000-0000-000000000003', 'GI', 'DGCA/GI/ALL/1102', '2025-01-01', '2025-01-01', '2027-01-01', '2025-01-01', 'VALID'),

    -- Capt Elena Rostova: Expired SFE
    ('e1000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'SFE', 'DGCA/SFE/A320/3309', '2023-01-01', '2023-01-01', '2026-01-01', '2023-01-01', 'EXPIRED')
ON CONFLICT DO NOTHING;

-- 10. Recurrent Training History (Audit Trail)
INSERT INTO instructor_recurrent_training (id, instructor_id, aircraft_type_id, training_date, base_month, validity_start_date, expiry_date, status, certificate_number, remarks)
VALUES 
    ('e2000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '2025-11-10', '2025-11-01', '2025-11-10', '2026-11-10', 'VALID', 'REC/A320/2025/119', 'Satisfactory annual standardization check conducted by Chief Examiner'),
    ('e2000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', '2025-05-15', '2025-05-01', '2025-05-15', '2026-05-15', 'VALID', 'REC/B737/2025/084', 'Annual recurrent check completed with Level D visual maneuvers'),
    ('e2000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', '2025-09-08', '2025-09-01', '2025-09-08', '2026-09-08', 'VALID', 'REC/A320/2025/091', 'Inside 3-month renewal window; needs slot booked before 08 Sep 2026')
ON CONFLICT DO NOTHING;

-- 11. Students
INSERT INTO students (id, organisation_id, student_number, full_name, email, phone, operator_name, is_active)
VALUES 
    ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'STU-2026-001', 'Aditi Rao', 'aditi.rao@indigo.aero', '+91 99111 00001', 'IndiGo Airlines', TRUE),
    ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'STU-2026-002', 'Rohan Verma', 'rohan.verma@indigo.aero', '+91 99111 00002', 'IndiGo Airlines', TRUE),
    ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'STU-2026-003', 'Tanya Sen', 'tanya.sen@airindia.in', '+91 99111 00003', 'Air India', TRUE),
    ('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'STU-2026-004', 'Siddharth Nair', 'siddharth.nair@airindia.in', '+91 99111 00004', 'Air India', TRUE)
ON CONFLICT DO NOTHING;

-- 12. Student Cohorts
INSERT INTO student_cohorts (id, organisation_id, cohort_code, cohort_name, start_date, expected_completion_date, status)
VALUES 
    ('f1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'A320-CADET-26A', 'IndiGo Cadet Batch 2026-A', '2026-08-01', '2026-10-31', 'ACTIVE'),
    ('f1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'B737-CADET-26B', 'Air India Cadet Batch 2026-B', '2026-08-15', '2026-11-15', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- 13. Cohort Members
INSERT INTO cohort_members (cohort_id, student_id)
VALUES 
    ('f1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001'),
    ('f1000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002'),
    ('f1000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000003'),
    ('f1000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- 14. Courses
INSERT INTO courses (id, organisation_id, aircraft_type_id, course_code, course_name, course_category, description)
VALUES 
    ('g0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'A320-TR-INIT', 'A320 Type Rating Initial Course', 'TYPE_RATING', 'Complete DGCA/EASA compliant initial A320 type rating syllabus including FTD and Level D FFS'),
    ('g0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'B737-TR-INIT', 'B737 Next Gen Type Rating Initial', 'TYPE_RATING', 'Complete B737-800 NG type rating syllabus with Level D FFS skill test'),
    ('g0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'A320-REC-2026', 'A320 Annual Recurrent & PPC', 'RECURRENT', 'Annual recurrent simulator training, LOFT, and Pilot Proficiency Check')
ON CONFLICT DO NOTHING;

-- 15. Course Lessons (Syllabus)
INSERT INTO course_lessons (id, course_id, lesson_code, lesson_name, training_type, sequence_number, planned_duration_minutes, required_role, required_resource_category, is_assessment)
VALUES 
    -- A320 Initial Lessons
    ('g1000000-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000001', 'GND-01', 'Cockpit Preparation & Systems Walkthrough', 'GROUND', 1, 180, 'GI', 'CLASSROOM', FALSE),
    ('g1000000-0000-0000-0000-000000000002', 'g0000000-0000-0000-0000-000000000001', 'FTD-01', 'Standard Operating Procedures & FMC Setup', 'FTD', 2, 120, 'SFI', 'FTD', FALSE),
    ('g1000000-0000-0000-0000-000000000003', 'g0000000-0000-0000-0000-000000000001', 'FFS-01', 'Takeoff, Initial Climb & Normal Handling', 'FFS', 3, 120, 'SFI', 'FFS', FALSE),
    ('g1000000-0000-0000-0000-000000000004', 'g0000000-0000-0000-0000-000000000001', 'FFS-04', 'Engine Failure After V1 & Single Engine Approach', 'FFS', 4, 120, 'SFI', 'FFS', FALSE),
    ('g1000000-0000-0000-0000-000000000005', 'g0000000-0000-0000-0000-000000000001', 'FFS-08', 'LOFT Scenario & Emergency Descents', 'FFS', 5, 120, 'SFI', 'FFS', FALSE),
    ('g1000000-0000-0000-0000-000000000006', 'g0000000-0000-0000-0000-000000000001', 'CA-40', 'Final Skill Test & License Endorsement Check', 'SKILL_TEST', 6, 120, 'SFE', 'FFS', TRUE),

    -- B737 Initial Lessons
    ('g1000000-0000-0000-0000-000000000007', 'g0000000-0000-0000-0000-000000000002', 'B737-FFS-01', 'B737 Normal Maneuvers & Flight Controls', 'FFS', 1, 120, 'SFI', 'FFS', FALSE),
    ('g1000000-0000-0000-0000-000000000008', 'g0000000-0000-0000-0000-000000000002', 'B737-CA-40', 'B737 Final Skill Test', 'SKILL_TEST', 2, 120, 'SFE', 'FFS', TRUE)
ON CONFLICT DO NOTHING;

-- 16. Student Course Enrolment
INSERT INTO student_courses (student_id, course_id, cohort_id, enrolment_date, planned_start_date, planned_completion_date, status)
VALUES 
    ('f0000000-0000-0000-0000-000000000001', 'g0000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', '2026-08-01', '2026-08-10', '2026-10-30', 'ACTIVE'),
    ('f0000000-0000-0000-0000-000000000002', 'g0000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', '2026-08-01', '2026-08-10', '2026-10-30', 'ACTIVE'),
    ('f0000000-0000-0000-0000-000000000003', 'g0000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', '2026-08-15', '2026-08-20', '2026-11-15', 'ACTIVE'),
    ('f0000000-0000-0000-0000-000000000004', 'g0000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', '2026-08-15', '2026-08-20', '2026-11-15', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- 17. FDTL Rules (Initial Seed)
INSERT INTO fdtl_rules (id, organisation_id, rule_name, rolling_period_hours, maximum_instructional_minutes, effective_from, authority, regulation_reference, is_active)
VALUES 
    ('h0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'DGCA Rolling 24 Hours Limit', 24, 360, '2024-01-01', 'DGCA India', 'CAR Section 7 Series J Part III', TRUE),
    ('h0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'DGCA Rolling 7 Days Limit', 168, 1800, '2024-01-01', 'DGCA India', 'CAR Section 7 Series J Part III', TRUE)
ON CONFLICT DO NOTHING;

-- 18. Historical FDTL Records (Logging Past Instructional Sessions)
INSERT INTO fdtl_records (id, instructor_id, start_time, end_time, instructional_minutes, is_actual)
VALUES 
    -- Capt Rahul Sharma: 2.0h earlier today, 2.0h yesterday (Total 4.0h in 24h, 16.0h in 7d)
    ('h1000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '4 hours', 120, TRUE),
    ('h1000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '22 hours', NOW() - INTERVAL '20 hours', 120, TRUE),
    ('h1000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '4 hours', 240, TRUE),

    -- Capt Rajesh Gupta: 5.0h in last 24h (Near FDTL limit)
    ('h1000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '5 hours', 180, TRUE),
    ('h1000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '18 hours', NOW() - INTERVAL '15 hours', 120, TRUE)
ON CONFLICT DO NOTHING;

-- 19. Sample Master Schedule Bookings
-- Training Event 1: A320 FFS-04
INSERT INTO training_events (id, organisation_id, course_id, lesson_id, student_id, cohort_id, training_type, session_title)
VALUES (
    'i0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'g0000000-0000-0000-0000-000000000001',
    'g1000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000001',
    'f1000000-0000-0000-0000-000000000001',
    'FFS',
    'FFS-04 Single Engine Procedures - Aditi Rao'
) ON CONFLICT DO NOTHING;

INSERT INTO master_schedule (id, organisation_id, training_event_id, instructor_id, resource_id, aircraft_type_id, start_time, end_time, session_status, is_instructional)
VALUES (
    'i1000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'i0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    NOW() + INTERVAL '2 hours',
    NOW() + INTERVAL '4 hours',
    'CONFIRMED',
    TRUE
) ON CONFLICT DO NOTHING;
