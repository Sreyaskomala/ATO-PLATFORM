# ATO Training & Resource Management Platform — Product Requirements & Architecture v2.0
## Operations & Compliance Management for ATOs, TRTOs & Airline Training Centres

**Document Version:** 2.0.0  
**Regulatory Standards:** DGCA India (CAR Section 7 & 8) • EASA Part-ORA.ATO / Part-FCL • FAA Part 142  
**Tech Stack:** Next.js (App Router) • TypeScript • Tailwind CSS • Supabase / PostgreSQL (Row-Level Security)

---

# 1. Operational Overview

### 1.1 Practical Context
At an Approved Training Organisation (ATO) or Type Rating Training Organisation (TRTO), putting a 4-hour simulator session on the roster requires checking multiple hard regulatory conditions before dispatch:
1. **Cadet Eligibility & Progression:** Completed prerequisite ground subjects, cleared preceding simulator lessons, and valid medical certificate.
2. **Instructor Authorisation:** Valid type rating endorsement, correct instructional privilege (`GI_TECH`, `GI_PERF`, `SFI`, `SFE`), and active DGCA approval.
3. **Recurrent Checks & Grace Windows:** Annual recurrent check completed within the base-month window (Base Month ± 60 days).
4. **90-Day Recency / Currency:** Minimum 3 takeoffs/landings or 1 recurrent simulator session in the preceding 90 days.
5. **Flight & Duty Time Limitations (FDTL):** Max 6.0 hours instructional/briefing duty per 24 hours, max 30.0 duty hours per 7 consecutive days, and required minimum rest.
6. **Device Compatibility:** Simulator aerodynamic model and powerplant variant match the syllabus lesson (e.g. A320 CFM56 vs NEO PW1100G).
7. **FSTD Qualification & Approvals:** Current Level D qualification certificate issued by the regulatory authority.
8. **Device Defect & MMI Status:** Master Minimum Simulator Equipment List (MMI) checks ensure no inoperative components block scheduled maneuvers.
9. **Facility & Resource Availability:** Bay slot, briefing room, and instructor calendar free of overlaps.

### 1.2 System Purpose
The platform connects curriculum footprints, instructor qualifications, simulator bays, master scheduling, electronic grading, and quality records into a single multi-tenant system.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ATO TRAINING OPERATIONS SUITE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌───────────────────────────┐             ┌───────────────────────────┐   │
│   │    TRAINING MANAGEMENT    │             │   PEOPLE & QUALIFICATIONS │   │
│   │ Courses • Syllabus • CBTA │             │ GI • SFI • SFE • Cadets   │   │
│   └─────────────┬─────────────┘             └─────────────┬─────────────┘   │
│                 │                                         │                 │
│                 └───────────────────┬─────────────────────┘                 │
│                                     ▼                                       │
│                       ┌───────────────────────────┐                         │
│                       │    REGULATORY VALIDATOR   │                         │
│                       │   • Hard Legal Rules      │                         │
│                       │   • 24h & 7d FDTL Limits  │                         │
│                       │   • Base Month Windows    │                         │
│                       │   • FSTD Parity & MMI     │                         │
│                       └─────────────┬─────────────┘                         │
│                                     ▼                                       │
│   ┌───────────────────────────┐             ┌───────────────────────────┐   │
│   │    FSTD FLEET & BAYS      │             │     MASTER SCHEDULER      │   │
│   │ FFS Level D • FTD Level 2 │             │ Drag-and-Drop • Timeline  │   │
│   └─────────────┬─────────────┘             └─────────────┬─────────────┘   │
│                 │                                         │                 │
│                 └───────────────────┬─────────────────────┘                 │
│                                     ▼                                       │
│                       ┌───────────────────────────┐                         │
│                       │   GO / NO-GO DISPATCH     │                         │
│                       └─────────────┬─────────────┘                         │
│                                     │                                       │
│          ┌──────────────────────────┼──────────────────────────┐            │
│          ▼                          ▼                          ▼            │
│   ┌───────────────┐          ┌───────────────┐          ┌───────────────┐   │
│   │  INSTRUCTOR   │          │  E-GRADING &  │          │ QUALITY, SMS  │   │
│   │   DASHBOARD   │          │  TRAINING LOG │          │ & AUDIT DESK  │   │
│   └───────────────┘          └───────────────┘          └───────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 2. Industry Benchmark & Functional Mapping

