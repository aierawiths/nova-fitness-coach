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
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { data: profile } = await supabaseClient.from("profiles").select("*").eq("id", user.id).single();
    if (!profile) throw new Error("Profile not found");

    const prompt = `You are a certified fitness trainer. Generate a structured 7-day workout plan for:
- Goal: ${profile.goal || "General Fitness"}
- Experience: ${profile.experience || "Beginner"}
- Equipment: ${profile.equipment || "Full Gym"}
- Activity Level: ${profile.activity_level || "Moderate"}
- Gender: ${profile.gender || "Not specified"}
- Age: ${profile.age || "Not specified"}
- Weight: ${profile.weight || "Not specified"}kg

Return ONLY valid JSON (no markdown):
{"weeklyPlan":[{"day":"Monday","focus":"","exercises":[{"name":"","sets":"","reps":"","rest":"","tips":""}]}]}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const aiData = await aiRes.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const planData = JSON.parse(content);

    const { data: plan, error } = await supabaseClient
      .from("workout_plans")
      .insert({ user_id: user.id, plan_data: planData })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(plan), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
