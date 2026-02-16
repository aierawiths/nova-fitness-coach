import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell, Flame, Zap, Trophy, ChevronRight, Sparkles,
  TrendingUp, Target, Activity, ArrowUpRight, Calendar
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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const goalProgress = Math.min(((stats.workouts + stats.scans + stats.logs) / 15) * 100, 100);

  return (
    <div className="min-h-screen bg-background safe-top relative overflow-hidden">
      {/* Background glow orbs */}
      <GlowOrb className="w-72 h-72 bg-primary -top-20 -left-20" />
      <GlowOrb className="w-60 h-60 bg-accent top-1/3 -right-16" />

      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 px-5 pt-5 pb-28">
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">{greeting()}</p>
            <h1 className="font-display text-2xl font-bold text-foreground mt-0.5">
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

        {/* Hero Card */}
        <motion.div variants={item} className="mt-5 relative overflow-hidden rounded-3xl border border-primary/20">
          <div className="absolute inset-0 bg-gradient-primary opacity-[0.08]" />
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative p-5 flex items-center gap-4">
            <div className="relative">
              <ProgressRing percent={goalProgress} size={64} stroke={5} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-xs font-bold text-primary">{Math.round(goalProgress)}%</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Weekly Goal</span>
              </div>
              <p className="text-sm text-foreground font-medium leading-snug">
                {profile?.goal || "General Fitness"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.workouts + stats.scans + stats.logs} / 15 activities
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-primary/50" />
          </div>
        </motion.div>

        {/* AI Insight Banner */}
        <motion.div variants={item}
          className="mt-4 p-4 rounded-2xl glass border-primary/10 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-primary/5 blur-xl" />
          <div className="relative flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">AI Insight</span>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {profile?.goal === "Lose Fat"
                  ? "Stay in a calorie deficit and keep your protein high today — you've got this! 💪"
                  : profile?.goal === "Gain Muscle"
                  ? "Focus on progressive overload and fuel your muscles with quality nutrition! 🔥"
                  : "Consistency is the real superpower — keep showing up every day! ⚡"}
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

        {/* Quick Actions */}
        <motion.div variants={item} className="mt-6">
          <h2 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            Quick Actions
          </h2>
          <div className="space-y-2.5">
            {[
              { icon: Dumbbell, label: "Generate AI Workout", sub: "Custom plan from your prompt", to: "/workout", accent: true },
              { icon: Flame, label: "View Diet Plan", sub: "Auto-generated with workout", to: "/diet", accent: false },
              { icon: Zap, label: "Scan Food", sub: "AI calorie & macro analysis", to: "/scan", accent: false },
              { icon: Trophy, label: "Track Progress", sub: "Log weight & body fat", to: "/progress", accent: false },
            ].map((a) => (
              <motion.button
                key={a.label}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(a.to)}
                className={`flex items-center gap-3.5 w-full p-3.5 rounded-2xl border transition-all group ${
                  a.accent
                    ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                    : "bg-secondary/40 border-border/20 hover:bg-secondary/60"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  a.accent ? "bg-primary/15" : "bg-secondary"
                }`}>
                  <a.icon className={`w-4.5 h-4.5 ${a.accent ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 text-left">
                  <span className={`text-sm font-medium ${a.accent ? "text-primary" : "text-foreground"}`}>{a.label}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.sub}</p>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
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
