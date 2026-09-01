import { create } from 'zustand';
import {
  Organisation,
  AircraftFleet,
  TrainingBatch,
  CadetStudent,
  InstructorProfile,
  InstructorQualification,
  SimulatorResource,
  CourseSyllabusItem,
  TrainingCourse,
  StageEvaluationRecord,
  CadetAttendanceRecord,
  TrainingScheduleSession,
  FDTLDutyRecord,
  ValidationRuleCheck,
  InstructorFDTLCalculation,
  ATOTab,
  CadetGoNoGoStatus,
} from '@/types';

export type { ATOTab };
import {
  ATO_ORGANISATION,
  ATO_FLEETS,
  ATO_BATCHES,
  ATO_STUDENTS,
  ATO_INSTRUCTORS,
  ATO_SIMULATORS,
  ATO_SYLLABUS,
  ATO_COURSES,
  ATO_STAGE_EVALUATIONS,
  ATO_ATTENDANCES,
  ATO_ACTIVE_SCHEDULES,
  ATO_HISTORICAL_DUTY_LOGS,
} from '@/lib/seed-data';
import { validateATOSchedulingMatrix, calculateInstructorDutyFDTL } from '@/lib/compliance';

export type CalendarViewMode = 'day' | 'week' | 'month' | 'year';

export interface ToastAlert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface SchedulingFormState {
  batchId: string;
  syllabusCode: string;
  instructorId: string;
  resourceId: string;
  selectedStudentIds: string[];
  date: string;
  startTime: string;
}

export interface SlotModalData {
  mode: 'CREATE' | 'EDIT';
  session?: TrainingScheduleSession;
  prefillDate?: string;
  prefillTime?: string;
  prefillResourceId?: string;
}

interface ATOStore {
  activeTab: ATOTab;
  setActiveTab: (tab: ATOTab) => void;

  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Master Calendar View State
  calendarView: CalendarViewMode;
  setCalendarView: (view: CalendarViewMode) => void;
  selectedCalendarDate: string;
  setSelectedCalendarDate: (date: string) => void;
  selectedSessionModal: TrainingScheduleSession | null;
  setSelectedSessionModal: (session: TrainingScheduleSession | null) => void;
  calendarFleetFilter: string;
  setCalendarFleetFilter: (fleetId: string) => void;
  calendarResourceFilter: string;
  setCalendarResourceFilter: (resourceId: string) => void;

  // Interactive Slot Add/Edit/Reschedule Modal
  isSlotModalOpen: boolean;
  slotModalData: SlotModalData | null;
  openSlotModal: (data: SlotModalData) => void;
  closeSlotModal: () => void;

  // Course and Cadet Modals
  isCreateCourseModalOpen: boolean;
  setIsCreateCourseModalOpen: (open: boolean) => void;
  isEvaluationModalOpen: boolean;
  setIsEvaluationModalOpen: (open: boolean) => void;
  selectedCadetForDossier: CadetStudent | null;
  setSelectedCadetForDossier: (cadet: CadetStudent | null) => void;

  organisation: Organisation;
  fleets: AircraftFleet[];
  batches: TrainingBatch[];
  students: CadetStudent[];
  instructors: InstructorProfile[];
  simulators: SimulatorResource[];
  syllabus: CourseSyllabusItem[];
  courses: TrainingCourse[];
  evaluations: StageEvaluationRecord[];
  attendances: CadetAttendanceRecord[];
  schedules: TrainingScheduleSession[];
  dutyLogs: FDTLDutyRecord[];

  selectedInstructorId: string;
  setSelectedInstructorId: (id: string) => void;

  selectedBatchId: string;
  setSelectedBatchId: (id: string) => void;

  // Modals & Navigation state
  isMobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  isCreateBatchModalOpen: boolean;
  setIsCreateBatchModalOpen: (open: boolean) => void;
  isAddInstructorModalOpen: boolean;
  setIsAddInstructorModalOpen: (open: boolean) => void;
  isExportPrintModalOpen: boolean;
  setIsExportPrintModalOpen: (open: boolean) => void;
  renewModalInstructor: InstructorProfile | null;
  setRenewModalInstructor: (ins: InstructorProfile | null) => void;

