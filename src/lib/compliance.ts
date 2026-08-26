import {
  InstructorProfile,
  InstructorFDTLCalculation,
  TrainingScheduleSession,
  FDTLDutyRecord,
  ValidationRuleCheck,
  CourseSyllabusItem,
  SimulatorResource,
  TrainingBatch,
  CadetStudent,
} from '@/types';

export const DGCA_ATO_LIMITS = {
  DAILY_MAX_DUTY_HOURS: 6.0,       // 6 hrs in 1 Day / 24 Hours
  WEEKLY_MAX_DUTY_HOURS: 30.0,     // 30 hrs in 7 Consecutive Days
  MAX_SIM_PER_SESSION: 4.0,        // 4 hrs max simulator instructional time
  BRIEFING_STANDARD_HOURS: 2.0,    // 2 hrs pre/post briefing
};

/**
 * Calculates rolling 24-hour and 7-day FDTL duty hours for an instructor
 * Incorporates:
 * - Logged past duty records (Briefing + Sim hours)
 * - Confirmed future schedule bookings
 * - The proposed new session
 */
export function calculateInstructorDutyFDTL(
  instructorId: string,
  instructorList: InstructorProfile[],
  sessionDateStr: string,
  proposedDutyHours: number = 0,
  schedules: TrainingScheduleSession[] = [],
  historicalLogs: FDTLDutyRecord[] = [],
  excludeSessionId?: string
): InstructorFDTLCalculation {
  const instructor = instructorList.find((i) => i.id === instructorId);
  const instructorName = instructor?.full_name || 'Instructor';

  // 1. Calculate Actual Historical Hours in 24h & 7d relative to session date
  const sessionDate = new Date(sessionDateStr);
  const sessionMs = sessionDate.getTime();
  const ms24h = 24 * 60 * 60 * 1000;
  const ms7d = 7 * 24 * 60 * 60 * 1000;

  let actual24h = 0;
  let actual24hBriefing = 0;
  let actual24hSim = 0;
  let actual7d = 0;

  for (const log of historicalLogs) {
    if (log.instructor_id !== instructorId) continue;
    const logDate = new Date(log.date);
    const logMs = logDate.getTime();

    // 24h window (same day or within 24h)
    if (Math.abs(sessionMs - logMs) < ms24h) {
      actual24h += log.total_duty_hours;
      actual24hBriefing += log.briefing_hours;
      actual24hSim += log.sim_hours;
    }

    // 7-day window
    if (logMs <= sessionMs && logMs >= sessionMs - ms7d) {
      actual7d += log.total_duty_hours;
    }
  }

  // 2. Add Scheduled Future Sessions
  let scheduled24h = 0;
  let scheduled7d = 0;

  for (const sch of schedules) {
    if (
      sch.instructor_id !== instructorId ||
      sch.status === 'CANCELLED' ||
      (excludeSessionId && sch.id === excludeSessionId)
    ) {
      continue;
    }

    const schDate = new Date(sch.date);
    const schMs = schDate.getTime();

    if (Math.abs(sessionMs - schMs) < ms24h) {
      scheduled24h += sch.total_duty_hours;
    }

    if (schMs <= sessionMs && schMs >= sessionMs - ms7d) {
      scheduled7d += sch.total_duty_hours;
    }
  }

  const total24h = parseFloat((actual24h + scheduled24h + proposedDutyHours).toFixed(1));
  const total7d = parseFloat((actual7d + scheduled7d + proposedDutyHours).toFixed(1));

  const remaining24h = parseFloat(Math.max(0, DGCA_ATO_LIMITS.DAILY_MAX_DUTY_HOURS - total24h).toFixed(1));
  const remaining7d = parseFloat(Math.max(0, DGCA_ATO_LIMITS.WEEKLY_MAX_DUTY_HOURS - total7d).toFixed(1));

  const pct24h = Math.min(100, Math.round((total24h / DGCA_ATO_LIMITS.DAILY_MAX_DUTY_HOURS) * 100));
  const pct7d = Math.min(100, Math.round((total7d / DGCA_ATO_LIMITS.WEEKLY_MAX_DUTY_HOURS) * 100));

  const isLegal =
    total24h <= DGCA_ATO_LIMITS.DAILY_MAX_DUTY_HOURS &&
    total7d <= DGCA_ATO_LIMITS.WEEKLY_MAX_DUTY_HOURS;

  return {
    instructor_id: instructorId,
    instructor_name: instructorName,
    hours_24h_sim: actual24hSim,
    hours_24h_briefing: actual24hBriefing,
    hours_24h_total: total24h,
    max_24h_limit: DGCA_ATO_LIMITS.DAILY_MAX_DUTY_HOURS,
    remaining_24h: remaining24h,
    percentage_24h: pct24h,

    hours_7d_total: total7d,
    max_7d_limit: DGCA_ATO_LIMITS.WEEKLY_MAX_DUTY_HOURS,
    remaining_7d: remaining7d,
    percentage_7d: pct7d,

    is_fdtl_legal: isLegal,
  };
}

