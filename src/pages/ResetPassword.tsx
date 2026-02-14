import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase will auto-detect the recovery token from the URL hash
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User is now in password recovery mode
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Mismatch", description: "Passwords don't match.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Set new <span className="text-gradient-primary">password</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">Enter your new password below.</p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground"
            required
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground"
            required
          />
        </div>

        {password && confirmPassword && password !== confirmPassword && (
          <p className="text-destructive text-xs">Passwords don't match</p>
        )}

        <Button type="submit" variant="glow" size="lg" className="w-full" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
