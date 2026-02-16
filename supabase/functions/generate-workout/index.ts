import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Parse custom prompt from request body
    let customPrompt = "";
    try {
      const body = await req.json();
      customPrompt = body?.customPrompt || "";
    } catch { /* no body */ }

    // Step 1: Generate workout plan with optional custom prompt
    const userContext = `User profile:
- Goal: ${profile.goal || "General Fitness"}
- Experience: ${profile.experience || "Beginner"}
- Equipment: ${profile.equipment || "Full Gym"}
- Activity Level: ${profile.activity_level || "Moderate"}
- Gender: ${profile.gender || "Not specified"}
- Age: ${profile.age || "Not specified"}
- Weight: ${profile.weight || "Not specified"}kg`;

    const workoutPrompt = customPrompt
      ? `You are a certified fitness trainer. The user has requested this specific workout plan: "${customPrompt}"

${userContext}

Generate a structured 7-day workout plan that matches their request while considering their profile. Adapt the plan to their experience level and available equipment.

Return ONLY valid JSON (no markdown):
{"weeklyPlan":[{"day":"Monday","focus":"","exercises":[{"name":"","sets":"","reps":"","rest":"","tips":""}]}]}`
      : `You are a certified fitness trainer. Generate a structured 7-day workout plan for:
${userContext}

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
        temperature: 0.7,
      }),
    });

    const workoutAiData = await workoutRes.json();
    let workoutContent = workoutAiData.choices?.[0]?.message?.content || "";
    workoutContent = workoutContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const workoutPlanData = JSON.parse(workoutContent);

    // Save workout plan
    const { data: workoutPlan, error: workoutError } = await supabaseClient
      .from("workout_plans")
      .insert({ user_id: user.id, plan_data: workoutPlanData })
      .select()
      .single();

    if (workoutError) throw workoutError;

    // Step 2: Generate diet plan that complements the workout
    const workoutSummary = workoutPlanData.weeklyPlan?.map((d: any) => `${d.day}: ${d.focus} (${d.exercises?.length || 0} exercises)`).join(", ") || "General training";

    const dietPrompt = `You are a certified sports nutritionist. Generate a 7-day meal plan that perfectly complements this workout schedule: ${workoutSummary}

${customPrompt ? `The user's workout focus: "${customPrompt}"` : ""}

User profile:
- Goal: ${profile.goal || "General Fitness"}
- Weight: ${profile.weight || "Not specified"}kg
- Height: ${profile.height || "Not specified"}cm
- Activity Level: ${profile.activity_level || "Moderate"}
- Dietary Preference: ${profile.dietary_preference || "No Preference"}
- Allergies: ${profile.allergies || "None"}
- Gender: ${profile.gender || "Not specified"}
- Age: ${profile.age || "Not specified"}

IMPORTANT: Match each day's nutrition to the workout intensity. On heavy training days (more exercises, compound movements), increase carbs and calories. On rest days, reduce calories slightly and increase protein for recovery. The diet must directly support the workout performance and recovery.

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
        temperature: 0.7,
      }),
    });

    const dietAiData = await dietRes.json();
    let dietContent = dietAiData.choices?.[0]?.message?.content || "";
    dietContent = dietContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const dietPlanData = JSON.parse(dietContent);

    // Save diet plan
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
