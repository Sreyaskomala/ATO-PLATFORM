# ATO Training Platform — Foundational PostgreSQL Database Schema

**Database:** PostgreSQL  
**Platform:** Supabase  
**Architecture:** Relational / Transactional  
**Primary Objective:** Support fleet management, simulator/FTD resources, instructor qualifications, course mapping, scheduling, FDTL compliance and instructor dashboards.

---

# 1. Database Design Principles

The database shall be designed around the following relationship:

```text
Aircraft Type
      │
      ├─────────────── Course
      │
      ├─────────────── Simulator / FTD
      │
      └─────────────── Instructor Qualification
                              │
                              ▼
                         Instructor
                              │
                              ▼
                        Master Schedule
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
           Student                         Resource
              │
              ▼
        Training Record
```

A valid training booking therefore requires:

```text
Qualified Instructor
        +
Compatible Aircraft Type
        +
Compatible Training Resource
        +
Eligible Student
        +
Available Time Slot
        +
Valid Instructor Qualification
        +
Valid Recurrent / Currency
        +
FDTL Compliance
```

---

# 2. Required PostgreSQL Extensions

Supabase PostgreSQL should enable the following extensions where available:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

`uuid-ossp` is used for UUID generation.

`btree_gist` is required if PostgreSQL exclusion constraints are used to prevent overlapping schedule bookings.

---

# 3. ENUM Types

Use PostgreSQL ENUMs for values that represent stable system states.

```sql
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
```

---

# 4. Organisations

The platform should be designed for future multi-ATO / multi-organisation deployment.

```sql
CREATE TABLE organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    legal_name VARCHAR(200) NOT NULL,
    trading_name VARCHAR(200),

    ato_approval_number VARCHAR(100),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Every major operational table should eventually contain:

```text
organisation_id
```

This allows the platform to evolve into a multi-tenant system.

---

# 5. Aircraft Types

Aircraft types are master data.

The application must NOT hard-code A320, B737, Q400 etc. into application logic.

```sql
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
```

Example records:

```text
Airbus     | A320       | CEO
Airbus     | A320       | NEO
Boeing     | B737       | NG
Boeing     | B737       | MAX
Bombardier | Q400       | -
ATR        | ATR 72     | -600
```

---

# 6. Resources

FFS, FTD and classrooms should be treated as resources.

```sql
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    organisation_id UUID NOT NULL
        REFERENCES organisations(id),

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
```

---

# 7. Simulator / FTD Aircraft Compatibility

A simulator may support more than one aircraft configuration.

Therefore, do not rely solely on:

```text
simulator.aircraft_type_id
```

Instead use a junction table.

```sql
CREATE TABLE resource_aircraft_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    resource_id UUID NOT NULL
        REFERENCES resources(id)
        ON DELETE CASCADE,

    aircraft_type_id UUID NOT NULL
        REFERENCES aircraft_types(id)
        ON DELETE CASCADE,

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    configuration VARCHAR(100),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (
        resource_id,
        aircraft_type_id
    )
);
```

This allows:

```text
A320 FFS-01
 ├── A320 CEO
 └── A320 NEO
```

if the actual simulator configuration supports both.

---

# 8. Resource Regulatory Approval

Regulatory approval should be separated from the physical resource.

```sql
CREATE TABLE resource_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    resource_id UUID NOT NULL
        REFERENCES resources(id)
        ON DELETE CASCADE,

    authority VARCHAR(100) NOT NULL,

    approval_number VARCHAR(100),

    qualification_level VARCHAR(50),

    effective_date DATE NOT NULL,

    expiry_date DATE,

    status qualification_status NOT NULL DEFAULT 'VALID',

    document_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

This allows the system to track:

* DGCA approval
* EASA qualification
* Other authority approvals

independently.

---

# 9. Staff Profiles

Supabase Auth should manage authentication.

Application-specific personnel data belongs in the staff table.

```sql
CREATE TABLE staff (
    id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    organisation_id UUID NOT NULL
        REFERENCES organisations(id),

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
```

---

# 10. Staff Roles

A person may have more than one role.

Therefore roles should not be stored as a single column.

