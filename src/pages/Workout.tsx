import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Dumbbell, Clock, RotateCcw, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  tips: string;
}

interface DayPlan {
  day: string;
  focus: string;
  exercises: Exercise[];
}

const samplePlan: DayPlan[] = [
  {
    day: "Monday", focus: "Chest & Triceps",
    exercises: [
      { name: "Bench Press", sets: "4", reps: "8-10", rest: "90s", tips: "Control the eccentric" },
      { name: "Incline Dumbbell Press", sets: "3", reps: "10-12", rest: "60s", tips: "Squeeze at the top" },
      { name: "Cable Flyes", sets: "3", reps: "12-15", rest: "45s", tips: "Focus on stretch" },
      { name: "Tricep Dips", sets: "3", reps: "10-12", rest: "60s", tips: "Lean slightly forward" },
    ],
  },
  { day: "Tuesday", focus: "Back & Biceps", exercises: [
    { name: "Deadlifts", sets: "4", reps: "6-8", rest: "120s", tips: "Brace your core" },
    { name: "Pull-Ups", sets: "3", reps: "8-10", rest: "90s", tips: "Full range of motion" },
    { name: "Barbell Rows", sets: "3", reps: "10-12", rest: "60s", tips: "Squeeze shoulder blades" },
  ]},
  { day: "Wednesday", focus: "Rest / Active Recovery", exercises: [] },
  { day: "Thursday", focus: "Legs", exercises: [
    { name: "Squats", sets: "4", reps: "8-10", rest: "120s", tips: "Break parallel" },
    { name: "Romanian Deadlifts", sets: "3", reps: "10-12", rest: "90s", tips: "Hinge at hips" },
    { name: "Leg Press", sets: "3", reps: "12-15", rest: "60s", tips: "Don't lock knees" },
  ]},
  { day: "Friday", focus: "Shoulders & Arms", exercises: [
    { name: "Overhead Press", sets: "4", reps: "8-10", rest: "90s", tips: "Lock out fully" },
    { name: "Lateral Raises", sets: "3", reps: "12-15", rest: "45s", tips: "Slight bend in elbows" },
  ]},
  { day: "Saturday", focus: "Full Body HIIT", exercises: [
    { name: "Burpees", sets: "4", reps: "10", rest: "30s", tips: "Explosive movement" },
    { name: "Kettlebell Swings", sets: "4", reps: "15", rest: "30s", tips: "Drive with hips" },
  ]},
  { day: "Sunday", focus: "Rest", exercises: [] },
];

const Workout = () => {
  const [plan] = useState<DayPlan[]>(samplePlan);
  const [expandedDay, setExpandedDay] = useState<number>(0);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
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

        <div className="mt-6 space-y-3">
          {plan.map((day, idx) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-border/30 overflow-hidden bg-card"
            >
              <button
                className="w-full flex items-center justify-between p-4"
                onClick={() => setExpandedDay(expandedDay === idx ? -1 : idx)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold",
                    day.exercises.length > 0
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground"
                  )}>
                    {day.day.slice(0, 2)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{day.day}</p>
                    <p className="text-xs text-muted-foreground">{day.focus}</p>
                  </div>
                </div>
                {expandedDay === idx ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {expandedDay === idx && day.exercises.length > 0 && (
                <div className="px-4 pb-4 space-y-2.5">
                  {day.exercises.map((ex, i) => (
                    <div key={i} className="p-3 rounded-xl bg-secondary/50 border border-border/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{ex.name}</span>
                      </div>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Dumbbell className="w-3 h-3" />{ex.sets}×{ex.reps}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />{ex.rest}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <RotateCcw className="w-3 h-3" />{ex.tips}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {expandedDay === idx && day.exercises.length === 0 && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground italic">Rest day — recovery is key to growth!</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Premium upsell */}
        <div className="mt-6 p-4 rounded-2xl border border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Premium Feature</span>
          </div>
          <p className="text-xs text-muted-foreground">Unlock adaptive weekly AI updates, advanced splits, and periodization with FitNova Premium.</p>
          <Button variant="outline" size="sm" className="mt-3 border-primary text-primary hover:bg-primary/10">
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Workout;