  // Dynamic Operations & Qualifications
  addInstructor: (instructor: Omit<InstructorProfile, 'id' | 'avatar_initials' | 'is_locked_out'>) => void;
  addInstructorQualification: (instructorId: string, qualification: InstructorQualification) => void;
  updateInstructorStatus: (id: string, status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED') => void;
  renewInstructorRecurrent: (instructorId: string, checkDate: string, examinerName: string) => void;
  addBatch: (
    batch: Omit<TrainingBatch, 'id' | 'students_count' | 'progress_percentage'>,
    cadets: { full_name: string; student_number: string; airline: string; medical_class1_expiry?: string; contact_email?: string }[]
  ) => void;
  addStudentToBatch: (
    batchId: string,
    student: { full_name: string; student_number: string; airline: string; medical_class1_expiry?: string; contact_email?: string }
  ) => void;

  // Session Slot Actions
  addSession: (session: TrainingScheduleSession) => void;
  updateSession: (sessionId: string, updates: Partial<TrainingScheduleSession>) => void;
  cancelSession: (sessionId: string, reason?: string) => void;

  // Course, Evaluation & Remedial Actions
  addCourse: (course: TrainingCourse) => void;
  recordStageEvaluation: (evalRecord: StageEvaluationRecord) => void;
  assignRemedialTraining: (studentId: string, stageCode: string, extraHours: number, focusAreas: string[]) => void;
  markAttendance: (
    recordOrSessionId: CadetAttendanceRecord | string,
    studentId?: string,
    status?: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'MAKEUP_COMPLETED',
    notes?: string
  ) => void;

  form: SchedulingFormState;
  updateForm: (updates: Partial<SchedulingFormState>) => void;
  autoMatchInstructorAndResource: (batchId: string, syllabusCode: string) => void;
  applyPreset: (presetKey: 'valid-ground-tech' | 'valid-ground-perf' | 'valid-sfi-ffs' | 'blocked-prereq-sim' | 'fdtl-exceeded' | 'refresher-lockout' | 'sim-fleet-mismatch') => void;

  validation: {
    isValid: boolean;
    summary: string;
    fdtl: InstructorFDTLCalculation | null;
    checks: ValidationRuleCheck[];
  };
  runValidation: () => void;
  commitSessionBooking: () => Promise<boolean>;

  toasts: ToastAlert[];
  addToast: (toast: Omit<ToastAlert, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useStore = create<ATOStore>((set, get) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  theme: 'light',
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aeromatrix_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
    set({ theme });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  calendarView: 'day',
  setCalendarView: (view) => set({ calendarView: view }),
  selectedCalendarDate: '2026-09-01',
  setSelectedCalendarDate: (date) => set({ selectedCalendarDate: date }),
  selectedSessionModal: null,
  setSelectedSessionModal: (session) => set({ selectedSessionModal: session }),
  calendarFleetFilter: 'ALL',
  setCalendarFleetFilter: (fleetId) => set({ calendarFleetFilter: fleetId }),
  calendarResourceFilter: 'ALL',
  setCalendarResourceFilter: (resourceId) => set({ calendarResourceFilter: resourceId }),

  isSlotModalOpen: false,
  slotModalData: null,
  openSlotModal: (data) => set({ isSlotModalOpen: true, slotModalData: data }),
  closeSlotModal: () => set({ isSlotModalOpen: false, slotModalData: null }),

  isCreateCourseModalOpen: false,
  setIsCreateCourseModalOpen: (open) => set({ isCreateCourseModalOpen: open }),
  isEvaluationModalOpen: false,
  setIsEvaluationModalOpen: (open) => set({ isEvaluationModalOpen: open }),
  selectedCadetForDossier: null,
  setSelectedCadetForDossier: (cadet) => set({ selectedCadetForDossier: cadet }),

  isMobileNavOpen: false,
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
  toggleMobileNav: () => set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen })),

  isCreateBatchModalOpen: false,
  setIsCreateBatchModalOpen: (open) => set({ isCreateBatchModalOpen: open }),
  isAddInstructorModalOpen: false,
  setIsAddInstructorModalOpen: (open) => set({ isAddInstructorModalOpen: open }),
  isExportPrintModalOpen: false,
  setIsExportPrintModalOpen: (open) => set({ isExportPrintModalOpen: open }),
  renewModalInstructor: null,
  setRenewModalInstructor: (ins) => set({ renewModalInstructor: ins }),

