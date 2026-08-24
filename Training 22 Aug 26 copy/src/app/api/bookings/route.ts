import { NextRequest, NextResponse } from 'next/server';
import { validateATOSchedulingMatrix, calculateInstructorDutyFDTL } from '@/lib/compliance';
import {
  ATO_INSTRUCTORS,
  ATO_BATCHES,
  ATO_SYLLABUS,
  ATO_SIMULATORS,
  ATO_STUDENTS,
  ATO_ACTIVE_SCHEDULES,
  ATO_HISTORICAL_DUTY_LOGS,
} from '@/lib/seed-data';
import { TrainingScheduleSession } from '@/types';

let activeSchedules = [...ATO_ACTIVE_SCHEDULES];

export async function GET() {
  return NextResponse.json({
    success: true,
    schedules: activeSchedules,
  });
}

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
        { success: false, error: 'Invalid batch, syllabus, instructor, or resource identifier' },
        { status: 400 }
      );
    }

    // Run DGCA CAR ATO Validation
    const validation = validateATOSchedulingMatrix({
      batch,
      syllabusItem,
      instructor,
      resource,
      students,
      date,
      startTime: start_time,
      allInstructors: ATO_INSTRUCTORS,
      allSchedules: activeSchedules,
      allDutyLogs: ATO_HISTORICAL_DUTY_LOGS,
    });

    if (!validation.isValid) {
      const fdtlFail = validation.checks.find((c) => c.category === 'FDTL' && !c.passed);
      if (fdtlFail) {
        return NextResponse.json(
          {
            success: false,
            code: 'P0001',
            error: 'DGCA FDTL Limit Violation',
            message: fdtlFail.message,
            validation,
          },
          { status: 422 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          code: 'VALIDATION_FAILED',
          error: 'Compliance Check Failed',
          message: validation.summary,
          validation,
        },
        { status: 400 }
      );
    }

    // Calculate end time
    const startHour = parseInt(start_time.split(':')[0]);
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
      student_ids: students.map((s) => s.id),
      student_names: students.map((s) => s.full_name),
      date,
      start_time,
      end_time: endTimeStr,
      briefing_hours: syllabusItem.duration_briefing_hours,
      sim_hours: syllabusItem.duration_instructional_hours,
      total_duty_hours: syllabusItem.total_duty_hours,
      status: 'CONFIRMED',
    };

    activeSchedules.push(newSession);

    return NextResponse.json(
      {
        success: true,
        message: 'Training session booked and confirmed under DGCA CAR regulations',
        session: newSession,
        validation,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
