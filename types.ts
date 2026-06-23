export enum UserRole {
  ADMIN = 'ADMIN',
  ENGINEER = 'ENGINEER',
  INSTRUCTOR = 'INSTRUCTOR',
  OPERATIONS = 'OPERATIONS',
  STUDENT = 'STUDENT',
  QUALITY_MANAGER = 'QUALITY_MANAGER'
}

export enum SimulatorStatus {
  SERVICEABLE = 'SERVICEABLE',
  UNSERVICEABLE = 'UNSERVICEABLE',
  MAINTENANCE = 'MAINTENANCE',
  AOG = 'AOG'
}

export enum SessionStatus {
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED', // Customer In
  COMPLETED = 'COMPLETED', // Customer Out
  CANCELLED = 'CANCELLED'
}

export enum Severity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  NONE = 'NONE'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum DocumentType {
  LICENSE = 'LICENSE',
  MEDICAL = 'MEDICAL',
  PASSPORT = 'PASSPORT',
  VISA = 'VISA',
  COMPANY_AUTH = 'COMPANY_AUTH',
  ELP = 'ELP'
}

export enum BatchStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Snag {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  reportedAt: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
}

export interface Simulator {
  id: string;
  facility: string; // Sector Alpha, Sector Beta, etc.
  name: string; // FSTD Name (e.g. FFS-B737-MAX-01)
  model: string; // Aircraft Type
  serialNumber: string;
  engineType: string;
  status: SimulatorStatus;
  totalHours: number;
  metrics: {
    reliability: number;
  }
}

export interface TrainingSession {
  id: string;
  bookingId: string;
  logSerialNo: string;
  simulatorId: string;
  customer: string;
  trainingType: string; // e.g. FSTD, DRY TRG
  sessionType: 'Standard' | 'Demo' | 'Billable' | 'Split';
  scheduledFrom: string;
  scheduledTo: string;
  releasedFrom?: string;
  releasedTo?: string;
  actualStart?: string;
  actualFinish?: string;
  status: SessionStatus;
  instructor: string;
  crew: {
    reporting: 'Present' | 'Absent';
    members: string[]; // [CREW1, CREW2, CREW3, OBSERVER]
  };
  metrics: {
    breakTime: number;
    utilizedTime: number;
    downTime: number;
  };
  effectiveness: string; // 1-5 Scale
  snags: Snag[];
  signatures: {
    engineer?: string;
    customerIn?: string;
    customerOut?: string;
  };
  engineerName: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  facility: string;
}

// --- NEW TYPES FOR ATMS v2.0 ---

export interface StudentDocument {
  id: string;
  type: DocumentType;
  name: string;
  expiryDate: string;
  status: VerificationStatus;
  fileUrl?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface Student {
  id: string;
  employeeNo: string;
  name: string;
  dob: string;
  nationality: string;
  email: string;
  company: string;
  aircraftType: string;
  batchId: string;
  status: 'ACTIVE' | 'HOLD' | 'GRADUATED';
  documents: StudentDocument[];
  competencies: Record<string, number>; // key: competency dimension name, value: score (1-5)
}

export interface Batch {
  id: string;
  code: string;
  courseId: string;
  customerId: string;
  aircraftType: string;
  startDate: string;
  endDate: string;
  plannedStrength: number;
  actualStrength: number;
  status: BatchStatus;
  studentIds: string[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  aircraftType: string;
  durationHours: number;
  validityMonths: number;
  stages: string[]; // e.g. ["Ground School", "MFTD", "FFS", "LOFT", "Assessment"]
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  location: string;
  equipment: string[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  durationHours: number;
  aircraftType: string;
  deliveryMode: 'Classroom' | 'E-Learning' | 'Simulator' | 'Briefing';
}

export interface RateCard {
  id: string;
  customerId: string;
  ratePerSimHour: number;
  ratePerClassroomHour: number;
  ratePerCourseFlat: number;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  hours: number;
  rate: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: 'DRAFT' | 'FINALIZED' | 'PAID' | 'DISPUTED';
  items: InvoiceLineItem[];
  disputeNotes?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
  hash: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  answerIndex: number;
  subjectId: string;
  difficulty: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  date: string;
  score: number;
  passMark: number;
  passed: boolean;
}

export interface LmsContent {
  id: string;
  title: string;
  type: 'VIDEO' | 'SLIDES' | 'QUIZ';
  durationMinutes: number;
  completed: boolean;
  score?: number;
}