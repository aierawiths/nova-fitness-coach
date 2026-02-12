import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface OnboardingData {
  age: string; gender: string; height: string; weight: string; bodyFat: string;
  goal: string; activityLevel: string; experience: string; equipment: string;
  dietaryPreference: string; allergies: string; location: string;
}

const initialData: OnboardingData = {
  age: "", gender: "", height: "", weight: "", bodyFat: "",
  goal: "", activityLevel: "", experience: "", equipment: "",
  dietaryPreference: "", allergies: "", location: "",
};

const goals = ["Lose Fat", "Gain Muscle", "Maintain"];
const activityLevels = ["Sedentary", "Light", "Moderate", "Active", "Very Active"];
const experiences = ["Beginner", "Intermediate", "Advanced"];
const equipmentOptions = ["Home (Minimal)", "Home Gym", "Full Gym"];
const dietaryPrefs = ["No Preference", "Vegetarian", "Vegan", "Keto", "Paleo", "Mediterranean"];
const genders = ["Male", "Female", "Other"];

const OptionButton = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <button type="button" onClick={onClick} className={cn(
    "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border",
    selected ? "bg-primary/15 border-primary text-primary" : "bg-secondary border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
  )}>{label}</button>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [saving, setSaving] = useState(false);
  const totalSteps = 5;

  const update = (key: keyof OnboardingData, value: string) => setData((prev) => ({ ...prev, [key]: value }));

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await (supabase.from("profiles") as any).update({
      age: parseInt(data.age) || null,
      gender: data.gender || null,
      height: parseFloat(data.height) || null,
      weight: parseFloat(data.weight) || null,
      body_fat: parseFloat(data.bodyFat) || null,
      goal: data.goal || null,
      activity_level: data.activityLevel || null,
      experience: data.experience || null,
      equipment: data.equipment || null,
      dietary_preference: data.dietaryPreference || null,
      allergies: data.allergies || null,
      location: data.location || null,
      onboarding_completed: true,
    }).eq("id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      navigate("/dashboard");
    }
  };

  const steps = [
    <div key="basic" className="space-y-5">
      <h2 className="font-display text-xl font-bold">Basic Information</h2>
      <p className="text-sm text-muted-foreground">Tell us about yourself so we can personalize your experience.</p>
      <Input placeholder="Age" type="number" value={data.age} onChange={(e) => update("age", e.target.value)} className="h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground" />
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Gender</label>
        <div className="flex gap-2 flex-wrap">
          {genders.map((g) => <OptionButton key={g} label={g} selected={data.gender === g} onClick={() => update("gender", g)} />)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="Height (cm)" type="number" value={data.height} onChange={(e) => update("height", e.target.value)} className="h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground" />
        <Input placeholder="Weight (kg)" type="number" value={data.weight} onChange={(e) => update("weight", e.target.value)} className="h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground" />
      </div>
      <Input placeholder="Body Fat % (optional)" type="number" value={data.bodyFat} onChange={(e) => update("bodyFat", e.target.value)} className="h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground" />
    </div>,
    <div key="goal" className="space-y-5">
      <h2 className="font-display text-xl font-bold">Fitness Goal</h2>
      <p className="text-sm text-muted-foreground">What are you primarily looking to achieve?</p>
      <div className="space-y-3">
        {goals.map((g) => <OptionButton key={g} label={g} selected={data.goal === g} onClick={() => update("goal", g)} />)}
      </div>
    </div>,
    <div key="activity" className="space-y-5">
      <h2 className="font-display text-xl font-bold">Activity & Experience</h2>
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Activity Level</label>
        <div className="flex gap-2 flex-wrap">
          {activityLevels.map((a) => <OptionButton key={a} label={a} selected={data.activityLevel === a} onClick={() => update("activityLevel", a)} />)}
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Workout Experience</label>
        <div className="flex gap-2 flex-wrap">
          {experiences.map((e) => <OptionButton key={e} label={e} selected={data.experience === e} onClick={() => update("experience", e)} />)}
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Equipment Access</label>
        <div className="flex gap-2 flex-wrap">
          {equipmentOptions.map((eq) => <OptionButton key={eq} label={eq} selected={data.equipment === eq} onClick={() => update("equipment", eq)} />)}
        </div>
      </div>
    </div>,
    <div key="diet" className="space-y-5">
      <h2 className="font-display text-xl font-bold">Dietary Preferences</h2>
      <div>
        <label className="text-xs text-muted-foreground mb-2 block">Diet Type</label>
        <div className="flex gap-2 flex-wrap">
          {dietaryPrefs.map((d) => <OptionButton key={d} label={d} selected={data.dietaryPreference === d} onClick={() => update("dietaryPreference", d)} />)}
        </div>
      </div>
      <Input placeholder="Allergies (comma separated)" value={data.allergies} onChange={(e) => update("allergies", e.target.value)} className="h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground" />
    </div>,
    <div key="location" className="space-y-5">
      <h2 className="font-display text-xl font-bold">Almost Done!</h2>
      <p className="text-sm text-muted-foreground">Your location helps us suggest relevant food and gym options.</p>
      <Input placeholder="City / Region" value={data.location} onChange={(e) => update("location", e.target.value)} className="h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground" />
    </div>,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16 pb-8">
      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-300", i <= step ? "bg-primary" : "bg-secondary")} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="flex-1">
          {steps[step]}
        </motion.div>
      </AnimatePresence>
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button variant="glass" size="lg" onClick={() => setStep(step - 1)} className="px-4">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        {step < totalSteps - 1 ? (
          <Button variant="glow" size="lg" className="flex-1" onClick={() => setStep(step + 1)}>
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="glow" size="lg" className="flex-1" onClick={handleFinish} disabled={saving}>
            {saving ? "Saving..." : "Get Started"} <Check className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