  organisation: ATO_ORGANISATION,
  fleets: ATO_FLEETS,
  batches: ATO_BATCHES,
  students: ATO_STUDENTS,
  instructors: ATO_INSTRUCTORS,
  simulators: ATO_SIMULATORS,
  syllabus: ATO_SYLLABUS,
  courses: ATO_COURSES,
  evaluations: ATO_STAGE_EVALUATIONS,
  attendances: ATO_ATTENDANCES,
  schedules: ATO_ACTIVE_SCHEDULES,
  dutyLogs: ATO_HISTORICAL_DUTY_LOGS,

  selectedInstructorId: ATO_INSTRUCTORS[2].id, // Capt. Rahul Sharma (SFI)
  setSelectedInstructorId: (id) => set({ selectedInstructorId: id }),

  selectedBatchId: ATO_BATCHES[0].id, // Batch 26A (IndiGo A320)
  setSelectedBatchId: (id) => set({ selectedBatchId: id }),

  renewInstructorRecurrent: (instructorId, checkDate, examinerName) => {
    const instructor = get().instructors.find((i) => i.id === instructorId);
    if (!instructor) return;

    // Month map to roll 1 year forward preserving base month
    const monthMap: { [key: string]: { num: string; startGrace: string } } = {
      January: { num: '01', startGrace: '11' },
      February: { num: '02', startGrace: '12' },
      March: { num: '03', startGrace: '01' },
      April: { num: '04', startGrace: '02' },
      May: { num: '05', startGrace: '03' },
      June: { num: '06', startGrace: '04' },
      July: { num: '07', startGrace: '05' },
      August: { num: '08', startGrace: '06' },
      September: { num: '09', startGrace: '07' },
      October: { num: '10', startGrace: '08' },
      November: { num: '11', startGrace: '09' },
      December: { num: '12', startGrace: '10' },
    };

    const bMonth = instructor.base_month || 'September';
    const monthNum = monthMap[bMonth]?.num || '09';
    const startGraceNum = monthMap[bMonth]?.startGrace || '07';

    // Next year forward
    const nextYear = 2027;
    const newRecurrentExpiry = `${nextYear}-${monthNum}-30`;
    const newRecurrentWindowStart = `${nextYear}-${startGraceNum}-01`;

    set((state) => ({
      instructors: state.instructors.map((ins) =>
        ins.id === instructorId
          ? {
              ...ins,
              recurrent_expiry: newRecurrentExpiry,
              recurrent_window_start: newRecurrentWindowStart,
              recurrent_status: 'VALID',
              currency_status: 'VALID',
              is_locked_out: false,
              lockout_reason: undefined,
            }
          : ins
      ),
    }));

    get().addToast({
      type: 'success',
      title: 'Recurrent Check Logged',
      message: `${instructor.full_name} completed annual check with ${examinerName || 'Designated Examiner'}. Base Month (${bMonth}) preserved until ${newRecurrentExpiry}.`,
    });
  },

  addInstructor: (newIns) => {
    const initials = newIns.full_name
      .replace(/^Capt\.\s+/i, '')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const created: InstructorProfile = {
      ...newIns,
      id: `ins-${Date.now()}`,
      avatar_initials: initials || 'IN',
      is_locked_out: newIns.recurrent_status === 'REFRESHER_REQUIRED' || newIns.recurrent_status === 'EXPIRED',
    };

    set((state) => ({
      instructors: [created, ...state.instructors],
    }));

    get().addToast({
      type: 'success',
      title: 'Instructor Onboarded',
      message: `${created.full_name} (${created.dgca_approval_number}) successfully registered with 5-year DGCA CAR validity.`,
    });
  },

  updateInstructorStatus: (id, status) => {
    set((state) => ({
      instructors: state.instructors.map((ins) =>
        ins.id === id ? { ...ins, employment_status: status } : ins
      ),
    }));

    get().addToast({
      type: 'info',
      title: 'Instructor Status Updated',
      message: `Employment status changed to ${status}.`,
    });
  },

