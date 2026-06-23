import { 
  SimulatorStatus, SessionStatus, Severity, Course, Subject, 
  Classroom, Student, Batch, VerificationStatus, DocumentType, 
  RateCard, Invoice, Question, AuditLogEntry, LmsContent, UserRole, BatchStatus
} from './types';

export const STATUS_COLORS = {
  [SimulatorStatus.SERVICEABLE]: 'bg-emerald-500',
  [SimulatorStatus.AOG]: 'bg-rose-500',
  [SimulatorStatus.MAINTENANCE]: 'bg-amber-500',
  [SimulatorStatus.UNSERVICEABLE]: 'bg-sky-500',
};

export const SESSION_STATUS_LABELS = {
  [SessionStatus.OFFERED]: 'Offered',
  [SessionStatus.ACCEPTED]: 'In Progress',
  [SessionStatus.COMPLETED]: 'Completed',
  [SessionStatus.CANCELLED]: 'Cancelled',
};

export const TRAINING_TYPES = [
  'Line Training',
  'Type Rating',
  'Recurrent',
  'Check',
  'LVO',
  'ETOPS'
];

export const SEVERITY_LEVELS = [
  Severity.CRITICAL,
  Severity.HIGH,
  Severity.MEDIUM,
  Severity.LOW,
  Severity.NONE
];

export const MOCK_COURSES: Course[] = [
  { id: 'course-1', code: 'A320-TR', name: 'A320 Initial Type Rating', aircraftType: 'A320-NEO', durationHours: 120, validityMonths: 12, stages: ['Ground School', 'MFTD', 'FFS', 'LOFT', 'Assessment'] },
  { id: 'course-2', code: 'B737-TR', name: 'B737 MAX Type Rating', aircraftType: 'B737-MAX', durationHours: 140, validityMonths: 12, stages: ['Ground School', 'FTD', 'FFS', 'LOFT', 'Assessment'] },
  { id: 'course-3', code: 'A320-REC', name: 'A320 Recurrent & LPC/OPC', aircraftType: 'A320-NEO', durationHours: 16, validityMonths: 6, stages: ['Ground School Refresh', 'FFS Session', 'LPC Check'] }
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: 'subj-1', code: 'AERO-320', name: 'A320 Aerodynamics & Systems', durationHours: 20, aircraftType: 'A320-NEO', deliveryMode: 'Classroom' },
  { id: 'subj-2', code: 'CRM-01', name: 'Crew Resource Management (CRM) Core', durationHours: 8, aircraftType: 'A320-NEO', deliveryMode: 'Classroom' },
  { id: 'subj-3', code: 'SIM-P1', name: 'Pre-flight Briefing & Sim Setup', durationHours: 4, aircraftType: 'A320-NEO', deliveryMode: 'Briefing' },
  { id: 'subj-4', code: 'FFS-TRG', name: 'Full Flight Simulator Maneuvers', durationHours: 40, aircraftType: 'A320-NEO', deliveryMode: 'Simulator' },
  { id: 'subj-5', code: 'E-PERF', name: 'A320 E-Learning Performance Limits', durationHours: 12, aircraftType: 'A320-NEO', deliveryMode: 'E-Learning' }
];

export const MOCK_CLASSROOMS: Classroom[] = [
  { id: 'class-1', name: 'Room 301 (A320 Systems)', capacity: 25, location: 'Sector Alpha Facility - Block A', equipment: ['Projector', 'Desktop Trainers', 'MFTD Panel Mockup'] },
  { id: 'class-2', name: 'Room 102 (CRM & Briefing)', capacity: 12, location: 'Sector Alpha Facility - Block B', equipment: ['Whiteboard', 'Smart TV'] },
  { id: 'class-3', name: 'Room B-201', capacity: 20, location: 'Sector Beta Facility', equipment: ['Projector', 'A320 FMGS Trainer'] }
];

