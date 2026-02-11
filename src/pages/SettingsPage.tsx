import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Bell, Shield, FileText, Info,
  Trash2, Moon, Globe
} from "lucide-react";

const SettingsItem = ({ icon: Icon, label, onClick, destructive }: {
  icon: React.ElementType; label: string; onClick?: () => void; destructive?: boolean
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border/20 hover:bg-secondary transition-all"
  >
    <Icon className={`w-5 h-5 ${destructive ? "text-destructive" : "text-muted-foreground"}`} />
    <span className={`flex-1 text-left text-sm font-medium ${destructive ? "text-destructive" : "text-foreground"}`}>{label}</span>
    <ChevronRight className="w-4 h-4 text-muted-foreground" />
  </button>
);

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background safe-top">
      <div className="px-6 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-display text-xl font-bold text-foreground">Settings</h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* General */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">General</h3>
            <div className="space-y-2">
              <SettingsItem icon={Bell} label="Notifications" />
              <SettingsItem icon={Moon} label="Appearance" />
              <SettingsItem icon={Globe} label="Language" />
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Legal</h3>
            <div className="space-y-2">
              <SettingsItem icon={Shield} label="Privacy Policy" onClick={() => navigate("/legal/privacy")} />
              <SettingsItem icon={FileText} label="Terms & Conditions" onClick={() => navigate("/legal/terms")} />
              <SettingsItem icon={Info} label="Medical Disclaimer" onClick={() => navigate("/legal/disclaimer")} />
            </div>
          </div>

          {/* Danger */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Account</h3>
            <div className="space-y-2">
              <SettingsItem icon={Trash2} label="Delete Account" destructive />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