  addBatch: (batchData, cadetsData) => {
    const batchId = `batch-${Date.now()}`;
    const newBatch: TrainingBatch = {
      ...batchData,
      id: batchId,
      students_count: cadetsData.length,
      progress_percentage: 0,
    };

    const newCadets: CadetStudent[] = cadetsData.map((c, i) => ({
      id: `stu-${Date.now()}-${i}`,
      student_number: c.student_number,
      full_name: c.full_name,
      avatar_initials: c.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      batch_id: batchId,
      batch_code: batchData.batch_code,
      airline_sponsor: c.airline || batchData.airline_operator,
      airline: c.airline || batchData.airline_operator,
      medical_class1_expiry: c.medical_class1_expiry || '2027-08-31',
      contact_email: c.contact_email,
      current_stage_id: 'STAGE-1-GROUND',
      current_stage_name: 'Ground Theory & Systems',
      progress_percentage: 0,
      ground_hours_completed: 0,
      sim_ftd_hours_completed: 0,
      sim_ffs_hours_completed: 0,
      sim_hours_completed: 0,
      ground_tech_completed: false,
      ground_perf_completed: false,
      mcc_jit_completed: false,
      skill_test_cleared: false,
      has_missed_sessions: false,
      missed_sessions_count: 0,
      remedial_hours_assigned: 0,
      go_no_go_status: 'GO_CLEARED',
      status: 'IN_TRAINING',
    }));

    set((state) => ({
      batches: [newBatch, ...state.batches],
      students: [...state.students, ...newCadets],
    }));

    get().addToast({
      type: 'success',
      title: 'Training Batch Created',
      message: `${newBatch.batch_name} (${newBatch.batch_code}) registered with ${newCadets.length} enrolled cadets.`,
    });
  },

  addStudentToBatch: (batchId, studentData) => {
    const batch = get().batches.find((b) => b.id === batchId);
    const newCadet: CadetStudent = {
      id: `stu-${Date.now()}`,
      student_number: studentData.student_number,
      full_name: studentData.full_name,
      avatar_initials: studentData.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      batch_id: batchId,
      batch_code: batch?.batch_code || 'BATCH',
      airline_sponsor: studentData.airline || batch?.airline_operator || 'Airline',
      airline: studentData.airline || batch?.airline_operator || 'Airline',
      current_stage_id: 'STAGE-1-GROUND',
      current_stage_name: 'Ground Theory & Systems',
      progress_percentage: 0,
      ground_hours_completed: 0,
      sim_ftd_hours_completed: 0,
      sim_ffs_hours_completed: 0,
      sim_hours_completed: 0,
      ground_tech_completed: false,
      ground_perf_completed: false,
      mcc_jit_completed: false,
      skill_test_cleared: false,
      has_missed_sessions: false,
      missed_sessions_count: 0,
      remedial_hours_assigned: 0,
      go_no_go_status: 'GO_CLEARED',
      status: 'IN_TRAINING',
    };

    set((state) => ({
      students: [...state.students, newCadet],
      batches: state.batches.map((b) => (b.id === batchId ? { ...b, students_count: b.students_count + 1 } : b)),
    }));

    get().addToast({
      type: 'success',
      title: 'Cadet Enrolled',
      message: `${newCadet.full_name} (${newCadet.student_number}) added to batch.`,
    });
  },

  addInstructorQualification: (instructorId, qual) => {
    set((state) => ({
      instructors: state.instructors.map((ins) => {
        if (ins.id !== instructorId) return ins;
        const existing = ins.qualifications || [];
        const updatedRoles = Array.from(new Set([...ins.roles, qual.role]));
        const updatedFleets = qual.fleet_code === 'ALL_FLEETS' 
          ? ins.assigned_fleets 
          : Array.from(new Set([...ins.assigned_fleets, qual.fleet_code]));
        return {
          ...ins,
          roles: updatedRoles,
          assigned_fleets: updatedFleets,
          qualifications: [qual, ...existing.filter((q) => q.id !== qual.id)],
        };
      }),
    }));

    get().addToast({
      type: 'success',
      title: 'Qualification Added',
      message: `Added ${qual.role} endorsement for ${qual.fleet_code} (Approval: ${qual.approval_number}).`,
    });
  },

  addSession: (session) => {
    set((state) => ({
      schedules: [session, ...state.schedules],
    }));

    get().addToast({
      type: 'success',
      title: 'Slot Booked & Dispatched',
      message: `${session.session_code} on ${session.date} (${session.start_time}–${session.end_time}) confirmed on ${session.resource_name}.`,
    });
  },

