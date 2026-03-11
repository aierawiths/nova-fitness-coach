import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { phone, otp, name } = await req.json();
    if (!phone || !otp) throw new Error("Phone and OTP are required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Check OTP
    const { data: otpRecord, error: fetchErr } = await supabase
      .from("phone_otps")
      .select("*")
      .eq("phone", phone)
      .eq("otp_code", otp)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!otpRecord) throw new Error("Invalid or expired OTP");

    // Mark as verified
    await supabase.from("phone_otps").update({ verified: true }).eq("id", otpRecord.id);

    // Check if user with this phone exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, phone")
      .eq("phone", phone)
      .maybeSingle();

    if (existingProfile) {
      // Existing phone user - generate a new password and update, then return credentials
      const newPassword = crypto.randomUUID();
      const { error: updateErr } = await supabase.auth.admin.updateUserById(existingProfile.id, {
        password: newPassword,
      });
      if (updateErr) throw updateErr;

      // Get the user's email to sign in
      const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(existingProfile.id);
      if (userErr) throw userErr;

      return new Response(
        JSON.stringify({
          success: true,
          isNewUser: false,
          userId: existingProfile.id,
          email: userData.user.email,
          password: newPassword,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new user with phone
    const tempEmail = `phone_${phone.replace(/[^0-9]/g, "")}@fitnova.app`;
    const tempPassword = crypto.randomUUID();

    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: tempEmail,
      password: tempPassword,
      phone,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { phone, full_name: name || "" },
    });

    if (createErr) throw createErr;

    // Update profile with phone
    await supabase.from("profiles").update({ phone, name: name || "" }).eq("id", newUser.user.id);

    return new Response(
      JSON.stringify({
        success: true,
        isNewUser: true,
        userId: newUser.user.id,
        email: tempEmail,
        password: tempPassword,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("verify-otp error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