```sql
CREATE TABLE staff_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    staff_id UUID NOT NULL
        REFERENCES staff(id)
        ON DELETE CASCADE,

    role instructor_role NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (
        staff_id,
        role
    )
);
```

Example:

```text
Instructor A
 ├── SFI
 └── SFE
```

---

# 11. Qualification Types

Qualification types should be configurable.

```sql
CREATE TABLE qualification_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    name VARCHAR(150) NOT NULL,

    description TEXT,

    validity_period_months INTEGER,

    recurrent_required BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Examples:

```text
A320 SFI Qualification
A320 SFE Qualification
B737 SFI Qualification
GI Ground Instructor Qualification
Recurrent Training
Examiner Authorisation
```

---

# 12. Instructor Qualifications

This is the primary qualification matrix.

```sql
CREATE TABLE instructor_qualifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    instructor_id UUID NOT NULL
        REFERENCES staff(id)
        ON DELETE CASCADE,

    aircraft_type_id UUID
        REFERENCES aircraft_types(id),

    qualification_type_id UUID NOT NULL
        REFERENCES qualification_types(id),

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
```

---

# 13. Recurrent Training

Recurrent training should be independently recorded.

```sql
CREATE TABLE instructor_recurrent_training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    instructor_id UUID NOT NULL
        REFERENCES staff(id)
        ON DELETE CASCADE,

    aircraft_type_id UUID
        REFERENCES aircraft_types(id),

    training_date DATE NOT NULL,

    base_month DATE NOT NULL,

    validity_start_date DATE NOT NULL,

    expiry_date DATE NOT NULL,

    recurrent_window_start DATE
        GENERATED ALWAYS AS (
            (expiry_date - INTERVAL '3 months')::DATE
        ) STORED,

    status qualification_status NOT NULL DEFAULT 'VALID',

    certificate_number VARCHAR(100),

    remarks TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

This is preferable to putting recurrent training directly inside the qualification record because it preserves the complete training history.

---

# 14. Instructor Availability

```sql
CREATE TABLE instructor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    instructor_id UUID NOT NULL
        REFERENCES staff(id)
        ON DELETE CASCADE,

    start_time TIMESTAMPTZ NOT NULL,

    end_time TIMESTAMPTZ NOT NULL,

    availability_type VARCHAR(30) NOT NULL
        CHECK (
            availability_type IN (
                'AVAILABLE',
                'UNAVAILABLE',
                'LEAVE',
                'TRAINING',
                'OTHER'
            )
        ),

    remarks TEXT,

    CONSTRAINT instructor_availability_time_check
        CHECK (end_time > start_time)
);
```

---

# 15. Students

```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    organisation_id UUID NOT NULL
        REFERENCES organisations(id),

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
```

---

# 16. Student Cohorts

```sql
CREATE TABLE student_cohorts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    organisation_id UUID NOT NULL
        REFERENCES organisations(id),

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
```

---

# 17. Cohort Members

```sql
CREATE TABLE cohort_members (
    cohort_id UUID NOT NULL
        REFERENCES student_cohorts(id)
        ON DELETE CASCADE,

    student_id UUID NOT NULL
        REFERENCES students(id)
        ON DELETE CASCADE,

    PRIMARY KEY (
        cohort_id,
        student_id
    )
);
```

---

# 18. Courses

```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    organisation_id UUID NOT NULL
        REFERENCES organisations(id),

    aircraft_type_id UUID
        REFERENCES aircraft_types(id),

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
```

Example:

```text
A320-TR-INITIAL
A320-RECURRENT
A320-SFI
B737-TR-INITIAL
Q400-RECURRENT
ATR72-600-INITIAL
```

---

# 19. Course Lessons

```sql
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    course_id UUID NOT NULL
        REFERENCES courses(id)
        ON DELETE CASCADE,

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
```

---

# 20. Student Course Enrolment

