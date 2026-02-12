import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Plus, Scale, Ruler, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ProgressEntry { date: string; weight: number; bodyFat?: number; }

const Progress = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newBodyFat, setNewBodyFat] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchEntries = async () => {
    const { data } = await (supabase.from("progress_logs") as any)
      .select("*").order("measurement_date", { ascending: true });
    const mapped = (data || []).map((d: any) => ({
      date: new Date(d.measurement_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      weight: Number(d.weight),
      bodyFat: d.body_fat ? Number(d.body_fat) : undefined,
    }));
    setEntries(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleSave = async () => {
    if (!newWeight || !user) return;
    setSaving(true);
    const { error } = await (supabase.from("progress_logs") as any).insert({
      user_id: user.id,
      weight: parseFloat(newWeight),
      body_fat: newBodyFat ? parseFloat(newBodyFat) : null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Progress logged!" });
      setNewWeight(""); setNewBodyFat(""); setShowForm(false);
      fetchEntries();
    }
  };

  const latestEntry = entries[entries.length - 1];
  const firstEntry = entries[0];
  const weightChange = latestEntry && firstEntry ? (latestEntry.weight - firstEntry.weight).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-6 pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">Progress</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your fitness journey</p>
        </motion.div>

        {loading ? (
          <div className="mt-8 flex justify-center"><Sparkles className="w-6 h-6 text-primary animate-pulse-glow" /></div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3 mt-5">
              <div className="p-3 rounded-2xl bg-card border border-border/30 text-center">
                <Scale className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-display font-bold text-foreground">{latestEntry?.weight || "—"}</p>
                <p className="text-[10px] text-muted-foreground">Current (kg)</p>
              </div>
              <div className="p-3 rounded-2xl bg-card border border-border/30 text-center">
                <TrendingUp className="w-4 h-4 text-accent mx-auto mb-1" />
                <p className="text-lg font-display font-bold text-foreground">{entries.length > 1 ? weightChange : "—"}</p>
                <p className="text-[10px] text-muted-foreground">Change (kg)</p>
              </div>
              <div className="p-3 rounded-2xl bg-card border border-border/30 text-center">
                <Ruler className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-display font-bold text-foreground">{latestEntry?.bodyFat ? `${latestEntry.bodyFat}%` : "—"}</p>
                <p className="text-[10px] text-muted-foreground">Body Fat</p>
              </div>
            </motion.div>

            {entries.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="mt-6 p-4 rounded-2xl bg-card border border-border/30">
                <h3 className="text-sm font-semibold text-foreground mb-4">Weight Progress</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={entries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 16%)" />
                    <XAxis dataKey="date" tick={{ fill: "hsl(240 5% 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={["auto", "auto"]} tick={{ fill: "hsl(240 5% 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(240 12% 8%)", border: "1px solid hsl(240 10% 16%)", borderRadius: "12px", color: "hsl(0 0% 95%)", fontSize: 12 }} />
                    <Line type="monotone" dataKey="weight" stroke="hsl(72 85% 58%)" strokeWidth={2.5} dot={{ fill: "hsl(72 85% 58%)", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </>
        )}

        <Button variant="glow" className="w-full mt-5" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Log Progress
        </Button>

        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-4 rounded-2xl bg-card border border-border/30 space-y-3">
            <Input placeholder="Weight (kg)" type="number" value={newWeight} onChange={(e) => setNewWeight(e.target.value)}
              className="h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground" />
            <Input placeholder="Body Fat % (optional)" type="number" value={newBodyFat} onChange={(e) => setNewBodyFat(e.target.value)}
              className="h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground" />
            <Button variant="glow" className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Entry"}
            </Button>
          </motion.div>
        )}

        {entries.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Recent Entries</h3>
            <div className="space-y-2">
              {[...entries].reverse().slice(0, 10).map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/20">
                  <span className="text-sm text-foreground">{entry.date}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-foreground font-medium">{entry.weight} kg</span>
                    {entry.bodyFat && <span className="text-muted-foreground">{entry.bodyFat}%</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
