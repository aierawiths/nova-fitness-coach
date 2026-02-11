import { motion } from "framer-motion";
import { Dumbbell, Flame, Zap, Trophy, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-6 pt-6 pb-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-muted-foreground text-sm">Welcome back,</p>
          <h1 className="font-display text-2xl font-bold text-foreground mt-0.5">
            Ready to <span className="text-gradient-primary">crush it</span>?
          </h1>
        </motion.div>

        {/* AI Tip Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-6 p-4 rounded-2xl bg-gradient-primary relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <span className="text-xs font-semibold text-primary-foreground uppercase tracking-wider">AI Insight</span>
            </div>
            <p className="text-sm text-primary-foreground/90 leading-relaxed">
              Based on your goals, today is the perfect day for an upper body workout. Let's build some strength!
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-primary-foreground/10" />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mt-6"
        >
          <StatCard icon={Flame} label="Calories" value="1,847" unit="kcal" />
          <StatCard icon={Zap} label="Workouts" value="12" unit="this week" />
          <StatCard icon={Dumbbell} label="Streak" value="7" unit="days" />
          <StatCard icon={Trophy} label="Goals Hit" value="3" unit="/ 5" />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 space-y-3"
        >
          <h2 className="font-display text-base font-semibold text-foreground">Quick Actions</h2>
          <QuickAction icon={Dumbbell} label="Generate AI Workout" onClick={() => navigate("/dashboard")} />
          <QuickAction icon={Flame} label="Generate AI Diet Plan" onClick={() => navigate("/diet")} />
          <QuickAction icon={Zap} label="Scan Food" onClick={() => navigate("/scan")} />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