/**
 * Validates complete ATO Operational Rules:
 * 1. Batch Progression & Gatekeeper Checks (Ground School before Sim; Sim hours before Skill Test)
 * 2. Instructor Role & Approval Legality (Tech GI for Systems, Perf GI for Performance, SFI for Sims, SFE for CA-40)
 * 3. Instructor Recurrent TRS 1-Year Validity & Refresher Lockout
 * 4. DGCA FDTL Limits (6h in 1 Day / 24h & 30h in 7 Days)
 * 5. Simulator Hardware & Regulatory Approval Compatibility
 * 6. GiST Schedule Overlap / Double Booking Check
 */
export function validateATOSchedulingMatrix(params: {
  batch: TrainingBatch;
  syllabusItem: CourseSyllabusItem;
  instructor: InstructorProfile;
  resource: SimulatorResource;
  students: CadetStudent[];
  date: string;
  startTime: string;
  allInstructors: InstructorProfile[];
  allSchedules: TrainingScheduleSession[];
  allDutyLogs: FDTLDutyRecord[];
}): {
  isValid: boolean;
  summary: string;
  fdtl: InstructorFDTLCalculation;
  checks: ValidationRuleCheck[];
} {
  const { batch, syllabusItem, instructor, resource, students, date, allInstructors, allSchedules, allDutyLogs } = params;
  const checks: ValidationRuleCheck[] = [];
  let isValid = true;

  // 1. INSTRUCTOR ROLE & APPROVAL MATCH
  const hasRole = instructor.roles.includes(syllabusItem.required_instructor_role);
  // Check if instructor has granular qualification matching fleet & role
  const matchingQual = instructor.qualifications?.find((q) => {
    const roleMatches = q.role === syllabusItem.required_instructor_role;
    const fleetMatches = q.fleet_code === 'ALL_FLEETS' || batch.aircraft_type_name.includes(q.fleet_code);
    return roleMatches && fleetMatches;
  });

  if (!hasRole && !matchingQual) {
    isValid = false;
    checks.push({
      id: 'chk-role-match',
      category: 'INSTRUCTOR',
      rule_title: '1. Instructor Qualification Category Match',
      passed: false,
      message: `Role Lacking: ${syllabusItem.session_code} requires ${syllabusItem.required_instructor_role}. ${instructor.full_name} holds [${instructor.roles.join(', ')}].`,
    });
  } else {
    checks.push({
      id: 'chk-role-match',
      category: 'INSTRUCTOR',
      rule_title: '1. Instructor Qualification Category Match',
      passed: true,
      message: `Verified: ${instructor.full_name} holds required ${syllabusItem.required_instructor_role} authorization (${matchingQual ? matchingQual.approval_number : instructor.dgca_approval_number}).`,
    });
  }

  // 2. FLEET APPROVAL ENDORSEMENT
  const fleetMatches = instructor.assigned_fleets.some((f) => batch.aircraft_type_name.includes(f)) ||
    Boolean(matchingQual);

  if (!fleetMatches) {
    isValid = false;
    checks.push({
      id: 'chk-fleet-approval',
      category: 'INSTRUCTOR',
      rule_title: '2. Fleet Type Rating Endorsement',
      passed: false,
      message: `Fleet Incompatible: Instructor is not endorsed on ${batch.aircraft_type_name} (Holds: ${instructor.assigned_fleets.join(', ')}).`,
    });
  } else {
    checks.push({
      id: 'chk-fleet-approval',
      category: 'INSTRUCTOR',
      rule_title: '2. Fleet Type Rating Endorsement',
      passed: true,
      message: `Endorsement Valid: Instructor rated on ${batch.aircraft_type_name}${matchingQual ? ` (${matchingQual.approval_type}, Valid: ${matchingQual.approval_expiry_date})` : ''}.`,
    });
  }

  // 3. RECURRENT TRS 1-YEAR VALIDITY & REFRESHER LOCKOUT
  const isQualLocked = matchingQual && (matchingQual.status === 'REFRESHER_REQUIRED' || matchingQual.status === 'EXPIRED');
  if (instructor.is_locked_out || instructor.recurrent_status === 'REFRESHER_REQUIRED' || isQualLocked) {
    isValid = false;
    checks.push({
      id: 'chk-recurrent-lockout',
      category: 'RECURRENT',
      rule_title: '3. Recurrent TRS Validity & Refresher Lockout',
      passed: false,
      message: `OPERATIONAL LOCKOUT: 1-Year Recurrent check deadline passed on ${matchingQual?.recurrent_expiry || instructor.recurrent_expiry}. Refresher course mandatory before reinstatement.`,
    });
  } else if (instructor.recurrent_status === 'EXPIRING' || matchingQual?.status === 'EXPIRING') {
    checks.push({
      id: 'chk-recurrent-lockout',
      category: 'RECURRENT',
      rule_title: '3. Recurrent TRS Validity & Refresher Lockout',
      passed: true,
      message: `Inside 3-Month Recurrent Window (${matchingQual?.recurrent_window_start || instructor.recurrent_window_start} – ${matchingQual?.recurrent_expiry || instructor.recurrent_expiry}). Base month preserved (${matchingQual?.base_month || instructor.base_month}).`,
    });
  } else {
    checks.push({
      id: 'chk-recurrent-lockout',
      category: 'RECURRENT',
      rule_title: '3. Recurrent TRS Validity & Refresher Lockout',
      passed: true,
      message: `TRS 1-Year Recurrent Current: Base month ${matchingQual?.base_month || instructor.base_month} valid until ${matchingQual?.recurrent_expiry || instructor.recurrent_expiry}.`,
    });
  }

  // 4. BATCH PROGRESSION & GATEKEEPER RULES (Ground School & Missed Classes)
  const missedClassStudents = students.filter((s) => s.has_missed_sessions || s.go_no_go_status === 'NO_GO_BLOCKED');
  if (missedClassStudents.length > 0 && (syllabusItem.phase === 'SIM_FFS' || syllabusItem.phase === 'SIM_FTD' || syllabusItem.phase === 'SKILL_TEST')) {
    isValid = false;
    checks.push({
      id: 'chk-gatekeeper-missed',
      category: 'PREREQUISITE',
      rule_title: '4A. Cadet Attendance & Missed Session Gatekeeper',
      passed: false,
      message: `PREREQUISITE VIOLATION: ${missedClassStudents.map((s) => `${s.full_name} (${s.blocker_reason || 'Missed required class module'})`).join('; ')}. Makeup session mandatory before proceeding to simulator!`,
    });
  }

  if (syllabusItem.phase === 'SIM_FFS' || syllabusItem.phase === 'SIM_FTD') {
    const uncompletedGroundStudents = students.filter((s) => !s.ground_tech_completed || !s.ground_perf_completed);
    if (uncompletedGroundStudents.length > 0) {
      isValid = false;
      checks.push({
        id: 'chk-gatekeeper-ground',
        category: 'BATCH_PROGRESSION',
        rule_title: '4B. Batch Progression: Ground School Gatekeeper',
        passed: false,
        message: `Prerequisite Violation: Cannot book Simulators. ${uncompletedGroundStudents.map((s) => s.full_name).join(', ')} have not completed Technical & Performance Ground School!`,
      });
    } else {
      checks.push({
        id: 'chk-gatekeeper-ground',
        category: 'BATCH_PROGRESSION',
        rule_title: '4B. Batch Progression: Ground School Gatekeeper',
        passed: true,
        message: 'Ground School Gate Passed: All assigned cadets cleared Technical & Performance phases.',
      });
    }
  } else if (syllabusItem.phase === 'SKILL_TEST') {
    const unreadyCadets = students.filter((s) => (s.sim_ffs_hours_completed ?? s.sim_hours_completed ?? 0) < 16.0);
    if (unreadyCadets.length > 0) {
      isValid = false;
      checks.push({
        id: 'chk-gatekeeper-skill',
        category: 'BATCH_PROGRESSION',
        rule_title: '4. Batch Progression: Skill Test Gatekeeper',
        passed: false,
        message: `Prerequisite Violation: Cadets must complete full 16h FFS syllabus before CA-40 Skill Test.`,
      });
    } else {
      checks.push({
        id: 'chk-gatekeeper-skill',
        category: 'BATCH_PROGRESSION',
        rule_title: '4. Batch Progression: Skill Test Gatekeeper',
        passed: true,
        message: 'Skill Test Gate Passed: Cadets completed required FFS flight syllabus.',
      });
    }
  } else {
    checks.push({
      id: 'chk-gatekeeper-ground',
      category: 'BATCH_PROGRESSION',
      rule_title: '4. Batch Progression: Ground School Gatekeeper',
      passed: true,
      message: 'Ground Class Phase In Progress.',
    });
  }

  // 5. DGCA CAR FDTL DUTY LIMITS (1-Day 6h / 7-Days 30h)
  const fdtl = calculateInstructorDutyFDTL(
    instructor.id,
    allInstructors,
    date,
    syllabusItem.total_duty_hours,
    allSchedules,
    allDutyLogs
  );

  if (fdtl.hours_24h_total > DGCA_ATO_LIMITS.DAILY_MAX_DUTY_HOURS) {
    isValid = false;
    checks.push({
      id: 'chk-fdtl-daily',
      category: 'FDTL',
      rule_title: '5. DGCA FDTL 1-Day Duty Limit (6.0 hrs Max)',
      passed: false,
      message: `FDTL HARD VIOLATION: Scheduling ${syllabusItem.total_duty_hours}h pushes 24-hour total to ${fdtl.hours_24h_total}h (DGCA Limit: 6.0h Max).`,
    });
  } else {
    checks.push({
      id: 'chk-fdtl-daily',
      category: 'FDTL',
      rule_title: '5. DGCA FDTL 1-Day Duty Limit (6.0 hrs Max)',
      passed: true,
      message: `FDTL 1-Day OK: Total ${fdtl.hours_24h_total}h / 6.0h permitted (${fdtl.remaining_24h}h remaining).`,
    });
  }

  if (fdtl.hours_7d_total > DGCA_ATO_LIMITS.WEEKLY_MAX_DUTY_HOURS) {
    isValid = false;
    checks.push({
      id: 'chk-fdtl-weekly',
      category: 'FDTL',
      rule_title: '6. DGCA FDTL 7-Day Cumulative Limit (30.0 hrs Max)',
      passed: false,
      message: `FDTL HARD VIOLATION: Scheduling pushes 7-consecutive-day total to ${fdtl.hours_7d_total}h (DGCA Limit: 30.0h Max).`,
    });
  } else {
    checks.push({
      id: 'chk-fdtl-weekly',
      category: 'FDTL',
      rule_title: '6. DGCA FDTL 7-Day Cumulative Limit (30.0h Max)',
      passed: true,
      message: `FDTL 7-Day OK: Total ${fdtl.hours_7d_total}h / 30.0h permitted (${fdtl.remaining_7d}h remaining).`,
    });
  }

  // 6. SIMULATOR RESOURCE COMPATIBILITY
  if (syllabusItem.required_resource_category === 'FFS' || syllabusItem.required_resource_category === 'FTD') {
    const isCompat = resource.supported_aircraft_ids.includes(batch.aircraft_type_id);
    if (!isCompat) {
      isValid = false;
      checks.push({
        id: 'chk-sim-compat',
        category: 'RESOURCE',
        rule_title: '7. Training Resource Hardware Compatibility',
        passed: false,
        message: `Device Incompatible: ${resource.resource_name} does not support ${batch.aircraft_type_name}.`,
      });
    } else {
      checks.push({
        id: 'chk-sim-compat',
        category: 'RESOURCE',
        rule_title: '7. Training Resource Hardware Compatibility',
        passed: true,
        message: `Simulator Match: ${resource.resource_name} (${resource.level}) approved for ${batch.aircraft_type_name}.`,
      });
    }
  } else {
    checks.push({
      id: 'chk-sim-compat',
      category: 'RESOURCE',
      rule_title: '7. Training Resource Hardware Compatibility',
      passed: true,
      message: `Classroom Facility Verified: ${resource.resource_name}.`,
    });
  }

  // 7. GIST EXCLUSION OVERLAP / DOUBLE BOOKING
  const conflict = allSchedules.some(
    (s) =>
      s.date === date &&
      s.status === 'CONFIRMED' &&
      (s.instructor_id === instructor.id || s.resource_id === resource.id)
  );

  if (conflict) {
    isValid = false;
    checks.push({
      id: 'chk-double-booking',
      category: 'RESOURCE',
      rule_title: '8. GiST Schedule Collision Detection',
      passed: false,
      message: `Double Booking Detected: Instructor ${instructor.full_name} or Resource ${resource.resource_name} has another confirmed session on ${date}.`,
    });
  } else {
    checks.push({
      id: 'chk-double-booking',
      category: 'RESOURCE',
      rule_title: '8. GiST Schedule Collision Detection',
      passed: true,
      message: 'Time slot clear on both instructor roster and resource timeline.',
    });
  }

  const failedChecks = checks.filter((c) => !c.passed);
  const failureSummary = failedChecks.length > 0
    ? failedChecks.map((c) => c.message).join(' • ')
    : 'Session violates DGCA compliance or prerequisite requirements.';

  return {
    isValid,
    summary: isValid
      ? 'All DGCA CAR and ATO Training Matrix rules satisfied. Session legal to schedule.'
      : failureSummary,
    fdtl,
    checks,
  };
}

