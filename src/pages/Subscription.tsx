import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Check, Sparkles, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const features = [
  "Unlimited AI food scans",
  "Weekly adaptive workout plans",
  "Advanced nutrition analytics",
  "Premium workout splits & periodization",
  "No advertisements",
  "Priority AI generation",
];

const Subscription = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-6 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Go <span className="text-gradient-primary">Premium</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Unlock the full power of AI-driven fitness
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 space-y-3"
        >
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </motion.div>

        {/* Plans */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-3"
        >
          <button
            onClick={() => setSelectedPlan("yearly")}
            className={cn(
              "w-full p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden",
              selectedPlan === "yearly"
                ? "border-primary bg-primary/5"
                : "border-border/30 bg-card"
            )}
          >
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground uppercase">
              Save 40%
            </div>
            <p className="text-sm font-semibold text-foreground">Yearly</p>
            <p className="text-2xl font-display font-bold text-foreground mt-1">
              $59.99<span className="text-sm font-normal text-muted-foreground">/year</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">$4.99/month, billed annually</p>
          </button>

          <button
            onClick={() => setSelectedPlan("monthly")}
            className={cn(
              "w-full p-4 rounded-2xl border-2 transition-all text-left",
              selectedPlan === "monthly"
                ? "border-primary bg-primary/5"
                : "border-border/30 bg-card"
            )}
          >
            <p className="text-sm font-semibold text-foreground">Monthly</p>
            <p className="text-2xl font-display font-bold text-foreground mt-1">
              $7.99<span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Cancel anytime</p>
          </button>
        </motion.div>

        <Button variant="glow" size="lg" className="w-full mt-6">
          <Sparkles className="w-4 h-4" />
          Start Free Trial
        </Button>

        <p className="text-[10px] text-muted-foreground text-center mt-4 leading-relaxed">
          7-day free trial, then {selectedPlan === "yearly" ? "$59.99/year" : "$7.99/month"}.
          Cancel anytime. Subscription auto-renews unless cancelled at least 24 hours before the renewal date.
        </p>
      </div>
    </div>
  );
};

export default Subscription;
