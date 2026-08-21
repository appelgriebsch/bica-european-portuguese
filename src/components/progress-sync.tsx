import { useEffect } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useProgress } from "@/lib/progress-store";
import { syncProgressWithAccount } from "@/lib/sync-progress";

/**
 * Pull the account, union it with this device, push the union back.
 * Runs on sign-in, on return to the tab, and when the line comes back.
 */
export function ProgressSync() {
  const { user, isPending } = useCurrentUserState();
  const hydrated = useProgress((s) => s.hydrated);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (useProgress.getState().hydrated) return;
    const persist = useProgress.persist;
    const unsub = persist.onFinishHydration(() => {
      useProgress.getState().markHydrated();
    });
    if (persist.hasHydrated()) useProgress.getState().markHydrated();
    else void persist.rehydrate();
    const fallback = window.setTimeout(() => useProgress.getState().markHydrated(), 800);
    return () => {
      unsub();
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (isPending || !userId || !hydrated) return;

    let cancelled = false;

    async function sync() {
      if (cancelled) return;
      await syncProgressWithAccount();
    }

    void sync();
    const onVisible = () => {
      if (document.visibilityState === "visible") void sync();
    };
    window.addEventListener("online", sync);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.removeEventListener("online", sync);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, isPending, hydrated]);

  return null;
}
