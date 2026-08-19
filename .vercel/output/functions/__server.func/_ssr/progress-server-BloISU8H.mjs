import { i as createServerFn } from "./ssr.mjs";
import { F as object, L as record, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-kozJojpm.mjs";
import { t as authMiddleware } from "./middleware-B4v1SFzM.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/progress-server-BloISU8H.js
var resultSchema = object({
	lessonId: string().min(1).max(80),
	quizScore: number().int().min(0).max(20),
	quizTotal: number().int().min(1).max(20),
	xp: number().int().min(0).max(200)
});
var snapshotSchema = object({
	completed: record(string(), object({
		quizScore: number(),
		quizTotal: number(),
		xp: number(),
		completedAt: string()
	})),
	xp: number(),
	streak: number(),
	lastStudyDate: string().nullable()
});
var fetchProgress_createServerFn_handler = createServerRpc({
	id: "b6bdbb42b54a50022135003565247329e49dfefe10c3c50e5112907dea6f160b",
	name: "fetchProgress",
	filename: "src/lib/progress-server.ts"
}, (opts) => fetchProgress.__executeServer(opts));
var fetchProgress = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(fetchProgress_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const rows = await sql`
      select lesson_id, quiz_score, quiz_total, xp, completed_at
      from lesson_progress
      where user_id = ${context.userId}
    `;
	const stats = await sql`
      select streak, last_study_date, total_xp
      from user_stats
      where user_id = ${context.userId}
    `;
	const completed = {};
	for (const r of rows) completed[r.lesson_id] = {
		quizScore: r.quiz_score,
		quizTotal: r.quiz_total,
		xp: r.xp,
		completedAt: r.completed_at ?? (/* @__PURE__ */ new Date()).toISOString()
	};
	const s = stats[0];
	return {
		completed,
		xp: s?.total_xp ?? 0,
		streak: s?.streak ?? 0,
		lastStudyDate: s?.last_study_date ?? null
	};
});
var saveLessonProgress_createServerFn_handler = createServerRpc({
	id: "5ad1aca74ebc7df070b50ea731a261d32a18cd56aca5a1812d1501075841d06a",
	name: "saveLessonProgress",
	filename: "src/lib/progress-server.ts"
}, (opts) => saveLessonProgress.__executeServer(opts));
var saveLessonProgress = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => resultSchema.parse(input)).handler(saveLessonProgress_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const completedAt = (/* @__PURE__ */ new Date()).toISOString();
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
	return { ok: true };
});
var saveProgressSnapshot_createServerFn_handler = createServerRpc({
	id: "af57669d5ec8bdac9ada812c4dd1ae6c5b27e4b2b4438c549de2303c0df006af",
	name: "saveProgressSnapshot",
	filename: "src/lib/progress-server.ts"
}, (opts) => saveProgressSnapshot.__executeServer(opts));
var saveProgressSnapshot = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => snapshotSchema.parse(input)).handler(saveProgressSnapshot_createServerFn_handler, async ({ context, data }) => {
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
	for (const [lessonId, row] of Object.entries(data.completed)) await sql`
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
	return { ok: true };
});
//#endregion
export { fetchProgress_createServerFn_handler, saveLessonProgress_createServerFn_handler, saveProgressSnapshot_createServerFn_handler };
