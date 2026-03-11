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

    const { imageBase64 } = await req.json();
    if (!imageBase64) throw new Error("No image provided");

    const prompt = `You are an expert food scientist, nutritionist, and culinary historian with deep knowledge of global cuisines. Analyze this food image with maximum precision.

Identify the food with extreme accuracy. Consider portion size, cooking method, ingredients visible, and regional variations.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "foodName": "exact food name",
  "localName": "name in the food's original language if applicable",
  "country": "country/region of origin",
  "cuisine": "cuisine type (e.g. Italian, Japanese, Indian)",
  "description": "brief 1-2 sentence description of the dish, ingredients, and preparation",
  "servingSize": "estimated serving size in grams",
  "estimatedCalories": "number only, be very precise based on portion size",
  "protein": "grams as number (e.g. 25)",
  "carbs": "grams as number (e.g. 45)",
  "fat": "grams as number (e.g. 12)",
  "fiber": "grams as number (e.g. 6)",
  "sugar": "grams as number (e.g. 8)",
  "sodium": "milligrams as number (e.g. 450)",
  "cholesterol": "milligrams as number (e.g. 65)",
  "vitamins": "key vitamins present (e.g. A, C, K, B12)",
  "minerals": "key minerals present (e.g. Iron, Calcium, Potassium)",
  "healthScore": "1-10 rating of overall healthiness",
  "isVegetarian": true or false,
  "isVegan": true or false,
  "isGlutenFree": true or false,
  "confidence": "High, Medium, or Low"
}

Be extremely precise with calorie and macro estimates. Consider exact portion size visible in the image. Round numbers appropriately.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!aiRes.ok) {
      const status = aiRes.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiRes.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(content);

    // Save to food_logs
    await supabaseClient.from("food_logs").insert({
      user_id: user.id,
      food_name: result.foodName,
      estimated_calories: parseFloat(result.estimatedCalories) || null,
      protein: result.protein?.toString(),
      carbs: result.carbs?.toString(),
      fat: result.fat?.toString(),
      fiber: result.fiber?.toString(),
      confidence: result.confidence,
    });

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("analyze-food error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