  updateSession: (sessionId, updates) => {
    set((state) => ({
      schedules: state.schedules.map((s) =>
        s.id === sessionId ? { ...s, ...updates } : s
      ),
    }));

    get().addToast({
      type: 'info',
      title: 'Session Updated / Rescheduled',
      message: `Session ${sessionId} has been rescheduled with updated parameters.`,
    });
  },

  cancelSession: (sessionId, reason = 'Operational adjustment') => {
    set((state) => ({
      schedules: state.schedules.map((s) =>
        s.id === sessionId
          ? { ...s, status: 'CANCELLED', cancellation_reason: reason }
          : s
      ),
    }));

    get().addToast({
      type: 'warning',
      title: 'Session Cancelled',
      message: `Session has been cancelled (${reason}).`,
    });
  },

  addCourse: (course) => {
    set((state) => ({
      courses: [course, ...state.courses],
    }));

    get().addToast({
      type: 'success',
      title: 'Curriculum Course Created',
      message: `${course.course_title} (${course.course_code}) added with ${course.stages.length} syllabus stages.`,
    });
  },

  recordStageEvaluation: (evalRecord) => {
    set((state) => {
      // Also update student go_no_go status and cleared status
      const updatedStudents = state.students.map((stu) => {
        if (stu.id !== evalRecord.student_id) return stu;
        if (evalRecord.outcome === 'PASSED') {
          return {
            ...stu,
            go_no_go_status: 'GO_CLEARED' as CadetGoNoGoStatus,
            blocker_reason: undefined,
          };
        } else if (evalRecord.outcome === 'FAILED' || evalRecord.outcome === 'REMEDIAL_REQUIRED') {
          return {
            ...stu,
            go_no_go_status: (evalRecord.outcome === 'FAILED' ? 'NO_GO_BLOCKED' : 'REMEDIAL_ACTIVE') as CadetGoNoGoStatus,
            remedial_hours_assigned: (stu.remedial_hours_assigned || 0) + (evalRecord.remedial_hours_required || 2.0),
            blocker_reason: `STAGE TEST ${evalRecord.outcome}: Scored ${evalRecord.score_percent}%. ${evalRecord.remarks}`,
          };
        }
        return stu;
      });

      return {
        evaluations: [evalRecord, ...state.evaluations],
        students: updatedStudents,
      };
    });

    get().addToast({
      type: evalRecord.outcome === 'PASSED' ? 'success' : 'error',
      title: `Stage Test ${evalRecord.outcome}`,
      message: `${evalRecord.student_name}: ${evalRecord.stage_name} scored ${evalRecord.score_percent}% (${evalRecord.outcome}).`,
    });
  },

  assignRemedialTraining: (studentId, stageCode, extraHours, focusAreas) => {
    set((state) => ({
      students: state.students.map((stu) => {
        if (stu.id !== studentId) return stu;
        return {
          ...stu,
          remedial_hours_assigned: (stu.remedial_hours_assigned || 0) + extraHours,
          go_no_go_status: 'REMEDIAL_ACTIVE',
          blocker_reason: `REMEDIAL ACTIVE: ${extraHours}h retraining assigned for ${stageCode} (${focusAreas.join(', ')}).`,
        };
      }),
    }));

    get().addToast({
      type: 'warning',
      title: 'Remedial Package Assigned',
      message: `Assigned ${extraHours}h remedial flight/simulator training for ${focusAreas.join(', ')}.`,
    });
  },

