import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Apple, ChevronDown, ChevronUp, Flame, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Meal { mealType: string; food: string; calories: string; protein: string; carbs: string; fat: string; }
interface DayMeals { day: string; meals: Meal[]; }

const MacroBar = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="flex-1 text-center">
    <p className="text-lg font-display font-bold text-foreground">{value}</p>
    <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    <div className={cn("h-1 w-8 mx-auto mt-1.5 rounded-full", color)} />
  </div>
);

const Diet = () => {
  const navigate = useNavigate();
  const [expandedDay, setExpandedDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [macros, setMacros] = useState({ calories: "—", protein: "—", carbs: "—", fat: "—" });
  const [mealPlan, setMealPlan] = useState<DayMeals[]>([]);
  const [isPremium] = useState(false); // TODO: integrate with RevenueCat

  useEffect(() => {
    const fetchLatest = async () => {
      const { data } = await (supabase.from("diet_plans") as any)
        .select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (data?.plan_data) {
        setMacros({
          calories: data.plan_data.dailyCalories || "—",
          protein: data.plan_data.protein || "—",
          carbs: data.plan_data.carbs || "—",
          fat: data.plan_data.fat || "—",
        });
        setMealPlan(data.plan_data.mealPlan || []);
      }
      setLoading(false);
    };
    fetchLatest();
  }, []);

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-6 pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">Diet Plan</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-optimized nutrition matched to your workout</p>
        </motion.div>

        {!isPremium ? (
          /* Premium Gate */
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mt-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">Premium Feature</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Your AI diet plan is auto-generated to perfectly match your workout. Upgrade to Premium to access personalized nutrition plans.
            </p>

            <div className="mt-6 w-full p-4 rounded-2xl border border-primary/30 bg-primary/5 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">What you get</span>
              </div>
              <ul className="space-y-2">
                {["Diet plan synced to your workout intensity", "Day-by-day macro targets", "Meals optimized for training & recovery", "Dietary preference & allergy support"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Sparkles className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <Button variant="glow" className="w-full mt-5" onClick={() => navigate("/subscription")}>
              <Crown className="w-4 h-4" />
              Upgrade to Premium
            </Button>
          </motion.div>
        ) : (
          /* Premium Content */
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="mt-5 p-4 rounded-2xl bg-gradient-card border border-border/30">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Target</span>
              </div>
              <div className="flex items-center">
                <MacroBar label="Calories" value={macros.calories} color="bg-primary" />
                <MacroBar label="Protein" value={macros.protein} color="bg-accent" />
                <MacroBar label="Carbs" value={macros.carbs} color="bg-primary/60" />
                <MacroBar label="Fat" value={macros.fat} color="bg-destructive/60" />
              </div>
            </motion.div>

            <div className="mt-4 p-3 rounded-xl bg-accent/10 border border-accent/20">
              <p className="text-xs text-muted-foreground text-center">
                <Sparkles className="w-3 h-3 inline mr-1 text-accent" />
                Diet plans are auto-generated to match your workout. Go to <span className="font-semibold text-accent">Workout</span> to generate a new synced plan.
              </p>
            </div>

            {loading ? (
              <div className="mt-8 flex justify-center"><Sparkles className="w-6 h-6 text-primary animate-pulse-glow" /></div>
            ) : mealPlan.length === 0 ? (
              <div className="mt-8 text-center text-muted-foreground text-sm">No diet plan yet. Generate a workout first!</div>
            ) : (
              <div className="mt-6 space-y-3">
                {mealPlan.map((day, idx) => (
                  <motion.div key={day.day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    className="rounded-2xl border border-border/30 overflow-hidden bg-card">
                    <button className="w-full flex items-center justify-between p-4" onClick={() => setExpandedDay(expandedDay === idx ? -1 : idx)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Apple className="w-5 h-5 text-accent" /></div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-foreground">{day.day}</p>
                          <p className="text-xs text-muted-foreground">{day.meals?.length || 0} meals</p>
                        </div>
                      </div>
                      {expandedDay === idx ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    {expandedDay === idx && (
                      <div className="px-4 pb-4 space-y-2.5">
                        {day.meals?.map((meal, i) => (
                          <div key={i} className="p-3 rounded-xl bg-secondary/50 border border-border/20">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-primary uppercase">{meal.mealType}</span>
                              <span className="text-xs text-muted-foreground">{meal.calories} cal</span>
                            </div>
                            <p className="text-sm text-foreground">{meal.food}</p>
                            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                              <span>P: {meal.protein}</span><span>C: {meal.carbs}</span><span>F: {meal.fat}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Diet;
