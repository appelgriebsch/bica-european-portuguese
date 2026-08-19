import { useEffect, useRef } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { fetchProgress, saveProgressSnapshot } from "@/lib/progress-server";
import { useProgress } from "@/lib/progress-store";

export function ProgressSync() {
  const { user, isPending } = useCurrentUserState();
  const hydrated = useProgress((s) => s.hydrated);
  const mergeRemote = useProgress((s) => s.mergeRemote);
  const did = useRef(false);

  useEffect(() => {
    if (isPending || !user || !hydrated || did.current) return;
    did.current = true;
    void (async () => {
      try {
        const remote = await fetchProgress();
        mergeRemote(remote);
        const snap = useProgress.getState().snapshot();
        await saveProgressSnapshot({ data: snap });
      } catch {
        /* signed-out race or network — local progress still works */
      }
    })();
  }, [user, isPending, hydrated, mergeRemote]);

  return null;
}