```sql
CREATE TABLE student_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    student_id UUID NOT NULL
        REFERENCES students(id)
        ON DELETE CASCADE,

    course_id UUID NOT NULL
        REFERENCES courses(id),

    cohort_id UUID
        REFERENCES student_cohorts(id),

    enrolment_date DATE NOT NULL,

    planned_start_date DATE,

    planned_completion_date DATE,

    actual_completion_date DATE,

    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# 21. Training Events

The Training Event represents the actual training activity.

```sql
CREATE TABLE training_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    organisation_id UUID NOT NULL
        REFERENCES organisations(id),

    course_id UUID
        REFERENCES courses(id),

    lesson_id UUID
        REFERENCES course_lessons(id),

    student_id UUID
        REFERENCES students(id),

    cohort_id UUID
        REFERENCES student_cohorts(id),

    training_type training_type NOT NULL,

    session_title VARCHAR(200) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# 22. Master Schedule

The Master Schedule connects the operational matrix.

```sql
CREATE TABLE master_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    organisation_id UUID NOT NULL
        REFERENCES organisations(id),

    training_event_id UUID
        REFERENCES training_events(id),

    instructor_id UUID
        REFERENCES staff(id),

    examiner_id UUID
        REFERENCES staff(id),

    resource_id UUID
        REFERENCES resources(id),

    aircraft_type_id UUID
        REFERENCES aircraft_types(id),

    start_time TIMESTAMPTZ NOT NULL,

    end_time TIMESTAMPTZ NOT NULL,

    duration_minutes INTEGER
        GENERATED ALWAYS AS (
            EXTRACT(
                EPOCH FROM (end_time - start_time)
            ) / 60
        ) STORED,

    session_status schedule_status NOT NULL
        DEFAULT 'DRAFT',

    is_instructional BOOLEAN NOT NULL DEFAULT TRUE,

    created_by UUID
        REFERENCES auth.users(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT schedule_time_check
        CHECK (end_time > start_time)
);
```

---

# 23. Prevent Instructor Double Booking

Use PostgreSQL exclusion constraints.

```sql
ALTER TABLE master_schedule
ADD CONSTRAINT no_instructor_overlap
EXCLUDE USING gist (
    instructor_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
)
WHERE (
    instructor_id IS NOT NULL
    AND session_status IN (
        'CONFIRMED',
        'IN_PROGRESS'
    )
);
```

This prevents overlapping confirmed bookings for the same instructor.

---

# 24. Prevent Resource Double Booking

```sql
ALTER TABLE master_schedule
ADD CONSTRAINT no_resource_overlap
EXCLUDE USING gist (
    resource_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
)
WHERE (
    resource_id IS NOT NULL
    AND session_status IN (
        'CONFIRMED',
        'IN_PROGRESS'
    )
);
```

This prevents the same FFS/FTD/classroom from being booked simultaneously.

---

# 25. Instructor FDTL Records

Historical actual instructional time should be separately recorded.

```sql
CREATE TABLE fdtl_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    instructor_id UUID NOT NULL
        REFERENCES staff(id)
        ON DELETE CASCADE,

    schedule_id UUID
        REFERENCES master_schedule(id),

    start_time TIMESTAMPTZ NOT NULL,

    end_time TIMESTAMPTZ NOT NULL,

    instructional_minutes INTEGER NOT NULL,

    is_actual BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fdtl_time_check
        CHECK (end_time > start_time),

    CONSTRAINT instructional_minutes_check
        CHECK (instructional_minutes >= 0)
);
```

---

# 26. FDTL Configuration

Do not hard-code regulatory limits throughout application code.

```sql
CREATE TABLE fdtl_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    organisation_id UUID
        REFERENCES organisations(id),

    rule_name VARCHAR(100) NOT NULL,

    rolling_period_hours INTEGER NOT NULL,

    maximum_instructional_minutes INTEGER NOT NULL,

    effective_from DATE NOT NULL,

    effective_until DATE,

    authority VARCHAR(100),

    regulation_reference VARCHAR(200),

    is_active BOOLEAN NOT NULL DEFAULT TRUE
);
```

Initial seed:

```text
Rolling 24 Hours → 360 minutes
Rolling 7 Days   → 1800 minutes
```

---

# 27. FDTL Calculation Function

Create:

