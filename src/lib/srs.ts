import { todayKey } from "@/lib/utils";

export type SrsCard = {
  interval: number;
  ease: number;
  due: string;
  reps: number;
  lapses: number;
};

/** First know → tomorrow; then 3, 7, 14, 30 days. */
const STEPS = [1, 3, 7, 14, 30] as const;

export const REVIEW_SESSION_CAP = 12;

export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y!, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + days);
  return todayKey(dt);
}

export function isDue(card: SrsCard | undefined, today: string): boolean {
  return !card || card.due <= today;
}

export function gradeCard(
  card: SrsCard | undefined,
  knew: boolean,
  today: string,
): SrsCard {
  const cur = card ?? {
    interval: 0,
    ease: 0,
    due: today,
    reps: 0,
    lapses: 0,
  };
  if (!knew) {
    return {
      interval: 0,
      ease: 0,
      due: today,
      reps: cur.reps,
      lapses: cur.lapses + 1,
    };
  }
  const ease = Math.min(cur.ease + 1, STEPS.length);
  const interval = STEPS[ease - 1] ?? 1;
  return {
    interval,
    ease,
    due: addDays(today, interval),
    reps: cur.reps + 1,
    lapses: cur.lapses,
  };
}
