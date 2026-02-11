import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Plus, Scale, Ruler } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProgressEntry {
  date: string;
  weight: number;
  bodyFat?: number;
}

const sampleProgress: ProgressEntry[] = [
  { date: "Jan 1", weight: 85, bodyFat: 22 },
  { date: "Jan 8", weight: 84.3, bodyFat: 21.5 },
  { date: "Jan 15", weight: 83.8, bodyFat: 21 },
  { date: "Jan 22", weight: 83.2, bodyFat: 20.5 },
  { date: "Jan 29", weight: 82.5, bodyFat: 20 },
  { date: "Feb 5", weight: 82.1, bodyFat: 19.5 },
];

const Progress = () => {
  const [entries] = useState<ProgressEntry[]>(sampleProgress);
  const [showForm, setShowForm] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newBodyFat, setNewBodyFat] = useState("");

  const latestEntry = entries[entries.length - 1];
  const firstEntry = entries[0];
  const weightChange = latestEntry ? (latestEntry.weight - firstEntry.weight).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-6 pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">Progress</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your fitness journey</p>
        </motion.div>

        {/* Summary cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mt-5"
        >
          <div className="p-3 rounded-2xl bg-card border border-border/30 text-center">
            <Scale className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-display font-bold text-foreground">{latestEntry?.weight}</p>
            <p className="text-[10px] text-muted-foreground">Current (kg)</p>
          </div>
          <div className="p-3 rounded-2xl bg-card border border-border/30 text-center">
            <TrendingUp className="w-4 h-4 text-accent mx-auto mb-1" />
            <p className="text-lg font-display font-bold text-foreground">{weightChange}</p>
            <p className="text-[10px] text-muted-foreground">Change (kg)</p>
          </div>
          <div className="p-3 rounded-2xl bg-card border border-border/30 text-center">
            <Ruler className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-display font-bold text-foreground">{latestEntry?.bodyFat}%</p>
            <p className="text-[10px] text-muted-foreground">Body Fat</p>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 rounded-2xl bg-card border border-border/30"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Weight Progress</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={entries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 16%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(240 5% 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={["auto", "auto"]} tick={{ fill: "hsl(240 5% 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(240 12% 8%)",
                  border: "1px solid hsl(240 10% 16%)",
                  borderRadius: "12px",
                  color: "hsl(0 0% 95%)",
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="weight" stroke="hsl(72 85% 58%)" strokeWidth={2.5} dot={{ fill: "hsl(72 85% 58%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Log entry */}
        <Button variant="glow" className="w-full mt-5" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Log Progress
        </Button>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-4 rounded-2xl bg-card border border-border/30 space-y-3"
          >
            <Input
              placeholder="Weight (kg)"
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground"
            />
            <Input
              placeholder="Body Fat % (optional)"
              type="number"
              value={newBodyFat}
              onChange={(e) => setNewBodyFat(e.target.value)}
              className="h-12 bg-secondary border-border/50 text-foreground placeholder:text-muted-foreground"
            />
            <Button variant="glow" className="w-full">
              Save Entry
            </Button>
          </motion.div>
        )}

        {/* History */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Recent Entries</h3>
          <div className="space-y-2">
            {[...entries].reverse().map((entry, idx) => (
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
      </div>
    </div>
  );
};

export default Progress;