```sql
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

    SELECT COALESCE(
        SUM(instructional_minutes),
        0
    )
    INTO v_24h
    FROM fdtl_records
    WHERE instructor_id = p_instructor_id
      AND start_time >= p_reference_time - INTERVAL '24 hours'
      AND start_time < p_reference_time;

    SELECT COALESCE(
        SUM(instructional_minutes),
        0
    )
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
```

---

# 28. Important FDTL Design Requirement

The final implementation must account for **scheduled instructional time as well as completed/logged instructional time** when validating a future booking.

Therefore the validation engine should calculate:

```text
Actual Instructional Time
+
Existing Scheduled Instructional Time
+
Proposed Booking
```

against the applicable rolling limits.

This prevents a scheduler from creating several individually valid bookings that collectively exceed the limit.

---

# 29. Instructor Booking Validation

Create a central PostgreSQL function:

```text
validate_training_booking()
```

The function shall validate:

```text
1. Instructor exists
2. Instructor active
3. Instructor role valid
4. Aircraft qualification exists
5. Qualification valid
6. Recurrent training valid
7. Currency valid
8. Instructor available
9. Instructor not double booked
10. FDTL 24-hour limit
11. FDTL 7-day limit
12. Resource exists
13. Resource compatible with aircraft
14. Resource approval valid
15. Resource available
16. Resource not double booked
17. Student eligible
18. Student available
19. Course valid
20. Lesson valid
```

Return structured results:

```json
{
  "valid": false,
  "checks": [
    {
      "code": "INSTRUCTOR_QUALIFIED",
      "passed": true
    },
    {
      "code": "FDTL_7_DAY",
      "passed": false,
      "current_minutes": 1680,
      "requested_minutes": 240,
      "maximum_minutes": 1800
    }
  ]
}
```

---

# 30. Matrix Constraint

The scheduling engine shall enforce:

```text
Instructor
    +
Aircraft Type
    +
Role
    +
Qualification
    +
Resource
    +
Resource Compatibility
    +
Time
    +
FDTL
```

Example:

```text
A320 FFS Session
        │
        ├── Aircraft Type = A320
        │
        ├── Resource = A320 FFS-01
        │
        ├── Instructor = Instructor A
        │
        └── Qualification
                │
                ├── A320
                ├── SFI
                ├── VALID
                └── CURRENT
```

Only when this entire relationship is valid can the booking become `CONFIRMED`.

---

# 31. Critical Improvement Over the Original Schema

Do **not** use:

```sql
simulators.aircraft_type_id
```

as the only aircraft relationship.

Instead:

```text
resources
      │
      ▼
resource_aircraft_types
      │
      ▼
aircraft_types
```

This provides flexibility for:

* Multiple aircraft variants
* Simulator configurations
* Multi-type devices
* Future fleet expansion

---

# 32. Critical Improvement — Qualification History

Do not simply overwrite:

```text
recurrent_expiry_date
```

Every recurrent event should create a historical record.

Example:

```text
2025 Recurrent
      ↓
Record #1

2026 Recurrent
      ↓
Record #2

2027 Recurrent
      ↓
Record #3
```

This is essential for auditability.

---

# 33. Critical Improvement — Staff Roles

Do not store:

```text
role = 'SFI'
```

as the only role on the staff profile.

A person may simultaneously be:

```text
SFI
+
SFE
+
GI
```

Therefore:

```text
staff
   ↓
staff_roles
```

must be many-to-many capable.

---

# 34. Critical Improvement — Training Event vs Schedule

Do not make `master_schedule` the complete training record.

Separate:

```text
Training Event
      ↓
Schedule
      ↓
Training Record
      ↓
Assessment
```

This allows a training event to have operational scheduling data independently from its eventual historical training record.

---

# 35. Required Indexes