export const MOCK_STUDENTS: Student[] = [
  { 
    id: 'stud-1', employeeNo: 'GL-20421', name: 'Capt. Priya Nair', dob: '1992-04-12', nationality: 'Indian', email: 'priya.nair@globalairways.com', company: 'Global Airways', aircraftType: 'A320-NEO', batchId: 'batch-1', status: 'HOLD',
    documents: [
      { id: 'doc-1-1', type: DocumentType.LICENSE, name: 'ATPL #DGCA-3240A', expiryDate: '2027-12-31', status: VerificationStatus.VERIFIED, verifiedAt: '2026-01-10', verifiedBy: 'System Auditor' },
      { id: 'doc-1-2', type: DocumentType.MEDICAL, name: 'DGCA Class 1 Medical', expiryDate: '2026-06-15', status: VerificationStatus.VERIFIED, verifiedAt: '2026-01-10', verifiedBy: 'System Auditor' } // Expired relative to current time 2026-06-21 -> triggers HOLD!
    ],
    competencies: { 'Knowledge': 4, 'CRM': 5, 'Flight Path Mgt': 3, 'Problem Solving': 4 }
  },
  { 
    id: 'stud-2', employeeNo: 'GL-20422', name: 'Rajesh Kumar', dob: '1995-09-22', nationality: 'Indian', email: 'rajesh.kumar@globalairways.com', company: 'Global Airways', aircraftType: 'A320-NEO', batchId: 'batch-1', status: 'ACTIVE',
    documents: [
      { id: 'doc-2-1', type: DocumentType.LICENSE, name: 'CPL #DGCA-8971B', expiryDate: '2028-04-15', status: VerificationStatus.VERIFIED, verifiedAt: '2026-02-14', verifiedBy: 'System Auditor' },
      { id: 'doc-2-2', type: DocumentType.MEDICAL, name: 'DGCA Class 1 Medical', expiryDate: '2026-09-30', status: VerificationStatus.VERIFIED, verifiedAt: '2026-02-14', verifiedBy: 'System Auditor' }
    ],
    competencies: { 'Knowledge': 4, 'CRM': 4, 'Flight Path Mgt': 4, 'Problem Solving': 4 }
  },
  { 
    id: 'stud-3', employeeNo: 'OC-8812', name: 'Sneha Rao', dob: '1993-11-05', nationality: 'Indian', email: 'sneha.rao@oceanicairlines.com', company: 'Oceanic Airlines', aircraftType: 'B737-MAX', batchId: 'batch-2', status: 'ACTIVE',
    documents: [
      { id: 'doc-3-1', type: DocumentType.LICENSE, name: 'ATPL #DGCA-7110A', expiryDate: '2029-01-10', status: VerificationStatus.PENDING },
      { id: 'doc-3-2', type: DocumentType.MEDICAL, name: 'DGCA Class 1 Medical', expiryDate: '2026-10-15', status: VerificationStatus.VERIFIED, verifiedAt: '2026-03-01', verifiedBy: 'Quality Desk' }
    ],
    competencies: { 'Knowledge': 3, 'CRM': 4, 'Flight Path Mgt': 3, 'Problem Solving': 3 }
  },
  { 
    id: 'stud-4', employeeNo: 'GL-4201', name: 'Amit Singh', dob: '1989-01-18', nationality: 'Indian', email: 'amit.singh@globalairways.com', company: 'Global Airways', aircraftType: 'A320-NEO', batchId: 'batch-3', status: 'GRADUATED',
    documents: [
      { id: 'doc-4-1', type: DocumentType.LICENSE, name: 'ATPL #DGCA-1290C', expiryDate: '2026-11-30', status: VerificationStatus.VERIFIED, verifiedAt: '2025-05-12', verifiedBy: 'Admin' },
      { id: 'doc-4-2', type: DocumentType.MEDICAL, name: 'DGCA Class 1 Medical', expiryDate: '2026-07-22', status: VerificationStatus.VERIFIED, verifiedAt: '2025-05-12', verifiedBy: 'Admin' }
    ],
    competencies: { 'Knowledge': 5, 'CRM': 5, 'Flight Path Mgt': 5, 'Problem Solving': 5 }
  }
];

export const MOCK_BATCHES: Batch[] = [
  { id: 'batch-1', code: 'A320-TR-2026-014', courseId: 'course-1', customerId: 'cust-1', aircraftType: 'A320-NEO', startDate: '2026-05-01', endDate: '2026-07-15', plannedStrength: 10, actualStrength: 2, status: BatchStatus.ACTIVE, studentIds: ['stud-1', 'stud-2'] },
  { id: 'batch-2', code: 'B737-TR-2026-002', courseId: 'course-2', customerId: 'cust-2', aircraftType: 'B737-MAX', startDate: '2026-07-01', endDate: '2026-09-15', plannedStrength: 8, actualStrength: 1, status: BatchStatus.PLANNED, studentIds: ['stud-3'] },
  { id: 'batch-3', code: 'REC-A320-2026-09', courseId: 'course-3', customerId: 'cust-1', aircraftType: 'A320-NEO', startDate: '2026-01-10', endDate: '2026-01-25', plannedStrength: 5, actualStrength: 1, status: BatchStatus.COMPLETED, studentIds: ['stud-4'] }
];

