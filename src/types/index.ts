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
  | 'SFE'        // Synthetic Flight Examiner (Skill Tests, PPC, License Endorsements)
  | 'TRI'        // Type Rating Instructor
  | 'TRE';       // Type Rating Examiner

export type TrainingPhase = 
  | 'GROUND_TECH'    // Phase 1A: Technical Ground School
  | 'GROUND_PERF'    // Phase 1B: Performance & Flight Planning Ground School
  | 'MCC_JIT'        // Phase 1C: Multi-Crew Cooperation & Jet Induction Training
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

export type EvaluationResult = 
  | 'PASSED'
  | 'FAILED'
  | 'REMEDIAL_REQUIRED'
  | 'PENDING'
  | 'NOT_STARTED';

export type CourseAudience = 
  | 'FRESHER_AB_INITIO'       // Fresher / CPL Holder (Requires full Ground + MCC/JIT + FTD + FFS)
  | 'TYPE_RATED_TRANSITION'   // Existing Type Rating Holder (Transition Fast-Track without MCC/JIT)
  | 'CAPTAIN_UPGRADE'         // Command Upgrade (PIC LHS Training)
  | 'RECURRENT_REFRESHER'     // Annual Recurrent / Refresher
  | 'SPECIAL_OPERATIONS';     // UPRT, LVO/AWO CAT II/III, PBN/RNAV

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

export type CadetGoNoGoStatus = 'GO_CLEARED' | 'NO_GO_BLOCKED' | 'REMEDIAL_ACTIVE';
export type StageEvalOutcome = 'PASSED' | 'FAILED' | 'REMEDIAL_REQUIRED';

export interface CourseStage {
  stage_id: string;
  stage_number: number;
  stage_name: string;
  stage_type: 'GROUND_THEORY' | 'MCC_JIT' | 'FTD_PROCEDURES' | 'FFS_FULL_SIM' | 'SKILL_TEST_CHECK';
  ground_hours: number;
  sim_ftd_hours: number;
  sim_ffs_hours: number;
  flight_hours?: number;
  description: string;
  has_exam_or_check: boolean;
  passing_score_percent: number;
  requires_stage_cleared_to_proceed: boolean;
}

export interface TrainingCourse {
  id: string;
  course_code: string;
  course_title: string;
  aircraft_type_id: string;
  aircraft_type_name: string;
  target_audience: CourseAudience;
  has_mcc_jit: boolean;
  mcc_jit_hours: number;
  total_ground_hours: number;
  total_ftd_hours: number;
  total_ffs_hours: number;
  total_course_hours: number;
  estimated_duration_days: number;
  stages: CourseStage[];
  description: string;
  is_active: boolean;
}

export interface TrainingBatch {
  id: string;
  batch_code: string;
  batch_name: string;
  airline_operator: string;
  aircraft_type_id: string;
  aircraft_type_name: string;
  course_id?: string;
  course_name?: string;
  start_date: string;
  expected_completion_date: string;
  current_phase: TrainingPhase;
  progress_percentage: number;
  students_count: number;
  status: 'ACTIVE' | 'GROUND_COMPLETE' | 'SIM_IN_PROGRESS' | 'GRADUATED';
}

export interface StageEvaluationRecord {
  id: string;
  student_id: string;
  student_name: string;
  course_id: string;
  stage_id: string;
  stage_name: string;
  evaluation_date: string;
  evaluator_instructor_id: string;
  evaluator_instructor_name: string;
  score_percent: number;
  outcome: StageEvalOutcome;
  remedial_hours_required: number;
  cleared_for_next_stage: boolean;
  remarks: string;
}

export interface CadetAttendanceRecord {
  id: string;
  student_id: string;
  session_code: string;
  session_title: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'MAKEUP_COMPLETED';
  notes?: string;
}

export interface CadetStudent {
  id: string;
  student_number: string;
  full_name: string;
  avatar_initials: string;
  batch_id: string;
  batch_code: string;
  airline_sponsor: string;
  airline?: string; // Alias for airline_sponsor
  enrolled_course_id?: string;
  enrolled_course_title?: string;
  current_stage_id: string;
  current_stage_name: string;
  progress_percentage: number;
  ground_hours_completed: number;
  sim_ftd_hours_completed: number;
  sim_ffs_hours_completed: number;
  sim_hours_completed?: number;
  ground_tech_completed?: boolean;
  ground_perf_completed?: boolean;
  mcc_jit_completed?: boolean;
  skill_test_cleared?: boolean;
  medical_class1_expiry?: string;
  contact_email?: string;
  phone?: string;
  has_missed_sessions: boolean;
  missed_sessions_count: number;
  remedial_hours_assigned: number;
  go_no_go_status: CadetGoNoGoStatus;
  blocker_reason?: string;
  status: 'IN_TRAINING' | 'GROUND_CLEARED' | 'SIM_CLEARED' | 'LICENSED';
}

export interface InstructorQualification {
  id: string;
  fleet_code: string; // 'A320' | 'B737' | 'ATR 72-600' | 'Q400' | 'ALL_FLEETS'
  role: InstructorRole; // 'SFI' | 'SFE' | 'GI_TECH' | 'GI_PERF' | 'TRI' | 'TRE'
  approval_number: string; // e.g. 'DGCA/SFI/A320/2024-88'
  approval_type: string; // 'SFI CAR Section 7 (Level D FFS)'
  approval_issue_date: string; // '2024-06-15'
  approval_expiry_date: string; // '2029-06-15' (5-year)
  base_month: string; // 'June' (auto-derived from issue date)
  recurrent_expiry: string; // '2027-06-30'
  recurrent_window_start: string; // '2027-04-01'
  status: QualificationStatus;
}

export interface InstructorProfile {
  id: string;
  staff_id: string;
  full_name: string;
  email: string;
  phone: string;
  roles: InstructorRole[];
  assigned_fleets: string[]; // e.g. ['A320', 'B737', 'ATR 72-600', 'Q400']
  
  // Granular Qualifications per fleet / instruction type
  qualifications: InstructorQualification[];

  // Primary / Default DGCA fields (backward compatible)
  dgca_approval_number: string;
  dgca_approval_type: string;
  dgca_5yr_approval_issue?: string;
  dgca_5yr_approval_expiry?: string;
  base_month: string;
  recurrent_expiry: string;
  recurrent_window_start: string;
  recurrent_status: QualificationStatus;
  last_flown_date?: string;
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
  cancellation_reason?: string;
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
  category: 'INSTRUCTOR' | 'RECURRENT' | 'FDTL' | 'RESOURCE' | 'BATCH_PROGRESSION' | 'PREREQUISITE';
  rule_title: string;
  passed: boolean;
  message: string;
}

export type ATOTab = 
  | 'dashboard'
  | 'calendar'
  | 'scheduler'
  | 'courses'
  | 'cadets'
  | 'instructors'
  | 'pipeline'
  | 'fleets'
  | 'manual'
  | 'schema';


