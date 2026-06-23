# AVI Training Management System (ATMS)

**Product Requirements Document (PRD)**

| | |
|---|---|
| **Version** | 2.0 (Production-Grade Expansion) |
| **Author** | AVI India |
| **Status** | Draft for Engineering & Stakeholder Review |
| **Target Industry** | Approved Training Organizations (ATO), Airlines, FSTD Operators, Type Rating Training Organizations (TRTO), Maintenance Training Organizations (MTO), Cabin Crew Training Centers |
| **Document Type** | Full Product & Technical Requirements Specification |

---

## Document Control

| Version | Date | Change Summary |
|---|---|---|
| 1.0 | Original | Initial conceptual PRD |
| 2.0 | Current | Expanded to production-grade spec: data models, system architecture, API contracts, state machines, RBAC matrices, SLAs, AI subsystem design, integration layer, mobile/offline strategy, multi-tenancy, billing, and compliance engine detail added across all modules. New modules added: Architecture, Multi-Tenancy & Data Isolation, Billing & Commercial Management, Learning Management System (LMS) Core, Integration & API Layer, Mobile & Offline Strategy, Data Migration & Onboarding, Localization, Accessibility, DevOps & Release Management, Support & SLAs. |

---

## Table of Contents

1. Executive Summary
2. Business Objectives & Success Metrics
3. Market & Competitive Context
4. User Roles & Personas
5. System Architecture
6. Module Architecture (Overview Map)
7. Multi-Tenancy & Data Isolation
8. Dashboard
9. Master Data Management
10. Student Management
11. Batch Management
12. Course Management
13. Learning Management System (LMS) Core
14. Training Planning Module
15. Ground School Management
16. Simulator Management
17. Crew Pairing Management
18. Instructor Management
19. Examination Management
20. Assessment Management
21. Competency Management
22. Training Records Management
23. Compliance Management
24. Certification Module
25. Resource Management
26. Workflow Management
27. Notification Engine
28. Reporting Module
29. Audit Trail
30. AI Subsystem (Advanced)
31. Integration & API Layer
32. Billing & Commercial Management
33. Mobile & Offline Strategy
34. Security Requirements
35. Non-Functional Requirements
36. Data Migration & Onboarding
37. Localization & Internationalization
38. Accessibility
39. DevOps, Release Management & Environments
40. Support, SLAs & Customer Success
41. Risk Register
42. Future Roadmap
43. Recommended Navigation Structure
44. Glossary

---

# 1. Executive Summary

The AVI Training Management System (ATMS) is an enterprise-grade, multi-tenant SaaS platform that digitizes and automates the full lifecycle of aviation training operations — from student onboarding through course delivery, simulator scheduling, examination, competency assessment, certification, and regulatory compliance reporting.

ATMS is designed to serve:

* Approved Training Organizations (ATO)
* Airlines (Flight Operations Training Departments)
* Flight Simulation Training Device Operators (FSTD Operators)
* Type Rating Training Organizations (TRTO)
* Maintenance Training Organizations (MTO)
* Cabin Crew Training Centers

The platform replaces spreadsheets, manual registers, email-driven scheduling, and siloed point tools with a single system of record. It is built as a cloud-native, API-first, multi-tenant SaaS product so that a single AVI deployment can serve many customer organizations securely and independently, while also supporting dedicated single-tenant deployments for customers with sovereignty or security requirements (e.g., state-owned carriers, defense-adjacent training centers).

Version 2.0 of this PRD elevates the original concept document to a build-ready specification: every module now defines its data model, state transitions, role-based permissions, API surface, and acceptance criteria, in addition to a genuinely advanced AI subsystem, a full integration layer, billing/commercial management for training-as-a-service contracts, and the non-functional rigor (security, performance, DR, accessibility, localization) expected of a system that will sit inside regulator-audited operations.

---

# 2. Business Objectives & Success Metrics

## 2.1 Primary Objectives

* Centralize all training operations in a single system of record
* Automate training planning and scheduling end-to-end
* Maximize simulator and classroom utilization
* Maximize instructor utilization while respecting fatigue/currency limits
* Ensure continuous regulatory compliance (DGCA, EASA, FAA, and others)
* Maintain a permanent, tamper-evident digital training record per trainee
* Reduce administrative workload through automation and self-service
* Enable instant audit readiness ("audit in a click")
* Provide commercial visibility (utilization-to-revenue linkage) for FSTD operators and ATOs running training as a paid service
* Provide a foundation for predictive, AI-assisted operations (scheduling, compliance, resourcing)

## 2.2 Success Metrics (KPIs)

| KPI | Target | Measurement Method |
|---|---|---|
| Simulator Utilization | >85% | Scheduled hours / available hours, per device, monthly |
| Instructor Utilization | >80% | Assigned hours / available hours, per instructor, monthly |
| Schedule Conflicts | <1% | Conflicts auto-detected / total sessions scheduled |
| Training Record Availability | 100% | Records retrievable within SLA on request |
| Audit Findings | Reduced by 90% (vs. pre-ATMS baseline) | Count of findings in regulator/internal audits, year-over-year |
| Time-to-Schedule (per batch) | <30 minutes | Time from batch creation to fully auto-generated schedule |
| Mean Time to Detect Non-Compliance | <24 hours | Time between record becoming non-compliant and system alert firing |
| Platform Uptime | 99.9% | Measured per Section 35 |
| Mobile Adoption (instructors/students) | >70% within 6 months of rollout | App MAU / total active users |

## 2.3 Non-Goals (Explicitly Out of Scope for v2.0)

To keep this PRD honest about scope, the following are **not** committed in this version and are deferred to the Future Roadmap (Section 42):

* Full payroll/HR system (ATMS will integrate with, not replace, HRIS)
* Flight Data Monitoring (FDM)/Flight Operations Quality Assurance (FOQA) analytics
* Crew rostering for live commercial operations (ATMS handles training pairing only, not operational crew rostering)
* Native accounting/general ledger (ATMS will integrate with ERP/accounting systems, not replace them)

---

# 3. Market & Competitive Context

ATMS competes in the aviation training technology category against a mix of legacy LMS vendors retrofitted for aviation, point solutions for simulator scheduling, and large ERP-style training suites sold by simulator OEMs. The differentiated position for ATMS is:

* **Regulatory-native design**: compliance rules (DGCA CAR, EASA Part-ORA/FCL/ARA, FAA Part 121/142) are modeled as first-class data objects, not bolted-on report templates.
* **Unified scheduling across people, devices, and rooms**: most competitors solve either simulator scheduling or classroom/LMS scheduling, rarely both with a single conflict-resolution engine.
* **AI-assisted operations from day one**: scheduling optimization and compliance auditing are designed as core capabilities, not phase-3 add-ons.
* **Multi-tenant SaaS economics with single-tenant flexibility**: enables AVI to serve large airline customers and small independent ATOs from the same product line.

---

# 4. User Roles & Personas

## 4.1 Executive Management

* Accountable Manager — ultimate regulatory accountability; read-heavy, dashboard and compliance-status focused
* CEO — commercial and operational oversight
* Director Training — owns training quality and capacity planning

## 4.2 Training Department

* Head of Training — approves training plans and policy
* Chief Instructor — owns instructor standardization and qualification
* Training Manager — day-to-day training operations owner
* Training Coordinator — executes scheduling and logistics
* Training Planner — builds annual/monthly/weekly plans

## 4.3 Operations

* Simulator Scheduler — owns device-level scheduling and conflict resolution
* Resource Planner — owns cross-resource (room, equipment, instructor) allocation

## 4.4 Instructors

* TRI (Type Rating Instructor)
* TRE (Type Rating Examiner)
* SFI (Synthetic Flight Instructor)
* Examiner (general)
* Ground Instructor

## 4.5 Compliance

* Quality Manager — owns the quality system and internal audits
* Compliance Monitoring Manager — owns regulatory compliance monitoring program

## 4.6 Students / Trainees

* Cadets
* Pilots (type rating, recurrent, upgrade)
* Cabin Crew
* Engineers (maintenance training)

## 4.7 System

* System Administrator (tenant-level)
* AVI Platform Administrator (cross-tenant, platform operations — new in v2.0)
* Integration Administrator (manages API keys, webhooks, SSO config — new in v2.0)

## 4.8 Representative Personas (new in v2.0)

**Persona: Priya, Training Coordinator at a 200-cadet ATO**
Spends 60% of her day re-arranging schedules when an instructor calls in sick. Needs: one-click reschedule with automatic conflict re-check across simulator, classroom, and instructor availability; mobile push notification to all affected students within 2 minutes of a change.

