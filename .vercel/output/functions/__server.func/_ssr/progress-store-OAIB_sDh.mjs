import { at as string, it as record, nt as object, tt as number } from "../_libs/@better-auth/core+[...].mjs";
import { i as createServerFn, o as getServerFnById, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-r4JW3nXy.mjs";
import { a as todayKey, o as yesterdayKey } from "./utils-Bw7vb_GY.mjs";
import { t as authClient } from "./client-C1iRFe1i.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/progress-store-OAIB_sDh.js
/** First know → tomorrow; then 3, 7, 14, 30 days. */
var STEPS = [
	1,
	3,
	7,
	14,
	30
];
function addDays(key, days) {
	const [y, m, d] = key.split("-").map(Number);
	const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
	dt.setDate(dt.getDate() + days);
	return todayKey(dt);
}
function isDue(card, today) {
	return !card || card.due <= today;
}
function gradeCard(card, knew, today) {
	const cur = card ?? {
		interval: 0,
		ease: 0,
		due: today,
		reps: 0,
		lapses: 0
	};
	if (!knew) return {
		interval: 0,
		ease: 0,
		due: today,
		reps: cur.reps,
		lapses: cur.lapses + 1
	};
	const ease = Math.min(cur.ease + 1, STEPS.length);
	const interval = STEPS[ease - 1] ?? 1;
	return {
		interval,
		ease,
		due: addDays(today, interval),
		reps: cur.reps + 1,
		lapses: cur.lapses
	};
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled (default) -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var resultSchema = object({
	lessonId: string().min(1).max(80),
	quizScore: number().int().min(0).max(20),
	quizTotal: number().int().min(1).max(20),
	xp: number().int().min(0).max(200)
});
var srsCardSchema = object({
	interval: number(),
	ease: number(),
	due: string(),
	reps: number(),
	lapses: number()
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
	lastStudyDate: string().nullable(),
	cards: record(string(), srsCardSchema).optional()
});
var fetchProgress = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("b6bdbb42b54a50022135003565247329e49dfefe10c3c50e5112907dea6f160b"));
var saveLessonProgress = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => resultSchema.parse(input)).handler(createSsrRpc("5ad1aca74ebc7df070b50ea731a261d32a18cd56aca5a1812d1501075841d06a"));
var saveProgressSnapshot = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => snapshotSchema.parse(input)).handler(createSsrRpc("af57669d5ec8bdac9ada812c4dd1ae6c5b27e4b2b4438c549de2303c0df006af"));
function nextStreak(last, today) {
	if (last === today) return -1;
	if (last === yesterdayKey()) return 1;
	return 0;
}
function applyStreak(lastStudyDate, streak, today) {
	const bump = nextStreak(lastStudyDate, today);
	return {
		lastStudyDate: today,
		streak: bump === -1 ? streak : bump === 1 ? streak + 1 : 1
	};
}
var useProgress = create()(persist((set, get) => ({
	completed: {},
	xp: 0,
	streak: 0,
	lastStudyDate: null,
	floor: "A1",
	cards: {},
	hydrated: false,
	markHydrated: () => set({ hydrated: true }),
	setFloor: (level) => set({ floor: level }),
	completeLesson: (lessonId, result) => {
		const today = todayKey();
		const prev = get();
		const existing = prev.completed[lessonId];
		const better = !existing || result.quizScore >= existing.quizScore ? {
			...result,
			completedAt: (/* @__PURE__ */ new Date()).toISOString()
		} : existing;
		const deltaXp = existing ? Math.max(0, better.xp - existing.xp) : result.xp;
		const { streak, lastStudyDate } = applyStreak(prev.lastStudyDate, prev.streak, today);
		set({
			completed: {
				...prev.completed,
				[lessonId]: better
			},
			xp: prev.xp + deltaXp,
			streak,
			lastStudyDate
		});
	},
	gradeVocab: (cardId, knew) => {
		const today = todayKey();
		const prev = get();
		set({ cards: {
			...prev.cards,
			[cardId]: gradeCard(prev.cards[cardId], knew, today)
		} });
	},
	touchStudy: (xp = 0) => {
		const today = todayKey();
		const prev = get();
		const { streak, lastStudyDate } = applyStreak(prev.lastStudyDate, prev.streak, today);
		set({
			xp: prev.xp + xp,
			streak,
			lastStudyDate
		});
	},
	mergeRemote: (remote) => {
		const local = get();
		const completed = { ...remote.completed };
		for (const [id, row] of Object.entries(local.completed)) {
			const other = completed[id];
			if (!other || row.quizScore > other.quizScore) completed[id] = row;
		}
		const cards = { ...remote.cards ?? {} };
		for (const [id, row] of Object.entries(local.cards)) {
			const other = cards[id];
			if (!other || row.reps > other.reps || row.reps === other.reps && row.due > other.due) cards[id] = row;
		}
		set({
			completed,
			cards,
			xp: Math.max(local.xp, remote.xp),
			streak: Math.max(local.streak, remote.streak),
			lastStudyDate: (local.lastStudyDate ?? "") > (remote.lastStudyDate ?? "") ? local.lastStudyDate : remote.lastStudyDate
		});
	},
	snapshot: () => {
		const s = get();
		return {
			completed: s.completed,
			xp: s.xp,
			streak: s.streak,
			lastStudyDate: s.lastStudyDate,
			cards: s.cards
		};
	}
}), {
	name: "bica.progress.v1",
	partialize: (s) => ({
		completed: s.completed,
		xp: s.xp,
		streak: s.streak,
		lastStudyDate: s.lastStudyDate,
		floor: s.floor,
		cards: s.cards
	}),
	onRehydrateStorage: () => () => {
		useProgress.getState().markHydrated();
	}
}));
//#endregion
export { saveProgressSnapshot as a, useProgress as c, saveLessonProgress as i, fetchProgress as n, useCurrentUser as o, isDue as r, useCurrentUserState as s, createSsrRpc as t };
