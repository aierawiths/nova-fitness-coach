import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell, Flame, Zap, Trophy, ChevronRight, Sparkles,
  TrendingUp, Target, Activity, ArrowUpRight, Calendar, Info, Clock, CheckCircle2, ScanLine
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

/* ---- Progress Ring ---- */
const ProgressRing = ({ percent, size = 56, stroke = 4, color = "hsl(var(--primary))" }: { percent: number; size?: number; stroke?: number; color?: string }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
      />
    </svg>
  );
};

/* ---- Glow Orb decoration ---- */
const GlowOrb = ({ className }: { className?: string }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  
  // Stats and Daily Info
  const [stats, setStats] = useState({ workouts: 0, scans: 0, logs: 0 });
  const [dailyActivity, setDailyActivity] = useState({ todayWorkouts: 0, todayScans: 0, todayLogs: 0 });
  
  // Recents (Phase 1)
  const [recents, setRecents] = useState<{
    workout: any | null;
    diet: any | null;
    food: any | null;
  }>({ workout: null, diet: null, food: null });

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Fetch total counts
      const [wp, fl, pl] = await Promise.all([
        (supabase.from("workout_plans") as any).select("id", { count: "exact", head: true }),
        (supabase.from("food_logs") as any).select("id", { count: "exact", head: true }),
        (supabase.from("progress_logs") as any).select("id", { count: "exact", head: true }),
      ]);
      setStats({ workouts: wp.count || 0, scans: fl.count || 0, logs: pl.count || 0 });

      // 2. Fetch today's activity (Phase 2)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const [wpToday, flToday, plToday] = await Promise.all([
        (supabase.from("workout_plans") as any).select("id", { count: "exact", head: true }).gte("created_at", todayISO),
        (supabase.from("food_logs") as any).select("id", { count: "exact", head: true }).gte("created_at", todayISO),
        (supabase.from("progress_logs") as any).select("id", { count: "exact", head: true }).gte("created_at", todayISO),
      ]);
      setDailyActivity({ todayWorkouts: wpToday.count || 0, todayScans: flToday.count || 0, todayLogs: plToday.count || 0 });

      // 3. Fetch recent artifacts (Phase 1)
      const userFilter = user ? { user_id: user.id } : {}; // fallback for guests if needed, though RLS handles it mostly.
      
      const { data: recentWorkout } = await supabase.from('workout_plans').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
      const { data: recentDiet } = await supabase.from('diet_plans').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
      const { data: recentFood } = await supabase.from('food_logs').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();

      setRecents({
        workout: recentWorkout,
        diet: recentDiet,
        food: recentFood,
      });
    };
    fetchDashboardData();
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const dailyGoalTarget = 3; // Example: e.g. 1 workout, 2 food logs a day
  const dailyTotal = dailyActivity.todayWorkouts + dailyActivity.todayScans + dailyActivity.todayLogs;
  const goalProgress = Math.min((dailyTotal / dailyGoalTarget) * 100, 100);

  // Dynamic AI Insight phase 2
  const getDailyMessage = () => {
    const h = new Date().getHours();
    if (dailyTotal === 0) {
      if (h < 10) return "Start your day strong! Log your breakfast or generate a morning workout to get moving.";
      if (h < 15) return "You haven't logged any activity today yet! Let's get a quick session in.";
      return "It's getting late, but there's still time to track your dinner or do a quick stretch.";
    }
    if (goalProgress >= 100) return "Incredible! You crushed your daily goals today! 🔥 Take some time to rest and recover.";
    if (dailyActivity.todayWorkouts === 0 && h > 15) return "Your nutrition is on track, but you haven't worked out yet! Time to sweat! 💦";
    return "Great momentum today! Keep logging your meals and stay hydrated.";
  };

  return (
    <div className="min-h-screen bg-background safe-top relative overflow-hidden">
      {/* Background glow orbs */}
      <GlowOrb className="w-72 h-72 bg-primary -top-20 -left-20" />
      <GlowOrb className="w-60 h-60 bg-accent top-1/3 -right-16" />

      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 px-5 pt-5 pb-28">
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">{greeting()}</p>
            <h1 className="font-display text-3xl font-extrabold text-foreground mt-0.5 tracking-tight">
              {profile?.name || "Athlete"}
            </h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/profile")}
            className="w-11 h-11 rounded-2xl bg-gradient-card border border-border/40 flex items-center justify-center"
          >
            <span className="font-display text-sm font-bold text-primary">
              {(profile?.name || "A").charAt(0).toUpperCase()}
            </span>
          </motion.button>
        </motion.div>

        {/* Daily Activity Hero Card */}
        <motion.div variants={item} className="mt-6 relative overflow-hidden rounded-[2rem] border border-primary/20 shadow-lg shadow-primary/5">
          <div className="absolute inset-0 bg-gradient-primary opacity-[0.08]" />
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative p-6 flex items-center gap-5">
            <div className="relative">
              <ProgressRing percent={goalProgress} size={64} stroke={5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-xs font-bold text-primary">{Math.round(goalProgress)}%</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Today's Activity</span>
              </div>
              <p className="text-base text-foreground font-bold leading-snug">
                {dailyTotal >= dailyGoalTarget ? "Daily Goal Crushed! 🎉" : `${dailyTotal} / ${dailyGoalTarget} Daily Actions`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dailyActivity.todayWorkouts} Workouts • {dailyActivity.todayScans} Meals • {dailyActivity.todayLogs} Logs
              </p>
            </div>
          </div>
        </motion.div>

        {/* AI Insight Banner (Dynamic Phase 2) */}
        <motion.div variants={item}
          className="mt-5 p-5 rounded-2xl glass border-primary/10 relative overflow-hidden shadow-sm">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-primary/5 blur-xl" />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-primary uppercase tracking-widest">AI Coach Insight</span>
              <p className="text-sm text-foreground/80 font-medium mt-1 leading-relaxed">
                {getDailyMessage()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3 mt-5">
          {[
            { icon: Dumbbell, label: "Workouts", value: stats.workouts, color: "text-primary", bg: "bg-primary/10" },
            { icon: Zap, label: "Scans", value: stats.scans, color: "text-accent", bg: "bg-accent/10" },
            { icon: TrendingUp, label: "Logs", value: stats.logs, color: "text-primary", bg: "bg-primary/10" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-gradient-card border border-border/30 p-3.5 text-center">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <span className="font-display text-xl font-bold text-foreground block">{s.value}</span>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Profile Summary Strip */}
        <motion.div variants={item}
          className="mt-5 flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/40 border border-border/20">
          <Activity className="w-4 h-4 text-accent shrink-0" />
          <div className="flex-1 flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto whitespace-nowrap scrollbar-none">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{profile?.goal || "—"}</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{profile?.experience || "Beginner"}</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{profile?.equipment || "Full Gym"}</span>
          </div>
        </motion.div>

        {/* Recents Section (Phase 1) */}
        <motion.div variants={item} className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Recent Activity
            </h2>
          </div>
          <div className="space-y-3">
            {!recents.workout && !recents.diet && !recents.food && (
              <div className="p-4 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center py-8 bg-secondary/20">
                <Info className="w-8 h-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground font-medium">No recent activity found.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Generate a workout or scan food to see it here!</p>
              </div>
            )}
            
            {recents.workout && (
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/workout")}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-card border border-border/40 shadow-sm text-left group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Dumbbell className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-0.5">Latest AI Workout</p>
                  <p className="text-sm font-bold text-foreground truncate block">
                    {/* Access deep JSON props safely simply by guessing structure, or fallback */}
                    {(recents.workout.plan_data as any)?.workout_plan?.title || "Custom Daily Routine"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 block">
                    {new Date(recents.workout.created_at).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            )}

            {recents.diet && (
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/diet")}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-card border border-border/40 shadow-sm text-left group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider mb-0.5">Latest Diet Plan</p>
                  <p className="text-sm font-bold text-foreground truncate block">
                    Custom Daily Meal Strategy
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 block">
                    {new Date(recents.diet.created_at).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            )}

            {recents.food && (
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/scan")}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-card border border-border/40 shadow-sm text-left group transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 overflow-hidden relative">
                  {recents.food.image_url ? (
                    <img src={recents.food.image_url} className="absolute inset-0 w-full h-full object-cover" alt="food" />
                  ) : (
                    <Zap className="w-5 h-5 text-accent" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] text-accent font-bold uppercase tracking-wider mb-0.5">Most Recent Meal</p>
                  <p className="text-sm font-bold text-foreground truncate block capitalize">
                    {recents.food.food_name || "Unknown Food"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 block">
                    {recents.food.estimated_calories} kcal • {new Date(recents.food.created_at).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item} className="mt-8">
          <h2 className="font-display text-sm font-bold text-foreground mb-4 uppercase tracking-wide flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            {[
              { icon: Dumbbell, label: "Generate AI Workout", sub: "Custom plan from your prompt", to: "/workout", accent: true },
              { icon: Flame, label: "View Diet Plan", sub: "Auto-generated with workout", to: "/diet", accent: false },
              { icon: ScanLine, label: "Scan Food", sub: "AI calorie & macro analysis", to: "/scan", accent: false },
            ].map((a) => (
              <motion.button
                key={a.label}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(a.to)}
                className={`flex items-center gap-4 w-full p-4 rounded-2xl border transition-all group shadow-sm ${
                  a.accent
                    ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                    : "bg-secondary/40 border-border/20 hover:bg-secondary/60"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  a.accent ? "bg-primary/15" : "bg-secondary"
                }`}>
                  <a.icon className={`w-5 h-5 ${a.accent ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 text-left">
                  <span className={`text-base font-bold ${a.accent ? "text-primary" : "text-foreground"}`}>{a.label}</span>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">{a.sub}</p>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                  a.accent ? "text-primary/50" : "text-muted-foreground/50"
                }`} />
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
