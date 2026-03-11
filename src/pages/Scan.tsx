import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera, ImageIcon, Sparkles, AlertTriangle, Leaf, Wheat, Droplets, MapPin, Globe, Heart, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ScanResult {
  foodName: string;
  localName?: string;
  country?: string;
  cuisine?: string;
  description?: string;
  servingSize?: string;
  estimatedCalories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar?: string;
  sodium?: string;
  cholesterol?: string;
  vitamins?: string;
  minerals?: string;
  healthScore?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  confidence: string;
}

const NutritionCircle = ({ label, value, unit, color, max, icon }: {
  label: string; value: string; unit: string; color: string; max: number; icon?: React.ReactNode;
}) => {
  const numValue = parseFloat(value) || 0;
  const percentage = Math.min((numValue / max) * 100, 100);
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--secondary))" strokeWidth="5" />
          <motion.circle
            cx="40" cy="40" r="36" fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-foreground">{value}</span>
          <span className="text-[10px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
    </motion.div>
  );
};

const Scan = () => {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    setScanning(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = "";
    uint8Array.forEach((byte) => (binary += String.fromCharCode(byte)));
    const base64 = btoa(binary);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
        setScanning(false);
        return;
      }
      const res = await supabase.functions.invoke("analyze-food", {
        body: { imageBase64: base64 },
      });
      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);
      setResult(res.data);
      toast({ title: "Food analyzed successfully!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setScanning(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const healthScoreColor = (score: string) => {
    const n = parseInt(score) || 0;
    if (n >= 8) return "hsl(var(--primary))";
    if (n >= 5) return "hsl(var(--accent))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-6 pt-6 pb-32">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">Food Scanner</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered nutrition analysis • Google Gemini 3</p>
        </motion.div>

        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mt-6 aspect-square rounded-3xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center bg-card/30 relative overflow-hidden">
          {preview ? (
            <img src={preview} alt="Food" className="w-full h-full object-cover rounded-3xl" />
          ) : scanning ? (
            <div className="flex flex-col items-center gap-3">
              <Sparkles className="w-10 h-10 text-primary animate-pulse-glow" />
              <p className="text-sm text-muted-foreground">Analyzing with Gemini 3 Flash...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center px-8">Take a photo of your food or upload from gallery</p>
            </div>
          )}
        </motion.div>

        <div className="flex gap-3 mt-5">
          <Button variant="glow" className="flex-1" onClick={() => cameraInputRef.current?.click()} disabled={scanning}>
            <Camera className="w-4 h-4" /> Camera
          </Button>
          <Button variant="glass" className="flex-1" onClick={() => fileInputRef.current?.click()} disabled={scanning}>
            <ImageIcon className="w-4 h-4" /> Gallery
          </Button>
        </div>

        {scanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse-glow" />
            <p className="text-xs text-muted-foreground">Identifying food, calculating nutrients...</p>
          </motion.div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
            {/* Food Identity Card */}
            <div className="p-5 rounded-2xl bg-card border border-border/30">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold text-foreground">{result.foodName}</h3>
                  {result.localName && result.localName !== result.foodName && (
                    <p className="text-xs text-muted-foreground italic mt-0.5">{result.localName}</p>
                  )}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  result.confidence === "High" ? "bg-primary/15 text-primary" :
                  result.confidence === "Medium" ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive"
                }`}>
                  {result.confidence}
                </span>
              </div>

              {result.description && (
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{result.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {result.country && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                    <MapPin className="w-3 h-3" /> {result.country}
                  </span>
                )}
                {result.cuisine && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                    <Globe className="w-3 h-3" /> {result.cuisine}
                  </span>
                )}
                {result.servingSize && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                    ~{result.servingSize}g serving
                  </span>
                )}
              </div>

              {/* Diet badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {result.isVegetarian && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    <Leaf className="w-3 h-3" /> Vegetarian
                  </span>
                )}
                {result.isVegan && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    🌱 Vegan
                  </span>
                )}
                {result.isGlutenFree && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                    <Wheat className="w-3 h-3" /> Gluten-Free
                  </span>
                )}
              </div>
            </div>

            {/* Health Score */}
            {result.healthScore && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="p-4 rounded-2xl bg-card border border-border/30 flex items-center gap-4">
                <div className="relative w-14 h-14 shrink-0">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
                    <motion.circle
                      cx="28" cy="28" r="24" fill="none"
                      stroke={healthScoreColor(result.healthScore)}
                      strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 24}
                      initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 24 - ((parseInt(result.healthScore) || 0) / 10) * 2 * Math.PI * 24 }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-foreground">{result.healthScore}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                    <Heart className="w-4 h-4 text-primary" /> Health Score
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {parseInt(result.healthScore) >= 8 ? "Excellent nutritional value" :
                     parseInt(result.healthScore) >= 5 ? "Moderate nutritional value" : "Consider healthier alternatives"}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Main Macros - Circles */}
            <div className="p-5 rounded-2xl bg-card border border-border/30">
              <h4 className="text-sm font-semibold text-foreground mb-4">Macronutrients</h4>
              <div className="grid grid-cols-4 gap-2">
                <NutritionCircle label="Calories" value={result.estimatedCalories} unit="kcal" color="hsl(var(--primary))" max={800} />
                <NutritionCircle label="Protein" value={result.protein} unit="g" color="hsl(175, 70%, 45%)" max={60} />
                <NutritionCircle label="Carbs" value={result.carbs} unit="g" color="hsl(45, 90%, 55%)" max={100} />
                <NutritionCircle label="Fat" value={result.fat} unit="g" color="hsl(350, 70%, 55%)" max={50} />
              </div>
            </div>

            {/* Secondary Nutrients - Circles */}
            <div className="p-5 rounded-2xl bg-card border border-border/30">
              <h4 className="text-sm font-semibold text-foreground mb-4">More Nutrients</h4>
              <div className="grid grid-cols-4 gap-2">
                <NutritionCircle label="Fiber" value={result.fiber} unit="g" color="hsl(140, 60%, 50%)" max={30} />
                {result.sugar && <NutritionCircle label="Sugar" value={result.sugar} unit="g" color="hsl(30, 90%, 55%)" max={50} />}
                {result.sodium && <NutritionCircle label="Sodium" value={result.sodium} unit="mg" color="hsl(210, 60%, 55%)" max={2000} />}
                {result.cholesterol && <NutritionCircle label="Cholest." value={result.cholesterol} unit="mg" color="hsl(280, 60%, 55%)" max={300} />}
              </div>
            </div>

            {/* Vitamins & Minerals */}
            {(result.vitamins || result.minerals) && (
              <div className="p-5 rounded-2xl bg-card border border-border/30">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-primary" /> Micronutrients
                </h4>
                {result.vitamins && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground mb-1.5">Vitamins</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.vitamins.split(",").map((v, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {v.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.minerals && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Minerals</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.minerals.split(",").map((m, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                          {m.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">Nutrition values are AI-estimated and may vary by ±10-15%. Always consult a professional for dietary advice.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Scan;
