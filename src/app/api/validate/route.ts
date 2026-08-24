import { NextRequest, NextResponse } from 'next/server';
import { validateATOSchedulingMatrix } from '@/lib/compliance';
import {
  ATO_INSTRUCTORS,
  ATO_BATCHES,
  ATO_SYLLABUS,
  ATO_SIMULATORS,
  ATO_STUDENTS,
  ATO_ACTIVE_SCHEDULES,
  ATO_HISTORICAL_DUTY_LOGS,
} from '@/lib/seed-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { batch_id, session_code, instructor_id, resource_id, student_ids, date, start_time } = body;

    const batch = ATO_BATCHES.find((b) => b.id === batch_id);
    const syllabusItem = ATO_SYLLABUS.find((s) => s.session_code === session_code);
    const instructor = ATO_INSTRUCTORS.find((i) => i.id === instructor_id);
    const resource = ATO_SIMULATORS.find((r) => r.id === resource_id);
    const students = ATO_STUDENTS.filter((s) => student_ids?.includes(s.id));

    if (!batch || !syllabusItem || !instructor || !resource) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters provided for validation' },
        { status: 400 }
      );
    }

    const validation = validateATOSchedulingMatrix({
      batch,
      syllabusItem,
      instructor,
      resource,
      students,
      date,
      startTime: start_time,
      allInstructors: ATO_INSTRUCTORS,
      allSchedules: ATO_ACTIVE_SCHEDULES,
      allDutyLogs: ATO_HISTORICAL_DUTY_LOGS,
    });

    return NextResponse.json({
      success: true,
      validation,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