Analysis of production training software (PlaneSym, QMSmart/SimQube, Aviatize, Cumulus, SmartCrew, Timefold) informs our technical scope:

| System Studied | Relevant Features | Limitations Identified | Implementation Approach |
| :--- | :--- | :--- | :--- |
| **QMSmart / SimQube** | DGCA/EASA TRTO workflows, instructor calendars, defect logs, discrepancy reports, QTG tracking. | Traditional UI; compliance findings separate from daily schedule. | **Primary Functional Reference**: Link instructor legality, maintenance discrepancies, and session records directly. |
| **PlaneSym** | Part 142 course footprints, simulator fleet records, digital logbooks, MMI tracking. | Separate products for training vs fleet; US-centric regulations. | **Unified Relational Model**: Map courses, simulator fleet bays, and defect logs in a single relational schema. |
| **Aviatize** | Interactive timeline scheduler, multi-resource views, conflict detection. | General flight school focus; lighter on airline-grade FDTL and type-specific privilege checks. | **Timeline Scheduler UX**: High-density interactive timeline grid with real-time legal validation. |
| **Cumulus** | Clear validity tracking, expiration alerts, CBTA progress bars, Go/No-Go readiness indicators. | Geared primarily for GA flight training rather than Level D multi-bay TRTOs. | **Operational Readiness Model**: Real-time **GO / NO-GO Session Readiness Inspector**. |
| **SmartCrew** | Modern full-stack architecture, clean crew portal, duty limit counters. | Generic airline flight-crew structure; lacks FSTD qualification and syllabus prerequisites. | **Roster & Portal Patterns**: Crew self-service dashboard with FDTL utilization gauges and notifications. |
| **Timefold** | Open-source constraint solver (Apache-2.0). | Complex backend solver; cannot replace deterministic legal verification. | **Phase 2 Optimization Layer**: Automated schedule recommendations for soft preferences after hard legal checks pass. |
| **ClearProp** | Flight-school management and member billing. | Proprietary flight club SaaS; narrow operational scope. | **Not Used**: Inapplicable to airline type rating centers. |

---

# 3. Multi-Tenant SaaS Architecture

Tenant isolation is handled at the database level using PostgreSQL Row-Level Security (RLS). Every operational record belongs to an organization.

```text
                                ORGANISATION (Tenant)
                                   id: UUID
                                   legal_name: string
                                   regulatory_authority: 'DGCA' | 'EASA' | 'FAA'
                                   ato_certificate_no: string
                                   fdtl_ruleset: 'DGCA_CAR_SEC7' | 'EASA_ORO_FTL'
                                           │
    ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
    ▼                  ▼                   ▼                   ▼                  ▼
Fleets & Types     Curricula & CBTA    People & Cadets     FSTD Devices       Master Schedule
(A320, B737, ATR)  (Ground, FTD, FFS)  (GI, SFI, SFE, SME) (Level D, Level 2) (Sessions & Roster)
    │                  │                   │                   │                  │
    └──────────────────┴───────────────────┼───────────────────┴──────────────────┘
                                           ▼
                                Supabase PostgreSQL + RLS
                                (tenant isolation via org_id)
```

### 3.1 Security & Data Isolation
- Every core table includes `organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`.
- RLS policies verify `auth.jwt() ->> 'organization_id' = organization_id` on all read and write queries.
- Foreign key constraints maintain relational integrity strictly within tenant boundaries.

---

