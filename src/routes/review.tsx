import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { SpeakButton } from "@/components/speak-button";
import { Button } from "@/components/ui/button";
import { vocabFromCompleted } from "@/data/curriculum";
import type { VocabItem } from "@/data/types";
import { useProgress } from "@/lib/progress-store";

export const Route = createFileRoute("/review")({ component: ReviewPage });

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function ReviewPage() {
  const completed = useProgress((s) => s.completed);
  const pool = useMemo(() => {
    const items = vocabFromCompleted(Object.keys(completed));
    const unique = new Map<string, VocabItem>();
    for (const item of items) unique.set(item.pt, item);
    return shuffle([...unique.values()]).slice(0, 12);
  }, [completed]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [done, setDone] = useState(false);

  const card = pool[index];
  const total = pool.length;

  function mark(yes: boolean) {
    if (yes) setKnown((n) => n + 1);
    if (index >= total - 1) {
      setDone(true);
      return;
    }
    setIndex((n) => n + 1);
    setFlipped(false);
  }

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-medium tracking-tight">Palavras</h1>
      <p className="mt-2 text-muted">
        Front in Portuguese. Flip. Be honest. Three minutes, then back to the day.
      </p>

      {total === 0 ? (
        <div className="mt-8 rounded-[var(--radius-lg)] bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="font-medium">Nothing to review yet.</p>
          <p className="mt-1 text-sm text-muted">Finish a lesson on the path first.</p>
          <Button asChild className="mt-4">
            <Link to="/path">Open the path</Link>
          </Button>
        </div>
      ) : done ? (
        <div className="mt-8">
          <h2 className="font-display text-2xl font-medium">Boa.</h2>
          <p className="mt-2 text-muted">
            {known}/{total} felt ready. The rest will wait until tomorrow.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link to="/">Today</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/practice">Practice</Link>
            </Button>
          </div>
        </div>
      ) : (
        card && (
          <div className="mt-8">
            <p className="text-xs tabular-nums text-subtle">
              {index + 1} / {total}
            </p>
            <button
              type="button"
              onClick={() => setFlipped((v) => !v)}
              className="mt-3 min-h-48 w-full rounded-[var(--radius-xl)] bg-surface p-6 text-left shadow-[var(--shadow-border)]"
            >
              <p className="font-display text-3xl font-medium">{card.pt}</p>
              <p className="mt-1 text-sm text-subtle">{card.hint}</p>
              {flipped ? (
                <div className="mt-6">
                  <p className="text-lg text-fg">{card.en}</p>
                  <p className="mt-3 text-sm text-muted">{card.examplePt}</p>
                  <p className="text-sm text-subtle">{card.exampleEn}</p>
                </div>
              ) : (
                <p className="mt-10 text-sm text-subtle">Tap to flip</p>
              )}
            </button>
            <div className="mt-3 flex items-center justify-between">
              <SpeakButton text={card.examplePt || card.pt} />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => mark(false)}>
                  Again
                </Button>
                <Button onClick={() => mark(true)}>I know this</Button>
              </div>
            </div>
          </div>
        )
      )}
    </AppShell>
  );
}
