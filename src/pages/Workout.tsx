import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Dumbbell, Clock, RotateCcw, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Exercise { name: string; sets: string; reps: string; rest: string; tips: string; }
interface DayPlan { day: string; focus: string; exercises: Exercise[]; }

const Workout = () => {
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [expandedDay, setExpandedDay] = useState<number>(0);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      const { data } = await (supabase.from("workout_plans") as any)
        .select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (data?.plan_data?.weeklyPlan) setPlan(data.plan_data.weeklyPlan);
      setLoading(false);
    };
    fetchLatest();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("generate-workout", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const workoutData = res.data?.workout?.plan_data || res.data?.plan_data;
      if (workoutData?.weeklyPlan) {
        setPlan(workoutData.weeklyPlan);
        toast({ title: "Workout & Diet plan generated!", description: "Your matching diet plan is ready on the Diet page." });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-6 pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">Workout Plan</h1>
          <p className="text-sm text-muted-foreground mt-1">Your AI-generated 7-day program</p>
        </motion.div>

        <Button variant="glow" className="w-full mt-5" onClick={handleGenerate} disabled={generating}>
          <Sparkles className="w-4 h-4" />
          {generating ? "Generating..." : "Generate New Plan"}
        </Button>

        {loading ? (
          <div className="mt-8 flex justify-center"><Sparkles className="w-6 h-6 text-primary animate-pulse-glow" /></div>
        ) : plan.length === 0 ? (
          <div className="mt-8 text-center text-muted-foreground text-sm">No workout plan yet. Generate one above!</div>
        ) : (
          <div className="mt-6 space-y-3">
            {plan.map((day, idx) => (
              <motion.div key={day.day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="rounded-2xl border border-border/30 overflow-hidden bg-card">
                <button className="w-full flex items-center justify-between p-4" onClick={() => setExpandedDay(expandedDay === idx ? -1 : idx)}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold",
                      day.exercises?.length > 0 ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground")}>
                      {day.day?.slice(0, 2)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{day.day}</p>
                      <p className="text-xs text-muted-foreground">{day.focus}</p>
                    </div>
                  </div>
                  {expandedDay === idx ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {expandedDay === idx && day.exercises?.length > 0 && (
                  <div className="px-4 pb-4 space-y-2.5">
                    {day.exercises.map((ex, i) => (
                      <div key={i} className="p-3 rounded-xl bg-secondary/50 border border-border/20">
                        <span className="text-sm font-medium text-foreground">{ex.name}</span>
                        <div className="flex gap-4 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Dumbbell className="w-3 h-3" />{ex.sets}×{ex.reps}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{ex.rest}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground"><RotateCcw className="w-3 h-3" />{ex.tips}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {expandedDay === idx && (!day.exercises || day.exercises.length === 0) && (
                  <div className="px-4 pb-4"><p className="text-sm text-muted-foreground italic">Rest day — recovery is key!</p></div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 rounded-2xl border border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Premium Feature</span>
          </div>
          <p className="text-xs text-muted-foreground">Unlock adaptive weekly AI updates, advanced splits, and periodization with FitNova Premium.</p>
          <Button variant="outline" size="sm" className="mt-3 border-primary text-primary hover:bg-primary/10">Upgrade Now</Button>
        </div>
      </div>
    </div>
  );
};

export default Workout;
