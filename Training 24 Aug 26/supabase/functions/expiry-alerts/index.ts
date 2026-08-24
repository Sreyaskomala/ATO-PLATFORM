// ============================================================================
// Supabase Edge Function: Automated Qualification & Recurrent Expiry Alerts
// Triggered via pg_cron (Daily at 00:00 UTC)
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExpiringQualification {
  instructor_id: string;
  instructor_name: string;
  instructor_email: string;
  aircraft_type: string;
  role: string;
  expiry_date: string;
  days_remaining: number;
  alert_level: "90_DAYS" | "30_DAYS" | "7_DAYS" | "EXPIRED";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Query qualifications expiring in 90, 30, or 7 days, or already expired
    const { data: expiringQuals, error } = await supabaseClient.rpc(
      "get_expiring_instructor_qualifications"
    );

    if (error) {
      throw error;
    }

    console.log(`[ExpiryCron] Processing ${expiringQuals?.length || 0} qualification alert candidates`);

    const alertsSent: any[] = [];

    // 2. Loop through and dispatch notifications
    for (const item of (expiringQuals as ExpiringQualification[] || [])) {
      const days = item.days_remaining;
      let alertType = "";
      
      if (days <= 0) alertType = "EXPIRED";
      else if (days <= 7) alertType = "7_DAYS";
      else if (days <= 30) alertType = "30_DAYS";
      else if (days <= 90) alertType = "90_DAYS";

      // 3. Log notification in database audit log & notification table
      const { error: insertErr } = await supabaseClient.from("audit_logs").insert({
        action: `EXPIRY_ALERT_${alertType}`,
        entity_type: "instructor_qualifications",
        entity_id: item.instructor_id,
        new_data: {
          instructor_email: item.instructor_email,
          aircraft: item.aircraft_type,
          role: item.role,
          expiry_date: item.expiry_date,
          days_remaining: days,
          timestamp: new Date().toISOString(),
        },
      });

      if (!insertErr) {
        alertsSent.push({
          instructor: item.instructor_name,
          email: item.instructor_email,
          alert: alertType,
          days,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${alertsSent.length} expiry alerts`,
        alerts: alertsSent,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
