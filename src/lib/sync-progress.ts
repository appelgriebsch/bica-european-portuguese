import { fetchProgress, saveProgressSnapshot } from "@/lib/progress-server";
import { useProgress } from "@/lib/progress-store";

/**
 * Pull the account, union it with this device, push the union.
 * Empty local + full remote → this device catches up.
 * Full local + empty remote → the account catches up.
 */
export async function syncProgressWithAccount(): Promise<{ ok: boolean; error?: string }> {
  const progress = useProgress.getState();
  if (progress.syncing) return { ok: true };
  progress.setSyncing(true);
  try {
    const remote = await fetchProgress();
    useProgress.getState().mergeRemote(remote);
    await saveProgressSnapshot({ data: useProgress.getState().snapshot() });
    useProgress.getState().markSynced();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not reach the account.";
    const friendly =
      message === "Unauthorized" || message.includes("Unauthorized")
        ? "Sign in again to save the path to this account."
        : "Could not reach the account. Try again.";
    useProgress.getState().setSyncError(friendly);
    return { ok: false, error: friendly };
  } finally {
    if (useProgress.getState().syncing) useProgress.getState().setSyncing(false);
  }
}
