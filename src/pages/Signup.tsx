import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import PhoneNumberInput from "@/components/PhoneNumberInput";
import { isValidPhoneNumber } from "react-phone-number-input";

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent you a confirmation link to verify your account." });
    }
  };

  const handleSendOtp = async () => {
    if (!name) {
      toast({ title: "Name required", description: "Please enter your name first.", variant: "destructive" });
      return;
    }
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
        body: { phone, otp, name },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data.email && data.password) {
        await signIn(data.email, data.password);
        navigate("/dashboard");
      } else if (!data.isNewUser) {
        toast({ title: "Account exists", description: "This phone is already registered. Please sign in instead." });
      }
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Create your <span className="text-gradient-primary">account</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">Start your AI-powered fitness journey today.</p>
      </div>

      {/* Toggle between email and phone */}
      <div className="flex gap-2 p-1 bg-secondary rounded-lg mb-6">
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
        <form onSubmit={handleSignup} className="space-y-4 flex-1">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
              className="pl-10 h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground" required />
          </div>
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
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground" required />
          </div>

          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-destructive text-xs">Passwords don't match</p>
          )}

          <Button type="submit" variant="glow" size="lg" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      ) : (
        <div className="space-y-4 flex-1">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)}
              className="pl-10 h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground" />
          </div>

          {!otpSent ? (
            <>
              <PhoneNumberInput
                value={phone}
                onChange={setPhone}
                placeholder="Enter phone number"
              />
              <Button variant="glow" size="lg" className="w-full" disabled={loading || !phone || !name} onClick={handleSendOtp}>
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
                {loading ? "Verifying..." : "Verify & Create Account"}
              </Button>
              <button onClick={() => { setOtpSent(false); setOtp(""); }} className="text-xs text-muted-foreground underline w-full text-center">
                Change number
              </button>
            </>
          )}
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
};

export default Signup;
