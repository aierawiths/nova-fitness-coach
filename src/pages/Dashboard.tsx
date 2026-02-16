import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Flame, Zap, Trophy, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const StatCard = ({ icon: Icon, label, value, unit }: { icon: React.ElementType; label: string; value: string; unit: string }) => (
  <div className="bg-gradient-card rounded-2xl p-4 border border-border/30">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-primary" />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="font-display text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{unit}</span>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-3 w-full p-4 rounded-2xl bg-secondary/50 border border-border/30 hover:bg-secondary transition-all group">
    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <span className="flex-1 text-left text-sm font-medium text-foreground">{label}</span>
    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
  </button>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
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

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-6 pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-muted-foreground text-sm">Welcome back,</p>
          <h1 className="font-display text-2xl font-bold text-foreground mt-0.5">
            {profile?.name || "Athlete"}, <span className="text-gradient-primary">let's go</span>!
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-6 p-4 rounded-2xl bg-gradient-primary relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <span className="text-xs font-semibold text-primary-foreground uppercase tracking-wider">AI Insight</span>
            </div>
            <p className="text-sm text-primary-foreground/90 leading-relaxed">
              {profile?.goal === "Lose Fat" ? "Stay in a calorie deficit and keep your protein high today!" :
               profile?.goal === "Gain Muscle" ? "Focus on progressive overload and fuel your muscles!" :
               "Consistency is key — keep showing up!"}
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary-foreground/10" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mt-6">
          <StatCard icon={Dumbbell} label="Workouts" value={String(stats.workouts)} unit="plans" />
          <StatCard icon={Zap} label="Scans" value={String(stats.scans)} unit="foods" />
          <StatCard icon={Flame} label="Goal" value={profile?.goal?.split(" ")[0] || "—"} unit="" />
          <StatCard icon={Trophy} label="Logs" value={String(stats.logs)} unit="entries" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 space-y-3">
          <h2 className="font-display text-base font-semibold text-foreground">Quick Actions</h2>
          <QuickAction icon={Dumbbell} label="Generate AI Workout" onClick={() => navigate("/workout")} />
          <QuickAction icon={Flame} label="Generate AI Diet Plan" onClick={() => navigate("/diet")} />
          <QuickAction icon={Zap} label="Scan Food" onClick={() => navigate("/scan")} />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
