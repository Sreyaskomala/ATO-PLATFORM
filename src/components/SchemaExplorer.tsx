'use client';

import React from 'react';
import { Database, Download, FileText, Code2 } from 'lucide-react';

export const SchemaExplorer: React.FC = () => {
  const fdtlTriggerSQL = `-- 1. The FDTL PostgreSQL Enforcement Trigger Function
CREATE OR REPLACE FUNCTION enforce_dgca_fdtl_limits()
RETURNS TRIGGER AS $$
DECLARE
    rolling_7_day_hours NUMERIC(5, 2);
    new_duration NUMERIC(5, 2);
BEGIN
    -- 1. Calculate the duration of the incoming session
    new_duration := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600;

    -- 2. Sum the duration of all sessions for this instructor in the 7 days prior
    SELECT COALESCE(SUM(duration_hours), 0)
    INTO rolling_7_day_hours
    FROM master_schedule
    WHERE instructor_id = NEW.instructor_id
      AND session_status IN ('Scheduled', 'Completed', 'CONFIRMED')
      AND start_time >= (NEW.start_time - INTERVAL '7 days')
      AND start_time <= NEW.start_time
      AND id != COALESCE(NEW.id, uuid_nil());

    -- 3. Add the new session's duration to the rolling total
    rolling_7_day_hours := rolling_7_day_hours + new_duration;

    -- 4. Enforce the 30-hour maximum limit (DGCA Civil Aviation Requirements)
    IF rolling_7_day_hours > 30 THEN
        RAISE EXCEPTION 'DGCA FDTL Violation: Instructor cannot exceed 30 hours of duty in a rolling 7-day window. Attempting to schedule pushes total to % hours.', rolling_7_day_hours
        USING ERRCODE = 'P0001'; -- Custom application error code
    END IF;

    -- 5. If legal, allow transaction to proceed
    NEW.duration_hours := new_duration;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. The Database Trigger Definition
CREATE TRIGGER trigger_check_fdtl
BEFORE INSERT OR UPDATE ON master_schedule
FOR EACH ROW
EXECUTE FUNCTION enforce_dgca_fdtl_limits();`;

  return (
    <div className="space-y-6 animate-fadeIn transition-colors duration-150">
      <div className="p-6 rounded-2xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm dark:shadow-none">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-skyline-500 dark:text-skyline-400" />
            <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">PostgreSQL Architecture & FDTL Trigger</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Database-level single source of truth preventing race conditions and schedule collisions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/DATABASE_SCHEMA.md"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-aviation-950 border border-slate-200 dark:border-aviation-700 hover:border-skyline-500 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <FileText className="w-4 h-4 text-skyline-500 dark:text-skyline-400" />
            <span>DATABASE_SCHEMA.md</span>
          </a>
          <a
            href="/schema.sql"
            download
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-skyline-500 hover:bg-skyline-400 text-xs font-semibold text-white shadow-md shadow-skyline-500/20 dark:shadow-glow-cyan transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download schema.sql</span>
          </a>
        </div>
      </div>

      {/* SQL Trigger Code Viewer */}
      <div className="p-6 rounded-2xl bg-white dark:bg-aviation-900/80 border border-slate-200 dark:border-aviation-800 backdrop-blur-xl space-y-4 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Code2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            DGCA FDTL Enforcement Trigger (`enforce_dgca_fdtl_limits`)
          </h3>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 dark:bg-aviation-950 border border-slate-800 dark:border-aviation-800 font-mono text-xs text-skyline-300 overflow-x-auto leading-relaxed">
          <pre>{fdtlTriggerSQL}</pre>
        </div>
      </div>
    </div>
  );
};