```sql
CREATE INDEX idx_aircraft_types_name
ON aircraft_types(model_name);

CREATE INDEX idx_resources_category
ON resources(resource_category);

CREATE INDEX idx_resource_aircraft
ON resource_aircraft_types(
    resource_id,
    aircraft_type_id
);

CREATE INDEX idx_instructor_qualifications
ON instructor_qualifications(
    instructor_id,
    aircraft_type_id,
    role
);

CREATE INDEX idx_instructor_expiry
ON instructor_qualifications(
    expiry_date
);

CREATE INDEX idx_recurrent_expiry
ON instructor_recurrent_training(
    expiry_date
);

CREATE INDEX idx_schedule_instructor_time
ON master_schedule(
    instructor_id,
    start_time,
    end_time
);

CREATE INDEX idx_schedule_resource_time
ON master_schedule(
    resource_id,
    start_time,
    end_time
);

CREATE INDEX idx_schedule_aircraft_time
ON master_schedule(
    aircraft_type_id,
    start_time
);

CREATE INDEX idx_fdtl_instructor_time
ON fdtl_records(
    instructor_id,
    start_time
);
```

---

# 36. Instructor Dashboard Data Model

The instructor dashboard should obtain its information from the relational model rather than maintaining duplicated dashboard data.

Dashboard aggregates:

```text
staff
 │
 ├── staff_roles
 │
 ├── instructor_qualifications
 │
 ├── instructor_recurrent_training
 │
 ├── instructor_availability
 │
 ├── master_schedule
 │
 ├── fdtl_records
 │
 └── notifications
```

---

# 37. Instructor Dashboard

The dashboard shall display:

## Today's Schedule

```text
09:00 – 11:00
A320 FFS
Student: ABC
Lesson: FFS-04
```

## FDTL

```text
Rolling 24 Hours

5.0 / 6.0 Hours
████████░░

1.0 Hour Remaining
```

```text
Rolling 7 Days

24 / 30 Hours
████████░░

6 Hours Remaining
```

## Qualifications

```text
A320 SFI
VALID
Expires: 15 Nov 2026

B737 SFI
EXPIRING
Expires: 10 Sep 2026
```

## Recurrent Training

```text
Current
Next Due:
01 Dec 2026

Recurrent Window:
01 Sep 2026 – 01 Dec 2026
```

## Notifications

```text
⚠ B737 qualification expires in 17 days.

✓ A320 recurrent training currently valid.

⚠ FDTL: 6 hours remaining this rolling week.
```

---

# 38. RLS Architecture

Supabase Row Level Security shall be enabled on all user-facing tables.

Example:

```sql
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

ALTER TABLE instructor_qualifications
ENABLE ROW LEVEL SECURITY;

ALTER TABLE master_schedule
ENABLE ROW LEVEL SECURITY;

ALTER TABLE fdtl_records
ENABLE ROW LEVEL SECURITY;
```

---

# 39. Instructor RLS Example

An instructor should be able to view their own qualification records:

```sql
CREATE POLICY instructor_view_own_qualifications
ON instructor_qualifications
FOR SELECT
USING (
    instructor_id = auth.uid()
);
```

Similarly, instructors may view their own schedule:

```sql
CREATE POLICY instructor_view_own_schedule
ON master_schedule
FOR SELECT
USING (
    instructor_id = auth.uid()
    OR examiner_id = auth.uid()
);
```

Actual production RLS should additionally enforce organisation/tenant boundaries.

---

# 40. Audit Log

Every compliance-sensitive change must be recorded.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    organisation_id UUID
        REFERENCES organisations(id),

    user_id UUID
        REFERENCES auth.users(id),

    action VARCHAR(100) NOT NULL,

    entity_type VARCHAR(100) NOT NULL,

    entity_id UUID,

    old_data JSONB,

    new_data JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Examples:

```text
QUALIFICATION_CREATED
QUALIFICATION_UPDATED
QUALIFICATION_EXPIRED
RECURRENT_COMPLETED
SCHEDULE_CREATED
SCHEDULE_CANCELLED
SCHEDULE_RESCHEDULED
FDTL_BOOKING_BLOCKED
RESOURCE_STATUS_CHANGED
ASSESSMENT_COMPLETED
```

---

# 41. Database Relationship Summary

