import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Clock3 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { lessons, units } from "@/data/curriculum";
import { useProgress } from "@/lib/progress-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/path")({ component: PathPage });

function PathPage() {
  const completed = useProgress((s) => s.completed);

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-medium tracking-tight">The path</h1>
      <p className="mt-2 text-muted">
        A1 through B2, in European Portuguese. Jump in anywhere — adults skip
        what they already know. After B2 the work is the radio, the book, and
        the queue.
      </p>

      <div className="mt-8 space-y-10">
        {units.map((unit) => {
          const unitLessons = lessons.filter((l) => l.unitId === unit.id);
          return (
            <section key={unit.id}>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-accent">
                    {unit.level} · {unit.titlePt}
                  </p>
                  <h2 className="font-display text-xl font-medium">{unit.title}</h2>
                  <p className="text-sm text-muted">{unit.blurb}</p>
                </div>
              </div>
              <ul className="grid gap-2">
                {unitLessons.map((lesson) => {
                  const done = Boolean(completed[lesson.id]);
                  const score = completed[lesson.id];
                  return (
                    <li key={lesson.id}>
                      <Link
                        to="/lesson/$id"
                        params={{ id: lesson.id }}
                        className={cn(
                          "flex items-center gap-3 rounded-[var(--radius-lg)] bg-surface p-3 no-underline shadow-[var(--shadow-border)] transition-shadow duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)]",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]",
                            done ? "bg-success text-success-fg" : "bg-soft text-accent",
                          )}
                        >
                          {done ? <Check className="size-4" /> : <Clock3 className="size-4" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-fg">
                            {lesson.titlePt}
                            <span className="ml-2 font-sans text-sm font-normal text-muted">
                              {lesson.title.split("—")[0]?.trim()}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-xs text-subtle">
                            {lesson.minutes} min
                            {score
                              ? ` · ${score.quizScore}/${score.quizTotal} on the quiz`
                              : ""}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