export const MOCK_RATE_CARDS: RateCard[] = [
  { id: 'rc-1', customerId: 'Global Airways', ratePerSimHour: 450, ratePerClassroomHour: 100, ratePerCourseFlat: 8500 },
  { id: 'rc-2', customerId: 'Oceanic Airlines', ratePerSimHour: 480, ratePerClassroomHour: 110, ratePerCourseFlat: 9000 },
  { id: 'rc-3', customerId: 'AeroJet', ratePerSimHour: 460, ratePerClassroomHour: 100, ratePerCourseFlat: 8800 }
];

export const MOCK_QUESTIONS: Question[] = [
  { id: 'q-1', text: 'What is the maximum operating altitude of the Airbus A320neo?', options: ['39,000 ft', '41,000 ft', '43,000 ft', '37,000 ft'], answerIndex: 1, subjectId: 'subj-1', difficulty: 'LOW' },
  { id: 'q-2', text: 'Which engine option is NOT available on the A320neo family?', options: ['Pratt & Whitney PW1100G-JM', 'CFM International LEAP-1A', 'IAE V2500-A5', 'All of the above are available'], answerIndex: 2, subjectId: 'subj-1', difficulty: 'MEDIUM' },
  { id: 'q-3', text: 'In CRM, what does the abbreviation "SOP" stand for?', options: ['Standard Operational Principle', 'Standard Operating Procedure', 'System Optimization Plan', 'Single Operator Protocol'], answerIndex: 1, subjectId: 'subj-2', difficulty: 'LOW' },
  { id: 'q-4', text: 'What is the primary action in case of an Engine dual failure on takeoff?', options: ['Apply maximum braking', 'Set glide speed and check ignition', 'Deploy Ram Air Turbine (RAT) and initiate APU start', 'Declare emergency and attempt immediate turn back'], answerIndex: 2, subjectId: 'subj-4', difficulty: 'HIGH' }
];

export const MOCK_INVOICES: Invoice[] = [
  { 
    id: 'inv-1', customerId: 'cust-1', customerName: 'Global Airways', invoiceNumber: 'INV-2026-042', date: '2026-06-01', amount: 5600, status: 'PAID',
    items: [
      { id: 'li-1', description: 'FSTD Simulator Rental (B737-MAX) - 10 hours', hours: 10, rate: 450, total: 4500 },
      { id: 'li-2', description: 'Ground Classroom Instruction - 11 hours', hours: 11, rate: 100, total: 1100 }
    ]
  },
  { 
    id: 'inv-2', customerId: 'cust-1', customerName: 'Global Airways', invoiceNumber: 'INV-2026-077', date: '2026-06-20', amount: 2800, status: 'DRAFT',
    items: [
      { id: 'li-3', description: 'FSTD Simulator Rental (A320-NEO) - 4 hours', hours: 4, rate: 450, total: 1800 },
      { id: 'li-4', description: 'Instructor Dry Support - 10 hours', hours: 10, rate: 100, total: 1000 }
    ]
  }
];

export const MOCK_LMS_CONTENTS: LmsContent[] = [
  { id: 'lms-1', title: 'A320 Hydraulic System Architecture', type: 'VIDEO', durationMinutes: 25, completed: true },
  { id: 'lms-2', title: 'A320 Flight Deck Layout & Controls', type: 'SLIDES', durationMinutes: 45, completed: true },
  { id: 'lms-3', title: 'Emergency Descent Procedures', type: 'VIDEO', durationMinutes: 15, completed: false },
  { id: 'lms-4', title: 'Hydraulics & Flight Controls Quiz', type: 'QUIZ', durationMinutes: 20, completed: false, score: 0 }
];

export const MOCK_AUDIT_TRAIL: AuditLogEntry[] = [
  { id: 'log-1', timestamp: '2026-06-21 10:30:15', userId: 'e1', userName: 'Alex Mercer', role: UserRole.ENGINEER, action: 'SIM_RELEASE', details: 'Released FFS-B737-MAX-01 (sim-1) under Log Sheet LOG-7124', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
  { id: 'log-2', timestamp: '2026-06-21 11:15:42', userId: 'c1', userName: 'Global Airways Rep', role: UserRole.INSTRUCTOR, action: 'SESSION_ACCEPT', details: 'Accepted simulator handover for booking BK-9941A', hash: '8f4384aa8e063a8a3a0c4f69748aa21e428c9a3b047a06a28795da28b7a05da2' },
  { id: 'log-3', timestamp: '2026-06-21 14:02:10', userId: 'adm-0', userName: 'System Admin', role: UserRole.ADMIN, action: 'USER_ROLE_UPDATE', details: 'Updated Rajesh Kumar to Active Student status', hash: '50e181ee42a8a70c32b5028aa07fa8da01e285a8b71d98fa6a8397ea28b49ff0' }
];