# 4. Operational Domains

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                               OPERATIONAL MODULES                                │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 1. TRAINING MANAGEMENT      │ Curricula, Course Footprints, CBTA, Cadet Progress │
│ 2. PEOPLE & QUALIFICATIONS  │ SFI/SFE/GI Privileges, Recurrent Windows, Currency │
│ 3. FSTD & RESOURCE MGT      │ FFS Level D, FTD Level 2, Classrooms, QTG, MMI     │
│ 4. SCHEDULER & ROSTERING    │ Drag-and-Drop Master Timeline, Reassignment        │
│ 5. REGULATORY COMPLIANCE    │ Deterministic GO/NO-GO Validator, FDTL Calculator  │
│ 6. TRAINING RECORDS         │ CA-40 Forms, E-Grading Sheets, Digital Signatures  │
│ 7. QUALITY & SAFETY (QMS)   │ Audits, Findings, CAPA, Simulator Interrupts       │
│ 8. ANALYTICS & ADMIN        │ Bay Utilization %, FDTL Risk, Roster Heatmaps, RBAC│
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Training & Curriculum Management

### Course Footprints & Syllabi
Structured hierarchy defining aviation training curricula (e.g., *A320 Initial Type Rating*, *B737 Recurrent & PPC*, *ATR 72-600 Upgrade*):

```text
Course: A320 Initial Type Rating (128 Total Hours)
  │
  ├── Phase 1A: Technical Ground School (GI_TECH / Classroom / 40.0h)
  │     ├── TECH-01: Aircraft Systems & Powerplant (6.0h)
  │     ├── TECH-02: Hydraulics, Electrics & Flight Controls (6.0h)
  │     └── ...
  │
  ├── Phase 1B: Performance & Flight Planning (GI_PERF / Classroom / 20.0h)
  │     ├── PERF-01: Takeoff/Landing Computations & W&B (4.0h)
  │     └── PERF-02: Route Planning & In-Flight Turnaround (4.0h)
  │
  ├── Phase 2A: Flight Training Device (FTD Level 2 / SFI / 16.0h)
  │     ├── FTD-01: FMS Setup, Pushback & Engine Start (4.0h)
  │     ├── FTD-02: Normal Operations & ECAM Discipline (4.0h)
  │     └── ...
  │
  ├── Phase 2B: Full Flight Simulator (FFS Level D / SFI / 32.0h)
  │     ├── FFS-01: Takeoff, Climb, Handling & Stalls (4.0h sim + 2.0h brief)
  │     ├── FFS-02: Engine Failure & Single-Engine Approaches (4.0h sim)
  │     ├── FFS-03: Windshear, TCAS, EGPWS & Rejected Takeoff (4.0h sim)
  │     └── ...
  │
  └── Phase 3: CA-40 Skill Test / License Endorsement (FFS Level D / SFE / 4.0h sim)
        └── SKILL-TEST: Pilot Proficiency Check (PPC) & IR/PBN Endorsement
```

### Competency-Based Training and Assessment (CBTA)
In accordance with ICAO Doc 9868 and DGCA requirements, sessions track 9 Core Competencies:
1. **PRO:** Application of Procedures & Compliance
2. **COM:** Communication
3. **FPA:** Flight Path Management — Automation
4. **FPM:** Flight Path Management — Manual
5. **LTW:** Leadership & Teamwork
6. **PSD:** Problem Solving & Decision Making
7. **SAW:** Situational Awareness
8. **WLM:** Workload Management
9. **KNO:** Application of Knowledge

Grading Scale: **1 (Unsatisfactory)** to **5 (Exemplary)**, with behavioural indicators and automated remediation flags for scores ≤ 2.

---

## 2. People, Privileges & Qualification Management

