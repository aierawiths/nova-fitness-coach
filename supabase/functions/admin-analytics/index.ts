import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Use service role to read all users' data
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the requesting user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // TODO: Add admin role check here for production
    // For now, any authenticated user can access (you should add admin roles later)

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "overview";

    if (action === "overview") {
      // Get all profiles with stats
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get counts
      const [workoutCount, dietCount, foodLogCount, progressCount, activityCount] = await Promise.all([
        supabaseAdmin.from("workout_plans").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("diet_plans").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("food_logs").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("progress_logs").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("user_activity_logs").select("id", { count: "exact", head: true }),
      ]);

      // Get today's active users
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: todayActivity } = await supabaseAdmin
        .from("user_activity_logs")
        .select("user_id")
        .gte("created_at", today.toISOString());

      const activeToday = new Set(todayActivity?.map((a: any) => a.user_id) || []).size;

      // Get recent activity logs (last 50)
      const { data: recentActivity } = await supabaseAdmin
        .from("user_activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      return new Response(JSON.stringify({
        totalUsers: profiles?.length || 0,
        activeToday,
        totalWorkouts: workoutCount.count || 0,
        totalDietPlans: dietCount.count || 0,
        totalFoodScans: foodLogCount.count || 0,
        totalProgressLogs: progressCount.count || 0,
        totalActivityEvents: activityCount.count || 0,
        profiles: profiles || [],
        recentActivity: recentActivity || [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "user-detail") {
      const userId = url.searchParams.get("userId");
      if (!userId) throw new Error("userId required");

      const [profileRes, workoutsRes, dietsRes, foodLogsRes, progressRes, activityRes] = await Promise.all([
        supabaseAdmin.from("profiles").select("*").eq("id", userId).single(),
        supabaseAdmin.from("workout_plans").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
        supabaseAdmin.from("diet_plans").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
        supabaseAdmin.from("food_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
        supabaseAdmin.from("progress_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
        supabaseAdmin.from("user_activity_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
      ]);

      return new Response(JSON.stringify({
        profile: profileRes.data,
        workouts: workoutsRes.data || [],
        dietPlans: dietsRes.data || [],
        foodLogs: foodLogsRes.data || [],
        progressLogs: progressRes.data || [],
        activityLogs: activityRes.data || [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