**Persona: Capt. Rao, TRE conducting OPCs**
Needs to walk into a simulator session with zero paperwork: trainee history, last assessment, open deficiencies, and the assessment form pre-loaded on a tablet, with offline capability in case the simulator bay has poor connectivity.

**Persona: Quality Manager preparing for a DGCA audit**
Needs to generate, in under five minutes, a complete compliance pack: every active trainee's document status, every instructor's currency status, every simulator's qualification status, and an audit trail of all changes in the last 12 months.

---

# 5. System Architecture

## 5.1 Architectural Principles

* **API-first**: every UI action is backed by a versioned, documented API endpoint; the web UI, mobile apps, and AI subsystem all consume the same API layer — no hidden server-side-only logic.
* **Cloud-native, containerized**: services are deployed as containers orchestrated via Kubernetes, enabling independent scaling of high-load services (e.g., scheduling engine) versus low-load services (e.g., master data).
* **Event-driven core**: state changes (session scheduled, document expired, assessment completed) emit events on a message bus, which downstream services (notifications, compliance engine, reporting) subscribe to. This decouples the system of record from side-effect processing and is what makes real-time alerting and AI features feasible without tightly coupling every module to every other module.
* **Domain-oriented service boundaries**: services are organized around the modules in Section 6 (Scheduling, Compliance, Records, Identity, Notifications, Reporting, AI), each owning its own data store, communicating via APIs and events rather than shared database access.

## 5.2 High-Level Component Diagram (Description)

* **Client Layer**: Web App (React-based SPA), Mobile Apps (iOS/Android, native or React Native), Public API consumers (regulator portals, customer ERP systems)
* **API Gateway**: handles authentication, rate limiting, request routing, API versioning
* **Application Services**: Identity & Access, Scheduling Engine, Compliance Engine, Records Service, Assessment Service, Certification Service, Notification Service, Reporting Service, AI Service
* **Data Layer**: per-service relational stores (PostgreSQL) for transactional data; document store for unstructured records (scanned licenses, certificates); time-series store for utilization/telemetry data; search index (e.g., Elasticsearch/OpenSearch) for cross-entity search
* **Message Bus**: Kafka or equivalent, carrying domain events
* **AI/ML Layer**: model-serving infrastructure for the Schedule Optimizer, Compliance Auditor, and Resource Planner (see Section 30), with a vector store for the AI Training Assistant's retrieval-augmented generation (RAG) over training records and regulatory text

## 5.3 Technology Assumptions (to be confirmed with Engineering)

| Layer | Assumed Technology | Notes |
|---|---|---|
| Frontend Web | React + TypeScript | SPA with server-rendered shell for SEO/load performance on public pages |
| Mobile | React Native or native Swift/Kotlin | Decision gated on offline-sync complexity (Section 33) |
| Backend Services | Node.js/Java/Go (per service, polyglot allowed) | Service boundary contracts matter more than language uniformity |
| Primary Database | PostgreSQL (multi-tenant, schema-per-tenant or row-level security — see Section 7) | |
| Message Bus | Kafka | |
| Search | OpenSearch | |
| AI Model Serving | Hosted LLM API (e.g., Claude via Anthropic API) + custom optimization models for scheduling | |
| Infrastructure | Kubernetes on a major cloud provider, multi-region capable | |

## 5.4 Acceptance Criteria

* Architecture supports horizontal scaling of the scheduling engine independent of other services under load testing (Section 28/35).
* Every domain event has a published schema and versioning policy.
* No UI feature exists without a corresponding public, documented API endpoint.

---

# 6. Module Architecture (Overview Map)

```
ATMS PLATFORM
│
├── Core Platform
│   ├── Identity & Access (RBAC, SSO, MFA)
│   ├── Multi-Tenancy & Data Isolation
│   ├── Master Data Management
│   ├── Notification Engine
│   ├── Audit Trail
│   └── Integration & API Layer
│
├── Training Operations
│   ├── Student Management
│   ├── Batch Management
│   ├── Course Management
│   ├── LMS Core
│   ├── Training Planning
│   ├── Ground School Management
│   ├── Simulator Management
│   ├── Crew Pairing Management
│   └── Instructor Management
│
├── Assessment & Certification
│   ├── Examination Management
│   ├── Assessment Management
│   ├── Competency Management
│   ├── Training Records
│   └── Certification Module
│
├── Compliance & Quality
│   ├── Compliance Management
│   └── (feeds) Audit Trail, Reporting
│
├── Commercial
│   ├── Billing & Commercial Management
│   └── Resource Management (utilization → billing)
│
├── Intelligence Layer
│   ├── AI Schedule Optimizer
│   ├── AI Compliance Auditor
│   ├── AI Training Assistant
│   └── AI Resource Planner
│
└── Delivery Channels
    ├── Web App
    ├── Mobile App (Instructor/Student/Admin)
    └── Public API / Integrations
```

---

# 7. Multi-Tenancy & Data Isolation

## 7.1 Tenancy Model

ATMS supports three deployment modes, selectable per customer contract:

| Mode | Description | Target Customer |
|---|---|---|
| Shared Multi-Tenant | Single application instance, row-level security isolates tenant data in shared databases | Small/mid ATOs, individual training centers |
| Dedicated Database, Shared App | Application instance shared; each tenant has a dedicated database/schema | Mid-size airlines, MTOs |
| Fully Dedicated (Single-Tenant) | Dedicated application + database stack, optionally in customer's own cloud region | Large airlines, state carriers, customers with data sovereignty requirements |

## 7.2 Data Isolation Requirements