### Instructor Roles & Privileges
| Role Code | Description | Operational Scope | Required Approvals |
| :--- | :--- | :--- | :--- |
| **GI_TECH** | Ground Instructor — Technical | Classroom technical systems & avionics | DGCA GI Approval / Type Endorsement |
| **GI_PERF** | Ground Instructor — Performance / SME | Flight planning, weight & balance, dispatch | DGCA SME Approval |
| **SFI** | Synthetic Flight Instructor | FTD Level 2 and FFS Level D instructional sessions | DGCA SFI CAR Approval + Active ATPL/IR |
| **SFE** | Synthetic Flight Examiner | Skill Tests, PPC Checks, CA-40 License Endorsements | DGCA SFE CAR Authorization + Annual Standardisation |

### Recurrent Validity & Base Month Logic
- **Base Month:** Assigned calendar month for annual recurrent checks (e.g. November).
- **Grace Period (3-Month Window):** Recurrent check may be completed within **Base Month - 2 months** to **Base Month** without shifting the anniversary date.
- **Status Indicators:**
  - 🟢 **CURRENT:** > 60 days remaining
  - 🟡 **EXPIRING SOON:** ≤ 60 days remaining (Recurrent window open)
  - 🔴 **EXPIRED / LOCKED OUT:** 0 days remaining (Scheduling blocked)

### 90-Day Currency
Instructors must hold recent operating or simulator experience: minimum 3 sectors or 1 FFS session in the preceding 90 days on aircraft type.

---

## 3. FSTD Fleet & Resource Management

### Device Classifications
- **FFS (Full Flight Simulator):** Level D certified, 6-DOF motion, 200° collimated visual system.
- **FTD (Flight Training Device):** Level 2 certified, representative cockpit, dual touch avionics, functional FMS.
- **Classrooms:** Briefing rooms and CBT stations.

### Aerodynamic & Powerplant Variant Parity
- *FFS-01 (A320):* A320-200 CFM56-5B, A320-200 IAE V2500, A320-271N PW1100G.
- *Verification Rule:* If a syllabus lesson requires *A320neo PW1100G*, scheduling on an FFS configured for *CFM56* without an approved changeover buffer is rejected.

### Maintenance & MMI Defect Tracking
- **Daily Maintenance Blocks:** Scheduled pre-flight inspection and QTG test windows.
- **MMI Defect Logging:** Defects logged as `AOG` (Grounded), `RESTRICTED` (Specific maneuvers barred), or `MINOR` (No training impact). Sessions requiring restricted items are blocked from dispatch.

---

## 4. Master Scheduling & Operational Rostering

### Timeline Grid
- **Bay Timeline View:** Y-axis: Simulator Bays (FFS-01, FFS-02, FTD-01, Rooms); X-axis: 24-hour time slots.
- **Instructor Roster View:** Y-axis: Instructors; X-axis: Days/Weeks with FDTL usage bars.
- **Batch Progression View:** Gantt chart showing cohorts moving across Ground -> FTD -> FFS -> Skill Test.
- **Drag-and-Drop Interaction:** Moving a session executes the compliance validator in real time; if conflicts or legal violations occur, an instant modal details the violation and rejects placement.

### Operational Reassignment
When a simulator goes AOG or an instructor reports unavailable:
1. Identify all affected training sessions.
2. Query compatible alternative FSTD devices and qualified standby instructors.
3. Verify compliance across alternative slots.
4. Apply batch reassignment with notifications to affected crew and students.

---

## 5. Regulatory Compliance & GO/NO-GO Dispatch

### 9-Stage Validation Sequence
Every booking request passes through a deterministic sequence:

```text
                   BOOKING DISPATCH REQUEST
                              │
  1. [COURSE PREREQUISITES]   ▼ Passed? ──── No ───► 🔴 NO-GO: Prerequisite incomplete
  2. [STUDENT ELIGIBILITY]    ▼ Passed? ──── No ───► 🔴 NO-GO: Medical/licence expired
  3. [INSTRUCTOR ROLE PRIV]   ▼ Passed? ──── No ───► 🔴 NO-GO: SFE required for CA-40 Check
  4. [INSTRUCTOR RECURRENT]   ▼ Passed? ──── No ───► 🔴 NO-GO: Recurrent expired (> 365 days)
  5. [INSTRUCTOR CURRENCY]    ▼ Passed? ──── No ───► 🔴 NO-GO: 90-day currency lapsed
  6. [FDTL 24H / 7D / REST]   ▼ Passed? ──── No ───► 🔴 NO-GO: 7-day limit (30.0h) exceeded
  7. [FSTD TYPE COMPATIBILITY]▼ Passed? ──── No ───► 🔴 NO-GO: Engine/variant mismatch
  8. [FSTD APPROVAL & MMI]    ▼ Passed? ──── No ───► 🔴 NO-GO: FSTD AOG or approval expired
  9. [RESOURCE AVAILABILITY]  ▼ Passed? ──── No ───► 🔴 NO-GO: Slot double-booked
                              │
                              ▼
                         🟢 DISPATCH APPROVED (GO)
```

### DGCA CAR Section 7 FDTL Calculations
Instructor Flight and Duty Time Limitations:

$$\text{Daily Duty (24 Consecutive Hours)} = \text{Sim Instructional Hours} + \text{Briefing Hours} \le 6.0\text{ h}$$

$$\text{Weekly Duty (7 Consecutive Days)} = \sum_{d=1}^{7} \text{Duty Hours}_d \le 30.0\text{ h}$$

$$\text{Minimum Rest Period} = \max(12.0\text{ h}, \text{Preceding Duty Duration})$$

$$\text{Consecutive Duty Days} \le 6 \implies \text{Mandatory 36 Consecutive Hours Rest}$$

---

## 6. Training Records & Assessments

### Electronic Grading Sheet
- Tablet-friendly interface for SFI/SFE during simulator sessions.
- Maneuver scoring (Takeoff with Engine Failure at $V_1$, Precision ILS CAT IIIB, Windshear Recovery).
- CBTA 9-competency radar score generation.
- Instructor remarks and remedial training prescriptions for below-standard items.

### DGCA CA-40 & PPC Forms
- Digital generation of official **DGCA CA-40 Skill Test Form** and **Pilot Proficiency Check (PPC)** records.
- Digital sign-offs for Instructor, Trainee, and Head of Training.
- Tamper-evident audit log of all grading submissions.

---

## 7. Quality, Safety (SMS) & Audit Desk

### QMS Findings & CAPA
- Audit tracking for internal ATO audits and DGCA regulatory inspections.
- Findings classified as `Level 1` (Safety/Regulatory Breaches — 7-day closure), `Level 2` (Standard Non-conformities — 30-day closure), or `Observation`.
- Corrective and Preventive Action (CAPA) workflow with evidence tracking and sign-off.

### Simulator Interruptions & Discrepancies
- Real-time logging of simulator interruptions (e.g. visual system glitch during session).
- Lost training time calculation, credit generation, and engineering work ticket dispatch.

---

## 8. Analytics & ATO Administration

### Operational Metrics
- **FSTD Bay Utilization:** Hours delivered / 24h capacity (target: > 85% for Level D FFS).
- **Instructor Duty Capacity:** Active vs consumed FDTL hours across the roster.
- **Batch Progression:** Cadets on schedule vs delayed across syllabus milestones.
- **Compliance Health:** Count of active, expiring, and lapsed qualifications.

---

# 5. Role-Based Permissions

