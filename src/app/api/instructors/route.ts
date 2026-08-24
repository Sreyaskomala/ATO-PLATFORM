import { NextRequest, NextResponse } from 'next/server';
import { calculateInstructorDutyFDTL } from '@/lib/compliance';
import {
  ATO_INSTRUCTORS,
  ATO_ACTIVE_SCHEDULES,
  ATO_HISTORICAL_DUTY_LOGS,
} from '@/lib/seed-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const instructorId = searchParams.get('id');

  if (instructorId) {
    const instructor = ATO_INSTRUCTORS.find((i) => i.id === instructorId);
    if (!instructor) {
      return NextResponse.json({ success: false, error: 'Instructor not found' }, { status: 404 });
    }

    const fdtl = calculateInstructorDutyFDTL(
      instructorId,
      ATO_INSTRUCTORS,
      '2026-08-24',
      0,
      ATO_ACTIVE_SCHEDULES,
      ATO_HISTORICAL_DUTY_LOGS
    );

    const sessions = ATO_ACTIVE_SCHEDULES.filter((s) => s.instructor_id === instructorId);

    return NextResponse.json({
      success: true,
      instructor,
      fdtl,
      sessions,
    });
  }

  // Return all instructors with duty summaries
  const result = ATO_INSTRUCTORS.map((ins) => {
    const fdtl = calculateInstructorDutyFDTL(
      ins.id,
      ATO_INSTRUCTORS,
      '2026-08-24',
      0,
      ATO_ACTIVE_SCHEDULES,
      ATO_HISTORICAL_DUTY_LOGS
    );
    return {
      ...ins,
      fdtl_summary: fdtl,
    };
  });

  return NextResponse.json({
    success: true,
    instructors: result,
  });
}