  markAttendance: (recordOrSessionId, studentId, status, notes) => {
    let record: CadetAttendanceRecord;
    if (typeof recordOrSessionId === 'object') {
      record = recordOrSessionId;
    } else {
      const student = get().students.find((s) => s.id === studentId);
      const session = get().schedules.find((s) => s.id === recordOrSessionId);
      record = {
        id: `att-${Date.now()}`,
        student_id: studentId || '',
        session_code: session?.session_code || 'SES',
        session_title: session?.session_title || 'Session',
        date: session?.date || '2026-09-01',
        status: status || 'PRESENT',
        notes,
      };
    }

    const currentStudentId = record.student_id;
    const currentStatus = record.status;

    set((state) => {
      const updatedStudents = state.students.map((stu) => {
        if (stu.id !== currentStudentId) return stu;
        if (currentStatus === 'ABSENT') {
          return {
            ...stu,
            has_missed_sessions: true,
            missed_sessions_count: (stu.missed_sessions_count || 0) + 1,
            go_no_go_status: 'NO_GO_BLOCKED' as CadetGoNoGoStatus,
            blocker_reason: `MISSED CLASS: Absent for ${record.session_code}. Makeup session mandatory before simulator access.`,
          };
        } else if (currentStatus === 'MAKEUP_COMPLETED') {
          const newCount = Math.max(0, (stu.missed_sessions_count || 1) - 1);
          return {
            ...stu,
            has_missed_sessions: newCount > 0,
            missed_sessions_count: newCount,
            go_no_go_status: newCount === 0 ? ('GO_CLEARED' as CadetGoNoGoStatus) : ('NO_GO_BLOCKED' as CadetGoNoGoStatus),
            blocker_reason: newCount === 0 ? undefined : stu.blocker_reason,
          };
        }
        return stu;
      });

      return {
        attendances: [record, ...state.attendances],
        students: updatedStudents,
      };
    });

    get().addToast({
      type: currentStatus === 'ABSENT' ? 'error' : 'success',
      title: `Attendance Marked: ${currentStatus}`,
      message: `Cadet attendance recorded as ${currentStatus} for ${record.session_code}.`,
    });
  },

  autoMatchInstructorAndResource: (batchId, syllabusCode) => {
    const { batches, syllabus, instructors, simulators, students, form } = get();
    const batch = batches.find((b) => b.id === batchId) || batches[0];
    const syllabusItem = syllabus.find((s) => s.session_code === syllabusCode) || syllabus[0];

    // 1. Match compliant instructor
    const compliantInstructor = instructors.find((ins) => {
      if (ins.employment_status === 'RESIGNED') return false;
      const hasRole = ins.roles.includes(syllabusItem.required_instructor_role);
      const hasFleet = ins.assigned_fleets.some((f) => batch.aircraft_type_name.includes(f));
      return hasRole && hasFleet && !ins.is_locked_out;
    }) || instructors[0];

    // 2. Match compliant simulator resource
    const compliantResource = simulators.find((res) => {
      const isCompatCategory = res.resource_category === syllabusItem.required_resource_category;
      const isCompatFleet = res.supported_aircraft_ids.includes(batch.aircraft_type_id);
      return isCompatCategory && isCompatFleet && res.status === 'AVAILABLE';
    }) || simulators[0];

    // 3. Match cadets belonging to this batch
    const batchCadetIds = students.filter((s) => s.batch_id === batch.id).map((s) => s.id);
    const isGround = syllabusItem.phase === 'GROUND_TECH' || syllabusItem.phase === 'GROUND_PERF';
    const selectedCadets = isGround ? batchCadetIds : (batchCadetIds.length > 0 ? batchCadetIds.slice(0, 2) : form.selectedStudentIds);

    set((state) => ({
      form: {
        ...state.form,
        batchId: batch.id,
        syllabusCode: syllabusItem.session_code,
        instructorId: compliantInstructor.id,
        resourceId: compliantResource.id,
        selectedStudentIds: selectedCadets,
      },
    }));

    get().runValidation();
  },

  form: {
    batchId: ATO_BATCHES[0].id,
    syllabusCode: ATO_SYLLABUS[5].session_code, // FFS-01
    instructorId: ATO_INSTRUCTORS[2].id, // Capt. Rahul Sharma (SFI)
    resourceId: ATO_SIMULATORS[0].id, // A320 FFS-01
    selectedStudentIds: [ATO_STUDENTS[0].id, ATO_STUDENTS[1].id], // Aditi Rao & Rohan Verma
    date: '2026-09-01',
    startTime: '08:00',
  },

  updateForm: (updates) => {
    set((state) => ({ form: { ...state.form, ...updates } }));
    get().runValidation();
  },