```text
┌─────────────────────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Function                │ OrgAdm  │ HT/CFI  │ Sched   │ SFI/SFE │ Maint   │ Cadet   │
├─────────────────────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Org Settings & Profile  │   CRUD  │    R    │    -    │    -    │    -    │    -    │
│ Course & Syllabus Setup │   CRUD  │   CRUD  │    R    │    R    │    -    │    R    │
│ Instructor Roster       │   CRUD  │   CRUD  │    R    │    R    │    -    │    -    │
│ FSTD Maintenance / MMI  │    R    │    R    │    R    │    R    │   CRUD  │    -    │
│ Master Timeline Sched   │    R    │   CRUD  │   CRUD  │    R    │    R    │    R    │
│ Go/No-Go Override       │    -    │  APPROV │    -    │    -    │    -    │    -    │
│ Electronic Grading Sheet│    -    │    R    │    -    │   CRUD  │    -    │    R    │
│ CA-40 Sign-Off          │    -    │  SIGN   │    -    │  SIGN   │    -    │   SIGN  │
│ QMS / Audit Findings    │    R    │   CRUD  │    -    │    -    │    R    │    -    │
│ Personal Roster / FDTL  │    R    │    R    │    R    │   SELF  │   SELF  │   SELF  │
└─────────────────────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
Legend: CRUD = Full Access, R = Read Only, APPROV = Dual-sign approval, SIGN = Digital Signature, SELF = Own records only
```

---

# 6. Screen Inventory & Navigation

```text
APPLICATION ROUTING
├── /                                   (Master Layout & View Switcher)
├── /dashboard                          (Persona-Aware Dashboard)
│     ├── /dashboard/instructor         (Instructor Command Center & FDTL Status)
│     ├── /dashboard/scheduler          (Master Timeline Drag-and-Drop)
│     └── /dashboard/executive          (Fleet Utilization & ATO KPIs)
├── /training
│     ├── /training/courses             (Course Syllabus & Footprints Builder)
│     ├── /training/batches             (Cadet Cohort Pipeline & CBTA Progress)
│     └── /training/records             (Electronic Grading Sheets & CA-40s)
├── /people
│     ├── /people/instructors           (GI/SFI/SFE Legality Matrix & Recurrents)
│     └── /people/students              (Cadet Profiles, Medicals & Prerequisites)
├── /fstd
│     ├── /fstd/fleet                   (FFS / FTD Fleet Bays & Approvals)
│     ├── /fstd/maintenance             (MMI Defect Log & Engineering Windows)
│     └── /fstd/qtg                     (Qualification Test Guide Records)
├── /compliance
│     ├── /compliance/go-no-go          (Real-Time Session Dispatch Inspector)
│     ├── /compliance/fdtl-matrix       (Instructor Duty Limit Monitor)
│     └── /compliance/audits            (QMS Findings & CAPA Desk)
└── /settings
      ├── /settings/organization        (ATO Profile, DGCA Approval No, Tenant)
      └── /settings/users               (User Directory & Permissions)
```

---

# 7. Database Entity Schema

### Primary Tables
1. `organizations`: Tenant root with ATO certificate, legal entity, and active regulatory ruleset.
2. `aircraft_fleets`: Aircraft types (A320, B737, ATR 72, etc.) and category classifications.
3. `fstd_devices`: Simulators (FFS Level D, FTD Level 2, Classrooms) with approval numbers, bays, and operational states.
4. `fstd_defects`: MMI defect logs with severity, operational restrictions, and engineer sign-offs.
5. `courses` & `course_syllabus_items`: Complete curriculum footprint with phase hours and role prerequisites.
6. `training_batches`: Student cohorts mapped to courses with progress tracking.
7. `cadet_students`: Student profiles with medical validity and ground/sim progress flags.
8. `instructors`: GI/SFI/SFE profiles, approvals, base months, and recurrent window calculations.
9. `instructor_qualifications`: Granular type ratings and DGCA privilege authorizations.
10. `training_sessions`: Master schedule events linking instructor, student, FSTD device, syllabus session, and timestamps.
11. `fdtl_duty_records`: Historical and projected duty hours for continuous rolling FDTL validation.
12. `electronic_grading_records`: Maneuver grades, CBTA competency matrix, and instructor debrief comments.
13. `qms_findings`: Audit findings, root causes, CAPA action plans, and regulatory deadlines.
14. `audit_logs`: Security audit log tracking user actions and dispatch decisions.

---

# 8. API & Server Actions

