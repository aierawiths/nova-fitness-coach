import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, Dumbbell, Brain, Flame, TrendingUp, Trophy,
  Check, Star, Sparkles, Crown, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const benefits = [
  { icon: Dumbbell, label: "Personalized AI workout plan" },
  { icon: Flame, label: "Smart fat loss & muscle gain strategy" },
  { icon: Brain, label: "Custom diet optimization" },
  { icon: TrendingUp, label: "Progress tracking & streak system" },
  { icon: Trophy, label: "Access to active member leaderboard" },
];

const topMembers = [
  { name: "Arjun", avatar: "", badge: "gold" },
  { name: "Priya", avatar: "", badge: "gold" },
  { name: "Rohan", avatar: "", badge: "silver" },
  { name: "Sneha", avatar: "", badge: "gold" },
  { name: "Vikram", avatar: "", badge: "silver" },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [.25,.46,.45,.94] as const } },
};

const Subscription = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<"silver" | "gold">("gold");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-5 pt-4 pb-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center mb-6"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          {/* Silhouette illustration */}
          <div className="relative mx-auto w-24 h-24 mb-5">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 blur-xl" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="w-14 h-14 text-foreground/70" fill="currentColor">
                <path d="M32 8a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm-4 16h8a6 6 0 0 1 6 6v8a2 2 0 0 1-2 2h-2v16a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V40h-2a2 2 0 0 1-2-2v-8a6 6 0 0 1 6-6Z" />
              </svg>
            </div>
          </div>

          <h1 className="font-display text-[26px] font-bold text-foreground leading-tight">
            Unlock Your Best<br />Body Yet
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-[260px] mx-auto">
            Choose your transformation level and start today.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-3 mb-8"
        >
          {benefits.map(({ icon: Icon, label }) => (
            <motion.div key={label} variants={fadeUp} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[13px] text-foreground/90 font-medium">{label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-1 p-1 rounded-xl bg-secondary/60 mb-5 max-w-[220px] mx-auto"
        >
          {(["monthly", "yearly"] as const).map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all capitalize",
                billingCycle === cycle
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {cycle}
              {cycle === "yearly" && (
                <span className="ml-1 text-primary text-[10px]">Save</span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Plan Cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3 mb-6"
        >
          {/* Silver Plan */}
          <button
            onClick={() => setSelectedPlan("silver")}
            className={cn(
              "w-full p-4 rounded-2xl border-2 transition-all text-left relative",
              selectedPlan === "silver"
                ? "border-[hsl(0,0%,72%)] bg-[hsl(0,0%,72%)]/5"
                : "border-border/40 bg-card/50"
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-[hsl(0,0%,72%)]" />
                  <p className="text-sm font-bold text-foreground">Silver Plan</p>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium mb-2">
                  Starter Transformation
                </p>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 transition-all",
                selectedPlan === "silver" ? "border-primary bg-primary" : "border-muted-foreground/40"
              )}>
                {selectedPlan === "silver" && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-xl font-display font-bold text-foreground">
                {billingCycle === "monthly" ? "₹499" : "₹3,999"}
              </span>
              <span className="text-xs text-muted-foreground">
                /{billingCycle === "monthly" ? "month" : "year"}
              </span>
            </div>

            <div className="space-y-1.5">
              {["Personalized workouts", "Basic diet plan", "Progress tracking", "Silver profile badge"].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-[hsl(0,0%,72%)]" />
                  <span className="text-[11px] text-foreground/70">{f}</span>
                </div>
              ))}
            </div>
          </button>

          {/* Gold Plan */}
          <button
            onClick={() => setSelectedPlan("gold")}
            className={cn(
              "w-full p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden",
              selectedPlan === "gold"
                ? "border-[hsl(43,96%,56%)] bg-[hsl(43,96%,56%)]/5"
                : "border-border/40 bg-card/50"
            )}
          >
            {/* Most Popular Badge */}
            <div className="absolute top-0 right-0">
              <div className="px-2.5 py-1 rounded-bl-xl text-[9px] font-bold uppercase tracking-wider text-primary-foreground"
                style={{ background: "linear-gradient(135deg, hsl(43 96% 56%), hsl(35 100% 45%))" }}
              >
                Most Popular
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-4 h-4 text-[hsl(43,96%,56%)]" />
                  <p className="text-sm font-bold text-foreground">Gold Plan</p>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium mb-2">
                  Elite Transformation
                </p>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 transition-all",
                selectedPlan === "gold" ? "border-primary bg-primary" : "border-muted-foreground/40"
              )}>
                {selectedPlan === "gold" && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-xl font-display font-bold text-foreground">
                {billingCycle === "monthly" ? "₹999" : "₹7,999"}
              </span>
              <span className="text-xs text-muted-foreground">
                /{billingCycle === "monthly" ? "month" : "year"}
              </span>
              {billingCycle === "yearly" && (
                <span className="ml-1 text-[10px] font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded-full">
                  Best Value
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              {[
                "Everything in Silver",
                "Advanced AI optimization",
                "Custom macro nutrition",
                "Priority updates",
                "Gold profile badge",
                "Featured in Top Active Users",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-[hsl(43,96%,56%)]" />
                  <span className="text-[11px] text-foreground/70">{f}</span>
                </div>
              ))}
            </div>

            {/* Gold glow */}
            {selectedPlan === "gold" && (
              <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(circle, hsl(43 96% 56%), transparent)" }}
              />
            )}
          </button>
        </motion.div>

        {/* Free trial note */}
        <p className="text-center text-xs text-muted-foreground mb-5">
          7-Day Free Trial · Cancel Anytime
        </p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Button variant="glow" size="lg" className="w-full">
            <Sparkles className="w-4 h-4" />
            Start My Transformation
          </Button>
        </motion.div>

        {/* Top Active Members Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-8 relative"
        >
          <div className="rounded-2xl bg-card/60 backdrop-blur-md border border-border/30 p-4 overflow-hidden relative">
            {/* Blur overlay */}
            <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-10 rounded-2xl" />
            
            <div className="relative z-0">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs font-semibold text-foreground/80">Top Active Members This Week</p>
              </div>
              
              <div className="flex items-center gap-3">
                {topMembers.map((member, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <Avatar className="w-10 h-10 border-2" style={{
                        borderColor: member.badge === "gold" ? "hsl(43 96% 56%)" : "hsl(0 0% 72%)"
                      }}>
                        <AvatarFallback className="bg-secondary text-foreground text-[10px] font-bold">
                          {member.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px]",
                        member.badge === "gold"
                          ? "bg-[hsl(43,96%,56%)] text-primary-foreground"
                          : "bg-[hsl(0,0%,72%)] text-primary-foreground"
                      )}>
                        {member.badge === "gold" ? "G" : "S"}
                      </div>
                    </div>
                    <span className="text-[9px] text-muted-foreground">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Upgrade prompt (above blur) */}
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <p className="text-xs font-semibold text-foreground text-center px-6">
                Upgrade to <span className="text-[hsl(43,96%,56%)]">Gold</span> to be featured here
              </p>
            </div>
          </div>
        </motion.div>

        {/* Legal footer */}
        <p className="text-[10px] text-muted-foreground/60 text-center mt-6 leading-relaxed px-4">
          Subscription auto-renews unless cancelled at least 24 hours before the renewal date. 
          By subscribing you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default Subscription;
