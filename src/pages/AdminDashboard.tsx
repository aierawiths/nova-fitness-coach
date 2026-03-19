import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users, Activity, Dumbbell, ScanLine, TrendingUp, Flame,
  ChevronRight, ArrowLeft, Search, Clock, BarChart3, Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface OverviewData {
  totalUsers: number;
  activeToday: number;
  totalWorkouts: number;
  totalDietPlans: number;
  totalFoodScans: number;
  totalProgressLogs: number;
  totalActivityEvents: number;
  profiles: any[];
  recentActivity: any[];
}

interface UserDetail {
  profile: any;
  workouts: any[];
  dietPlans: any[];
  foodLogs: any[];
  progressLogs: any[];
  activityLogs: any[];
}

const eventLabels: Record<string, string> = {
  page_view: "Page View",
  workout_generated: "Workout Generated",
  diet_generated: "Diet Generated",
  food_scanned: "Food Scanned",
  progress_logged: "Progress Logged",
  login: "Login",
  signup: "Signup",
  profile_updated: "Profile Updated",
};

const eventColors: Record<string, string> = {
  page_view: "bg-secondary text-secondary-foreground",
  workout_generated: "bg-primary/15 text-primary",
  diet_generated: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  food_scanned: "bg-accent/15 text-accent",
  progress_logged: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  login: "bg-green-500/15 text-green-600 dark:text-green-400",
  signup: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  profile_updated: "bg-secondary text-secondary-foreground",
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number | string; color: string }) => (
  <div className="p-4 rounded-2xl bg-card border border-border/30 shadow-sm">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-2xl font-display font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground mt-1">{label}</p>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"overview" | "users" | "activity" | "user-detail">("overview");

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Please log in", variant: "destructive" });
        navigate("/login");
        return;
      }
      // Use the query param approach by constructing URL manually
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-analytics?action=overview`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setOverview(data);
    } catch (err: any) {
      toast({ title: "Error loading analytics", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const fetchUserDetail = async (userId: string) => {
    setUserLoading(true);
    setSelectedUserId(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-analytics?action=user-detail&userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setSelectedUser(data);
      setView("user-detail");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setUserLoading(false);
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const filteredProfiles = overview?.profiles?.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.id || "").toLowerCase().includes(q) ||
      (p.goal || "").toLowerCase().includes(q)
    );
  }) || [];

  const formatDate = (d: string) => {
    if (!d) return "Never";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Activity className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  // User detail view
  if (view === "user-detail" && selectedUser) {
    const p = selectedUser.profile;
    return (
      <div className="min-h-screen bg-background safe-top">
        <div className="px-5 pt-5 pb-28">
          <button onClick={() => setView("users")} className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Users
          </button>

          <h1 className="font-display text-2xl font-bold text-foreground">{p?.name || "Unknown User"}</h1>
          <p className="text-xs text-muted-foreground mt-1">ID: {p?.id?.slice(0, 8)}...</p>

          {/* Profile Info */}
          <div className="mt-5 p-4 rounded-2xl bg-card border border-border/30 space-y-2">
            <h3 className="text-sm font-bold text-foreground mb-3">Profile Details</h3>
            {[
              ["Age", p?.age],
              ["Gender", p?.gender],
              ["Height", p?.height ? `${p.height} cm` : null],
              ["Weight", p?.weight ? `${p.weight} kg` : null],
              ["Body Fat", p?.body_fat ? `${p.body_fat}%` : null],
              ["Goal", p?.goal],
              ["Activity Level", p?.activity_level],
              ["Experience", p?.experience],
              ["Equipment", p?.equipment],
              ["Diet Preference", p?.dietary_preference],
              ["Allergies", p?.allergies],
              ["Location", p?.location],
              ["Phone", p?.phone],
              ["Onboarding Done", p?.onboarding_completed ? "Yes" : "No"],
              ["Last Login", formatDate(p?.last_login_at)],
              ["Login Count", p?.login_count || 0],
              ["Workouts Generated", p?.total_workouts_generated || 0],
              ["Food Scans", p?.total_food_scans || 0],
              ["Diet Plans", p?.total_diet_plans_generated || 0],
              ["Joined", formatDate(p?.created_at)],
            ].map(([label, value]) => (
              <div key={label as string} className="flex items-center justify-between py-1.5 border-b border-border/10 last:border-0">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-foreground">{value || "—"}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <StatCard icon={Dumbbell} label="Workouts" value={selectedUser.workouts.length} color="bg-primary/10 text-primary" />
            <StatCard icon={Flame} label="Diet Plans" value={selectedUser.dietPlans.length} color="bg-orange-500/10 text-orange-500" />
            <StatCard icon={ScanLine} label="Food Scans" value={selectedUser.foodLogs.length} color="bg-accent/10 text-accent" />
            <StatCard icon={TrendingUp} label="Progress Logs" value={selectedUser.progressLogs.length} color="bg-blue-500/10 text-blue-500" />
          </div>

          {/* Recent Activity */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-foreground mb-3">Activity Timeline</h3>
            <div className="space-y-2">
              {selectedUser.activityLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No activity recorded yet</p>
              ) : (
                selectedUser.activityLogs.map((log: any) => (
                  <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/20">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${eventColors[log.event_type] || "bg-secondary text-secondary-foreground"}`}>
                      {eventLabels[log.event_type] || log.event_type}
                    </span>
                    <span className="text-xs text-muted-foreground flex-1">{log.page || "—"}</span>
                    <span className="text-[10px] text-muted-foreground">{formatDate(log.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Food Logs */}
          {selectedUser.foodLogs.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-foreground mb-3">Recent Food Scans</h3>
              <div className="space-y-2">
                {selectedUser.foodLogs.map((log: any) => (
                  <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/20">
                    <span className="text-sm font-medium text-foreground flex-1 capitalize">{log.food_name}</span>
                    <span className="text-xs text-muted-foreground">{log.estimated_calories} kcal</span>
                    <span className="text-[10px] text-muted-foreground">{formatDate(log.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-5 pt-5 pb-28">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-1">User analytics & activity tracking</p>
          </div>
          <button onClick={() => navigate("/dashboard")} className="text-xs text-muted-foreground flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "overview" as const, label: "Overview", icon: BarChart3 },
            { key: "users" as const, label: "Users", icon: Users },
            { key: "activity" as const, label: "Activity", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                view === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {view === "overview" && overview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Users} label="Total Users" value={overview.totalUsers} color="bg-primary/10 text-primary" />
              <StatCard icon={Activity} label="Active Today" value={overview.activeToday} color="bg-green-500/10 text-green-500" />
              <StatCard icon={Dumbbell} label="Workouts" value={overview.totalWorkouts} color="bg-primary/10 text-primary" />
              <StatCard icon={Flame} label="Diet Plans" value={overview.totalDietPlans} color="bg-orange-500/10 text-orange-500" />
              <StatCard icon={ScanLine} label="Food Scans" value={overview.totalFoodScans} color="bg-accent/10 text-accent" />
              <StatCard icon={TrendingUp} label="Progress Logs" value={overview.totalProgressLogs} color="bg-blue-500/10 text-blue-500" />
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/30">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {overview.recentActivity.slice(0, 15).map((log: any) => (
                  <div key={log.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/30 border border-border/10">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${eventColors[log.event_type] || "bg-secondary text-secondary-foreground"}`}>
                      {eventLabels[log.event_type] || log.event_type}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex-1 truncate">{log.user_id?.slice(0, 8)}...</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(log.created_at)}</span>
                  </div>
                ))}
                {overview.recentActivity.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No activity yet. Events will appear as users interact with the app.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {view === "users" && overview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or goal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 bg-card border-border/30 rounded-xl"
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-3">{filteredProfiles.length} users found</p>

            <div className="space-y-2">
              {filteredProfiles.map((profile: any) => (
                <motion.button
                  key={profile.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fetchUserDetail(profile.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/30 shadow-sm text-left group transition-all hover:border-primary/20"
                  disabled={userLoading && selectedUserId === profile.id}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="font-display text-sm font-bold text-primary">
                      {(profile.name || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-foreground truncate">{profile.name || "Unnamed"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{profile.goal || "No goal"}</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground">
                        {profile.last_login_at ? `Last: ${formatDate(profile.last_login_at)}` : "Never logged in"}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                        {profile.total_workouts_generated || 0} workouts
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
                        {profile.total_food_scans || 0} scans
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-medium">
                        {profile.login_count || 0} logins
                      </span>
                    </div>
                  </div>
                  {userLoading && selectedUserId === profile.id ? (
                    <Activity className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:translate-x-1 transition-transform" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Activity Tab */}
        {view === "activity" && overview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-xs text-muted-foreground mb-3">{overview.totalActivityEvents} total events</p>
            <div className="space-y-2">
              {overview.recentActivity.map((log: any) => (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/20">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${eventColors[log.event_type] || "bg-secondary text-secondary-foreground"}`}>
                    {eventLabels[log.event_type] || log.event_type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => fetchUserDetail(log.user_id)}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      {log.user_id?.slice(0, 8)}...
                    </button>
                    {log.page && <span className="text-[10px] text-muted-foreground ml-2">{log.page}</span>}
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(log.created_at)}</span>
                </div>
              ))}
              {overview.recentActivity.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No activity events yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Events will appear as users use the app</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