### Validation Endpoint
`POST /api/compliance/validate-booking`
```json
// Request Payload
{
  "organization_id": "8f7a9d20-1111-4a2e-8b9a-7c8d9e0f1a2b",
  "course_id": "c100-a320-initial",
  "session_code": "FFS-04",
  "instructor_id": "inst-sfi-sharma",
  "student_ids": ["cadet-rahul-verma", "cadet-priya-nair"],
  "fstd_device_id": "fstd-ffs-01-a320",
  "scheduled_date": "2026-08-26",
  "start_time": "14:00",
  "end_time": "18:00",
  "briefing_hours": 2.0,
  "sim_hours": 4.0
}

// Response Payload (GO)
{
  "status": "GO",
  "passed_all_rules": true,
  "rules_evaluated": [
    { "category": "COURSE_PREREQUISITE", "passed": true, "message": "FFS-03 cleared with grade Satisfactory" },
    { "category": "STUDENT_ELIGIBILITY", "passed": true, "message": "Class 1 Medical valid (210 days remaining)" },
    { "category": "INSTRUCTOR_ROLE", "passed": true, "message": "SFI privilege valid on A320" },
    { "category": "INSTRUCTOR_RECURRENT", "passed": true, "message": "Base month Nov; window current (88 days remaining)" },
    { "category": "INSTRUCTOR_CURRENCY", "passed": true, "message": "3 sectors completed in last 28 days" },
    { "category": "FDTL_24H", "passed": true, "message": "Duty 6.0h <= 6.0h limit" },
    { "category": "FDTL_7D", "passed": true, "message": "7-day duty 26.0h + 6.0h = 32.0h -> 26.0h used; projection legal" },
    { "category": "FSTD_APPROVAL", "passed": true, "message": "DGCA Level D Approval valid until 2027-03-31" },
    { "category": "RESOURCE_AVAILABILITY", "passed": true, "message": "Bay 01 available; no conflicts" }
  ],
  "fdtl_metrics": {
    "projected_24h_duty": 6.0,
    "remaining_24h_capacity": 0.0,
    "projected_7d_duty": 26.0,
    "remaining_7d_capacity": 4.0
  }
}
```

---

# 9. Implementation Roadmap

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DEVELOPMENT ROADMAP                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🟢 MVP (Sprint 1-2): THE COMPLIANCE-AWARE SCHEDULING CORE                  │
│  ├── Multi-tenant foundation & Supabase schema with RLS                     │
│  ├── Master Drag-and-Drop Scheduler with instant Go/No-Go validation        │
│  ├── DGCA CAR Section 7 FDTL Calculations (24h & 7d limits)                 │
│  ├── SFI / SFE / GI Legality & Recurrent Base-Month Matrix                  │
│  ├── FFS / FTD Fleet Bay Manager & MMI Defect Log                           │
│  ├── Instructor Command Center (FDTL Gauges, Roster, Recurrent Alerts)      │
│  └── Student Progression & Batch Pipeline                                   │
│                                                                             │
│  🟡 PHASE 2 (Sprint 3-4): ADVANCED TRAINING OPERATIONS                      │
│  ├── Electronic Grading Sheet & CBTA 9-Competency Assessment System         │
│  ├── DGCA CA-40 & PPC Form Generator with Digital Signatures                │
│  ├── Automated Reassignment Assistant for AOG / Sick Leave Events           │
│  ├── QMS Findings, CAPA Tracking & Simulator Interrupt Logging              │
│  ├── Schedule Optimization Adapter for Soft Objectives                      │
│  └── Mobile PWA Roster View for Instructors & Cadets                        │
│                                                                             │
│  🔵 PHASE 3 (Sprint 5+): ENTERPRISE EXTENSIONS                              │
│  ├── QTG Run Log & Simulator Engineering Telemetry                          │
│  ├── Airline Training Billing & Bay Hourly Utilization Invoicing            │
│  ├── Multi-Jurisdiction Rulesets (DGCA, EASA, FAA)                          │
│  ├── Automated Schedule Suggestions & Maintenance Forecasting               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
