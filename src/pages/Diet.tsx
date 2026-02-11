import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Apple, ChevronDown, ChevronUp, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface Meal {
  mealType: string;
  food: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

interface DayMeals {
  day: string;
  meals: Meal[];
}

const sampleDiet: { macros: { calories: string; protein: string; carbs: string; fat: string }; plan: DayMeals[] } = {
  macros: { calories: "2,200", protein: "165g", carbs: "245g", fat: "73g" },
  plan: [
    {
      day: "Monday", meals: [
        { mealType: "Breakfast", food: "Greek Yogurt Parfait with Berries & Granola", calories: "420", protein: "30g", carbs: "52g", fat: "12g" },
        { mealType: "Lunch", food: "Grilled Chicken Bowl with Rice & Veggies", calories: "650", protein: "45g", carbs: "68g", fat: "18g" },
        { mealType: "Snack", food: "Protein Shake with Banana", calories: "280", protein: "32g", carbs: "35g", fat: "4g" },
        { mealType: "Dinner", food: "Salmon with Sweet Potato & Asparagus", calories: "580", protein: "42g", carbs: "48g", fat: "22g" },
      ],
    },
    {
      day: "Tuesday", meals: [
        { mealType: "Breakfast", food: "Oatmeal with Whey Protein & Almonds", calories: "450", protein: "35g", carbs: "55g", fat: "14g" },
        { mealType: "Lunch", food: "Turkey Wrap with Avocado", calories: "520", protein: "38g", carbs: "42g", fat: "20g" },
        { mealType: "Dinner", food: "Lean Beef Stir Fry with Noodles", calories: "620", protein: "40g", carbs: "58g", fat: "22g" },
      ],
    },
  ],
};

const MacroBar = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="flex-1 text-center">
    <p className="text-lg font-display font-bold text-foreground">{value}</p>
    <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    <div className={cn("h-1 w-8 mx-auto mt-1.5 rounded-full", color)} />
  </div>
);

const Diet = () => {
  const [expandedDay, setExpandedDay] = useState(0);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-6 pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">Diet Plan</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-optimized nutrition for your goals</p>
        </motion.div>

        {/* Daily Macros */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-5 p-4 rounded-2xl bg-gradient-card border border-border/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Target</span>
          </div>
          <div className="flex items-center">
            <MacroBar label="Calories" value={sampleDiet.macros.calories} color="bg-primary" />
            <MacroBar label="Protein" value={sampleDiet.macros.protein} color="bg-accent" />
            <MacroBar label="Carbs" value={sampleDiet.macros.carbs} color="bg-primary/60" />
            <MacroBar label="Fat" value={sampleDiet.macros.fat} color="bg-destructive/60" />
          </div>
        </motion.div>

        <Button variant="glow" className="w-full mt-5" onClick={handleGenerate} disabled={generating}>
          <Sparkles className="w-4 h-4" />
          {generating ? "Generating..." : "Generate New Plan"}
        </Button>

        {/* Meal plan */}
        <div className="mt-6 space-y-3">
          {sampleDiet.plan.map((day, idx) => (
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
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Apple className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{day.day}</p>
                    <p className="text-xs text-muted-foreground">{day.meals.length} meals</p>
                  </div>
                </div>
                {expandedDay === idx ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {expandedDay === idx && (
                <div className="px-4 pb-4 space-y-2.5">
                  {day.meals.map((meal, i) => (
                    <div key={i} className="p-3 rounded-xl bg-secondary/50 border border-border/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-primary uppercase">{meal.mealType}</span>
                        <span className="text-xs text-muted-foreground">{meal.calories} cal</span>
                      </div>
                      <p className="text-sm text-foreground">{meal.food}</p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <span>P: {meal.protein}</span>
                        <span>C: {meal.carbs}</span>
                        <span>F: {meal.fat}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Diet;
