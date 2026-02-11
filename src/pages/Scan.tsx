import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera, ImageIcon, Sparkles, AlertTriangle } from "lucide-react";

interface ScanResult {
  foodName: string;
  estimatedCalories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  confidence: string;
}

const Scan = () => {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scansToday] = useState(1);
  const maxFreeScans = 3;

  const handleScan = (source: "camera" | "gallery") => {
    setScanning(true);
    // Will be replaced with real camera/gallery + AI
    setTimeout(() => {
      setResult({
        foodName: "Grilled Chicken Salad",
        estimatedCalories: "380",
        protein: "35g",
        carbs: "18g",
        fat: "16g",
        fiber: "5g",
        confidence: "87%",
      });
      setScanning(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-6 pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">Food Scanner</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered nutrition analysis</p>
        </motion.div>

        {/* Scan count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-5 flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/30"
        >
          <span className="text-xs text-muted-foreground">Daily scans used</span>
          <span className="text-sm font-semibold text-foreground">{scansToday} / {maxFreeScans}</span>
        </motion.div>

        {/* Scan area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 aspect-square rounded-3xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center bg-card/30 relative overflow-hidden"
        >
          {scanning ? (
            <div className="flex flex-col items-center gap-3">
              <Sparkles className="w-10 h-10 text-primary animate-pulse-glow" />
              <p className="text-sm text-muted-foreground">Analyzing food...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center px-8">
                Take a photo of your food or upload from gallery
              </p>
            </div>
          )}
        </motion.div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-5">
          <Button variant="glow" className="flex-1" onClick={() => handleScan("camera")} disabled={scanning}>
            <Camera className="w-4 h-4" /> Camera
          </Button>
          <Button variant="glass" className="flex-1" onClick={() => handleScan("gallery")} disabled={scanning}>
            <ImageIcon className="w-4 h-4" /> Gallery
          </Button>
        </div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 rounded-2xl bg-card border border-border/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-foreground">{result.foodName}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {result.confidence} match
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Calories", value: result.estimatedCalories, unit: "kcal" },
                { label: "Protein", value: result.protein },
                { label: "Carbs", value: result.carbs },
                { label: "Fat", value: result.fat },
                { label: "Fiber", value: result.fiber },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-secondary/50">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-base font-semibold text-foreground mt-0.5">
                    {item.value} {item.unit || ""}
                  </p>
                </div>
              ))}
            </div>

            <Button variant="glow" className="w-full mt-4">
              Save to Food Log
            </Button>

            <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Nutrition values are AI-estimated and may vary. Always consult a professional for dietary advice.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Scan;