  applyPreset: (presetKey) => {
    const { batches, syllabus, instructors, simulators, students } = get();

    switch (presetKey) {
      case 'valid-ground-tech':
        // Batch 26B (B737) -> Ground Tech Class with Tech GI (Capt Hemant Kulkarni)
        set({
          form: {
            batchId: batches[1].id, // AIX B737 Batch
            syllabusCode: 'GND-TECH-01',
            instructorId: instructors[0].id, // Tech GI
            resourceId: 'room-alpha',
            selectedStudentIds: [students[2].id, students[3].id],
            date: '2026-09-01',
            startTime: '09:00',
          },
        });
        break;

      case 'valid-ground-perf':
        // Batch 26D (Q400) -> Ground Performance Class with Perf GI / SME (Capt Sanjay Deshmukh)
        set({
          form: {
            batchId: batches[3].id, // Q400 Batch
            syllabusCode: 'GND-PERF-01',
            instructorId: instructors[1].id, // Perf GI / SME
            resourceId: 'room-beta',
            selectedStudentIds: [students[5].id],
            date: '2026-09-01',
            startTime: '10:00',
          },
        });
        break;

      case 'valid-sfi-ffs':
        // Batch 26A (A320) -> FFS-01 Session with SFI (Capt Rahul Sharma) on A320 FFS-01 Level D
        set({
          form: {
            batchId: batches[0].id,
            syllabusCode: 'FFS-01',
            instructorId: instructors[2].id, // SFI Rahul Sharma
            resourceId: simulators[0].id, // A320 FFS-01
            selectedStudentIds: [students[0].id, students[1].id], // Cadets who cleared Ground School
            date: '2026-09-01',
            startTime: '08:00',
          },
        });
        break;

      case 'blocked-prereq-sim':
        // Attempting to book FFS Simulator for Batch 26B students who haven't completed Ground Tech/Perf yet!
        set({
          form: {
            batchId: batches[1].id, // AIX B737 Batch (Ground phase not finished)
            syllabusCode: 'FFS-01',
            instructorId: instructors[3].id, // SFI Sarah Jenkins
            resourceId: simulators[1].id, // B737 FFS-01
            selectedStudentIds: [students[2].id, students[3].id], // Tanya Sen & Siddharth Nair
            date: '2026-09-01',
            startTime: '14:00',
          },
        });
        break;

      case 'fdtl-exceeded':
        // Booking Capt Rajesh Gupta who already has 5.5h today and 28h in 7-days -> Exceeds both 6h & 30h limits!
        set({
          form: {
            batchId: batches[0].id,
            syllabusCode: 'FFS-04', // 6.0h duty (2h brief + 4h sim)
            instructorId: instructors[5].id, // Capt Rajesh Gupta
            resourceId: simulators[0].id,
            selectedStudentIds: [students[0].id, students[1].id],
            date: '2026-09-01', // Today
            startTime: '14:00',
          },
        });
        break;

      case 'refresher-lockout':
        // Attempting to schedule Capt Elena Rostova whose 1-year recurrent is missed -> REFRESHER REQUIRED
        set({
          form: {
            batchId: batches[0].id,
            syllabusCode: 'CA-40', // Skill Test
            instructorId: instructors[7].id, // Elena Rostova (Refresher Lockout)
            resourceId: simulators[0].id,
            selectedStudentIds: [students[0].id, students[1].id],
            date: '2026-09-01',
            startTime: '08:00',
          },
        });
        break;

      case 'sim-fleet-mismatch':
        // Booking B737 batch session on an A320 FFS device
        set({
          form: {
            batchId: batches[1].id, // B737 Batch
            syllabusCode: 'FFS-01',
            instructorId: instructors[3].id, // SFI Sarah Jenkins
            resourceId: simulators[0].id, // A320 FFS-01 (Mismatch!)
            selectedStudentIds: [students[2].id, students[3].id],
            date: '2026-09-01',
            startTime: '08:00',
          },
        });
        break;
    }

    get().runValidation();
  },

  validation: {
    isValid: true,
    summary: 'Compliance checks active.',
    fdtl: null,
    checks: [],
  },

  runValidation: () => {
    const { form, batches, syllabus, instructors, simulators, students, schedules, dutyLogs } = get();

    const batch = batches.find((b) => b.id === form.batchId) || batches[0];
    const syllabusItem = syllabus.find((s) => s.session_code === form.syllabusCode) || syllabus[0];
    const instructor = instructors.find((i) => i.id === form.instructorId) || instructors[0];
    const resource = simulators.find((r) => r.id === form.resourceId) || simulators[0];
    const selectedCadets = students.filter((s) => form.selectedStudentIds.includes(s.id));

    const result = validateATOSchedulingMatrix({
      batch,
      syllabusItem,
      instructor,
      resource,
      students: selectedCadets,
      date: form.date,
      startTime: form.startTime,
      allInstructors: instructors,
      allSchedules: schedules,
      allDutyLogs: dutyLogs,
    });

    set({ validation: result });
  },

