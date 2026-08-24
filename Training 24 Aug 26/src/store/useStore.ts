import { create } from 'zustand';
import {
  Organisation,
  AircraftFleet,
  TrainingBatch,
  CadetStudent,
  InstructorProfile,
  SimulatorResource,
  CourseSyllabusItem,
  TrainingScheduleSession,
  FDTLDutyRecord,
  ValidationRuleCheck,
  InstructorFDTLCalculation,
} from '@/types';
import {
  ATO_ORGANISATION,
  ATO_FLEETS,
  ATO_BATCHES,
  ATO_STUDENTS,
  ATO_INSTRUCTORS,
  ATO_SIMULATORS,
  ATO_SYLLABUS,
  ATO_ACTIVE_SCHEDULES,
  ATO_HISTORICAL_DUTY_LOGS,
} from '@/lib/seed-data';
import { validateATOSchedulingMatrix, calculateInstructorDutyFDTL } from '@/lib/compliance';

export type ATOTab =
  | 'dashboard'    // All-in-One Executive Operations Cockpit
  | 'calendar'     // Master Calendar (Day / Week / Month / Year)
  | 'scheduler'    // Session Dispatcher & Validation Workbench
  | 'instructors'  // Instructor Legality & Recurrent Hub
  | 'pipeline'     // Cadet Training Progression & CBTA Matrix
  | 'fleets'       // Fleet Types & FSTD Simulators
  | 'schema';      // PostgreSQL & DGCA Triggers

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

interface ATOStore {
  activeTab: ATOTab;
  setActiveTab: (tab: ATOTab) => void;

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

  organisation: Organisation;
  fleets: AircraftFleet[];
  batches: TrainingBatch[];
  students: CadetStudent[];
  instructors: InstructorProfile[];
  simulators: SimulatorResource[];
  syllabus: CourseSyllabusItem[];
  schedules: TrainingScheduleSession[];
  dutyLogs: FDTLDutyRecord[];

  selectedInstructorId: string;
  setSelectedInstructorId: (id: string) => void;

  selectedBatchId: string;
  setSelectedBatchId: (id: string) => void;

  // Modals state
  isCreateBatchModalOpen: boolean;
  setIsCreateBatchModalOpen: (open: boolean) => void;
  isAddInstructorModalOpen: boolean;
  setIsAddInstructorModalOpen: (open: boolean) => void;
  isExportPrintModalOpen: boolean;
  setIsExportPrintModalOpen: (open: boolean) => void;

  // Dynamic CRUD
  addInstructor: (instructor: Omit<InstructorProfile, 'id' | 'avatar_initials' | 'is_locked_out'>) => void;
  updateInstructorStatus: (id: string, status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED') => void;
  addBatch: (
    batch: Omit<TrainingBatch, 'id' | 'students_count' | 'progress_percentage'>,
    cadets: { full_name: string; student_number: string; airline: string; medical_class1_expiry?: string; contact_email?: string }[]
  ) => void;
  addStudentToBatch: (
    batchId: string,
    student: { full_name: string; student_number: string; airline: string; medical_class1_expiry?: string; contact_email?: string }
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

  calendarView: 'day',
  setCalendarView: (view) => set({ calendarView: view }),
  selectedCalendarDate: '2026-08-25',
  setSelectedCalendarDate: (date) => set({ selectedCalendarDate: date }),
  selectedSessionModal: null,
  setSelectedSessionModal: (session) => set({ selectedSessionModal: session }),
  calendarFleetFilter: 'ALL',
  setCalendarFleetFilter: (fleetId) => set({ calendarFleetFilter: fleetId }),
  calendarResourceFilter: 'ALL',
  setCalendarResourceFilter: (resourceId) => set({ calendarResourceFilter: resourceId }),

  isCreateBatchModalOpen: false,
  setIsCreateBatchModalOpen: (open) => set({ isCreateBatchModalOpen: open }),
  isAddInstructorModalOpen: false,
  setIsAddInstructorModalOpen: (open) => set({ isAddInstructorModalOpen: open }),
  isExportPrintModalOpen: false,
  setIsExportPrintModalOpen: (open) => set({ isExportPrintModalOpen: open }),

  organisation: ATO_ORGANISATION,
  fleets: ATO_FLEETS,
  batches: ATO_BATCHES,
  students: ATO_STUDENTS,
  instructors: ATO_INSTRUCTORS,
  simulators: ATO_SIMULATORS,
  syllabus: ATO_SYLLABUS,
  schedules: ATO_ACTIVE_SCHEDULES,
  dutyLogs: ATO_HISTORICAL_DUTY_LOGS,

  selectedInstructorId: ATO_INSTRUCTORS[2].id, // Capt. Rahul Sharma (SFI)
  setSelectedInstructorId: (id) => set({ selectedInstructorId: id }),

  selectedBatchId: ATO_BATCHES[0].id, // Batch 26A (IndiGo A320)
  setSelectedBatchId: (id) => set({ selectedBatchId: id }),

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
      batch_id: batchId,
      batch_code: batchData.batch_code,
      airline: c.airline || batchData.airline_operator,
      medical_class1_expiry: c.medical_class1_expiry || '2027-08-31',
      contact_email: c.contact_email,
      ground_tech_completed: false,
      ground_perf_completed: false,
      sim_hours_completed: 0,
      skill_test_cleared: false,
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

  addStudentToBatch: (batchId, cadet) => {
    const batch = get().batches.find((b) => b.id === batchId);
    if (!batch) return;

    const newCadet: CadetStudent = {
      id: `stu-${Date.now()}`,
      student_number: cadet.student_number,
      full_name: cadet.full_name,
      batch_id: batchId,
      batch_code: batch.batch_code,
      airline: cadet.airline || batch.airline_operator,
      medical_class1_expiry: cadet.medical_class1_expiry || '2027-08-31',
      contact_email: cadet.contact_email,
      ground_tech_completed: false,
      ground_perf_completed: false,
      sim_hours_completed: 0,
      skill_test_cleared: false,
      status: 'IN_TRAINING',
    };

    set((state) => ({
      students: [...state.students, newCadet],
      batches: state.batches.map((b) =>
        b.id === batchId ? { ...b, students_count: b.students_count + 1 } : b
      ),
    }));

    get().addToast({
      type: 'success',
      title: 'Cadet Enrolled',
      message: `${newCadet.full_name} enrolled into batch ${batch.batch_code}.`,
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
    const selectedCadets = batchCadetIds.length > 0 ? batchCadetIds.slice(0, 2) : form.selectedStudentIds;

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
    date: '2026-08-25',
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
            date: '2026-08-25',
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
            date: '2026-08-25',
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
            date: '2026-08-25',
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
            date: '2026-08-25',
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
            date: '2026-08-24', // Today
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
            date: '2026-08-25',
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
            date: '2026-08-25',
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

    // Calculate end time
    const startHour = parseInt(form.startTime.split(':')[0]);
    const endHour = startHour + Math.ceil(syllabusItem.total_duty_hours);
    const endTimeStr = `${endHour.toString().padStart(2, '0')}:00`;

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
      student_names: selectedCadets.map((c) => c.full_name),
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