```text
organisations
│
├── aircraft_types
│     │
│     ├── courses
│     │      └── course_lessons
│     │
│     ├── resource_aircraft_types
│     │      └── resources
│     │
│     └── instructor_qualifications
│            └── staff
│
├── staff
│     ├── staff_roles
│     ├── instructor_qualifications
│     ├── instructor_recurrent_training
│     ├── instructor_availability
│     ├── fdtl_records
│     └── master_schedule
│
├── students
│     ├── student_courses
│     ├── cohort_members
│     └── training_events
│
├── resources
│     ├── resource_aircraft_types
│     └── resource_approvals
│
└── master_schedule
       │
       ├── instructor
       ├── examiner
       ├── resource
       ├── aircraft
       └── training_event
```

---

# 42. Final Scheduling Flow

The production scheduling flow shall be:

```text
Scheduler selects course
          ↓
Selects student/cohort
          ↓
Selects lesson
          ↓
System determines aircraft type
          ↓
System identifies compatible resources
          ↓
System identifies qualified instructors
          ↓
System filters by qualification validity
          ↓
System filters by recurrent status
          ↓
System filters by instructor availability
          ↓
System calculates FDTL
          ↓
System checks student availability
          ↓
System checks simulator availability
          ↓
System checks overlapping bookings
          ↓
System performs final transaction-level validation
          ↓
             ┌───────────────┐
             │               │
           VALID           INVALID
             │               │
             ▼               ▼
        CONFIRM BOOKING    BLOCK
                             │
                             ▼
                       Show exact reason
```

---

# 43. Core Business Rule

The platform shall never allow the frontend to determine whether a booking is legal by itself.

The frontend may provide:

```text
✓ Available
✓ Qualified
✓ Valid
```

for user experience.

However, the final authority shall be:

```text
PostgreSQL
+
Server-side API
+
Transactional Validation Engine
```

---

# 44. Final Matrix

The central operational matrix is:

| Dimension            | Example       |
| -------------------- | ------------- |
| Aircraft Type        | A320          |
| Course               | A320 Initial  |
| Lesson               | FFS-04        |
| Student              | Student A     |
| Instructor           | Instructor A  |
| Instructor Role      | SFI           |
| Qualification        | A320 SFI      |
| Qualification Status | VALID         |
| Recurrent Status     | VALID         |
| Resource             | A320 FFS-01   |
| Resource Status      | AVAILABLE     |
| Date                 | 10-Sep-2026   |
| Time                 | 09:00–11:00   |
| FDTL 24h             | 4.0 / 6.0 hrs |
| FDTL 7d              | 24 / 30 hrs   |
| Booking Status       | CONFIRMED     |

This is the fundamental **ATO Training Matrix** that the platform must manage.

---

# 45. Development Priority

The development team should implement the database in this order:

```text
1. Extensions
2. ENUMs
3. Organisations
4. Aircraft Types
5. Resources
6. Resource/Aircraft Mapping
7. Resource Approvals
8. Staff
9. Staff Roles
10. Qualification Types
11. Instructor Qualifications
12. Recurrent Training
13. Instructor Availability
14. Students
15. Cohorts
16. Courses
17. Course Lessons
18. Student Courses
19. Training Events
20. Master Schedule
21. Scheduling Constraints
22. FDTL Rules
23. FDTL Functions
24. Audit Logs
25. RLS Policies
26. Seed Data
27. Automated Tests
```

---

# 46. Important Implementation Note

This schema is the **foundational relational model**, not the complete final production schema.

Before production deployment, the following should additionally be implemented:

* Complete RLS policies
* Role/permission matrix
* Resource maintenance tables
* Student lesson progress
* Training records
* Assessment records
* Documents/document versions
* Notifications
* Regulatory rules
* Instructor currency
* Course prerequisites
* Course versions/revisions
* Availability constraints
* Schedule approval workflow
* FDTL scheduled-time calculation
* Transaction-safe booking procedure
* Audit triggers
* Automated expiry jobs
* Supabase Edge Functions
* Comprehensive automated tests

The most important architectural principle is:

> **Do not build the application around the calendar. Build it around the relational training/compliance model, and make the calendar a view of that model.**

That approach will allow the platform to scale from **4 aircraft families and a handful of simulators to a large ATO operation with many fleets, devices, instructors, examiners, courses, students and regulatory constraints without redesigning the core database.**