  commitSessionBooking: async () => {
    get().runValidation();
    const { validation, form, batches, syllabus, instructors, simulators, students, schedules, addToast } = get();

    if (!validation.isValid) {
      const fdtlFail = validation.checks.find((c) => c.category === 'FDTL' && !c.passed);
      if (fdtlFail) {
        addToast({
          type: 'error',
          title: 'DGCA FDTL Limit Exceeded',
          message: fdtlFail.message,
          duration: 6000,
        });
        return false;
      }

      const prereqFail = validation.checks.find((c) => c.category === 'BATCH_PROGRESSION' && !c.passed);
      if (prereqFail) {
        addToast({
          type: 'error',
          title: 'Prerequisite Gatekeeper Violation',
          message: prereqFail.message,
          duration: 6000,
        });
        return false;
      }

      const lockoutFail = validation.checks.find((c) => c.category === 'RECURRENT' && !c.passed);
      if (lockoutFail) {
        addToast({
          type: 'error',
          title: 'Instructor Recurrent Lockout',
          message: lockoutFail.message,
          duration: 6000,
        });
        return false;
      }

      addToast({
        type: 'error',
        title: 'Booking Blocked by Compliance Validator',
        message: validation.summary,
        duration: 5000,
      });
      return false;
    }

    const batch = batches.find((b) => b.id === form.batchId)!;
    const syllabusItem = syllabus.find((s) => s.session_code === form.syllabusCode)!;
    const instructor = instructors.find((i) => i.id === form.instructorId)!;
    const resource = simulators.find((r) => r.id === form.resourceId)!;
    const selectedCadets = students.filter((s) => form.selectedStudentIds.includes(s.id));

    // Calculate end time with minute precision
    const [startHoursStr, startMinutesStr] = form.startTime.split(':');
    const startHour = parseInt(startHoursStr, 10) || 8;
    const startMin = parseInt(startMinutesStr || '0', 10) || 0;
    const dutyMinutes = Math.round(syllabusItem.total_duty_hours * 60);
    const totalMinutes = startHour * 60 + startMin + dutyMinutes;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMin = totalMinutes % 60;
    const endTimeStr = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

    const isGround = syllabusItem.phase === 'GROUND_TECH' || syllabusItem.phase === 'GROUND_PERF';
    const studentNamesWithRoles = isGround
      ? selectedCadets.map((c) => c.full_name)
      : selectedCadets.map((c, idx) => {
          if (idx === 0) return `${c.full_name} (PF)`;
          if (idx === 1) return `${c.full_name} (PM)`;
          return `${c.full_name} (Observer)`;
        });

    const newSession: TrainingScheduleSession = {
      id: `sch-${Date.now()}`,
      batch_id: batch.id,
      batch_code: batch.batch_code,
      session_code: syllabusItem.session_code,
      session_title: `${syllabusItem.session_code} - ${syllabusItem.session_title}`,
      phase: syllabusItem.phase,
      aircraft_type_id: batch.aircraft_type_id,
      aircraft_type_name: batch.aircraft_type_name,
      instructor_id: instructor.id,
      instructor_name: instructor.full_name,
      instructor_role: syllabusItem.required_instructor_role,
      resource_id: resource.id,
      resource_name: resource.resource_name,
      student_ids: selectedCadets.map((c) => c.id),
      student_names: studentNamesWithRoles,
      date: form.date,
      start_time: form.startTime,
      end_time: endTimeStr,
      briefing_hours: syllabusItem.duration_briefing_hours,
      sim_hours: syllabusItem.duration_instructional_hours,
      total_duty_hours: syllabusItem.total_duty_hours,
      status: 'CONFIRMED',
    };

    set({
      schedules: [newSession, ...schedules],
    });

    addToast({
      type: 'success',
      title: 'Session Scheduled & Confirmed (DGCA Legal)',
      message: `Successfully booked ${newSession.session_code} on ${resource.resource_name} with ${instructor.full_name} for ${batch.batch_code}.`,
      duration: 5000,
    });

    get().runValidation();
    return true;
  },

  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastAlert = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      get().removeToast(id);
    }, toast.duration || 5000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));
