import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, WholeWord } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { levels, verbDesks } from "@/data/curriculum";
import { useProgress } from "@/lib/progress-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/verbs/")({ component: VerbsIndex });

function VerbsIndex() {
  const completed = useProgress((s) => s.completed);
  const doneIds = new Set(Object.keys(completed));

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-medium tracking-tight">Verbos</h1>
      <p className="mt-2 text-muted">
        One desk per level. The verbs that actually open conversations, with
        the persons laid out, then a quiz. Present first. Then yesterday.
        Then will, would, and if.
      </p>

      <div className="mt-8 space-y-10">
        {levels.map((lv) => {
          const desks = verbDesks.filter((d) => d.level === lv.id);
          const done = desks.filter((d) => doneIds.has(d.id)).length;
          return (
            <section key={lv.id}>
              <div className="mb-3">
                <p className="text-xs font-medium uppercase tracking-wider text-accent">
                  {lv.id} · {done}/{desks.length} done
                </p>
                <h2 className="font-display text-xl font-medium">{lv.title}</h2>
                <p className="text-sm text-muted">{lv.blurb}</p>
              </div>
              <ul className="grid min-w-0 gap-2">
                {desks.map((desk) => {
                  const score = completed[desk.id];
                  return (
                    <li key={desk.id} className="min-w-0">
                      <Link
                        to="/verbs/$id"
                        params={{ id: desk.id }}
                        className="flex min-w-0 w-full items-center gap-3 rounded-[var(--radius-lg)] bg-surface p-3 no-underline shadow-[var(--shadow-border)] transition-shadow duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)]"
                      >
                        <span
                          className={cn(
                            "grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]",
                            score ? "bg-success text-success-fg" : "bg-soft text-accent",
                          )}
                        >
                          {score ? <Check className="size-4" /> : <WholeWord className="size-4" />}
                        </span>
                        <span className="min-w-0 flex-1 overflow-hidden">
                          <span className="block truncate font-medium text-fg">
                            {desk.titlePt}
                            <span className="ml-2 hidden font-sans text-sm font-normal text-muted sm:inline">
                              {desk.title}
                            </span>
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-subtle">
                            {desk.minutes} min · {desk.focus}
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
