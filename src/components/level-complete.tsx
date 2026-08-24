import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { firstLessonOf, grammarDrills, nextCefr } from "@/data/curriculum";
import { masteryFor } from "@/data/level-mastery";
import type { CefrLevel } from "@/data/types";
import { useProgress } from "@/lib/progress-store";
import { cn } from "@/lib/utils";

export function LevelComplete({
  level,
  footnote,
  onClose,
  children,
}: {
  level: CefrLevel;
  footnote?: string;
  onClose?: () => void;
  children?: ReactNode;
}) {
  const mastery = masteryFor(level);
  const nxt = nextCefr(level);
  const nextLesson = nxt ? firstLessonOf(nxt) : undefined;
  const completed = useProgress((s) => s.completed);
  const nextGram = grammarDrills.find((d) => d.level === level && !completed[d.id]);

  useEffect(() => {
    if (!onClose) return;
    const close = onClose;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <article
      className="level-up flex flex-1 flex-col"
      aria-live="polite"
      aria-label={`${level} complete`}
    >
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-border)]">
        <img
          src={mastery.image}
          alt=""
          className="scene level-up-enter aspect-[16/9] w-full object-cover"
        />
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-2 top-2 bg-surface/90 text-fg hover:bg-surface"
          >
            <X />
          </Button>
        )}
      </div>

      <div className="level-seal-wrap mt-5 flex items-center gap-4">
        <LevelSeal />
        <div className="min-w-0">
          <p className="level-up-enter text-xs font-medium uppercase tracking-wider text-accent">
            {mastery.kicker}
          </p>
          <h1
            className="level-up-enter font-display text-4xl font-medium tracking-tight"
            style={{ animationDelay: "80ms" }}
          >
            {level}
          </h1>
        </div>
      </div>

      <p
        className="level-up-enter mt-3 font-display text-2xl font-medium"
        style={{ animationDelay: "140ms" }}
      >
        {mastery.headline}
      </p>
      <p
        className="level-up-enter mt-2 text-lg text-fg"
        style={{ animationDelay: "200ms" }}
      >
        {mastery.phrase.pt}
      </p>
      <p
        className="level-up-enter text-sm text-muted"
        style={{ animationDelay: "240ms" }}
      >
        {mastery.phrase.en}
        {footnote ? ` · ${footnote}` : ""}
      </p>

      <h2
        className="level-up-enter mt-8 text-xs font-medium uppercase tracking-wider text-accent"
        style={{ animationDelay: "300ms" }}
      >
        Agora consegue · You can now
      </h2>
      <ul className="mt-3 space-y-2">
        {mastery.canNow.map((line, i) => (
          <li
            key={line}
            className="level-up-enter flex gap-3 rounded-[var(--radius-md)] bg-surface p-3 shadow-[var(--shadow-border)]"
            style={{ animationDelay: `${360 + i * 80}ms` }}
          >
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-success text-success-fg">
              <Check className="size-3.5" strokeWidth={2.5} />
            </span>
            <p className="text-sm leading-snug">{line}</p>
          </li>
        ))}
      </ul>

      <div
        className="level-up-enter mt-8 flex flex-col gap-2 sm:flex-row"
        style={{ animationDelay: `${360 + mastery.canNow.length * 80}ms` }}
      >
        {children ?? (
          <>
            {nextLesson && nxt && (
              <Button asChild>
                <Link
                  to="/lesson/$id"
                  params={{ id: nextLesson.id }}
                  onClick={onClose}
                >
                  Begin {nxt}
                  <ArrowRight />
                </Link>
              </Button>
            )}
            {nextGram && (
              <Button asChild variant={nextLesson ? "outline" : "default"}>
                <Link
                  to="/grammar/$id"
                  params={{ id: nextGram.id }}
                  onClick={onClose}
                >
                  {level} grammar
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to="/path" onClick={onClose}>
                Path
              </Link>
            </Button>
          </>
        )}
      </div>
    </article>
  );
}

export function LevelCompleteOverlay({
  level,
  onClose,
}: {
  level: CefrLevel;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-bg"
      role="dialog"
      aria-modal="true"
      aria-label={`${level} complete`}
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <LevelComplete level={level} onClose={onClose} />
      </div>
    </div>
  );
}

function LevelSeal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width="72"
      height="72"
      className={cn("level-seal size-16 shrink-0", className)}
      aria-hidden
    >
      <rect width="64" height="64" rx="16" className="fill-accent" />
      <rect x="4" y="4" width="56" height="56" rx="12" className="fill-accent-fg" />
      <rect
        x="10"
        y="10"
        width="44"
        height="44"
        rx="8"
        fill="none"
        className="stroke-accent"
        strokeWidth="2.25"
      />
      <g className="fill-accent">
        <path d="M18 18 22 14 26 18 22 22Z" />
        <path d="M38 18 42 14 46 18 42 22Z" />
        <path d="M18 46 22 42 26 46 22 50Z" />
        <path d="M38 46 42 42 46 46 42 50Z" />
      </g>
      <circle cx="32" cy="32" r="12" className="fill-accent" />
      <path
        d="M25.5 32.5 30 37l8.5-10"
        fill="none"
        className="level-seal-check stroke-accent-fg"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
