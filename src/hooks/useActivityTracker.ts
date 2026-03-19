import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type EventType =
  | "page_view"
  | "workout_generated"
  | "diet_generated"
  | "food_scanned"
  | "progress_logged"
  | "login"
  | "signup"
  | "profile_updated";

export const useActivityTracker = () => {
  const { user } = useAuth();

  const trackEvent = useCallback(
    async (eventType: EventType, eventData: Record<string, any> = {}, page?: string) => {
      if (!user) return;
      try {
        await (supabase.from("user_activity_logs") as any).insert({
          user_id: user.id,
          event_type: eventType,
          event_data: eventData,
          page: page || window.location.pathname,
        });
      } catch (err) {
        // silently fail - tracking should never break the app
        console.warn("Activity tracking failed:", err);
      }
    },
    [user]
  );

  const trackPageView = useCallback(
    (pageName: string) => {
      trackEvent("page_view", { page_name: pageName }, pageName);
    },
    [trackEvent]
  );

  return { trackEvent, trackPageView };
};

/** Track login and update profile counters */
export const trackLogin = async (userId: string) => {
  try {
    await (supabase.from("profiles") as any)
      .update({
        last_login_at: new Date().toISOString(),
        login_count: undefined, // will use RPC below
      })
      .eq("id", userId);

    // Increment login_count using raw update
    await supabase.rpc("increment_login_count" as any, { user_id_input: userId });
  } catch {
    // fallback: just update last_login_at
    await (supabase.from("profiles") as any)
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", userId);
  }
};

export const incrementProfileCounter = async (
  userId: string,
  field: "total_workouts_generated" | "total_food_scans" | "total_diet_plans_generated"
) => {
  try {
    await supabase.rpc("increment_profile_counter" as any, {
      user_id_input: userId,
      counter_field: field,
    });
  } catch (err) {
    console.warn("Counter increment failed:", err);
  }
};
