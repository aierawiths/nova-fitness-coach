import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Signup = () => {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Create your <span className="text-gradient-primary">account</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">Start your AI-powered fitness journey today.</p>
      </div>

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

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
};

export default Signup;
