import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { phone } = await req.json();
    if (!phone) throw new Error("Phone number is required");

    const TWILIO_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_PHONE = Deno.env.get("TWILIO_PHONE_NUMBER");
    if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_PHONE) throw new Error("Twilio credentials not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min

    // Invalidate old OTPs for this phone
    await supabase.from("phone_otps").delete().eq("phone", phone);

    // Store new OTP
    const { error: insertErr } = await supabase.from("phone_otps").insert({
      phone,
      otp_code: otp,
      expires_at: expiresAt,
    });
    if (insertErr) throw insertErr;

    // Send via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
    const body = new URLSearchParams({
      To: phone,
      From: TWILIO_PHONE,
      Body: `Your FitNova verification code is: ${otp}. It expires in 5 minutes.`,
    });

    const twilioRes = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!twilioRes.ok) {
      const errData = await twilioRes.text();
      throw new Error(`Twilio error: ${errData}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-otp error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
