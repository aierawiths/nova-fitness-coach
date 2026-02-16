import { NavLink, useLocation } from "react-router-dom";
import { Dumbbell, Apple, ScanLine, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/dashboard", icon: Dumbbell, label: "Workout" },
  { to: "/diet", icon: Apple, label: "Diet" },
  { to: "/scan", icon: ScanLine, label: "Scan" },
  { to: "/progress", icon: TrendingUp, label: "Progress" },
  { to: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass safe-bottom border-t border-border/30">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-200",
                isActive && "bg-primary/10"
              )}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
