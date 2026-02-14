import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import fitnessHero from "@/assets/fitness-hero.jpg";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import { isValidPhoneNumber } from "react-phone-number-input";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
  };

  const handleSendOtp = async () => {
    if (!phone || !isValidPhoneNumber(phone)) {
      toast({ title: "Invalid number", description: "Please enter a valid phone number with country code.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { phone },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setOtpSent(true);
      toast({ title: "OTP sent!", description: "Check your phone for the verification code." });
    } catch (err: any) {
      toast({ title: "Failed to send OTP", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { phone, otp },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data.email && data.password) {
        await signIn(data.email, data.password);
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="relative h-[40vh] overflow-hidden">
        <img src={fitnessHero} alt="Fitness" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        <div className="absolute bottom-8 left-6 right-6">
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Fit<span className="text-gradient-primary">Nova</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">AI-powered fitness, reimagined.</p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 pb-8 space-y-6">
        {/* Toggle between email and phone */}
        <div className="flex gap-2 p-1 bg-secondary rounded-lg">
          <button
            onClick={() => { setMode("email"); setOtpSent(false); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === "email" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Email
          </button>
          <button
            onClick={() => setMode("phone")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === "phone" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Phone
          </button>
        </div>

        {mode === "email" ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button type="submit" variant="glow" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {!otpSent ? (
              <>
                <PhoneNumberInput
                  value={phone}
                  onChange={setPhone}
                  placeholder="Enter phone number"
                />
                <Button variant="glow" size="lg" className="w-full" disabled={loading || !phone} onClick={handleSendOtp}>
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Enter the 6-digit code sent to <span className="text-foreground font-medium">{phone}</span>
                </p>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button variant="glow" size="lg" className="w-full" disabled={loading || otp.length !== 6} onClick={handleVerifyOtp}>
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </Button>
                <button onClick={() => { setOtpSent(false); setOtp(""); }} className="text-xs text-muted-foreground underline w-full text-center">
                  Change number
                </button>
              </>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
