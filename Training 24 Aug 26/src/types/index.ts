// ============================================================================
// Domain Types for Real-World Approved Training Organisation (ATO) Suite
// ============================================================================

export type ResourceCategory = 'FFS' | 'FTD' | 'CLASSROOM';

export type ResourceStatus = 
  | 'AVAILABLE'
  | 'UNDER_MAINTENANCE'
  | 'OUT_OF_SERVICE'
  | 'QUALIFICATION'
  | 'BLOCKED';

export type InstructorRole = 
  | 'GI_TECH'    // Technical Ground Instructor (Systems, Airframe, Avionics, Hydraulics)
  | 'GI_PERF'    // Performance Ground Instructor / SME (Flight Planning, Performance, W&B, Weather)
  | 'SFI'        // Synthetic Flight Instructor (Simulator Training FFS/FTD)
  | 'SFE';       // Synthetic Flight Examiner (Skill Tests, PPC, License Endorsements)

export type TrainingPhase = 
  | 'GROUND_TECH'    // Phase 1A: Technical Ground School
  | 'GROUND_PERF'    // Phase 1B: Performance & Flight Planning Ground School
  | 'SIM_FTD'        // Phase 2A: Flight Training Device Procedures
  | 'SIM_FFS'        // Phase 2B: Full Flight Simulator Sessions (FFS-01 to FFS-08)
  | 'SKILL_TEST';    // Phase 3: CA-40 Skill Test / License Endorsement Check

export type QualificationStatus = 
  | 'VALID'
  | 'EXPIRING'
  | 'EXPIRED'
  | 'REFRESHER_REQUIRED'
  | 'SUSPENDED';

export type ScheduleStatus = 
  | 'DRAFT'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Organisation {
  id: string;
  legal_name: string;
  trading_name: string;
  ato_approval_number: string;
  is_active: boolean;
}

export interface AircraftFleet {
  id: string;
  manufacturer: string;
  model_name: string;
  variant: string;
  type_rating_code: string;
  category: 'JET' | 'TURBOPROP';
  description: string;
}

export interface TrainingBatch {
  id: string;
  batch_code: string;
  batch_name: string;
  airline_operator: string;
  aircraft_type_id: string;
  aircraft_type_name: string;
  start_date: string;
  expected_completion_date: string;
  current_phase: TrainingPhase;
  progress_percentage: number;
  students_count: number;
  status: 'ACTIVE' | 'GROUND_COMPLETE' | 'SIM_IN_PROGRESS' | 'GRADUATED';
}

export interface CadetStudent {
  id: string;
  student_number: string;
  full_name: string;
  batch_id: string;
  batch_code: string;
  airline: string;
  medical_class1_expiry?: string;
  contact_email?: string;
  ground_tech_completed: boolean;
  ground_perf_completed: boolean;
  sim_hours_completed: number;
  skill_test_cleared: boolean;
  status: 'IN_TRAINING' | 'GROUND_CLEARED' | 'SIM_CLEARED' | 'LICENSED';
}

export interface InstructorProfile {
  id: string;
  staff_id: string;
  full_name: string;
  email: string;
  phone: string;
  roles: InstructorRole[];
  assigned_fleets: string[]; // e.g. ['A320', 'B737', 'ATR 72-600', 'Q400']
  dgca_approval_number: string;
  dgca_approval_type: string; // 'GI CAR', 'SME CAR', 'SFI CAR', 'SFE CAR'
  dgca_5yr_approval_issue?: string; // DGCA 5-year initial approval issue date
  dgca_5yr_approval_expiry?: string; // DGCA 5-year approval validity
  base_month: string; // e.g. 'November'
  recurrent_expiry: string; // e.g. '2026-11-30' (Annual recurrent check)
  recurrent_window_start: string; // e.g. '2026-09-01' (3 months prior)
  recurrent_status: QualificationStatus;
  last_flown_date?: string; // 90-day recency/currency check
  currency_status?: QualificationStatus;
  employment_status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
  is_locked_out: boolean;
  lockout_reason?: string;
  avatar_initials: string;
}

export interface SimulatorResource {
  id: string;
  resource_name: string;
  resource_category: ResourceCategory;
  level: string; // 'Level D', 'Level 2', 'Classroom'
  supported_aircraft_ids: string[];
  supported_aircraft_names: string[];
  status: ResourceStatus;
  bay_location: string;
  approval_authority: string; // 'DGCA India', 'EASA'
  approval_number: string;
  approval_expiry: string;
}

export interface CourseSyllabusItem {
  id: string;
  aircraft_type_id: string;
  phase: TrainingPhase;
  session_code: string;
  session_title: string;
  duration_instructional_hours: number;
  duration_briefing_hours: number;
  total_duty_hours: number;
  required_instructor_role: InstructorRole;
  required_resource_category: ResourceCategory;
  is_check: boolean;
  description: string;
}

export interface TrainingScheduleSession {
  id: string;
  batch_id: string;
  batch_code: string;
  session_code: string;
  session_title: string;
  phase: TrainingPhase;
  aircraft_type_id: string;
  aircraft_type_name: string;
  instructor_id: string;
  instructor_name: string;
  instructor_role: InstructorRole;
  resource_id: string;
  resource_name: string;
  student_ids: string[];
  student_names: string[];
  date: string;
  start_time: string; // e.g. '08:00'
  end_time: string;   // e.g. '14:00'
  briefing_hours: number;
  sim_hours: number;
  total_duty_hours: number;
  status: ScheduleStatus;
}

export interface FDTLDutyRecord {
  id: string;
  instructor_id: string;
  session_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  briefing_hours: number;
  sim_hours: number;
  total_duty_hours: number;
  is_actual: boolean;
}

export interface InstructorFDTLCalculation {
  instructor_id: string;
  instructor_name: string;
  
  // 1-Day / 24-Hour limit (Max 6.0 hrs)
  hours_24h_sim: number;
  hours_24h_briefing: number;
  hours_24h_total: number;
  max_24h_limit: number; // 6.0h
  remaining_24h: number;
  percentage_24h: number;

  // 7-Consecutive Days limit (Max 30.0 hrs)
  hours_7d_total: number;
  max_7d_limit: number; // 30.0h
  remaining_7d: number;
  percentage_7d: number;

  is_fdtl_legal: boolean;
}

export interface ValidationRuleCheck {
  id: string;
  category: 'INSTRUCTOR' | 'RECURRENT' | 'FDTL' | 'RESOURCE' | 'BATCH_PROGRESSION';
  rule_title: string;
  passed: boolean;
  message: string;
}
