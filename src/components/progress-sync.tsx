import { useEffect } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { fetchProgress, saveProgressSnapshot } from "@/lib/progress-server";
import { useProgress } from "@/lib/progress-store";

/**
 * Pull the account, union it with this device, push the union back.
 * Runs on sign-in, on return to the tab, and when the line comes back —
 * not once, and never writes an empty snapshot over a full one (the
 * server takes greatest() / jsonb merge).
 */
export function ProgressSync() {
  const { user, isPending } = useCurrentUserState();
  const hydrated = useProgress((s) => s.hydrated);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (isPending || !userId || !hydrated) return;

    let cancelled = false;
    let inFlight = false;

    async function sync() {
      if (cancelled || inFlight) return;
      inFlight = true;
      try {
        const remote = await fetchProgress();
        if (cancelled) return;
        useProgress.getState().mergeRemote(remote);
        await saveProgressSnapshot({ data: useProgress.getState().snapshot() });
        if (!cancelled) useProgress.getState().markSynced();
      } catch {
        /* still local — retry on the next focus / online */
      } finally {
        inFlight = false;
      }
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
