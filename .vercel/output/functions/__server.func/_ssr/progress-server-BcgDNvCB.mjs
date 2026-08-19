import { i as createServerFn, o as getServerFnById, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { F as object, L as record, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as authClient } from "./client-sGid3STf.mjs";
import { t as authMiddleware } from "./middleware-B4v1SFzM.mjs";
import { a as yesterdayKey, i as todayKey } from "./utils-BjFYziMh.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/progress-server-BcgDNvCB.js
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
function nextStreak(last, today) {
	if (last === today) return -1;
	if (last === yesterdayKey()) return 1;
	return 0;
}
var useProgress = create()(persist((set, get) => ({
	completed: {},
	xp: 0,
	streak: 0,
	lastStudyDate: null,
	floor: "A1",
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
		const streakBump = nextStreak(prev.lastStudyDate, today);
		const streak = streakBump === -1 ? prev.streak : streakBump === 1 ? prev.streak + 1 : 1;
		set({
			completed: {
				...prev.completed,
				[lessonId]: better
			},
			xp: prev.xp + deltaXp,
			streak,
			lastStudyDate: today
		});
	},
	mergeRemote: (remote) => {
		const local = get();
		const completed = { ...remote.completed };
		for (const [id, row] of Object.entries(local.completed)) {
			const other = completed[id];
			if (!other || row.quizScore > other.quizScore) completed[id] = row;
		}
		set({
			completed,
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
			lastStudyDate: s.lastStudyDate
		};
	}
}), {
	name: "bica.progress.v1",
	partialize: (s) => ({
		completed: s.completed,
		xp: s.xp,
		streak: s.streak,
		lastStudyDate: s.lastStudyDate,
		floor: s.floor
	}),
	onRehydrateStorage: () => () => {
		useProgress.getState().markHydrated();
	}
}));
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
var fetchProgress = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("b6bdbb42b54a50022135003565247329e49dfefe10c3c50e5112907dea6f160b"));
var saveLessonProgress = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => resultSchema.parse(input)).handler(createSsrRpc("5ad1aca74ebc7df070b50ea731a261d32a18cd56aca5a1812d1501075841d06a"));
var saveProgressSnapshot = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => snapshotSchema.parse(input)).handler(createSsrRpc("af57669d5ec8bdac9ada812c4dd1ae6c5b27e4b2b4438c549de2303c0df006af"));
//#endregion
export { useCurrentUser as a, saveProgressSnapshot as i, fetchProgress as n, useCurrentUserState as o, saveLessonProgress as r, useProgress as s, createSsrRpc as t };
