import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Settings, Crown, ChevronRight, LogOut, Dumbbell, Apple, ScanLine, TrendingUp, Moon, Sun, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/20 shadow-sm">
    <Icon className="w-5 h-5 text-primary" />
    <span className="text-sm font-medium text-muted-foreground flex-1">{label}</span>
    <span className="text-base font-bold text-foreground">{value}</span>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [stats, setStats] = useState({ workouts: 0, scans: 0, logs: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [wp, fl, pl] = await Promise.all([
        (supabase.from("workout_plans") as any).select("id", { count: "exact", head: true }),
        (supabase.from("food_logs") as any).select("id", { count: "exact", head: true }),
        (supabase.from("progress_logs") as any).select("id", { count: "exact", head: true }),
      ]);
      setStats({ workouts: wp.count || 0, scans: fl.count || 0, logs: pl.count || 0 });
    };
    fetchStats();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-6 pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-extrabold text-foreground tracking-tight">Profile</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-6 p-6 rounded-2xl bg-gradient-card border border-border/30 flex items-center gap-5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold text-foreground tracking-tight">{profile?.name || "User"}</h2>
            <p className="text-sm text-muted-foreground font-medium">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">Free Plan</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <button onClick={() => navigate("/subscription")} className="w-full mt-4 p-5 rounded-2xl bg-gradient-primary flex items-center gap-4 group shadow-md shadow-primary/20">
            <Crown className="w-6 h-6 text-primary-foreground" />
            <div className="flex-1 text-left">
              <p className="text-base font-bold text-primary-foreground">Upgrade to Premium</p>
              <p className="text-sm text-primary-foreground/80 font-medium">Unlock all AI features</p>
            </div>
            <ChevronRight className="w-5 h-5 text-primary-foreground group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 space-y-3">
          <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Your Stats</h3>
          <StatItem icon={Dumbbell} label="Workout plans" value={String(stats.workouts)} />
          <StatItem icon={ScanLine} label="Foods scanned" value={String(stats.scans)} />
          <StatItem icon={TrendingUp} label="Progress entries" value={String(stats.logs)} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-8 space-y-3">
          <button onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/30 hover:bg-secondary transition-all shadow-sm">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-left text-sm font-bold text-foreground">Settings</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/30 hover:bg-secondary transition-all shadow-sm"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="flex-1 text-left text-sm font-bold text-foreground">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          <Button variant="ghost" className="w-full justify-start gap-4 p-4 h-auto rounded-2xl text-destructive font-bold hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
            <LogOut className="w-5 h-5" /> Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
