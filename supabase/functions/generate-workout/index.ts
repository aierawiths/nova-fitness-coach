import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { data: profile } = await supabaseClient.from("profiles").select("*").eq("id", user.id).single();
    if (!profile) throw new Error("Profile not found");

    let customPrompt = "";
    try {
      const body = await req.json();
      customPrompt = body?.customPrompt || "";
    } catch { /* no body */ }

    const userContext = `User profile (use these for precise calculations):
- Goal: ${profile.goal || "General Fitness"}
- Experience Level: ${profile.experience || "Beginner"}
- Available Equipment: ${profile.equipment || "Full Gym"}
- Activity Level: ${profile.activity_level || "Moderate"}
- Gender: ${profile.gender || "Not specified"}
- Age: ${profile.age || "Not specified"}
- Weight: ${profile.weight || "Not specified"}kg
- Height: ${profile.height || "Not specified"}cm
- Body Fat: ${profile.body_fat || "Not specified"}%`;

    const workoutPrompt = `You are an elite-level certified strength & conditioning coach and exercise scientist with 20+ years of experience training athletes and regular people.

${customPrompt ? `The user specifically requests: "${customPrompt}"\n` : ""}
${userContext}

Create the most effective, scientifically-backed 7-day workout plan possible. Consider:
- Progressive overload principles and periodization
- Proper muscle group recovery (48-72hrs between same muscle groups)
- Compound movements prioritized before isolation
- Appropriate volume based on experience level
- Real-world practical exercises (no made-up exercises)
- Specific rep ranges for the user's goal (strength: 3-6, hypertrophy: 8-12, endurance: 15-20)
- Include at least 1 rest or active recovery day
- Each exercise must have actionable, specific tips

Return ONLY valid JSON (no markdown):
{"weeklyPlan":[{"day":"Monday","focus":"","exercises":[{"name":"","sets":"","reps":"","rest":"","tips":""}]}]}`;

    const workoutRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: workoutPrompt }],
        temperature: 0.5,
      }),
    });

    if (!workoutRes.ok) {
      if (workoutRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (workoutRes.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${workoutRes.status}`);
    }

    const workoutAiData = await workoutRes.json();
    let workoutContent = workoutAiData.choices?.[0]?.message?.content || "";
    workoutContent = workoutContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const workoutPlanData = JSON.parse(workoutContent);

    const { data: workoutPlan, error: workoutError } = await supabaseClient
      .from("workout_plans")
      .insert({ user_id: user.id, plan_data: workoutPlanData })
      .select()
      .single();

    if (workoutError) throw workoutError;

    // Step 2: Generate complementary diet plan
    const workoutSummary = workoutPlanData.weeklyPlan?.map((d: any) => `${d.day}: ${d.focus} (${d.exercises?.length || 0} exercises)`).join(", ") || "General training";

    const dietPrompt = `You are a world-class sports nutritionist with deep knowledge of exercise nutrition science, meal timing, and macronutrient periodization.

Generate a precise 7-day meal plan that perfectly fuels this workout schedule: ${workoutSummary}

${customPrompt ? `User's training focus: "${customPrompt}"` : ""}

${userContext}
- Dietary Preference: ${profile.dietary_preference || "No Preference"}
- Allergies: ${profile.allergies || "None"}

CRITICAL RULES:
- Calculate TDEE precisely using the user's stats and activity level
- Match daily calories to training intensity (higher on heavy days, lower on rest days)
- Protein: minimum 1.6g/kg bodyweight for muscle building, 2.2g/kg for cutting
- Pre-workout meals: complex carbs + moderate protein 2hrs before
- Post-workout: fast-digesting protein + simple carbs within 30min
- Include real, specific foods with exact portions (not vague descriptions)
- Every meal must have realistic, cookable foods
- Account for allergies and dietary preferences strictly

Return ONLY valid JSON (no markdown):
{"dailyCalories":"","protein":"","carbs":"","fat":"","mealPlan":[{"day":"Monday","meals":[{"mealType":"Breakfast","food":"","calories":"","protein":"","carbs":"","fat":""}]}]}`;

    const dietRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: dietPrompt }],
        temperature: 0.5,
      }),
    });

    if (!dietRes.ok) {
      const errText = await dietRes.text();
      console.error("Diet AI error:", dietRes.status, errText);
      // Still return workout even if diet fails
      return new Response(JSON.stringify({ workout: workoutPlan }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dietAiData = await dietRes.json();
    let dietContent = dietAiData.choices?.[0]?.message?.content || "";
    dietContent = dietContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const dietPlanData = JSON.parse(dietContent);

    const { data: dietPlan, error: dietError } = await supabaseClient
      .from("diet_plans")
      .insert({ user_id: user.id, plan_data: dietPlanData })
      .select()
      .single();

    if (dietError) throw dietError;

    return new Response(JSON.stringify({ workout: workoutPlan, diet: dietPlan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("generate-workout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
