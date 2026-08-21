import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { LessonResult } from "@/lib/progress-store";
import type { SrsCard } from "@/lib/srs";
import type { CefrLevel } from "@/data/types";
import { asDayKey } from "@/lib/utils";

const resultSchema = z.object({
  lessonId: z.string().min(1).max(80),
  quizScore: z.number().int().min(0).max(20),
  quizTotal: z.number().int().min(1).max(20),
  xp: z.number().int().min(0).max(200),
});

const srsCardSchema = z.object({
  interval: z.coerce.number(),
  ease: z.coerce.number(),
  due: z.string(),
  reps: z.coerce.number(),
  lapses: z.coerce.number(),
});

const snapshotSchema = z.object({
  completed: z
    .record(
      z.string(),
      z.object({
        quizScore: z.coerce.number(),
        quizTotal: z.coerce.number(),
        xp: z.coerce.number(),
        completedAt: z.string(),
      }),
    )
    .default({}),
  xp: z.coerce.number(),
  streak: z.coerce.number(),
  lastStudyDate: z.string().nullable(),
  cards: z.record(z.string(), srsCardSchema).optional(),
  floor: z.enum(["A1", "A2", "B1", "B2", "C1"]).optional(),
});

function parseCards(raw: unknown): Record<string, SrsCard> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, SrsCard>;
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, SrsCard>;
      }
    } catch {
      return {};
    }
  }
  return {};
}

/** POST, not GET — a cached GET was handing the second browser an empty path. */
export const fetchProgress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      lesson_id: string;
      quiz_score: number;
      quiz_total: number;
      xp: number;
      completed_at: string | null;
    }>`
      select lesson_id, quiz_score, quiz_total, xp, completed_at
      from lesson_progress
      where user_id = ${context.userId}
    `;
    const stats = await sql<{
      streak: number;
      last_study_date: string | null;
      total_xp: number;
      vocab_cards: unknown;
    }>`
      select streak, last_study_date, total_xp, vocab_cards
      from user_stats
      where user_id = ${context.userId}
    `;
    const completed: Record<string, LessonResult> = {};
    for (const r of rows) {
      completed[r.lesson_id] = {
        quizScore: Number(r.quiz_score) || 0,
        quizTotal: Number(r.quiz_total) || 0,
        xp: Number(r.xp) || 0,
        completedAt: r.completed_at ?? new Date().toISOString(),
      };
    }
    const s = stats[0];
    return {
      completed,
      xp: Number(s?.total_xp) || 0,
      streak: Number(s?.streak) || 0,
      lastStudyDate: asDayKey(s?.last_study_date),
      cards: parseCards(s?.vocab_cards),
      floor: "A1" as CefrLevel,
    };
  });

export const saveLessonProgress = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => resultSchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const completedAt = new Date().toISOString();
    await sql`
      insert into lesson_progress (user_id, lesson_id, quiz_score, quiz_total, xp, completed_at, updated_at)
      values (
        ${context.userId},
        ${data.lessonId},
        ${data.quizScore},
        ${data.quizTotal},
        ${data.xp},
        ${completedAt},
        now()
      )
      on conflict (user_id, lesson_id) do update set
        quiz_score = greatest(lesson_progress.quiz_score, excluded.quiz_score),
        quiz_total = excluded.quiz_total,
        xp = greatest(lesson_progress.xp, excluded.xp),
        completed_at = coalesce(lesson_progress.completed_at, excluded.completed_at),
        updated_at = now()
    `;
    return { ok: true as const };
  });

export const saveProgressSnapshot = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => snapshotSchema.parse(input))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const cardsJson = JSON.stringify(data.cards ?? {});
    const lastStudy = asDayKey(data.lastStudyDate);
    await sql`
      insert into user_stats (user_id, streak, last_study_date, total_xp, vocab_cards, updated_at)
      values (
        ${context.userId},
        ${data.streak},
        ${lastStudy},
        ${data.xp},
        ${cardsJson}::jsonb,
        now()
      )
      on conflict (user_id) do update set
        streak = greatest(user_stats.streak, excluded.streak),
        last_study_date = case
          when excluded.last_study_date is null then user_stats.last_study_date
          when user_stats.last_study_date is null then excluded.last_study_date
          when excluded.last_study_date::text > user_stats.last_study_date::text
            then excluded.last_study_date
          else user_stats.last_study_date
        end,
        total_xp = greatest(user_stats.total_xp, excluded.total_xp),
        vocab_cards = coalesce(user_stats.vocab_cards, '{}'::jsonb)
          || coalesce(excluded.vocab_cards, '{}'::jsonb),
        updated_at = now()
    `;
    for (const [lessonId, row] of Object.entries(data.completed)) {
      await sql`
        insert into lesson_progress (user_id, lesson_id, quiz_score, quiz_total, xp, completed_at, updated_at)
        values (
          ${context.userId},
          ${lessonId},
          ${row.quizScore},
          ${row.quizTotal},
          ${row.xp},
          ${row.completedAt},
          now()
        )
        on conflict (user_id, lesson_id) do update set
          quiz_score = greatest(lesson_progress.quiz_score, excluded.quiz_score),
          quiz_total = excluded.quiz_total,
          xp = greatest(lesson_progress.xp, excluded.xp),
          completed_at = coalesce(lesson_progress.completed_at, excluded.completed_at),
          updated_at = now()
      `;
    }
    return { ok: true as const };
  });