* Every database row in shared-tenant tables carries a `tenant_id`; row-level security policies enforce isolation at the database layer, not just the application layer.
* Cross-tenant queries are impossible by default; any cross-tenant reporting (e.g., AVI's own platform analytics) goes through an explicitly audited aggregation service that strips identifying detail.
* File storage (documents, scanned licenses, certificates) is partitioned by tenant-specific storage buckets/prefixes with independent encryption keys per tenant (Section 34).
* Tenant admins can request a full data export (Section 36) and a full data deletion in compliance with applicable data protection law on contract termination.

## 7.3 Tenant Provisioning

* New tenant onboarding is a defined workflow: tenant record creation → admin user invite → master data seeding (Section 9) → regulatory framework selection (DGCA/EASA/FAA/multiple) → go-live checklist sign-off.
* Tenants can operate under multiple regulatory frameworks simultaneously (e.g., an ATO training both DGCA- and EASA-licensed pilots), with compliance rules scoped per trainee/course rather than per tenant.

## 7.4 Acceptance Criteria

* A simulated penetration test confirms no cross-tenant data leakage under row-level security.
* Tenant data export completes and is independently restorable within the SLA defined in Section 40.


---

# 8. Dashboard

## 8.1 Overview Widgets

| Widget | Data Source | Refresh Rate |
|---|---|---|
| Active Students | Student Management | Real-time |
| Active Batches | Batch Management | Real-time |
| Active Instructors | Instructor Management | Real-time |
| Active Simulators | Simulator Management | Real-time |
| Today's Training Sessions | Scheduling Engine | Real-time |
| Upcoming Examinations | Examination Management | Real-time |

## 8.2 Alerts Panel

* Expiring Licenses (configurable lead time, default 60/30/7 days)
* Expiring Medicals (default 60/30/7 days)
* Expiring Instructor Authorizations (default 90/30/7 days)
* Expiring Simulator Qualifications (default 90/30 days, tied to qualification renewal cycle)
* Missing Training Records (any session marked complete without an attached record after 24 hours)

Each alert is clickable and deep-links to the underlying record. Alerts are role-scoped: a Training Coordinator sees alerts for their batches; the Quality Manager sees all alerts tenant-wide.

## 8.3 KPI Widgets

* Student Progress (% course milestones complete, per batch and per student)
* Simulator Utilization (rolling 30-day, by device)
* Instructor Utilization (rolling 30-day, by instructor and by qualification type)
* Pass Rates (by course, by examiner, by period — trend line, not just a snapshot)
* Revenue (visible only to roles with Billing read access — see Section 32 RBAC)

## 8.4 Dashboard Personalization

* Role-based default dashboard layouts, with widget add/remove/reorder per user.
* Saved custom views (e.g., "My Batches This Month") per user, shareable with a team.

## 8.5 Acceptance Criteria

* All widgets load within 2 seconds on a standard broadband connection for a tenant with up to 5,000 active students.
* Alert lead times are configurable per tenant without requiring engineering changes (admin-configurable in Section 39 Administration).

---

# 9. Master Data Management

Master data is the foundation every other module references. Each master entity below includes its full field set, relationships, and lifecycle rules — the original PRD listed only example fields; this section makes each entity build-ready.

## 9.1 Aircraft Master

**Fields**: Aircraft Type, Aircraft Variant, Manufacturer, ICAO Code, Engine Type(s), Typical Seating Configuration, Associated Type Rating Code, Active/Retired status.

**Examples**: A320 CEO, A320 NEO, B737 NG, B737 MAX, Q400, ATR 72.

**Relationships**: An Aircraft Type is referenced by Course Master (course is per aircraft type), Simulator Master (a simulator is qualified against one or more aircraft types/variants), and Student Profile (current type rating).

**Lifecycle**: Active → Retired (retiring an aircraft type does not delete historical course/session records referencing it; it only prevents new courses being created against it).

## 9.2 Simulator Master

**Fields**: Simulator Name, Device Number, Device Type (FFS/FTD/MFTD/FBS), Qualification Level (e.g., EASA Level D, FAA Level C/D), Qualification Authority, Qualification Date, Qualification Expiry, Associated Aircraft Type(s)/Variant(s), Manufacturer, Visual System Type, Motion System (Y/N), Location/Bay, Status (Operational / Under Maintenance / Qualification Lapsed / Decommissioned).

**Relationships**: Referenced by Simulator Scheduling (Section 16), Resource Management utilization tracking (Section 25), Compliance Management (qualification expiry, Section 23), Billing (Section 32, utilization-based billing).

**Lifecycle**: A simulator in "Qualification Lapsed" status is automatically blocked from new session scheduling by the Scheduling Engine — this is a hard system rule, not just a dashboard alert, since scheduling a session on a non-qualified device is a regulatory violation.

## 9.3 Subject Master

**Fields**: Subject Code, Subject Name, Duration (hours/minutes), Aircraft Type, Delivery Mode (Classroom / E-Learning / Simulator / Briefing), Prerequisite Subject(s), Associated Competency Unit(s) (link to Section 21).

## 9.4 Classroom Master

**Fields**: Classroom Name, Capacity, Location/Building, Equipment Available (projector, desktop trainers, etc.), Accessibility Features (Section 38).

## 9.5 Instructor Master

**Fields**: Instructor ID, Name, Qualification(s), Authorization Type(s) (TRI/TRE/SFI/Examiner/Ground Instructor), Authorization Expiry per type, Associated Aircraft Type(s), Employment Type (Staff/Contract), Base Location, Languages Spoken (Section 37 relevance for ground school delivery).

**Relationships**: Drives Instructor Management (Section 18) qualification matrix and currency monitoring; referenced by every scheduled session.

## 9.6 Customer / Company Master (New in v2.0)

The original PRD references "Company" on the Student Profile but never defines it as a master entity. For any ATO/FSTD operator training students on behalf of airlines, the Customer is a first-class entity:

**Fields**: Customer Name, Customer Type (Airline / Independent / Cadet Sponsor), Billing Contact, Commercial Contract Reference, Contracted Training Volume (hours/sessions per period), Default Billing Rate Card (link to Section 32).

**Relationships**: Referenced by Student Profile, Batch Management, and Billing & Commercial Management.

## 9.7 Master Data Governance

* All master data changes are logged in the Audit Trail (Section 29) with old value, new value, user, and timestamp.
* Master data edits that affect regulatory status (e.g., changing a simulator's qualification level) require a second-approver workflow (maker-checker) before taking effect.
* Master data is versioned: historical sessions/records always display the master data values as they existed at the time of the session, not the current values (e.g., if a simulator's qualification level changes, past sessions still show the qualification level under which they were actually conducted).

## 9.8 Acceptance Criteria

* No session can be scheduled referencing a master data record in a non-active/non-operational state.
* Master data versioning is verifiable: a session record from 18 months ago displays master data as of that date even if the master record has since changed.

---

# 10. Student Management

## 10.1 Student Profile Data Model

**Fields**: Student ID (system-generated, immutable), Employee Number (customer-assigned), Name, Date of Birth, Nationality, Company (link to Customer Master), Aircraft Type(s) (current and historical), Batch (current), Contact Details, Emergency Contact, Photo, Biometric ID (for attendance — see 10.4).

## 10.2 Document Repository

Stored documents per student, each with its own expiry tracking and verification status:

| Document Type | Expiry Tracked | Verification Required |
|---|---|---|
| License (CPL/ATPL/etc.) | Yes | Yes — verified against issuing authority reference number |
| Medical Certificate | Yes | Yes |
| Passport | Yes | Yes |
| Visa (where applicable) | Yes | Yes |
| Company Authorization Letter | Yes (per contract period) | Yes |
| English Language Proficiency Certificate | Yes | Yes |

* Documents are stored as scanned images/PDFs in tenant-isolated object storage (Section 7.2), with OCR-assisted metadata extraction (expiry date auto-suggested from scanned document, confirmed by a human reviewer before being trusted by the Compliance Engine).
* Each document has a verification workflow: Uploaded → Pending Verification → Verified / Rejected, with rejection requiring a reason code and re-upload request to the student.

## 10.3 Expiry Monitoring

* Automatic alerts before expiry, feeding the Dashboard Alerts Panel (Section 8.2) and Notification Engine (Section 27).
* A student with any expired mandatory document is automatically flagged "Training Hold" — the Scheduling Engine blocks new session assignments for that student until the hold is cleared (configurable per tenant whether this is a hard block or a soft warning, since policy varies by regulator and customer).

## 10.4 Attendance & Identity Verification (New in v2.0)

* Biometric attendance (fingerprint or facial recognition, tenant-configurable) for ground school and simulator sessions, feeding directly into Training Records (Section 22) without manual attendance entry.
* QR-code badge as a fallback for tenants not adopting biometric hardware.

## 10.5 Student Self-Service Portal (New in v2.0)

* Students can view their own schedule, upload/renew documents, view progress against course milestones, access e-learning content (Section 13), and download their own certificates (Section 24) once issued.
* Students cannot edit any record that affects compliance status (e.g., cannot self-attest document expiry); all such edits require staff verification.

## 10.6 RBAC Summary

| Action | Coordinator | Training Manager | Quality Manager | Student (self) |
|---|---|---|---|---|
| View student profile | Own batch only | All | All | Own profile only |
| Edit student profile | Own batch only | All | No (read-only) | No |
| Upload own documents | N/A | N/A | N/A | Yes |
| Verify documents | No | Yes | Yes | No |
| Override training hold | No | Yes (with reason logged) | Yes | No |

## 10.7 Acceptance Criteria

* A student with an expired medical cannot be added to a new simulator session; attempting to do so returns a clear, actionable error referencing the specific expired document.
* Document expiry alerts fire at exactly the configured lead-time thresholds, verified via automated test.

---

# 11. Batch Management

## 11.1 Batch Data Model

**Fields**: Batch Code (system-generated, human-readable e.g. `A320-TR-2026-014`), Course (link to Course Master), Customer (link to Customer Master), Aircraft Type, Start Date, End Date, Planned Strength, Actual Strength, Status.

## 11.2 Batch Status State Machine

```
Planned → Active → Completed
            ↓
        Suspended → Active (resume) or Cancelled
```

* **Planned**: batch created, students not yet confirmed, schedule may exist as a draft.
* **Active**: at least one session has been conducted; students are locked to the batch (transfers require an explicit Batch Transfer workflow, not direct edits).
* **Suspended**: training paused (e.g., simulator unavailability, customer request); all future scheduled sessions are automatically held, not silently cancelled, pending resume-or-cancel decision.
* **Completed**: all course milestones met or batch formally closed; triggers final record archival (Section 22) and certificate eligibility check (Section 24).
* **Cancelled**: terminal state; requires reason code and triggers billing reconciliation (Section 32) for any unbilled/partially billed sessions.

## 11.3 Batch-Level Features (New in v2.0)

* **Capacity validation**: a batch cannot be created with Planned Strength exceeding the simultaneous capacity of the assigned classroom/simulator resources for its course structure.
* **Batch dashboard**: per-batch view showing schedule adherence (planned vs. actual session completion), at-risk students (falling behind milestones), and resource consumption to date (for billing reconciliation).
* **Batch cloning**: create a new batch by cloning an existing batch's course structure and resource template, adjusting only dates and student roster.

## 11.4 Acceptance Criteria

* Suspending a batch holds (does not delete) all future scheduled sessions, and resuming restores them with automatic conflict re-validation against current resource availability.

---

# 12. Course Management

## 12.1 Course Catalog

**Examples**: Initial Type Rating, Recurrent Training, Upgrade Training, Instructor Course, CRM (Crew Resource Management), SMS (Safety Management System) Initial/Recurrent.

**Fields**: Course Code, Course Name, Aircraft Type, Regulatory Basis (link to Compliance Management rule set, Section 23), Total Duration, Validity Period (for recurrent courses, e.g., "valid 12 months"), Prerequisite Course(s).

## 12.2 Course Structure (Sequenced Stages)

```
Ground School → MFTD → FFS → LOFT → Assessment → Certification
```

* Each stage in v2.0 is modeled as a **Course Template Node** with: required Subjects (link to Subject Master), required Duration, pass/fail gating rules (can a student proceed to FFS without passing the Ground School assessment? — tenant-configurable, defaults to "no"), and required resource type (Classroom/Simulator Type/Device Qualification Level).
* Course Templates are versioned: a regulatory change to a course's required hours creates a new version; students already mid-course continue under the version they started on unless explicitly migrated.

## 12.3 Course Builder (New in v2.0)

* Drag-and-drop course template builder for Training Managers: assemble Subjects into stages, set durations and gating rules, without engineering involvement.
* Course templates can be marked "Regulatory Locked" once approved by the Quality Manager, preventing accidental edits without a change-control workflow.

## 12.4 Acceptance Criteria

* A student cannot be marked as having completed a course if any mandatory, non-waived stage is incomplete.
* Changing a Course Template version does not retroactively alter the recorded course structure for students who completed training under a prior version.

---

# 13. Learning Management System (LMS) Core (New Module — v2.0)

The original PRD mentions "E-Learning Material Distribution" only as a sub-bullet under Ground School and defers an "LMS Integration" to Phase 3. For a platform claiming to be the most advanced training system available, e-learning cannot be an afterthought — it is built as a first-class core module.

## 13.1 Content Authoring & Library

* Native authoring tool for SCORM/xAPI-compliant content (slides, narrated video, interactive quizzes) plus support for importing existing SCORM packages from third-party authoring tools.
* Content Library organized by Subject (link to Subject Master), versioned, with a review/approval workflow before publishing to students (Quality Manager sign-off for regulatory subjects).

## 13.2 Delivery & Tracking

* Per-student progress tracking at the granularity of individual content modules (not just "course complete"), including time spent, quiz attempts, and completion timestamps — all of which feed Training Records (Section 22).
* Adaptive sequencing: a module can require a minimum quiz score before unlocking the next module.
* Offline content download for mobile (Section 33), with progress sync on reconnect.

## 13.3 Virtual Classroom Integration

* Native or integrated (via API, Section 31) virtual classroom for remote ground school delivery, with attendance auto-captured from session join/leave events.

## 13.4 Knowledge Retention Tools

* Spaced-repetition question banks for recurrent/refresher knowledge, distinct from the formal Examination Engine (Section 19) — this is a learning tool, not an assessment instrument, and is explicitly not used to gate certification.

## 13.5 Acceptance Criteria

* A student's e-learning completion record is timestamped and immutable once submitted, and is queryable by the Compliance Engine the same way a classroom attendance record is.
* SCORM package import successfully tracks completion and score data back into ATMS for at least SCORM 1.2 and SCORM 2004 packages.

---

# 14. Training Planning Module

## 14.1 Planning Horizons

* Annual Planning — capacity planning against forecast customer demand (feeds AI Resource Planner, Section 30.4)
* Monthly Planning — batch-level resource allocation
* Weekly Planning — session-level scheduling
* Daily Planning — real-time adjustments, day-of changes

## 14.2 Auto Planning Engine

**Inputs**: Students (availability, course stage, document/training-hold status), Instructors (qualification, authorization expiry, currency, fatigue/duty-time limits, leave calendar), Simulators (qualification, maintenance windows, device-to-course mapping), Classrooms (capacity, equipment), Course Requirements (stage sequencing, durations, prerequisites).

**Outputs**: A complete, conflict-free training schedule, plus a Constraint Violation Report for any requirement the engine could not satisfy (e.g., "Batch A320-TR-2026-014 requires 1 additional TRE-qualified instructor in Week 3 — none available").

## 14.3 Manual Override & Re-Planning

* Planners can manually adjust any auto-generated schedule; manual changes are re-validated against all conflict rules in real time (not just at save time), and any rule violation is surfaced inline, not after the fact.
* "What-if" sandbox mode: a planner can simulate a schedule change (e.g., "what if Simulator 2 goes into maintenance next week") without committing it, to see downstream impact before deciding.

## 14.4 Acceptance Criteria

* The Auto Planning Engine produces a schedule for a 20-student, 6-week type rating batch in under 60 seconds, with zero hard-constraint violations (double-bookings, qualification mismatches) in the output.
* Every constraint violation surfaced to a planner includes the specific rule violated and the specific resource/student causing it — never a generic "scheduling conflict" message.

---

# 15. Ground School Management

## 15.1 Core Features

* Classroom Booking (integrated with the central Scheduling Engine, not a separate calendar)
* Attendance Tracking (manual, QR, or biometric — Section 10.4)
* Instructor Assignment
* Lesson Completion Sign-off (instructor confirms syllabus coverage per session, not just attendance)
* Material Distribution (links to LMS Core, Section 13)

## 15.2 Records Generated

* Attendance Logs (immutable once the session closes)
* Lesson Completion Records (subject, instructor, date, syllabus reference, any deviation notes)
* Training Reports (per-batch summary, auto-compiled from session-level records)

## 15.3 Acceptance Criteria

* A ground school session cannot be marked "Complete" without both an attendance log and an instructor lesson-completion sign-off — partial data blocks closure and surfaces as an open task to the assigned instructor.

---

# 16. Simulator Management

## 16.1 Simulator Scheduling

**Device types scheduled**: FTD, FFS, MFTD, FBS.

**Session types**: Training Session, LPC (License Proficiency Check), OPC (Operator Proficiency Check), Skill Test, Instructor Assessment, Recurrent Training.

## 16.2 Conflict Detection Engine

Prevents, at the point of scheduling (not via post-hoc report):

* **Double Booking** — same device, overlapping time
* **Instructor Conflict** — same instructor, overlapping sessions across any device/classroom
* **Student Conflict** — same student, overlapping sessions
* **Qualification Mismatch** — device not qualified for the aircraft type/session type requested
* **Maintenance Window Conflict** — device scheduled during a planned or unplanned maintenance hold (new in v2.0 — see 16.3)

## 16.3 Maintenance & Downtime Integration (New in v2.0)

* Simulator Master status can be set to "Under Maintenance" with a start/end window; the Scheduling Engine treats this exactly like a booking for conflict purposes.
* Unplanned downtime (device fault) can be logged in real time by simulator technical staff, which immediately blocks new bookings and triggers an automated rescheduling suggestion (via the AI Schedule Optimizer, Section 30.1) for any sessions already booked in the affected window.
* Downtime events feed Resource Management utilization reporting (Section 25) and, where relevant, MTBF-style reliability tracking for the device fleet.

## 16.4 Session Lifecycle

```
Scheduled → Briefed → In Progress → Debriefed → Closed
                                        ↓
                                  (Assessment Management, Section 20)
```

* A session cannot move to "Closed" until any required assessment record (Section 20) is attached.

## 16.5 Acceptance Criteria

* Zero double-bookings are possible to create through the UI or API — this is enforced as a database-level constraint, not just application validation.
* An unplanned maintenance event affecting a scheduled session triggers a rescheduling suggestion within 5 minutes of the downtime being logged.

---

# 17. Crew Pairing Management

## 17.1 Pairing Creation

**Fields**: Pilot A, Pilot B, Instructor, Session (link to scheduled simulator session), Pairing Type (Initial / Recurrent / LOFT).

## 17.2 Pairing Rules (New in v2.0)

* Configurable pairing constraints per tenant/regulator (e.g., do not pair two students both on their first LOFT session without a more experienced pairing partner; respect customer-specific pairing exclusion lists).
* Pairing history is tracked to support fair rotation (avoid always pairing the same two students) and to support post-incident review if ever required.

## 17.3 Tracking

* Pairing History — full history per student, queryable.
* Session History — linked to the underlying simulator session record.
* Progress — joint and individual progress tracked where a paired exercise has both shared and individual assessment components.

## 17.4 Acceptance Criteria

* Pairing history for any student is retrievable in a single query/report, showing every pairing partner, session, and outcome across their training history.

---

# 18. Instructor Management

## 18.1 Qualification Matrix

Tracked per instructor, per aircraft type: TRI, TRE, SFI, Examiner status, with issue date, expiry date, and issuing authority reference.

## 18.2 Currency Monitoring

* Sessions Conducted (rolling count against regulatory minimums, e.g., minimum sessions per period to retain examiner currency)
* Observations (standardization observations received, with outcome)
* Standardization Events (attended/required, with next-due date)

## 18.3 Alerts

* Automatic expiry notifications (Section 27), with escalating lead times the closer to expiry, and automatic removal of an instructor's eligibility to be scheduled for a given session type once their relevant authorization lapses — enforced the same way the Student Training Hold is enforced (16.2 Qualification Mismatch check).

## 18.4 Instructor Workload & Fatigue Tracking (New in v2.0)

* Duty time and rest period tracking against tenant-configured limits (informed by applicable flight/duty time regulations as adapted for ground-based training instructors), surfaced to the Auto Planning Engine (Section 14.2) as a hard constraint, not just a utilization metric.
* Leave calendar integration, so planners never see an unavailable instructor as a viable scheduling option.

## 18.5 Acceptance Criteria

* An instructor whose TRE authorization has lapsed cannot be assigned to any session requiring TRE qualification, system-wide, immediately upon lapse — verified by automated test that attempts such an assignment and confirms rejection.

---

# 19. Examination Management

## 19.1 Question Bank

* MCQ, Descriptive, Oral Assessment question types.
* Questions tagged by Subject, Competency Unit (Section 21), Difficulty, and Regulatory Reference.
* Version-controlled question bank with change history (a question edited after being used in a graded exam retains its original wording attached to historical results).

## 19.2 Exam Engine

* Random Question Selection from a tagged pool, with configurable rules (e.g., minimum number of questions per competency area, no single subject over-represented).
* Time Limits, Pass Marks (configurable per course/regulatory requirement).
* Re-Test Rules — configurable cool-down period, maximum attempts, and mandatory remedial training trigger after N failures.
* Exam integrity controls (new in v2.0): randomized question order per candidate, optional question-pool exclusion for candidates who have seen a question in a prior attempt, browser lockdown mode for computer-based exams, and an audit log of exam session activity (start time, each question's time-on-screen, submission time).

## 19.3 Oral Assessment Support (New in v2.0)

* Structured digital oral-exam capture: examiner records pass/fail and notes per topic area against a structured rubric on a tablet, rather than a free-text-only record, enabling consistent reporting across examiners.

## 19.4 Acceptance Criteria

* No two candidates in the same exam sitting receive an identical question order from a shared pool, verified by test.
* An exam result cannot be edited after submission without a logged override by an authorized role (Quality Manager), with mandatory reason code.

---

# 20. Assessment Management

## 20.1 Instructor-Recorded Assessment

Instructor can record, per session: Performance (against structured competency-based criteria, not just free text — see Section 21), Deficiencies, Remarks.

## 20.2 Results

* Pass / Fail / Additional Training Required, with Additional Training Required automatically generating a remedial session recommendation (and, where the AI Resource Planner is enabled, an auto-suggested slot).

## 20.3 Structured Assessment Forms (New in v2.0)

* Tenant-configurable digital assessment forms matching the format required by the relevant regulator (e.g., structured grade sheets for LPC/OPC), with electronic signature capture from both the assessing instructor/examiner and, where required, the candidate.
* Forms are versioned against regulatory templates; a form completed under an older template version remains valid and viewable in its original format even after the template is updated.

## 20.4 Acceptance Criteria

* A "Fail" result with no recorded deficiency notes is blocked from submission — the system requires a minimum level of substantiation for any non-pass outcome.

---

# 21. Competency Management

## 21.1 Competency Framework

Tracked dimensions: Knowledge, Skills, Behaviors (aligned to competency-based training and assessment frameworks used in modern type rating and CRM training).

## 21.2 Competency Assessment

* Progress tracked per competency unit, not just per course — a student's profile shows a competency radar/heatmap across all tracked units, aggregated from every assessment event referencing that unit.
* Gaps identified automatically where a competency unit has not been demonstrated to the required standard within the validity window.
* Corrective Training auto-suggested (linking back to Course Management's remedial stage options, Section 12) when a gap is identified.

## 21.3 Acceptance Criteria

* A student's competency profile updates within seconds of an assessment being submitted, with full traceability to the specific session and assessor that contributed each data point.

---

# 22. Training Records Management

## 22.1 Digital Training File

Per student, a single consolidated file containing: Ground School Records, Simulator Records, Exam Results, Assessment Reports, E-Learning completion (Section 13), Document history (Section 10), Certificates issued (Section 24).

## 22.2 Record Integrity (New in v2.0)

* Once a training record is finalized (session closed, assessment submitted, exam graded), it is **immutable**: any correction creates a new versioned entry with a visible amendment trail, never a silent overwrite. This is essential for audit defensibility — a regulator must be able to see not just the current state but that nothing was retroactively altered without trace.
* Records are cryptographically hashed at finalization; periodic integrity checks confirm no record has been tampered with outside the application layer.

## 22.3 Retention

* Permanent Digital Archive, with retention periods configurable per regulatory requirement and per record type (some records may have a defined minimum retention; tenants can extend but the system prevents deletion below the regulatory minimum).

## 22.4 Acceptance Criteria

* Any attempt to delete a record within its mandatory retention period is blocked at the database layer, not just the UI layer.
* A full Digital Training File for any student is exportable as a single, regulator-ready PDF/archive package within the SLA defined in Section 40.

---

# 23. Compliance Management

## 23.1 Supported Regulatory Frameworks

**DGCA**: CAR Requirements (Civil Aviation Requirements as published by DGCA India).

**EASA**: Part-ORA, Part-FCL, Part-ARA.

**FAA**: Part 121, Part 142.

A tenant may operate under one or multiple frameworks simultaneously, scoped per course/trainee (Section 7.3).

## 23.2 Compliance Rule Engine (New in v2.0)

Rather than compliance being a set of static report templates, v2.0 models each regulatory requirement as a **Compliance Rule**: a machine-readable condition (e.g., "Instructor must have conducted ≥3 LPC sessions in the preceding 12 months to retain TRE currency") bound to the specific entities it governs (instructor, course, document type). This is what makes the Compliance Dashboard and AI Compliance Auditor (Section 30.2) live and continuously evaluated, rather than something only checked when someone remembers to run a report.

* Rules are authored/edited by the Compliance Monitoring Manager role, version-controlled, and mapped to their specific regulatory citation for audit traceability.
* Every rule evaluation result (pass/fail, as of when) is itself logged — so the system can show not just current compliance status but a compliance history timeline for any entity.

## 23.3 Compliance Dashboard

Display: Missing Records, Expired Documents, Audit Findings — now driven live from the Rule Engine rather than batch reports, with drill-down from any aggregate number to the specific underlying records.

## 23.4 Acceptance Criteria

* Every Compliance Rule has a documented regulatory citation visible to auditors.
* The Compliance Dashboard's headline non-compliance count matches, to the record, a manual audit of the underlying data — verified in UAT before go-live for each tenant.

---

# 24. Certification Module

## 24.1 Certificate Types

Ground School Completion, Simulator Completion, Type Rating Completion — extensible per tenant for any course-defined certificate.

## 24.2 Features

* QR Verification — every issued certificate carries a QR code resolving to a public (or customer-restricted) verification page confirming authenticity and current validity status, without exposing the full training file.
* Digital Signature — certificates are digitally signed by the issuing authority's designated signatory role; signature validity is independently checkable.
* Certificate Tracking — full lifecycle from eligibility-met → drafted → approved → issued → (where applicable) expired/superseded.

## 24.3 Eligibility Engine (New in v2.0)

* A certificate cannot be issued unless the Compliance Rule Engine (23.2) confirms every prerequisite record (course completion, passing assessment/exam, no open deficiencies) is present and verified — eligibility is computed, not self-declared by the issuing staff member.

## 24.4 Acceptance Criteria

* A certificate's QR verification page correctly reflects revocation if a certificate is later revoked (e.g., due to a discovered record error), within 1 minute of the revocation being recorded.

---

# 25. Resource Management

## 25.1 Classroom Utilization

Monitor Availability, Occupancy, Utilization — by classroom, by period, with comparison against the >85%/>80% targets in Section 2.2.

## 25.2 Simulator Utilization

Monitor Availability, Downtime (planned and unplanned, Section 16.3), Utilization Percentage — feeding directly into Billing (Section 32) where utilization is the billing basis.

## 25.3 Resource Forecasting (New in v2.0)

* Utilization trends feed the AI Resource Planner (Section 30.4) to forecast future capacity constraints before they cause scheduling failures.

## 25.4 Acceptance Criteria

* Utilization figures reported in Resource Management reconcile exactly with the session records in Scheduling and the billing records in Section 32 — no separate, divergent calculation paths.

---

# 26. Workflow Management

## 26.1 Approval Workflows

**Training Plan**: Coordinator → Training Manager → Head of Training.

**Certification**: Instructor → Training Manager → Certificate Issued.

## 26.2 Workflow Engine (New in v2.0)

Rather than these being the only two hardcoded workflows, v2.0 introduces a configurable workflow engine: any tenant can define additional approval chains (e.g., Master Data change approval per Section 9.7, Batch Suspension approval, Exam Re-test approval) using the same underlying engine — approver roles, escalation timers (auto-escalate if not actioned within N hours), and notification triggers (Section 27) are all configurable without engineering change requests.

## 26.3 Acceptance Criteria

* Every workflow step records who approved/rejected, when, and any comments — visible in the Audit Trail (Section 29).
* An escalation timer that fires sends a notification to the configured escalation role and logs the escalation event.

---

# 27. Notification Engine

## 27.1 Channels

Email, SMS, WhatsApp, In-App Notifications, Push Notification (mobile — Section 33).

## 27.2 Events

Training Schedule (created/changed/cancelled), Exam Results, Expiry Alerts, Training Changes, Workflow approvals/escalations (26.2), Compliance Rule failures (23.2).

## 27.3 Notification Preferences & Throttling (New in v2.0)

* Per-user channel preference (e.g., a student may opt for WhatsApp + push but not email).
* Digest mode for high-frequency, low-urgency notifications (e.g., daily digest of minor schedule adjustments) versus immediate delivery for high-urgency events (e.g., a session cancellation within 24 hours of start time).
* Delivery confirmation tracking per channel, with automatic fallback to a secondary channel if primary delivery fails (e.g., SMS fallback if push notification is undelivered after 5 minutes for a time-sensitive alert).

## 27.4 Acceptance Criteria

* A session cancellation within 24 hours of start time triggers an immediate (non-digested) notification to all affected students and instructors across at least two channels, with delivery confirmed or escalated to a fallback channel within 5 minutes.

---

# 28. Reporting Module

## 28.1 Standard Reports

**Training Reports**: Student Progress, Batch Progress, Completion Rates.

**Instructor Reports**: Instructor Utilization, Instructor Currency.

**Simulator Reports**: Device Utilization, Downtime Reports.

**Regulatory Reports**: DGCA Reports, EASA Reports, Audit Reports.

## 28.2 Report Builder (New in v2.0)

* Self-service report builder: any user with appropriate data access can build a custom report by selecting entities, fields, filters, and grouping, without engineering involvement — output as on-screen dashboard, scheduled email export, or raw data download (CSV/Excel).
* Report scheduling: any report can be scheduled for automatic generation and distribution (e.g., "Monthly compliance pack to Quality Manager, 1st of every month").

## 28.3 Regulatory Submission Formats

* Standard reports are exportable in the specific template formats required for DGCA and EASA submissions where such standard templates exist, reducing manual reformatting before submission.

## 28.4 Acceptance Criteria

* A custom report built via the Report Builder returns results identical to an equivalent query run directly against the underlying data (verified by spot-check in UAT) — the Report Builder must not introduce calculation drift from the system of record.

---

# 29. Audit Trail

## 29.1 Tracked Fields

User, Action, Old Value, New Value, Timestamp, IP Address/Device (new in v2.0), Session ID (new in v2.0, to correlate a batch of related changes made in one user session).

## 29.2 Scope

All system activities are auditable: master data changes, record edits, workflow approvals, document verifications, certificate issuance/revocation, permission changes, login/logout events, and failed authentication attempts (security-relevant, Section 34).

## 29.3 Tamper Evidence (New in v2.0)

* Audit Trail entries are append-only and cryptographically chained (each entry's hash includes the prior entry's hash), making undetected retroactive alteration of the audit log itself infeasible.

## 29.4 Acceptance Criteria

* The Audit Trail itself cannot be edited or deleted by any role, including platform administrators, through any UI or standard API path — only through a documented, logged, dual-approval emergency procedure reserved for legal/regulatory necessity.

---

# 30. AI Subsystem (Advanced)

The original PRD lists four AI features as one-line bullets. For ATMS to credibly claim to be the most advanced training management platform available, the AI subsystem needs defined inputs, model approach, outputs, guardrails, and human-in-the-loop controls — AI recommendations in a regulator-audited environment must always be explainable and overridable, never a black box.

## 30.1 AI Schedule Optimizer

**Function**: Automatically creates and continuously re-optimizes training schedules.

**Inputs**: Same as the Auto Planning Engine (Section 14.2), plus historical scheduling patterns, instructor/student preference signals (e.g., preferred time-of-day where regulation permits), and live disruption events (sickness, device downtime).

**Approach**: A constraint-satisfaction/optimization model (not a generative LLM) for the core scheduling math — this is a combinatorial optimization problem, and correctness/determinism matter more than creativity here. An LLM-based layer sits on top to explain *why* a particular schedule was chosen and to handle natural-language adjustment requests (e.g., a planner typing "move all of Batch 14's sessions next week to mornings only").

**Outputs**: A ranked set of schedule options (not just one), each with a clear trade-off summary (e.g., "Option A: zero conflicts, instructor utilization 78%. Option B: zero conflicts, instructor utilization 84%, but requires Instructor Singh to work two consecutive late shifts").

**Guardrails**: The optimizer can never auto-commit a schedule change without human approval for any change affecting an already-confirmed session within 48 hours of start time; it can auto-commit only for not-yet-confirmed/draft schedules.

## 30.2 AI Compliance Auditor

**Function**: Continuously scans live data against the Compliance Rule Engine (Section 23.2) to detect Missing Records, Expired Documents, and Regulatory Deviations before they become audit findings.

**Approach**: Primarily deterministic rule evaluation (Section 23.2) for anything with a clear-cut regulatory threshold; an LLM-based layer is used specifically for **pattern-level anomaly detection** that rigid rules miss — e.g., flagging that an instructor's assessment language has trended toward unusually brief deficiency notes compared to their own historical pattern, which may indicate under-documentation rather than an actual rule breach, surfaced as a suggestion for Quality Manager review, never as an automatic finding.

**Outputs**: A prioritized findings list, each with severity, regulatory citation, affected record(s), and suggested remediation action — and, critically, a confidence indicator distinguishing "this is a definite rule violation" from "this is a pattern worth a human look."

**Guardrails**: The AI Compliance Auditor never auto-closes a finding and never auto-issues/revokes a certificate; all compliance-affecting actions remain human-approved.

## 30.3 AI Training Assistant

**Function**: Natural language query interface over training data, e.g., *"Show all A320 trainees whose LPC expires within 60 days."*

**Approach**: Retrieval-augmented generation (RAG) — the LLM translates the natural-language query into a structured query against the actual ATMS data store (not against an LLM's general knowledge), retrieves the precise records, and presents them with a natural-language summary. The model never fabricates record data; if a query cannot be resolved to a valid structured query, the assistant says so rather than guessing.

**Scope boundaries**: Responses are scoped by the requesting user's RBAC permissions — the assistant cannot surface data the user could not otherwise see through the standard UI.

**Outputs**: Natural-language answer plus the underlying data table/records, so a user can always verify the answer against the actual system of record rather than trusting the summary blindly.

## 30.4 AI Resource Planner

**Function**: Predicts Simulator Demand, Instructor Demand, and Capacity Constraints ahead of time.

**Approach**: Time-series forecasting models trained on historical utilization (Section 25), contracted training volumes (Customer Master, Section 9.6), and seasonality patterns (e.g., recurrent training surges tied to license renewal cycles).

**Outputs**: A rolling capacity forecast (e.g., "At current contracted volume, Simulator Bay 2 will be at 96% utilization in March 2027 — recommend reviewing Customer X's contract scheduling or evaluating additional device capacity"), feeding into commercial planning (Section 32) and annual planning (Section 14.1).

## 30.5 Cross-Cutting AI Governance

* **Explainability**: every AI-generated recommendation includes a human-readable rationale, not just a score or a decision.
* **Human-in-the-loop by default**: no AI output that affects compliance status, certification, or a confirmed schedule is ever auto-applied without explicit human approval, system-wide.
* **Auditability**: every AI recommendation and the human decision on it (accepted/modified/rejected) is itself logged in the Audit Trail (Section 29) — this is required both for regulatory defensibility and to build the feedback dataset for model improvement.
* **Data scope**: AI model training/inference uses only the data the requesting tenant is entitled to see, respecting tenant isolation (Section 7) at all times; no cross-tenant data leakage through shared model training.
* **Bias/fairness review**: scheduling and resource-allocation models are periodically reviewed to confirm they do not systematically disadvantage any instructor or student group (e.g., consistently assigning less desirable shifts to one demographic), with findings reported to the Quality Manager.

## 30.6 Acceptance Criteria

* The AI Training Assistant achieves at least 95% accuracy on a benchmark set of representative natural-language queries against test data, verified before general release for each tenant.
* No AI subsystem component can take any compliance-affecting or certification-affecting action without a corresponding human approval event in the Audit Trail.

---

# 31. Integration & API Layer (New Module — v2.0)

The original PRD has no integration section at all — a production-grade enterprise platform cannot be a closed island. This module defines how ATMS connects to the systems every customer already runs.

## 31.1 Public API

* Full REST (and/or GraphQL where appropriate) API covering every module in this document, versioned (`/v1`, `/v2`, etc.) with a documented deprecation policy (minimum 12 months notice before retiring a version).
* OpenAPI specification published and kept in sync with the live API automatically as part of CI/CD (Section 39).

## 31.2 Webhooks

* Outbound webhooks for key domain events (session scheduled/changed, certificate issued, compliance finding raised) so customer systems can react in near-real-time without polling.

## 31.3 Standard Integrations

| System Type | Purpose | Direction |
|---|---|---|
| SSO/Identity Provider (SAML/OIDC) | Authentication | Inbound |
| HRIS | Sync instructor/staff master data | Inbound |
| Payroll | Export instructor hours for pay processing | Outbound |
| ERP/Accounting | Export billing/invoice data (Section 32) | Outbound |
| Regulator Portals (e.g., e-filing systems) | Submit regulatory reports (Section 28.3) | Outbound |
| Third-Party LMS | Import/export SCORM content and completion data | Bi-directional |
| Calendar (Outlook/Google) | Sync individual schedules to personal calendars | Outbound |

## 31.4 Data Import/Export

* Bulk import tools (CSV/Excel templates) for initial master data and historical record migration (Section 36), with validation reports before commit.
* Scheduled and on-demand bulk export for customer-owned data portability.

## 31.5 Acceptance Criteria

* Every documented API endpoint has automated contract tests run on every deployment, preventing undocumented breaking changes from reaching production.
* A webhook delivery failure is retried with exponential backoff and surfaced to the Integration Administrator if it remains undelivered after the retry window.

---

# 32. Billing & Commercial Management (New Module — v2.0)

The original PRD includes a "Revenue" dashboard widget but no actual billing model — this is a significant gap for any FSTD operator or ATO running training as a commercial service. v2.0 adds a full commercial layer.

## 32.1 Rate Cards

* Configurable rate cards per Customer (Section 9.6): per-simulator-hour rate (potentially varying by device, time-of-day, session type), per-classroom-hour rate, per-course flat-fee rate, or hybrid models.
* Rate cards are versioned and tied to a contract validity period.

## 32.2 Usage-to-Invoice Pipeline

* Every closed session (Section 16.4) with billable resource usage automatically generates a billing line item, eliminating manual hour-tallying.
* Draft invoices are reviewable and adjustable (e.g., applying a contracted discount, disputing a no-show charge) before finalization.
* Finalized invoices export to the customer's accounting/ERP system via the Integration Layer (Section 31.3).

## 32.3 Commercial Reporting

* Revenue by Customer, by Device, by Course Type.
* Utilization-to-Revenue linkage — directly answering "is this simulator paying for itself," tying Resource Management data (Section 25) to actual billed revenue.
* Contract Consumption Tracking — for customers with a contracted training volume (Section 9.6), real-time visibility into hours consumed versus contracted, with proactive alerts as a customer approaches their contracted cap (commercial opportunity) or risks under-utilizing a pre-paid block (retention risk).

## 32.4 RBAC

Billing data is visible only to roles explicitly granted Billing access (typically Executive Management and designated commercial staff) — Training Coordinators and Instructors do not see revenue figures by default, consistent with the Dashboard RBAC note in Section 8.3.

## 32.5 Acceptance Criteria

* Every billed line item traces back to exactly one underlying session/resource-usage record — no manually-entered, untraceable billing lines are possible in the standard flow.
* A disputed invoice line item retains a full history of the dispute and resolution, visible in the Audit Trail.

---

# 33. Mobile & Offline Strategy (New Module — v2.0)

## 33.1 Mobile Apps

* Native mobile apps (iOS/Android) for Instructors, Students, and Coordinators/Administrators, each with a role-tailored feature set rather than a shrunk-down version of the full web app.

**Instructor App**: today's schedule, pre-session trainee briefing pack, digital assessment forms (Section 20.3), e-signature capture.

**Student App**: personal schedule, e-learning content (Section 13), document upload/renewal, certificate download, push notifications.

**Coordinator/Admin App**: schedule overview, conflict alerts, quick-approve workflow actions (Section 26).

## 33.2 Offline Mode

* Critical instructor workflows (viewing today's schedule, completing an assessment form, capturing attendance) function fully offline, with local data cached ahead of a scheduled session and changes queued for sync.
* Conflict resolution policy for offline sync: if a record was also changed server-side while a device was offline (e.g., a session was rescheduled centrally while an instructor was offline in a remote training bay), the app surfaces the conflict explicitly for the user to resolve rather than silently picking one version — this matters because assessment data integrity cannot be left to a last-write-wins default.

## 33.3 Acceptance Criteria

* An instructor can complete a full assessment form offline and have it sync correctly, with no data loss, upon reconnection within 24 hours.
* Offline-cached data is encrypted at rest on the device and purged automatically if the app detects it has been offline beyond a configurable maximum staleness window (security control against a lost/stolen device retaining stale sensitive data indefinitely).

---

# 34. Security Requirements

## 34.1 Authentication

* Single Sign-On (SSO) via SAML 2.0 / OIDC.
* Multi-Factor Authentication (MFA), mandatory for all roles with access to compliance-affecting or billing data.

## 34.2 Authorization

* Role-Based Access Control (RBAC), with role definitions configurable per tenant (Section 7) within a platform-defined permission catalog (tenants compose roles from defined permissions; they do not invent arbitrary new permission types).
* Attribute-based scoping layered on top of RBAC where needed (e.g., "Training Coordinator, scoped to Batch IDs X, Y, Z" rather than all coordinators automatically seeing all batches).

## 34.3 Data Security

* Encryption At Rest (AES-256 or equivalent) and Encryption In Transit (TLS 1.2+) for all data, with per-tenant encryption key separation for sensitive document storage (Section 7.2).
* Secrets management via a dedicated secrets vault; no credentials in application code or configuration files.

## 34.4 Audit Compliance

* Full Audit Logging per Section 29, retained per the regulatory retention requirements applicable to the tenant's operating framework(s) (Section 23.1).

## 34.5 Additional Security Controls (New in v2.0)

* Regular third-party penetration testing (at minimum annually, and after any major architectural change), with findings tracked to closure.
* Vulnerability disclosure program / responsible disclosure policy.
* Data residency options to meet customer/regulator data sovereignty requirements (tied to the deployment modes in Section 7.1).
* Incident response plan with defined customer notification timelines in the event of a security incident affecting their data.

## 34.6 Acceptance Criteria

* No critical or high-severity finding from penetration testing remains open beyond the remediation SLA defined in the security policy.
* MFA cannot be disabled for compliance-affecting roles by any tenant administrator without an AVI platform-level override (preventing a compromised tenant admin account from weakening their own security posture).

---

# 35. Non-Functional Requirements

## 35.1 Availability

99.9% uptime, measured monthly, excluding scheduled maintenance windows communicated at least 72 hours in advance.

## 35.2 Performance

* Page Load < 3 seconds (95th percentile) under normal load.
* API response time < 500ms (95th percentile) for standard read operations; scheduling engine optimization calls (Section 14/30.1) may run asynchronously with progress feedback rather than being held to the same synchronous threshold.

## 35.3 Scalability

* 10,000+ concurrent users platform-wide, with linear horizontal scaling validated by load testing before each major release.

## 35.4 Backup

* Daily Automated Backup, with point-in-time recovery capability (not just daily snapshots) for transactional databases.

## 35.5 Disaster Recovery

* Recovery Time Objective (RTO): 4 Hours.
* Recovery Point Objective (RPO): 15 Minutes.
* DR failover tested at minimum semi-annually with documented results.

## 35.6 Acceptance Criteria

* A simulated DR failover test meets both the RTO and RPO targets, with results documented and reviewed by Engineering and Customer Success leadership.

---

# 36. Data Migration & Onboarding (New Module — v2.0)

## 36.1 Migration Approach

* Standardized data mapping templates for common source formats (spreadsheets, legacy training databases) covering Student Profiles, historical Training Records, Instructor Qualifications, and Document Repository content.
* A dedicated migration validation pass before cutover: record counts reconciled, spot-check sampling of migrated records against source, and a sign-off checklist with the customer's Quality Manager before legacy systems are decommissioned.

## 36.2 Parallel Run Period

* Customers may run ATMS in parallel with their legacy process for a defined period (typically one full training cycle) before fully decommissioning legacy tools, to de-risk cutover for an operation that cannot afford a training-records gap.

## 36.3 Onboarding Checklist

Tenant provisioning (Section 7.3) → Master Data seeding (Section 9) → Regulatory framework configuration (Section 23) → Role and RBAC setup (Section 34.2) → Pilot batch run → Full go-live.

## 36.4 Acceptance Criteria

* Migrated historical training records pass the same integrity/immutability checks (Section 22.2) as natively-created records before the migration is considered complete.

---

# 37. Localization & Internationalization (New Module — v2.0)

## 37.1 Language Support

* UI localization for at minimum English, Hindi, and additional languages per customer base (configurable, extensible).
* Content (e-learning materials, exam questions) supports per-item language tagging, since ground school content is often delivered in multiple languages even within a single tenant.

## 37.2 Regional Formats

* Date, time, and number formats adapt to tenant locale settings; time zone handling is explicit and tested for multi-base operations (a tenant with training bases in multiple time zones must see schedules correctly localized per base, not just per tenant default).

## 37.3 Acceptance Criteria

* A schedule viewed by users in two different time zones for the same underlying session displays correctly converted local times with no ambiguity about the session's actual UTC time.

---

# 38. Accessibility (New Module — v2.0)

## 38.1 Standard

* Web and mobile applications target WCAG 2.1 AA conformance as a baseline.

## 38.2 Specific Requirements

* Full keyboard navigability for all core workflows.
* Screen-reader compatibility for student self-service portal content, given the platform serves a genuinely global, diverse trainee population.
* Sufficient color contrast and non-color-dependent status indicators (e.g., compliance status shown with icon + text, not color alone, given color-vision-deficient users among instructors/staff).

## 38.3 Acceptance Criteria

* Automated accessibility scanning (e.g., axe-core) integrated into CI/CD (Section 39) blocks merge on any new critical-severity accessibility violation.

---

# 39. DevOps, Release Management & Environments (New Module — v2.0)

## 39.1 Environments

Development → Staging → UAT (per-tenant, for major releases affecting that tenant's configuration) → Production.

## 39.2 Release Cadence

* Continuous deployment for non-breaking changes; scheduled release windows (communicated in advance per Section 35.1) for changes with customer-visible behavior change.
* Feature flagging for gradual rollout and tenant-specific feature enablement (e.g., AI Subsystem features may be enabled per-tenant based on contract tier).

## 39.3 Testing Gates

* Automated unit, integration, and contract tests (Section 31.5) required to pass before any production deployment.
* Regression test suite covering every Acceptance Criteria item in this document, maintained as living test cases, not just one-time UAT scripts.

## 39.4 Acceptance Criteria

* No production deployment occurs without passing the full automated test gate; any manual override of this gate requires a logged, dual-approved exception.

---

# 40. Support, SLAs & Customer Success (New Module — v2.0)

## 40.1 Support Tiers

| Severity | Definition | Response SLA | Resolution Target |
|---|---|---|---|
| Critical (P1) | Production down, or compliance-affecting data integrity issue | 30 minutes | 4 hours |
| High (P2) | Major feature unusable, no safe workaround | 4 hours | 1 business day |
| Medium (P3) | Feature degraded, workaround available | 1 business day | 5 business days |
| Low (P4) | Cosmetic / minor / enhancement request | 2 business days | Next release cycle |

## 40.2 Customer Success

* Dedicated onboarding support through the Data Migration process (Section 36).
* Quarterly business reviews for enterprise-tier customers, reviewing KPI performance (Section 2.2) against their own historical baseline.

## 40.3 Acceptance Criteria

* P1 incidents are resolved within SLA in at least 95% of occurrences, measured quarterly, with root-cause analysis published to affected customers for every P1.

---

# 41. Risk Register (New — v2.0)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI scheduling recommendation accepted without adequate human review, causing a regulatory conflict | Medium | High | Human-in-the-loop guardrails (Section 30.5); mandatory rationale display before approval |
| Cross-tenant data leakage in shared multi-tenant mode | Low | Critical | Row-level security, periodic penetration testing (Section 7.2, 34.5) |
| Migration data integrity loss during legacy cutover | Medium | High | Parallel run period, validation sign-off (Section 36.2) |
| Instructor/simulator double-booking due to integration timing gap with external calendar sync | Low | Medium | Conflict detection enforced at database layer, not just sync layer (Section 16.5) |
| Customer resistance to biometric attendance (privacy concerns) | Medium | Medium | QR-code fallback always available (Section 10.4); opt-out path per tenant policy |
| Over-reliance on AI Compliance Auditor reducing human vigilance | Low | High | Confidence indicators distinguishing rule violations from suggested review items (Section 30.2); periodic manual audit sampling retained regardless of AI coverage |
| Vendor lock-in concern from customers | Medium | Medium | Full data export capability (Section 7.2, 36), documented open API (Section 31.1) |

---

# 42. Future Roadmap

## Phase 2 (0–12 months post-GA)

* Mobile App full release (instructor/student/admin) — note: brought forward from the original Phase-2-only listing into core scope at Section 33, given its centrality to a modern training operation; remaining Phase 2 mobile work is refinement, not first build.
* E-Signatures (extended beyond assessment forms to all workflow approvals, Section 26)
* Advanced offline sync for low-connectivity training locations

## Phase 3 (12–24 months post-GA)

* AI Copilot — conversational interface across the full platform (extending the AI Training Assistant, Section 30.3, into a proactive assistant that surfaces relevant information unprompted, e.g., briefing a Training Manager each morning on overnight alerts)
* Predictive Analytics — extending the AI Resource Planner (30.4) into predictive student-outcome modeling (early identification of students at risk of failing a stage, based on competency trend data, Section 21) — strictly as a flag for additional instructor attention, never as an automated pass/fail influence
* DGCA/EASA Submission Automation — direct electronic filing integration where regulator systems support it (Section 31.3)
* Deeper third-party LMS Integration (bi-directional content marketplace, not just import/export)

## Phase 4 (Exploratory, 24+ months)

* Simulator telemetry integration — pulling objective flight-parameter data directly from FFS/FTD data recording systems to enrich (not replace) instructor assessment, where device data interfaces support it
* Cross-tenant (opt-in, anonymized) benchmarking — allowing a tenant to see how their utilization/pass-rate KPIs compare to anonymized industry aggregates

---

# 43. Recommended Navigation Structure

```
ATMS
│
├── Dashboard
│
├── Planning
│   ├── Calendar View
│   ├── Create Plan
│   ├── Ground School Planning
│   ├── Simulator Planning
│   ├── Resource Allocation
│   ├── Conflict Resolution
│   └── What-If Sandbox
│
├── Masters
│   ├── Aircraft Master
│   ├── Course Master
│   ├── Subject Master
│   ├── Simulator Master
│   ├── Classroom Master
│   ├── Instructor Master
│   └── Customer Master
│
├── Students
├── Batches
├── Learning (LMS Content & Progress)
├── Examinations
├── Assessments
├── Competencies
├── Training Records
├── Certificates
│
├── Compliance
│   ├── Compliance Dashboard
│   ├── Rule Engine
│   └── AI Compliance Findings
│
├── Resources
│   ├── Utilization Reports
│   └── Maintenance/Downtime Log
│
├── Billing
│   ├── Rate Cards
│   ├── Invoices
│   └── Contract Consumption
│
├── Reports
│   └── Report Builder
│
├── AI Assistant
│
├── Integrations
│   ├── API & Webhooks
│   └── Connected Systems
│
└── Administration
    ├── Users & Roles
    ├── Tenant Settings
    ├── Workflow Configuration
    ├── Notification Settings
    └── Audit Trail
```

---

# 44. Glossary

| Term | Definition |
|---|---|
| ATO | Approved Training Organization |
| FSTD | Flight Simulation Training Device |
| TRTO | Type Rating Training Organization |
| MTO | Maintenance Training Organization |
| TRI / TRE | Type Rating Instructor / Examiner |
| SFI | Synthetic Flight Instructor |
| LPC / OPC | License Proficiency Check / Operator Proficiency Check |
| LOFT | Line-Oriented Flight Training |
| CRM | Crew Resource Management |
| SMS | Safety Management System |
| FFS / FTD / MFTD / FBS | Full Flight Simulator / Flight Training Device / Maintenance FTD / Fixed-Base Simulator |
| RTO / RPO | Recovery Time Objective / Recovery Point Objective |
| RBAC | Role-Based Access Control |
| SLA | Service Level Agreement |
| SCORM / xAPI | Shareable Content Object Reference Model / Experience API — e-learning content interoperability standards |
| RAG | Retrieval-Augmented Generation (AI technique) |
| MTBF | Mean Time Between Failures |

---

END OF DOCUMENT