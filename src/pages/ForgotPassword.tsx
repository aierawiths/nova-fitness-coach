import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "Email sent", description: "Check your inbox for the password reset link." });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-8">
      <Link to="/login" className="flex items-center gap-2 text-muted-foreground text-sm mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Reset your <span className="text-gradient-primary">password</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      {sent ? (
        <div className="space-y-4">
          <div className="bg-secondary rounded-lg p-6 text-center space-y-2">
            <Mail className="w-10 h-10 text-primary mx-auto" />
            <p className="text-foreground font-medium">Check your email</p>
            <p className="text-muted-foreground text-sm">
              We sent a password reset link to <span className="text-foreground font-medium">{email}</span>
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
            Try another email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
          <Button type="submit" variant="glow" size="lg" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
