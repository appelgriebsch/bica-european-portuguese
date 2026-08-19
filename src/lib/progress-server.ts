import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { LessonResult } from "@/lib/progress-store";

const resultSchema = z.object({
  lessonId: z.string().min(1).max(80),
  quizScore: z.number().int().min(0).max(20),
  quizTotal: z.number().int().min(1).max(20),
  xp: z.number().int().min(0).max(200),
});

const snapshotSchema = z.object({
  completed: z.record(
    z.string(),
    z.object({
      quizScore: z.number(),
      quizTotal: z.number(),
      xp: z.number(),
      completedAt: z.string(),
    }),
  ),
  xp: z.number(),
  streak: z.number(),
  lastStudyDate: z.string().nullable(),
});

export const fetchProgress = createServerFn({ method: "GET" })
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
    }>`
      select streak, last_study_date, total_xp
      from user_stats
      where user_id = ${context.userId}
    `;
    const completed: Record<string, LessonResult> = {};
    for (const r of rows) {
      completed[r.lesson_id] = {
        quizScore: r.quiz_score,
        quizTotal: r.quiz_total,
        xp: r.xp,
        completedAt: r.completed_at ?? new Date().toISOString(),
      };
    }
    const s = stats[0];
    return {
      completed,
      xp: s?.total_xp ?? 0,
      streak: s?.streak ?? 0,
      lastStudyDate: s?.last_study_date ?? null,
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
    await sql`
      insert into user_stats (user_id, streak, last_study_date, total_xp, updated_at)
      values (
        ${context.userId},
        ${data.streak},
        ${data.lastStudyDate},
        ${data.xp},
        now()
      )
      on conflict (user_id) do update set
        streak = excluded.streak,
        last_study_date = excluded.last_study_date,
        total_xp = excluded.total_xp,
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
