import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/speak-button";
import { lessons, levels } from "@/data/curriculum";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useProgress } from "@/lib/progress-store";

export const Route = createFileRoute("/me")({ component: MePage });

function MePage() {
  const { user, isPending } = useCurrentUserState();
  const completed = useProgress((s) => s.completed);
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak);
  const doneIds = Object.keys(completed);
  const vocab = lessons
    .filter((l) => doneIds.includes(l.id))
    .flatMap((l) =>
      l.sections.flatMap((s) => (s.type === "vocab" ? s.items : [])),
    )
    .slice(0, 24);

  const estimated =
    levels
      .slice()
      .reverse()
      .find((lv) => {
        const inLevel = lessons.filter((l) => l.level === lv.id);
        const done = inLevel.filter((l) => doneIds.includes(l.id)).length;
        return done >= Math.ceil(inLevel.length * 0.5);
      })?.id ?? "A1";

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-medium tracking-tight">You</h1>
      <p className="mt-2 text-muted">
        A quiet record. No leagues. Show up, sip, leave.
      </p>

      <section className="mt-6 rounded-[var(--radius-xl)] bg-surface p-5 shadow-[var(--shadow-border)]">
        {isPending ? (
          <div className="h-8 w-40 animate-pulse rounded bg-surface-2" />
        ) : user ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{user.displayName ?? "Signed in"}</p>
              <p className="text-sm text-muted">{user.primaryEmail}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        ) : (
          <div>
            <p className="font-medium">Learning as a guest</p>
            <p className="mt-1 text-sm text-muted">
              Sign in to keep the streak if you switch phones.
            </p>
            <Button asChild className="mt-4">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        )}
      </section>

      <section className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-[var(--radius-lg)] bg-surface p-3 shadow-[var(--shadow-border)]">
          <p className="text-xs text-muted">Streak</p>
          <p className="font-display text-2xl tabular-nums">{streak}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] bg-surface p-3 shadow-[var(--shadow-border)]">
          <p className="text-xs text-muted">Around</p>
          <p className="font-display text-2xl">{estimated}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] bg-surface p-3 shadow-[var(--shadow-border)]">
          <p className="text-xs text-muted">XP</p>
          <p className="font-display text-2xl tabular-nums">{xp}</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-medium">Phrasebook</h2>
        <p className="mt-1 text-sm text-muted">
          Words from lessons you have finished. Tap the speaker.
        </p>
        {vocab.length === 0 ? (
          <p className="mt-4 text-sm text-subtle">Finish a lesson to fill this page.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border rounded-[var(--radius-lg)] bg-surface shadow-[var(--shadow-border)]">
            {vocab.map((item) => (
              <li key={item.pt + item.en} className="flex items-center gap-2 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.pt}</p>
                  <p className="truncate text-sm text-muted">{item.en}</p>
                </div>
                <SpeakButton text={item.pt} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
