import { o as __toESM } from "../_runtime.mjs";
import { $ as literal, J as _enum, X as array, at as string, it as record, nt as object, ot as union, tt as number } from "../_libs/@better-auth/core+[...].mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as createRootRoute, b as useRouter, d as useRouterState, g as createFileRoute, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as Slot } from "../_libs/@radix-ui/react-primitive+[...].mjs";
import { n as createServerFn, t as createMiddleware } from "../_libs/@tanstack/start-client-core+[...].mjs";
import { i as getSql, r as GROK_PROVIDERS, t as auth } from "../index.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { _ as ArrowLeft, a as RotateCcw, c as Pause, d as House, f as Headphones, g as ArrowRight, h as BookOpen, i as Send, l as MessageCircle, m as Check, n as UserRound, o as Play, p as Clock3, r as TriangleAlert, s as PenLine, t as Volume2, u as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { n as Root, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
import { i as signOut, r as signIn, t as authClient } from "./client.mjs";
//#region src/lib/error-component.tsx
var import_jsx_runtime = require_jsx_runtime();
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-danger",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-8",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-xl font-medium",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-muted",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
//#endregion
//#region src/lib/auth/provider.tsx
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
//#endregion
//#region src/lib/preview-embedder-origin.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
//#endregion
//#region src/lib/preview-host-bridge.ts
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
//#endregion
//#region src/components/preview-host-bridge.tsx
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
//#endregion
//#region src/styles.css?url
var styles_default = "/assets/styles-Bh8ZY0nE.css";
//#endregion
//#region src/routes/__root.tsx
var APP_NAME = "Bica";
var Route$16 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "European Portuguese in sips — byte-sized lessons from A1 to C1, with quizzes and café conversations."
			},
			{
				name: "apple-mobile-web-app-title",
				content: APP_NAME
			},
			{
				name: "theme-color",
				content: "#1E4D73"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:title",
				content: APP_NAME
			},
			{
				property: "og:description",
				content: "European Portuguese, twenty minutes at a time."
			},
			...[],
			...[]
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				position: "top-center",
				toastOptions: { className: "font-sans bg-surface text-fg border-border" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
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
//#endregion
//#region src/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function greetingForHour(hour) {
	if (hour < 12) return {
		pt: "Bom dia",
		en: "Good morning"
	};
	if (hour < 20) return {
		pt: "Boa tarde",
		en: "Good afternoon"
	};
	return {
		pt: "Boa noite",
		en: "Good evening"
	};
}
function todayKey(d = /* @__PURE__ */ new Date()) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function yesterdayKey(d = /* @__PURE__ */ new Date()) {
	const y = new Date(d);
	y.setDate(y.getDate() - 1);
	return todayKey(y);
}
/** Lowercase, collapse space, strip combining marks — kind to typed answers. */
function normalizePt(value) {
	return value.trim().toLowerCase().replace(/\s+/g, " ").normalize("NFD").replace(/\p{M}/gu, "").replace(/[“”"'`]/g, "").replace(/[.,!?…:;]/g, "");
}
function answersMatch(input, accepted) {
	const got = normalizePt(input);
	if (!got) return false;
	return accepted.some((a) => normalizePt(a) === got);
}
//#endregion
//#region src/lib/srs.ts
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
//#endregion
//#region src/lib/progress-store.ts
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
//#region src/lib/auth/middleware.ts
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out (auth on — the default, including live preview) -> throws
* `UnauthorizedError` (see `verify.server.ts`). Only when auth is explicitly
* disabled (`VITE_AUTH_ENABLED=false`) does it resolve the shared dev user and
* never throw. Use it on every server function that touches per-user data, and
* scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server.mjs");
	const { requireUserId } = await import("./verify.server.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
//#endregion
//#region src/lib/progress-server.ts
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
var fetchProgress = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
	const sql = await getSql();
	const rows = await sql`
      select lesson_id, quiz_score, quiz_total, xp, completed_at
      from lesson_progress
      where user_id = ${context.userId}
    `;
	const stats = await sql`
      select streak, last_study_date, total_xp, vocab_cards
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
	let cards = {};
	const raw = s?.vocab_cards;
	if (raw && typeof raw === "object") cards = raw;
	else if (typeof raw === "string") try {
		cards = JSON.parse(raw);
	} catch {
		cards = {};
	}
	return {
		completed,
		xp: s?.total_xp ?? 0,
		streak: s?.streak ?? 0,
		lastStudyDate: s?.last_study_date ?? null,
		cards
	};
});
var saveLessonProgress = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => resultSchema.parse(input)).handler(async ({ context, data }) => {
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
var saveProgressSnapshot = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => snapshotSchema.parse(input)).handler(async ({ context, data }) => {
	const sql = await getSql();
	const cardsJson = JSON.stringify(data.cards ?? {});
	await sql`
      insert into user_stats (user_id, streak, last_study_date, total_xp, vocab_cards, updated_at)
      values (
        ${context.userId},
        ${data.streak},
        ${data.lastStudyDate},
        ${data.xp},
        ${cardsJson}::jsonb,
        now()
      )
      on conflict (user_id) do update set
        streak = excluded.streak,
        last_study_date = excluded.last_study_date,
        total_xp = excluded.total_xp,
        vocab_cards = excluded.vocab_cards,
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
//#region src/components/progress-sync.tsx
function ProgressSync() {
	const { user, isPending } = useCurrentUserState();
	const hydrated = useProgress((s) => s.hydrated);
	const mergeRemote = useProgress((s) => s.mergeRemote);
	const did = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (isPending || !user || !hydrated || did.current) return;
		did.current = true;
		(async () => {
			try {
				const remote = await fetchProgress();
				mergeRemote(remote);
				await saveProgressSnapshot({ data: useProgress.getState().snapshot() });
			} catch {}
		})();
	}, [
		user,
		isPending,
		hydrated,
		mergeRemote
	]);
	return null;
}
//#endregion
//#region src/components/azulejo-mark.tsx
/** Lisbon tile mark — same artwork as `/favicon.svg`. */
function AzulejoMark({ className, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/favicon.svg",
		alt: title ?? "",
		width: 32,
		height: 32,
		draggable: false,
		className: cn("size-8 shrink-0", className)
	});
}
//#endregion
//#region src/components/app-shell.tsx
var nav = [
	{
		to: "/",
		label: "Today",
		icon: House,
		match: (p) => p === "/"
	},
	{
		to: "/path",
		label: "Path",
		icon: BookOpen,
		match: (p) => p === "/path" || p.startsWith("/lesson")
	},
	{
		to: "/practice",
		label: "Practice",
		icon: Headphones,
		match: (p) => p === "/practice" || p.startsWith("/speak") || p.startsWith("/listen") || p.startsWith("/read") || p.startsWith("/review") || p.startsWith("/grammar")
	},
	{
		to: "/me",
		label: "You",
		icon: UserRound,
		match: (p) => p === "/me" || p === "/login"
	}
];
function AppShell({ children, hideNav = false }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const streak = useProgress((s) => s.streak);
	const { user, isPending } = useCurrentUserState();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh overflow-x-clip bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressSync, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-30 border-b border-border/80 bg-bg/90 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex items-center gap-2 no-underline",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AzulejoMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-lg font-medium tracking-tight",
								children: "Bica"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden items-center gap-1 md:flex",
							children: nav.map((item) => {
								const active = item.match(pathname);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: item.to,
									className: cn("rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium no-underline transition-colors duration-[var(--motion-quick)]", active ? "bg-soft text-accent" : "text-muted hover:text-fg"),
									children: item.label
								}, item.to);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [streak > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-medium tabular-nums text-muted",
								children: [streak, "d"]
							}), isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-8 animate-pulse rounded-full bg-surface-2" }) : user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/me",
								title: user.displayName ?? "You",
								className: "size-8 overflow-hidden rounded-full bg-surface-2",
								children: user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: user.profileImageUrl,
									alt: "",
									className: "size-8 object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-8 place-items-center text-xs font-medium",
									children: (user.displayName ?? "U").charAt(0).toUpperCase()
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								className: "text-sm font-medium text-accent no-underline hover:underline",
								children: "Sign in"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: cn("mx-auto w-full max-w-2xl px-4 pt-5", hideNav ? "pb-8" : "pb-28 md:pb-12"),
				children
			}),
			!hideNav && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mx-auto grid max-w-2xl grid-cols-4",
					children: nav.map((item) => {
						const active = item.match(pathname);
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium no-underline", active ? "text-accent" : "text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								strokeWidth: active ? 2.2 : 1.8
							}), item.label]
						}) }, item.to);
					})
				})
			})
		]
	});
}
//#endregion
//#region src/data/a1.ts
var a1Lessons = [
	{
		id: "a1-ola",
		level: "A1",
		unitId: "a1-first",
		unit: "First words",
		order: 1,
		minutes: 8,
		title: "Olá — hello in Portugal",
		titlePt: "Olá",
		skill: "speak",
		summary: "Greet, introduce yourself, and say thank you — the first minute of any conversation.",
		goals: [
			"Greet at the right time of day",
			"Say your name",
			"Thank someone"
		],
		image: "/scenes/cafe.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A1 · 8 min",
				title: "The door opens",
				body: "You step into a Lisbon pastelaria. Before the coffee, before the pastry — you speak. European Portuguese greets by time of day, and people notice if you get it right.",
				phrase: {
					pt: "Olá, bom dia.",
					en: "Hi, good morning."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "olá",
						hint: "oh-LAH",
						en: "hi / hello",
						examplePt: "Olá!",
						exampleEn: "Hi!"
					},
					{
						pt: "bom dia",
						hint: "boñ DEE-uh",
						en: "good morning (until lunch)",
						examplePt: "Bom dia, senhora.",
						exampleEn: "Good morning, ma'am."
					},
					{
						pt: "boa tarde",
						hint: "BO-uh TAR-de",
						en: "good afternoon",
						examplePt: "Boa tarde.",
						exampleEn: "Good afternoon."
					},
					{
						pt: "boa noite",
						hint: "BO-uh NOY-te",
						en: "good evening / good night",
						examplePt: "Boa noite.",
						exampleEn: "Good evening."
					},
					{
						pt: "chamo-me",
						hint: "SHA-muh-muh",
						en: "my name is",
						examplePt: "Chamo-me Andreas.",
						exampleEn: "My name is Andreas."
					},
					{
						pt: "obrigado / obrigada",
						hint: "oh-bree-GAH-doo / -dah",
						en: "thank you (m / f speaker)",
						examplePt: "Obrigado.",
						exampleEn: "Thank you."
					},
					{
						pt: "de nada",
						hint: "duh NAH-duh",
						en: "you're welcome",
						examplePt: "De nada.",
						exampleEn: "You're welcome."
					}
				]
			},
			{
				type: "grammar",
				title: "Obrigado agrees with you",
				body: "In Portugal, obrigado is said by a man, obrigada by a woman — it agrees with the speaker, not the listener. Time-of-day greetings are used in shops, lifts, and with strangers. Olá is friendly and fine with anyone not much older than you.",
				examples: [
					{
						pt: "Sou o Pedro. Obrigado.",
						en: "I'm Pedro. Thank you. (man speaking)"
					},
					{
						pt: "Sou a Ana. Obrigada.",
						en: "I'm Ana. Thank you. (woman speaking)"
					},
					{
						pt: "Bom dia. Chamo-me Inês.",
						en: "Good morning. My name is Inês."
					}
				]
			},
			{
				type: "dialogue",
				setting: "Counter at a pastelaria in Campo de Ourique, 09:10.",
				lines: [
					{
						speaker: "You",
						pt: "Bom dia.",
						en: "Good morning."
					},
					{
						speaker: "Clerk",
						pt: "Bom dia. Então?",
						en: "Good morning. So — what can I get you?"
					},
					{
						speaker: "You",
						pt: "Olá. Chamo-me Andreas.",
						en: "Hi. My name is Andreas."
					},
					{
						speaker: "Clerk",
						pt: "Prazer, Andreas.",
						en: "Nice to meet you, Andreas."
					},
					{
						speaker: "You",
						pt: "Obrigado.",
						en: "Thank you."
					},
					{
						speaker: "Clerk",
						pt: "De nada.",
						en: "You're welcome."
					}
				]
			},
			{
				type: "culture",
				title: "Prazer",
				body: "Prazer means 'pleasure' and is the standard 'nice to meet you'. A handshake is common with strangers; two kisses (right cheek first) among friends. In shops, a quiet bom dia as you enter is polite — silence can feel abrupt."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "It's 10:00. How do you greet the baker?",
				options: [
					"Boa noite",
					"Bom dia",
					"Boa tarde",
					"Adeus"
				],
				answer: 1,
				explain: "Bom dia runs until lunch, roughly."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "A woman saying 'thank you' uses…",
				options: [
					"Obrigado",
					"Obrigada",
					"De nada",
					"Prazer"
				],
				answer: 1,
				explain: "The adjective agrees with the speaker."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "What did you hear?",
				speak: "Chamo-me Rita.",
				options: [
					"My name is Rita.",
					"Good night, Rita.",
					"Thank you, Rita.",
					"See you, Rita."
				],
				answer: 0,
				explain: "Chamo-me = I call myself."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Boa tarde” is only used after 20:00.",
				options: ["True", "False"],
				answer: 1,
				explain: "Boa tarde is the afternoon greeting, from lunch until evening."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "How do you reply to obrigado?",
				options: [
					"Olá",
					"Bom dia",
					"De nada",
					"Chamo-me"
				],
				answer: 2,
				explain: "De nada = you're welcome."
			},
			{
				id: "q6",
				kind: "type",
				prompt: "Type the Portuguese for 'good morning'.",
				accept: ["bom dia"],
				explain: "Bom dia until lunch."
			}
		]
	},
	{
		id: "a1-como-esta",
		level: "A1",
		unitId: "a1-first",
		unit: "First words",
		order: 2,
		minutes: 10,
		title: "Como está? — how are you",
		titlePt: "Como está?",
		skill: "speak",
		summary: "Tu, você, and o senhor: three ways to say 'you', and the small-talk that follows.",
		goals: [
			"Ask how someone is",
			"Pick tu vs. o senhor",
			"Give a short answer"
		],
		image: "/scenes/cafe.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A1 · 10 min",
				title: "The second sentence",
				body: "After olá comes the weather of the soul: how are you? In Portugal the form of 'you' carries the relationship. Get this right and conversations open; get it wrong and people still understand — they just feel the distance.",
				phrase: {
					pt: "Tudo bem?",
					en: "All good?"
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "tudo bem?",
						hint: "TOO-doo baiñ",
						en: "all good? (informal)",
						examplePt: "Olá! Tudo bem?",
						exampleEn: "Hi! All good?"
					},
					{
						pt: "como está?",
						hint: "KOH-moo sh-TAH",
						en: "how are you? (polite)",
						examplePt: "Como está, senhor Silva?",
						exampleEn: "How are you, Mr Silva?"
					},
					{
						pt: "como estás?",
						hint: "KOH-moo sh-TASH",
						en: "how are you? (tu)",
						examplePt: "E então, como estás?",
						exampleEn: "So, how are you?"
					},
					{
						pt: "estou bem",
						hint: "shtoh baiñ",
						en: "I'm well",
						examplePt: "Estou bem, obrigado.",
						exampleEn: "I'm well, thank you."
					},
					{
						pt: "mais ou menos",
						hint: "mighz oo MEH-noosh",
						en: "so-so",
						examplePt: "Mais ou menos.",
						exampleEn: "So-so."
					},
					{
						pt: "e o senhor?",
						hint: "ee oo suh-NYOR",
						en: "and you, sir?",
						examplePt: "E o senhor, está bem?",
						exampleEn: "And you, sir — are you well?"
					},
					{
						pt: "então",
						hint: "en-TOW̃",
						en: "so / well then (discourse glue)",
						examplePt: "Então, tudo bem?",
						exampleEn: "So, all good?"
					}
				]
			},
			{
				type: "grammar",
				title: "Three you's",
				body: "Tu + estás is for friends, family, and most people your age. O senhor / a senhora + está is respectful with older strangers and in formal service. Você + está exists, but in Lisbon it can feel cold or blunt — prefer o senhor or first names. Tudo bem? is the all-purpose icebreaker.",
				examples: [
					{
						pt: "Tu estás bem?",
						en: "Are you well? (friend)"
					},
					{
						pt: "O senhor está bem?",
						en: "Are you well, sir?"
					},
					{
						pt: "Tudo bem? — Tudo, e tu?",
						en: "All good? — All good, and you?"
					}
				]
			},
			{
				type: "dialogue",
				setting: "A neighbour in the stairwell of an Alfama building.",
				lines: [
					{
						speaker: "Neighbour",
						pt: "Boa tarde. Tudo bem?",
						en: "Good afternoon. All good?"
					},
					{
						speaker: "You",
						pt: "Tudo bem, obrigado. E a senhora?",
						en: "All good, thank you. And you?"
					},
					{
						speaker: "Neighbour",
						pt: "Estou bem. Então, já se habituou a Lisboa?",
						en: "I'm well. So — settled into Lisbon yet?"
					},
					{
						speaker: "You",
						pt: "Mais ou menos. Ainda estou a aprender.",
						en: "So-so. I'm still learning."
					},
					{
						speaker: "Neighbour",
						pt: "Com calma. Vai correr bem.",
						en: "Take it easy. It'll go well."
					}
				]
			},
			{
				type: "culture",
				title: "Então",
				body: "Então is the Swiss Army knife of European Portuguese — 'so', 'well', 'and then'. A shopkeeper's Então? at the counter means 'what can I get you?' among friends it means 'what's the news?'. You will hear it constantly. Steal it."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "To a close friend you ask…",
				options: [
					"Como está?",
					"Como estás?",
					"Como está o senhor?",
					"De nada?"
				],
				answer: 1,
				explain: "Tu takes estás."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "A safe greeting with a shopkeeper is…",
				options: [
					"Tudo bem?",
					"Como estás, pá?",
					"Hey",
					"Tu, então?"
				],
				answer: 0,
				explain: "Tudo bem? works almost everywhere."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "What did you hear?",
				speak: "Estou bem, obrigada.",
				options: [
					"I'm well, thank you.",
					"So-so, thanks.",
					"Good night.",
					"What's your name?"
				],
				answer: 0,
				explain: "Estou bem = I am well."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "In Lisbon, você is always the friendliest choice.",
				options: ["True", "False"],
				answer: 1,
				explain: "Você can feel distant; tu or o senhor/a senhora is safer."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“Mais ou menos” means…",
				options: [
					"Very well",
					"So-so",
					"See you later",
					"Please"
				],
				answer: 1,
				explain: "Literally 'more or less'."
			},
			{
				id: "q6",
				kind: "type",
				prompt: "Type the informal 'all good?'",
				accept: ["tudo bem", "tudo bem?"],
				explain: "Tudo bem? is the all-purpose icebreaker."
			}
		]
	},
	{
		id: "a1-de-onde",
		level: "A1",
		unitId: "a1-first",
		unit: "First words",
		order: 3,
		minutes: 10,
		title: "De onde é? — where you're from",
		titlePt: "De onde é?",
		skill: "speak",
		summary: "Origin, city, and languages — the three answers that turn a greeting into a conversation.",
		goals: [
			"Say where you are from",
			"Say where you live",
			"Name the languages you speak"
		],
		image: "/scenes/cafe.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A1 · 10 min",
				title: "The third question",
				body: "After olá and tudo bem, someone will ask where you are from. In Portugal this is curiosity, not a test. A short answer — country, city, languages — is enough to keep the talk going.",
				phrase: {
					pt: "Sou alemão. Vivo em Frankfurt.",
					en: "I'm German. I live in Frankfurt."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "de onde é?",
						hint: "duh ON-de eh",
						en: "where are you from? (polite)",
						examplePt: "De onde é, o senhor?",
						exampleEn: "Where are you from, sir?"
					},
					{
						pt: "sou alemão / alemã",
						hint: "ah-le-MOW̃ / ah-le-MÃ",
						en: "I am German (m / f)",
						examplePt: "Sou alemão.",
						exampleEn: "I'm German."
					},
					{
						pt: "vivo em / moro em",
						hint: "VEE-voo aiñ",
						en: "I live in",
						examplePt: "Vivo em Frankfurt.",
						exampleEn: "I live in Frankfurt."
					},
					{
						pt: "falo",
						hint: "FAH-loo",
						en: "I speak",
						examplePt: "Falo alemão e inglês.",
						exampleEn: "I speak German and English."
					},
					{
						pt: "estou a aprender",
						hint: "shtoh uh ah-pren-DEHR",
						en: "I am learning",
						examplePt: "Estou a aprender português.",
						exampleEn: "I'm learning Portuguese."
					},
					{
						pt: "há quanto tempo?",
						hint: "ah KWAN-too TEM-poo",
						en: "how long?",
						examplePt: "Há quanto tempo está em Portugal?",
						exampleEn: "How long have you been in Portugal?"
					},
					{
						pt: "a primeira vez",
						hint: "pree-MAY-ruh vezh",
						en: "the first time",
						examplePt: "É a primeira vez.",
						exampleEn: "It's the first time."
					}
				]
			},
			{
				type: "grammar",
				title: "Ser for origin, viver for the city",
				body: "Sou + nationality (it agrees: alemão / alemã, português / portuguesa). Vivo em or moro em + city. Languages take falar: falo alemão. The European continuous again: estou a aprender, not estou aprendendo. Há quanto tempo…? asks for duration — answer with desde (since) or há dois anos (for two years).",
				examples: [
					{
						pt: "Sou alemão, mas vivo em Frankfurt.",
						en: "I'm German, but I live in Frankfurt."
					},
					{
						pt: "Falo alemão e um pouco de português.",
						en: "I speak German and a little Portuguese."
					},
					{
						pt: "Estou a aprender desde janeiro.",
						en: "I've been learning since January."
					}
				]
			},
			{
				type: "dialogue",
				setting: "The same pastelaria, two minutes after the greeting.",
				lines: [
					{
						speaker: "Clerk",
						pt: "De onde é?",
						en: "Where are you from?"
					},
					{
						speaker: "You",
						pt: "Sou alemão. Vivo em Frankfurt.",
						en: "I'm German. I live in Frankfurt."
					},
					{
						speaker: "Clerk",
						pt: "Ah. E fala português?",
						en: "Ah. And do you speak Portuguese?"
					},
					{
						speaker: "You",
						pt: "Estou a aprender. Falo alemão e inglês.",
						en: "I'm learning. I speak German and English."
					},
					{
						speaker: "Clerk",
						pt: "Pois. Está a correr bem.",
						en: "Right. It's going well."
					},
					{
						speaker: "You",
						pt: "Obrigado. É a primeira vez em Lisboa.",
						en: "Thank you. First time in Lisbon."
					}
				]
			},
			{
				type: "culture",
				title: "Estou a aprender is a door",
				body: "Saying you are learning Portuguese almost always gets a slower, clearer reply — and often a smile. People will switch to English if you look lost; you can keep the Portuguese going with mais devagar, se faz favor (more slowly, please). Nationality adjectives take a gender: a woman says sou alemã."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“De onde é?” asks…",
				options: [
					"How old you are",
					"Where you are from",
					"What you want to eat",
					"The time"
				],
				answer: 1,
				explain: "Origin."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "A woman from Germany says…",
				options: [
					"Sou alemão",
					"Sou alemã",
					"Estou Alemanha",
					"Falo Frankfurt"
				],
				answer: 1,
				explain: "The adjective agrees with the speaker."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "What is he doing?",
				speak: "Estou a aprender português.",
				options: [
					"Teaching Portuguese",
					"Learning Portuguese",
					"Forgetting Portuguese",
					"Translating a book"
				],
				answer: 1,
				explain: "Estou a aprender."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Vivo em” and “moro em” both mean 'I live in'.",
				options: ["True", "False"],
				answer: 0,
				explain: "Both are common."
			},
			{
				id: "q5",
				kind: "type",
				prompt: "Type 'I am German' (masculine speaker).",
				accept: ["sou alemão"],
				explain: "Sou + nationality."
			}
		]
	},
	{
		id: "a1-numeros",
		level: "A1",
		unitId: "a1-first",
		unit: "First words",
		order: 4,
		minutes: 12,
		title: "Números — prices at the counter",
		titlePt: "Números",
		skill: "listen",
		summary: "Count to 20, hear euros, and catch a price the first time it is said.",
		goals: [
			"Count 0–20",
			"Ask the price",
			"Hear euros and cents"
		],
		image: "/scenes/cafe.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A1 · 12 min",
				title: "The number is the sentence",
				body: "At a counter the Portuguese will say the price once, fast, and look at you. Training your ear for dois euros e cinquenta is the difference between nodding and holding up the card in panic.",
				phrase: {
					pt: "Quanto custa?",
					en: "How much is it?"
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "zero, um, dois, três, quatro",
						hint: "um ≈ oong (nasal)",
						en: "0–4",
						examplePt: "Um café, se faz favor.",
						exampleEn: "One coffee, please."
					},
					{
						pt: "cinco, seis, sete, oito, nove, dez",
						hint: "saysh, SET-te, OY-too",
						en: "5–10",
						examplePt: "Cinco pastéis.",
						exampleEn: "Five pastries."
					},
					{
						pt: "onze … vinte",
						hint: "ON-ze … VEEN-te",
						en: "11–20",
						examplePt: "São quinze euros.",
						exampleEn: "That's fifteen euros."
					},
					{
						pt: "euro / euros",
						hint: "EH-oo-roo",
						en: "euro / euros",
						examplePt: "Dois euros.",
						exampleEn: "Two euros."
					},
					{
						pt: "quanto custa?",
						hint: "KWAN-too KOOSH-tuh",
						en: "how much does it cost?",
						examplePt: "Quanto custa o jornal?",
						exampleEn: "How much is the paper?"
					},
					{
						pt: "se faz favor",
						hint: "suh fash fuh-VOR",
						en: "please (Portugal)",
						examplePt: "A conta, se faz favor.",
						exampleEn: "The bill, please."
					},
					{
						pt: "fica em",
						hint: "FEE-kuh aiñ",
						en: "it comes to…",
						examplePt: "Fica em três euros.",
						exampleEn: "That comes to three euros."
					}
				]
			},
			{
				type: "grammar",
				title: "Um café, uma bica",
				body: "Um is masculine, uma feminine. Café, pastel, jornal take um; bica, água, conta take uma. Prices: dois euros e cinquenta (2,50 €). In Portugal 'please' at a counter is se faz favor more often than por favor.",
				examples: [
					{
						pt: "Um, dois, três, quatro, cinco.",
						en: "1–5"
					},
					{
						pt: "Fica em um euro e vinte.",
						en: "That's one euro twenty."
					},
					{
						pt: "Quanto custa uma água?",
						en: "How much is a water?"
					}
				]
			},
			{
				type: "dialogue",
				setting: "Pastelaria counter. You want a coffee and a pastry to go.",
				lines: [
					{
						speaker: "You",
						pt: "Bom dia. Quanto custa um pastel de nata?",
						en: "Good morning. How much is a custard tart?"
					},
					{
						speaker: "Clerk",
						pt: "Um euro e quarenta.",
						en: "One euro forty."
					},
					{
						speaker: "You",
						pt: "Dois, se faz favor. E uma bica.",
						en: "Two, please. And an espresso."
					},
					{
						speaker: "Clerk",
						pt: "Fica em três euros e setenta.",
						en: "That comes to three seventy."
					},
					{
						speaker: "You",
						pt: "Obrigado.",
						en: "Thank you."
					}
				]
			},
			{
				type: "culture",
				title: "Pay at the counter",
				body: "In many cafés you order and pay at the counter, then stand or take a tiny table. Cards are widely accepted; small coins still oil the machine. Rounding up a little is kind, large tipping is not expected."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Quanto custa?” means…",
				options: [
					"Where is it?",
					"How much is it?",
					"What time is it?",
					"Who is it?"
				],
				answer: 1,
				explain: "Custa = it costs."
			},
			{
				id: "q2",
				kind: "listen",
				prompt: "How much?",
				speak: "Fica em dois euros e cinquenta.",
				options: [
					"€2.05",
					"€2.50",
					"€12.50",
					"€20"
				],
				answer: 1,
				explain: "Dois euros e cinquenta = 2,50 €."
			},
			{
				id: "q3",
				kind: "choice",
				prompt: "The very Portuguese 'please' is…",
				options: [
					"Por favor agora",
					"Se faz favor",
					"Please-o",
					"Com licença só"
				],
				answer: 1,
				explain: "Se faz favor is the counter classic."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Uma bica” is grammatically feminine.",
				options: ["True", "False"],
				answer: 0,
				explain: "Uma + feminine noun."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "Dez is…",
				options: [
					"2",
					"10",
					"16",
					"20"
				],
				answer: 1,
				explain: "Dez = ten."
			}
		]
	},
	{
		id: "a1-bica",
		level: "A1",
		unitId: "a1-city",
		unit: "In the city",
		order: 4,
		minutes: 12,
		title: "Uma bica — ordering coffee",
		titlePt: "Uma bica",
		skill: "speak",
		summary: "The Lisbon espresso, the galão, and how to order like you live here.",
		goals: [
			"Order coffee and a pastry",
			"Ask for here or to go",
			"Handle 'and for you?'"
		],
		image: "/scenes/cafe.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A1 · 12 min",
				title: "This cup is the country",
				body: "A bica is Lisbon's short espresso in a tiny cup. Not a Brazilian cafezinho, not an Italian lungo. Learning the drinks is learning to stand at the bar without explaining yourself.",
				phrase: {
					pt: "Uma bica, se faz favor.",
					en: "An espresso, please."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "uma bica",
						hint: "OO-muh BEE-kuh",
						en: "Lisbon espresso",
						examplePt: "Uma bica, bem cheia.",
						exampleEn: "An espresso, a full one."
					},
					{
						pt: "um galão",
						hint: "oong guh-LOW̃",
						en: "coffee with lots of milk, in a glass",
						examplePt: "Um galão, se faz favor.",
						exampleEn: "A galão, please."
					},
					{
						pt: "uma meia de leite",
						hint: "MAY-uh duh LAY-te",
						en: "half coffee, half milk, in a cup",
						examplePt: "Uma meia de leite.",
						exampleEn: "A milky coffee."
					},
					{
						pt: "um pastel de nata",
						hint: "push-TEL duh NAH-tuh",
						en: "custard tart",
						examplePt: "Um pastel de nata quente.",
						exampleEn: "A warm custard tart."
					},
					{
						pt: "para aqui / para levar",
						hint: "PAH-ruh uh-KEE / luh-VAR",
						en: "for here / to go",
						examplePt: "Para levar.",
						exampleEn: "To go."
					},
					{
						pt: "água sem gás",
						hint: "AH-gwuh saiñ gash",
						en: "still water",
						examplePt: "Uma água sem gás.",
						exampleEn: "A still water."
					},
					{
						pt: "a conta",
						hint: "uh KON-tuh",
						en: "the bill",
						examplePt: "A conta, se faz favor.",
						exampleEn: "The bill, please."
					}
				]
			},
			{
				type: "grammar",
				title: "Quero / queria / vou querer",
				body: "Quero is direct ('I want'). Queria is softer ('I would like') and sounds more polite. At the bar, skip both: just name the thing — Uma bica, se faz favor. Vou querer ('I'll have') is also natural when looking at a display.",
				examples: [
					{
						pt: "Queria uma bica e um pastel.",
						en: "I'd like an espresso and a tart."
					},
					{
						pt: "Vou querer um galão.",
						en: "I'll have a galão."
					},
					{
						pt: "Para aqui ou para levar?",
						en: "For here or to go?"
					}
				]
			},
			{
				type: "dialogue",
				setting: "Standing at the bar, 08:40, rain on the window.",
				lines: [
					{
						speaker: "Clerk",
						pt: "Bom dia. Então?",
						en: "Good morning. What'll it be?"
					},
					{
						speaker: "You",
						pt: "Uma bica e um pastel de nata, se faz favor.",
						en: "An espresso and a custard tart, please."
					},
					{
						speaker: "Clerk",
						pt: "O pastel quente?",
						en: "The tart warm?"
					},
					{
						speaker: "You",
						pt: "Sim, quente. E uma água sem gás.",
						en: "Yes, warm. And a still water."
					},
					{
						speaker: "Clerk",
						pt: "Para aqui?",
						en: "For here?"
					},
					{
						speaker: "You",
						pt: "Para aqui. Obrigado.",
						en: "For here. Thank you."
					}
				]
			},
			{
				type: "culture",
				title: "Drink names change by city",
				body: "Bica is Lisbon. In Porto you may hear cimbalino. A garoto is a tiny coffee with a drop of milk; a pingado similar. A galão is the breakfast glass. Untranslatable on purpose — order the local word and you belong for thirty seconds."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "A Lisbon espresso is…",
				options: [
					"um galão",
					"uma bica",
					"uma meia de leite",
					"um sumo"
				],
				answer: 1,
				explain: "Bica = short espresso in Lisbon."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "To take it away you say…",
				options: [
					"Para aqui",
					"Para levar",
					"A conta",
					"Sem gás"
				],
				answer: 1,
				explain: "Levar = to take."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "What was ordered?",
				speak: "Uma bica e um pastel de nata, se faz favor.",
				options: [
					"Tea and cake",
					"Espresso and a custard tart",
					"A galão only",
					"The bill"
				],
				answer: 1,
				explain: "Bica + pastel de nata."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Queria” is softer than “quero”.",
				options: ["True", "False"],
				answer: 0,
				explain: "Conditional = more polite."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "Still water is…",
				options: [
					"água com gás",
					"água sem gás",
					"um sumo",
					"um galão"
				],
				answer: 1,
				explain: "Sem gás = without gas."
			}
		]
	},
	{
		id: "a1-onde-fica",
		level: "A1",
		unitId: "a1-city",
		unit: "In the city",
		order: 5,
		minutes: 12,
		title: "Onde fica? — finding your way",
		titlePt: "Onde fica?",
		skill: "speak",
		summary: "Ask where something is, catch left and right, and thank the stranger who helped.",
		goals: [
			"Ask for a place",
			"Understand left / right / straight",
			"Excuse yourself in a crowd"
		],
		image: "/scenes/tram.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A1 · 12 min",
				title: "Lisbon is vertical",
				body: "Streets fold, trams block the view, and maps lie about hills. Asking a person is faster. Start with Desculpe and the name of the place; finish with Obrigado.",
				phrase: {
					pt: "Desculpe, onde fica o elevador?",
					en: "Excuse me, where is the lift / funicular?"
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "onde fica…?",
						hint: "ON-de FEE-kuh",
						en: "where is… located?",
						examplePt: "Onde fica a estação?",
						exampleEn: "Where is the station?"
					},
					{
						pt: "desculpe",
						hint: "desh-KOOL-pe",
						en: "sorry / excuse me",
						examplePt: "Desculpe, pode ajudar?",
						exampleEn: "Excuse me, can you help?"
					},
					{
						pt: "com licença",
						hint: "coñ lee-SEN-suh",
						en: "excuse me (passing through)",
						examplePt: "Com licença.",
						exampleEn: "Excuse me (coming through)."
					},
					{
						pt: "à esquerda / à direita",
						hint: "uh sh-KER-duh / dee-RAY-tuh",
						en: "on the left / on the right",
						examplePt: "Vire à esquerda.",
						exampleEn: "Turn left."
					},
					{
						pt: "em frente / sempre em frente",
						hint: "aiñ FREN-te",
						en: "ahead / straight on",
						examplePt: "Sempre em frente.",
						exampleEn: "Straight on."
					},
					{
						pt: "perto / longe",
						hint: "PER-too / LON-zhe",
						en: "near / far",
						examplePt: "É perto, a pé.",
						exampleEn: "It's nearby, on foot."
					},
					{
						pt: "a pé",
						hint: "uh peh",
						en: "on foot",
						examplePt: "São cinco minutos a pé.",
						exampleEn: "It's a five-minute walk."
					}
				]
			},
			{
				type: "grammar",
				title: "Fica vs. é",
				body: "Onde fica? asks for location of places (stations, streets, shops). Onde é? is also heard. Fica em… = it is situated in… For people, onde está? (where is he/she right now). Prepositions: ao pé de (next to), em frente de (opposite), a seguir (just after).",
				examples: [
					{
						pt: "A farmácia fica à direita.",
						en: "The pharmacy is on the right."
					},
					{
						pt: "É longe? — Não, é perto.",
						en: "Is it far? — No, it's near."
					},
					{
						pt: "Pode repetir, se faz favor?",
						en: "Can you repeat, please?"
					}
				]
			},
			{
				type: "dialogue",
				setting: "A steep street near the Miradouro de Santa Catarina.",
				lines: [
					{
						speaker: "You",
						pt: "Desculpe, onde fica o eléctrico 28?",
						en: "Excuse me, where is tram 28?"
					},
					{
						speaker: "Local",
						pt: "O 28? Siga sempre em frente e depois à esquerda.",
						en: "The 28? Go straight on, then left."
					},
					{
						speaker: "You",
						pt: "É longe?",
						en: "Is it far?"
					},
					{
						speaker: "Local",
						pt: "Não. Dois minutos a pé.",
						en: "No. Two minutes on foot."
					},
					{
						speaker: "You",
						pt: "Muito obrigado.",
						en: "Thank you very much."
					},
					{
						speaker: "Local",
						pt: "De nada. Boa viagem.",
						en: "You're welcome. Have a good trip."
					}
				]
			},
			{
				type: "culture",
				title: "Eléctrico, not bonde",
				body: "The yellow tram is o eléctrico (often just o 28). Bus is autocarro, train comboio, underground o metro. Brazilian words (ônibus, trem) will be understood and will mark you as not from here — which is fine, but these lessons stay with Portugal."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“À esquerda” means…",
				options: [
					"On the right",
					"On the left",
					"Straight on",
					"Far away"
				],
				answer: 1,
				explain: "Esquerda = left."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "To squeeze past people in a shop you say…",
				options: [
					"Olá",
					"Com licença",
					"Tudo bem",
					"Galão"
				],
				answer: 1,
				explain: "Com licença = coming through."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "What direction?",
				speak: "Siga sempre em frente e depois à direita.",
				options: [
					"Turn around",
					"Straight, then right",
					"Left, then down",
					"Take the bus"
				],
				answer: 1,
				explain: "Em frente then à direita."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "In Portugal a city bus is an “autocarro”.",
				options: ["True", "False"],
				answer: 0,
				explain: "Not ônibus."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“É perto, a pé” means…",
				options: [
					"It's far by car",
					"It's nearby on foot",
					"It's closed",
					"It's upstairs"
				],
				answer: 1,
				explain: "Perto = near, a pé = walking."
			}
		]
	},
	{
		id: "a1-familia",
		level: "A1",
		unitId: "a1-first",
		unit: "First words",
		order: 6,
		minutes: 10,
		title: "Família — people around you",
		titlePt: "Família",
		skill: "speak",
		summary: "Names, possessives, and the small talk of who you are with.",
		goals: [
			"Name family members",
			"Use meu / minha",
			"Say where you are from"
		],
		image: "/scenes/cafe.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A1 · 10 min",
				title: "Who is this?",
				body: "Portuguese small talk asks about people: where you are from, whether you are here with family, whether you like the city. You need a handful of nouns and meu / minha.",
				phrase: {
					pt: "Sou alemão. Estou cá sozinho.",
					en: "I'm German. I'm here on my own."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "eu sou",
						hint: "eh-oo soh",
						en: "I am (identity)",
						examplePt: "Eu sou professor.",
						exampleEn: "I am a teacher."
					},
					{
						pt: "sou de…",
						hint: "soh de",
						en: "I'm from…",
						examplePt: "Sou de Frankfurt.",
						exampleEn: "I'm from Frankfurt."
					},
					{
						pt: "meu / minha",
						hint: "meh-oo / MEEN-yuh",
						en: "my (m / f)",
						examplePt: "A minha irmã.",
						exampleEn: "My sister."
					},
					{
						pt: "marido / mulher",
						hint: "muh-REE-doo / moo-LYER",
						en: "husband / wife",
						examplePt: "O meu marido.",
						exampleEn: "My husband."
					},
					{
						pt: "filho / filha",
						hint: "FEEL-yoo / FEEL-yuh",
						en: "son / daughter",
						examplePt: "Tenho uma filha.",
						exampleEn: "I have a daughter."
					},
					{
						pt: "amigo / amiga",
						hint: "uh-MEE-goo / -guh",
						en: "friend",
						examplePt: "Estou com um amigo.",
						exampleEn: "I'm with a friend."
					},
					{
						pt: "sozinho / sozinha",
						hint: "soo-ZEEN-yoo",
						en: "alone",
						examplePt: "Estou sozinho em Lisboa.",
						exampleEn: "I'm alone in Lisbon."
					}
				]
			},
			{
				type: "grammar",
				title: "Ser vs. estar, meu vs. minha",
				body: "Ser is who you are and where you are from: sou alemão, sou de Frankfurt. Estar is temporary state and location: estou em Lisboa, estou cansado. Possessives match the thing possessed: o meu pai, a minha mãe, os meus amigos.",
				examples: [
					{
						pt: "Sou alemão e estou em Lisboa.",
						en: "I'm German and I'm in Lisbon."
					},
					{
						pt: "A minha mulher chama-se Clara.",
						en: "My wife is called Clara."
					},
					{
						pt: "Não tenho filhos.",
						en: "I don't have children."
					}
				]
			},
			{
				type: "dialogue",
				setting: "A short chat on a miradouro bench.",
				lines: [
					{
						speaker: "Local",
						pt: "É turista?",
						en: "Are you a tourist?"
					},
					{
						speaker: "You",
						pt: "Sim. Sou de Frankfurt. Estou cá uma semana.",
						en: "Yes. I'm from Frankfurt. I'm here a week."
					},
					{
						speaker: "Local",
						pt: "Veio com a família?",
						en: "Did you come with family?"
					},
					{
						speaker: "You",
						pt: "Não, estou sozinho. A minha mulher trabalha.",
						en: "No, I'm on my own. My wife is working."
					},
					{
						speaker: "Local",
						pt: "Ah. Gosta de Lisboa?",
						en: "Ah. Do you like Lisbon?"
					},
					{
						speaker: "You",
						pt: "Gosto muito.",
						en: "I like it a lot."
					}
				]
			},
			{
				type: "culture",
				title: "Nationality is gendered",
				body: "Alemão / alemã, inglês / inglesa, francês / francesa. Lisboa vs. Portugal: people say sou de Lisboa even if they mean the metro area. Cá means 'here' in a warm, local way — estou cá is 'I'm around'."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Sou de Frankfurt” uses…",
				options: [
					"estar",
					"ser",
					"ficar",
					"ir"
				],
				answer: 1,
				explain: "Origin uses ser."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“My sister” is…",
				options: [
					"O meu irmã",
					"A minha irmã",
					"O minha irmã",
					"A meu irmã"
				],
				answer: 1,
				explain: "Irmã is feminine → minha."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "What did you hear?",
				speak: "Estou sozinho em Lisboa.",
				options: [
					"I live in Lisbon",
					"I'm alone in Lisbon",
					"I have a son in Lisbon",
					"I'm from Lisbon"
				],
				answer: 1,
				explain: "Sozinho = alone."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Estou cansado” describes a temporary state.",
				options: ["True", "False"],
				answer: 0,
				explain: "Estar for states."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“Gosto muito” means…",
				options: [
					"I don't like it",
					"I like it a lot",
					"I'm leaving",
					"I'm tired"
				],
				answer: 1,
				explain: "Gostar + muito."
			}
		]
	},
	{
		id: "a1-horas",
		level: "A1",
		unitId: "a1-city",
		unit: "In the city",
		order: 7,
		minutes: 12,
		title: "Que horas são? — time & opening hours",
		titlePt: "Que horas são?",
		skill: "listen",
		summary: "Tell the time, catch opening hours, and not arrive at the museum on Monday.",
		goals: [
			"Ask and tell the time",
			"Read opening hours",
			"Use hoje / amanhã / agora"
		],
		image: "/scenes/tram.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A1 · 12 min",
				title: "Monday is closed",
				body: "Many museums rest on Monday. Lunch can close a shop from 13:00 to 15:00. Asking que horas são and está aberto? saves a hill climb to a locked door.",
				phrase: {
					pt: "Está aberto até que horas?",
					en: "Open until what time?"
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "que horas são?",
						hint: "kuh AW-rush sow̃",
						en: "what time is it?",
						examplePt: "Desculpe, que horas são?",
						exampleEn: "Excuse me, what time is it?"
					},
					{
						pt: "são duas horas",
						hint: "sow̃ DOO-ush AW-rush",
						en: "it's two o'clock",
						examplePt: "São três e meia.",
						exampleEn: "It's half past three."
					},
					{
						pt: "meio-dia / meia-noite",
						hint: "MAY-oo DEE-uh",
						en: "noon / midnight",
						examplePt: "Fechamos ao meio-dia.",
						exampleEn: "We close at noon."
					},
					{
						pt: "hoje / amanhã / agora",
						hint: "OH-zhe / uh-muh-NYÃ / uh-GO-ruh",
						en: "today / tomorrow / now",
						examplePt: "Amanhã está fechado.",
						exampleEn: "Tomorrow it's closed."
					},
					{
						pt: "aberto / fechado",
						hint: "uh-BER-too / fuh-SHA-doo",
						en: "open / closed",
						examplePt: "Está aberto?",
						exampleEn: "Is it open?"
					},
					{
						pt: "segunda … domingo",
						hint: "suh-GOON-duh …",
						en: "Monday … Sunday",
						examplePt: "Às segundas está fechado.",
						exampleEn: "On Mondays it's closed."
					},
					{
						pt: "pequeno-almoço / almoço / jantar",
						hint: "pe-KEH-noo al-MO-soo",
						en: "breakfast / lunch / dinner",
						examplePt: "O almoço é à uma.",
						exampleEn: "Lunch is at one."
					}
				]
			},
			{
				type: "grammar",
				title: "São vs. é, and à",
				body: "É uma hora (1:00) but são duas / três / quatro… Meia = :30, e um quarto = :15, menos um quarto = :45. On + weekday: à segunda, às terças. Opening: das nove às dezoito (9–18).",
				examples: [
					{
						pt: "É uma hora.",
						en: "It's one o'clock."
					},
					{
						pt: "São dez e meia.",
						en: "It's half past ten."
					},
					{
						pt: "Aberto das nove às sete.",
						en: "Open from nine to seven."
					}
				]
			},
			{
				type: "dialogue",
				setting: "Ticket desk at a small museum.",
				lines: [
					{
						speaker: "You",
						pt: "Bom dia. Está aberto hoje?",
						en: "Good morning. Are you open today?"
					},
					{
						speaker: "Clerk",
						pt: "Sim. Até às dezoito.",
						en: "Yes. Until six."
					},
					{
						speaker: "You",
						pt: "E amanhã?",
						en: "And tomorrow?"
					},
					{
						speaker: "Clerk",
						pt: "Amanhã é segunda. Estamos fechados.",
						en: "Tomorrow is Monday. We're closed."
					},
					{
						speaker: "You",
						pt: "Ah. Então hoje. Que horas são?",
						en: "Ah. Then today. What time is it?"
					},
					{
						speaker: "Clerk",
						pt: "São duas e um quarto.",
						en: "It's a quarter past two."
					}
				]
			},
			{
				type: "culture",
				title: "Meals are later",
				body: "Lunch often 13:00–15:00; dinner 20:00 is normal, 21:00 not late. Pequeno-almoço is breakfast (not café da manhã). A Sunday lunch can last the afternoon. If a sign says encerrado, it is shut — no debate."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "It's 1:00. You say…",
				options: [
					"São uma hora",
					"É uma hora",
					"São um",
					"É duas"
				],
				answer: 1,
				explain: "Singular: é uma hora."
			},
			{
				id: "q2",
				kind: "listen",
				prompt: "When do they close?",
				speak: "Até às dezoito.",
				options: [
					"8:00",
					"16:00",
					"18:00",
					"20:00"
				],
				answer: 2,
				explain: "Dezoito = 18."
			},
			{
				id: "q3",
				kind: "choice",
				prompt: "Breakfast in Portugal is…",
				options: [
					"café da manhã",
					"pequeno-almoço",
					"jantar",
					"lanche da tarde only"
				],
				answer: 1,
				explain: "European Portuguese: pequeno-almoço."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Está fechado” means it is closed.",
				options: ["True", "False"],
				answer: 0,
				explain: "Fechado = closed."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“São dez e meia” is…",
				options: [
					"10:00",
					"10:15",
					"10:30",
					"10:45"
				],
				answer: 2,
				explain: "Meia = half."
			}
		]
	},
	{
		id: "a1-metro",
		level: "A1",
		unitId: "a1-city",
		unit: "In the city",
		order: 8,
		minutes: 12,
		title: "O metro — tickets and trams",
		titlePt: "Transportes",
		skill: "mix",
		summary: "Buy a ticket, ride the metro, and not miss your stop on the 28.",
		goals: [
			"Name transport",
			"Buy a ticket",
			"Ask if this is the right stop"
		],
		image: "/scenes/tram.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A1 · 12 min",
				title: "Yellow and green",
				body: "Lisbon's metro is small and honest. The tram is slower and better. You need: a ticket (bilhete or cartão), a direction (sentido), and the nerve to ask é esta a paragem?",
				phrase: {
					pt: "Um bilhete para o metro, se faz favor.",
					en: "A metro ticket, please."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "o metro / o eléctrico / o autocarro",
						hint: "MET-roo / uh-LEH-tree-koo",
						en: "metro / tram / bus",
						examplePt: "Vou de metro.",
						exampleEn: "I'm going by metro."
					},
					{
						pt: "o comboio",
						hint: "koom-BOY-oo",
						en: "train",
						examplePt: "O comboio para o Porto.",
						exampleEn: "The train to Porto."
					},
					{
						pt: "o bilhete / o cartão",
						hint: "beel-YET / kar-TOW̃",
						en: "ticket / travel card",
						examplePt: "Onde se compra o bilhete?",
						exampleEn: "Where do you buy the ticket?"
					},
					{
						pt: "a paragem",
						hint: "puh-RAH-zhaiñ",
						en: "stop",
						examplePt: "Qual é a próxima paragem?",
						exampleEn: "What's the next stop?"
					},
					{
						pt: "sentido",
						hint: "sen-TEE-doo",
						en: "direction",
						examplePt: "Sentido Santa Apolónia.",
						exampleEn: "Direction Santa Apolónia."
					},
					{
						pt: "vai para…?",
						hint: "vai PAH-ruh",
						en: "does this go to…?",
						examplePt: "Este eléctrico vai para a Graça?",
						exampleEn: "Does this tram go to Graça?"
					},
					{
						pt: "descer / sair",
						hint: "de-SEHR / sa-EER",
						en: "to get off / to exit",
						examplePt: "Onde é que eu desço?",
						exampleEn: "Where do I get off?"
					}
				]
			},
			{
				type: "grammar",
				title: "Ir de + transport",
				body: "Vou de metro, de eléctrico, de comboio, a pé. Destination: vou para o aeroporto, vou ao Chiado (ao = a + o). Este / esta / isto for 'this': este comboio, esta paragem, isto é o meu cartão.",
				examples: [
					{
						pt: "Este autocarro vai para Belém?",
						en: "Does this bus go to Belém?"
					},
					{
						pt: "Desço na próxima.",
						en: "I get off at the next one."
					},
					{
						pt: "O cartão está carregado?",
						en: "Is the card loaded?"
					}
				]
			},
			{
				type: "dialogue",
				setting: "Inside a packed 28, holding the pole.",
				lines: [
					{
						speaker: "You",
						pt: "Desculpe, este eléctrico vai para o Castelo?",
						en: "Excuse me, does this tram go to the Castle?"
					},
					{
						speaker: "Passenger",
						pt: "Sim. Mas é melhor descer na Graça e andar um pouco.",
						en: "Yes. But better to get off at Graça and walk a bit."
					},
					{
						speaker: "You",
						pt: "Qual é a paragem?",
						en: "Which stop?"
					},
					{
						speaker: "Passenger",
						pt: "Graça. Daqui a três paragens.",
						en: "Graça. Three stops from here."
					},
					{
						speaker: "You",
						pt: "Muito obrigado.",
						en: "Thank you very much."
					}
				]
			},
			{
				type: "culture",
				title: "Validate",
				body: "Tap in. Inspectors (o revisor) do ride the tram. A Viva Viagem card is the usual tourist ticket; zapping is pay-as-you-go. Comboio to Cascais or Sintra is a different system — ask um bilhete de comboio, ida or ida e volta (return)."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "A tram in Portugal is…",
				options: [
					"o bonde",
					"o eléctrico",
					"o ônibus",
					"o trem"
				],
				answer: 1,
				explain: "Eléctrico in European Portuguese."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Desço na próxima” means…",
				options: [
					"I stay on",
					"I get off at the next stop",
					"This is the last stop",
					"I need a ticket"
				],
				answer: 1,
				explain: "Descer = get off."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "Where should you get off?",
				speak: "Desça na Graça. Daqui a três paragens.",
				options: [
					"Now",
					"At Graça, in three stops",
					"At the castle directly",
					"Never"
				],
				answer: 1,
				explain: "Graça, three stops."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Ida e volta” is a return ticket.",
				options: ["True", "False"],
				answer: 0,
				explain: "There and back."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "Train is…",
				options: [
					"comboio",
					"trem",
					"autocarro",
					"barco"
				],
				answer: 0,
				explain: "Comboio in Portugal."
			}
		]
	},
	{
		id: "a1-mesa",
		level: "A1",
		unitId: "a1-city",
		unit: "In the city",
		order: 9,
		minutes: 12,
		title: "Uma mesa — sitting down to eat",
		titlePt: "A mesa",
		skill: "speak",
		summary: "Ask for a table, read the ementa, order, and ask for the bill — the other half of small talk.",
		goals: [
			"Ask for a table",
			"Order from the ementa",
			"Ask for a conta"
		],
		image: "/scenes/cafe.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A1 · 12 min",
				title: "The table is a conversation",
				body: "Portugal eats late and talks at the table. You need five moves: a table for two, the menu (ementa, not cardápio), one dish, water or wine, and the bill. Couvert — bread, olives — is charged if you eat it. You may leave it.",
				phrase: {
					pt: "Uma mesa para dois, se faz favor.",
					en: "A table for two, please."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "uma mesa para dois",
						hint: "MEH-zuh",
						en: "a table for two",
						examplePt: "Uma mesa para dois, se faz favor.",
						exampleEn: "A table for two, please."
					},
					{
						pt: "a ementa / o prato do dia",
						hint: "i-MEN-tuh",
						en: "the menu / today's dish",
						examplePt: "Qual é o prato do dia?",
						exampleEn: "What's today's dish?"
					},
					{
						pt: "queria / para mim",
						hint: "kuh-REE-uh",
						en: "I'd like / for me",
						examplePt: "Queria o peixe, para mim.",
						exampleEn: "I'd like the fish, for me."
					},
					{
						pt: "água / vinho da casa",
						hint: "AH-gwuh / VEEN-yoo",
						en: "water / house wine",
						examplePt: "Uma água e um vinho da casa, se faz favor.",
						exampleEn: "A water and a house wine, please."
					},
					{
						pt: "a conta",
						hint: "KON-tuh",
						en: "the bill",
						examplePt: "A conta, se faz favor.",
						exampleEn: "The bill, please."
					},
					{
						pt: "está incluído?",
						hint: "in-kloo-EE-doo",
						en: "is it included?",
						examplePt: "O couvert está incluído?",
						exampleEn: "Is the couvert included?"
					},
					{
						pt: "estava muito bom",
						hint: "shtah-vuh",
						en: "it was very good",
						examplePt: "Estava muito bom, obrigado.",
						exampleEn: "It was very good, thank you."
					}
				]
			},
			{
				type: "grammar",
				title: "Queria is softer than quero",
				body: "Quero is fine at a counter. At a table, queria (I would like) is the default. Para mim / para ele / para nós assigns dishes. Se faz favor does the work of please. A conta, se faz favor — not 'check' or a wave that looks like you're angry.",
				examples: [
					{
						pt: "Queria a sopa e o peixe, se faz favor.",
						en: "I'd like the soup and the fish, please."
					},
					{
						pt: "Para mim, o prato do dia.",
						en: "For me, today's dish."
					},
					{
						pt: "A conta, se faz favor.",
						en: "The bill, please."
					}
				]
			},
			{
				type: "dialogue",
				setting: "A tasca in Graça, 13:40. Paper tablecloths.",
				lines: [
					{
						speaker: "You",
						pt: "Boa tarde. Uma mesa para dois, se faz favor.",
						en: "Good afternoon. A table for two, please."
					},
					{
						speaker: "Waiter",
						pt: "Pois. Por aqui. A ementa.",
						en: "Right. This way. The menu."
					},
					{
						speaker: "You",
						pt: "Qual é o prato do dia?",
						en: "What's today's dish?"
					},
					{
						speaker: "Waiter",
						pt: "Bacalhau com broa. Está muito bom.",
						en: "Cod with cornbread. It's very good."
					},
					{
						speaker: "You",
						pt: "Queria isso, e uma água. A conta no fim, está bem?",
						en: "I'd like that, and a water. The bill at the end, all right?"
					},
					{
						speaker: "Waiter",
						pt: "Claro.",
						en: "Of course."
					}
				]
			},
			{
				type: "culture",
				title: "Couvert and the hour",
				body: "Lunch is often 12:30–15:00; dinner starts around 20:00. Couvert is not a gift — decline it if you don't want it. Tipping is modest, not American. 'A ementa' is the menu; cardápio is Brazilian. If the waiter says então?, it means 'so — what will it be?'"
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "The menu in Portugal is…",
				options: [
					"o cardápio",
					"a ementa",
					"a conta",
					"o prato"
				],
				answer: 1,
				explain: "Ementa in European Portuguese."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "At a table, a softer order uses…",
				options: [
					"Quero",
					"Queria",
					"Dou",
					"Vou"
				],
				answer: 1,
				explain: "Queria = I would like."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "What are they asking for?",
				speak: "A conta, se faz favor.",
				options: [
					"The menu",
					"The bill",
					"Water",
					"A table"
				],
				answer: 1,
				explain: "A conta = the bill."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "Couvert is always free.",
				options: ["True", "False"],
				answer: 1,
				explain: "You pay if you eat it. You may leave it."
			},
			{
				id: "q5",
				kind: "type",
				prompt: "Type the Portuguese for 'a table for two'.",
				accept: ["uma mesa para dois", "uma mesa para 2"],
				explain: "Uma mesa para dois."
			}
		]
	}
];
//#endregion
//#region src/data/a2.ts
var a2Lessons = [
	{
		id: "a2-tempo",
		level: "A2",
		unitId: "a2-talk",
		unit: "Daily talk",
		order: 1,
		minutes: 10,
		title: "O tempo — weather small talk",
		titlePt: "O tempo",
		skill: "speak",
		summary: "The safest five minutes of Portuguese: rain, sun, and complaining together.",
		goals: [
			"Describe the weather",
			"Respond to a stranger",
			"Use está + adjective"
		],
		image: "/scenes/tram.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A2 · 10 min",
				title: "Always the sky",
				body: "Lisbon light is a personality. People comment on it the way others comment on football. Estar is your verb. You do not need poetry — you need está um dia lindo and está a chover.",
				phrase: {
					pt: "Está um dia lindo, não está?",
					en: "It's a beautiful day, isn't it?"
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "está sol / está nublado",
						hint: "shtah sol / noo-BLAH-doo",
						en: "it's sunny / cloudy",
						examplePt: "Hoje está sol.",
						exampleEn: "It's sunny today."
					},
					{
						pt: "está a chover",
						hint: "shtah uh shoo-VEHR",
						en: "it's raining",
						examplePt: "Leva o guarda-chuva, está a chover.",
						exampleEn: "Take the umbrella, it's raining."
					},
					{
						pt: "está calor / está frio",
						hint: "kuh-LOR / FREE-oo",
						en: "it's hot / cold",
						examplePt: "Está muito calor.",
						exampleEn: "It's very hot."
					},
					{
						pt: "o vento / o nevoeiro",
						hint: "VEN-too / nuh-voo-AY-roo",
						en: "wind / fog",
						examplePt: "Há muito vento na ponte.",
						exampleEn: "It's very windy on the bridge."
					},
					{
						pt: "um dia lindo",
						hint: "oong DEE-uh LEEN-doo",
						en: "a lovely day",
						examplePt: "Está um dia lindo.",
						exampleEn: "It's a lovely day."
					},
					{
						pt: "não está?",
						hint: "now̃ shtah",
						en: "isn't it? (tag)",
						examplePt: "Está fresco, não está?",
						exampleEn: "It's chilly, isn't it?"
					},
					{
						pt: "o guarda-chuva",
						hint: "GWAR-duh SHOO-vuh",
						en: "umbrella",
						examplePt: "Esqueci o guarda-chuva.",
						exampleEn: "I forgot the umbrella."
					}
				]
			},
			{
				type: "grammar",
				title: "Está a + infinitive",
				body: "The European Portuguese continuous: está a chover, está a fazer sol, estou a aprender. Not the Brazilian está chovendo in these lessons. Tag questions: não está?, não é? — they invite agreement, which is the whole point of weather talk.",
				examples: [
					{
						pt: "Está a chover desde de manhã.",
						en: "It's been raining since morning."
					},
					{
						pt: "Estou a gostar deste tempo.",
						en: "I'm enjoying this weather."
					},
					{
						pt: "Amanhã vai estar melhor.",
						en: "Tomorrow it'll be better."
					}
				]
			},
			{
				type: "dialogue",
				setting: "Two people waiting under a tram shelter in Baixa.",
				lines: [
					{
						speaker: "Stranger",
						pt: "Que dia, pá. Está a chover outra vez.",
						en: "What a day. Raining again."
					},
					{
						speaker: "You",
						pt: "Pois é. Ontem estava um dia lindo.",
						en: "It is. Yesterday was beautiful."
					},
					{
						speaker: "Stranger",
						pt: "Em Lisboa o tempo muda em cinco minutos.",
						en: "In Lisbon the weather changes in five minutes."
					},
					{
						speaker: "You",
						pt: "Já percebi. Trouxe o guarda-chuva hoje.",
						en: "I've noticed. I brought the umbrella today."
					},
					{
						speaker: "Stranger",
						pt: "Fez bem.",
						en: "Good call."
					}
				]
			},
			{
				type: "culture",
				title: "Pá and pois é",
				body: "Pá (from rapaz) is informal glue — not rude among equals. Pois é agrees without adding information, like 'indeed'. Weather talk is how you join a queue as a person rather than a tourist."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "European Portuguese for 'it's raining'…",
				options: [
					"Está chovendo",
					"Está a chover",
					"Choveu agora não",
					"Faz rain"
				],
				answer: 1,
				explain: "Está a + infinitive."
			},
			{
				id: "q2",
				kind: "listen",
				prompt: "What's the weather?",
				speak: "Está um dia lindo, não está?",
				options: [
					"Stormy",
					"Lovely",
					"Freezing",
					"Foggy"
				],
				answer: 1,
				explain: "Um dia lindo."
			},
			{
				id: "q3",
				kind: "choice",
				prompt: "“Não está?” is…",
				options: [
					"A refusal",
					"A tag seeking agreement",
					"Past tense",
					"A goodbye"
				],
				answer: 1,
				explain: "Tag question."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Está calor” uses ser.",
				options: ["True", "False"],
				answer: 1,
				explain: "Weather uses estar."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "An umbrella is…",
				options: [
					"um chapéu",
					"um guarda-chuva",
					"uma toalha",
					"um casaco"
				],
				answer: 1,
				explain: "Guarda-chuva."
			},
			{
				id: "q6",
				kind: "type",
				prompt: "Type 'it's raining' in European Portuguese.",
				accept: ["está a chover", "esta a chover"],
				explain: "Está a chover — not está chovendo."
			}
		]
	},
	{
		id: "a2-ontem",
		level: "A2",
		unitId: "a2-talk",
		unit: "Daily talk",
		order: 2,
		minutes: 15,
		title: "Ontem — what I did yesterday",
		titlePt: "Pretérito",
		skill: "speak",
		summary: "The pretérito perfeito: yesterday's story in a handful of verbs.",
		goals: [
			"Conjugate regular -ar/-er/-ir in the past",
			"Use ontem / anteontem",
			"Tell a three-line story"
		],
		image: "/scenes/cafe.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A2 · 15 min",
				title: "Stories start yesterday",
				body: "Small talk graduates when you can say what you did. Portuguese pretérito perfeito is clean for completed actions: fui, vi, comi, gostei. This is the tense of last night's dinner and this morning's museum.",
				phrase: {
					pt: "Ontem fui ao oceano e comi peixe.",
					en: "Yesterday I went to the sea and ate fish."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "ontem / anteontem",
						hint: "ON-taiñ",
						en: "yesterday / the day before",
						examplePt: "Ontem estive no Porto.",
						exampleEn: "Yesterday I was in Porto."
					},
					{
						pt: "fui / foste / foi",
						hint: "fwee",
						en: "I/you/he went (ir)",
						examplePt: "Fui a Belém.",
						exampleEn: "I went to Belém."
					},
					{
						pt: "vi / viste / viu",
						hint: "vee",
						en: "I/you/he saw",
						examplePt: "Vi o Mosteiro.",
						exampleEn: "I saw the monastery."
					},
					{
						pt: "comi / bebi",
						hint: "koo-MEE / buh-BEE",
						en: "I ate / I drank",
						examplePt: "Comi um pastel.",
						exampleEn: "I ate a tart."
					},
					{
						pt: "gostei",
						hint: "goosh-TAY",
						en: "I liked",
						examplePt: "Gostei muito.",
						exampleEn: "I liked it a lot."
					},
					{
						pt: "estive / esteve",
						hint: "shtee-ve",
						en: "I was / he was (estar past)",
						examplePt: "Estive doente.",
						exampleEn: "I was ill."
					},
					{
						pt: "cheguei / saí",
						hint: "sheh-GAY / sa-EE",
						en: "I arrived / I left",
						examplePt: "Cheguei tarde.",
						exampleEn: "I arrived late."
					}
				]
			},
			{
				type: "grammar",
				title: "Regular past, plus the irregulars you actually need",
				body: "Falar → falei, falaste, falou, falámos. Comer → comi, comeste, comeu. Ir and ser share fui, foste, foi — context tells you which. Estar → estive, estiveste, esteve. Add ontem, de manhã, à noite, no sábado.",
				examples: [
					{
						pt: "Ontem falei com a minha irmã.",
						en: "Yesterday I spoke with my sister."
					},
					{
						pt: "Fomos a Sintra de comboio.",
						en: "We went to Sintra by train."
					},
					{
						pt: "Não gostei do restaurante.",
						en: "I didn't like the restaurant."
					}
				]
			},
			{
				type: "dialogue",
				setting: "Monday morning at the office kitchenette — or a café, same script.",
				lines: [
					{
						speaker: "Colleague",
						pt: "Então, como correu o fim de semana?",
						en: "So, how was the weekend?"
					},
					{
						speaker: "You",
						pt: "Bem. No sábado fui a Belém e vi o Mosteiro.",
						en: "Good. Saturday I went to Belém and saw the monastery."
					},
					{
						speaker: "Colleague",
						pt: "Comeste pastéis?",
						en: "Did you eat tarts?"
					},
					{
						speaker: "You",
						pt: "Comi dois. Gostei. No domingo estive em casa.",
						en: "I ate two. I liked them. Sunday I stayed home."
					},
					{
						speaker: "Colleague",
						pt: "Fez bem. Também precisei de descansar.",
						en: "Sensible. I needed rest too."
					}
				]
			},
			{
				type: "culture",
				title: "Fim de semana",
				body: "Ask como correu o fim de semana? on Monday. A short answer is enough; a three-clause story is perfect. Portuguese does not need a long recap. If you did nothing: estive em casa, a descansar — a complete, respectable weekend."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“I went” is…",
				options: [
					"vou",
					"fui",
					"ia",
					"irei"
				],
				answer: 1,
				explain: "Fui is pretérito of ir (and ser)."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Gostei” means…",
				options: [
					"I will like",
					"I like (now)",
					"I liked",
					"I don't like"
				],
				answer: 2,
				explain: "Past of gostar."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "What happened?",
				speak: "Ontem fui a Belém e comi um pastel.",
				options: [
					"Tomorrow I'll go",
					"Yesterday I went to Belém and ate a tart",
					"I never eat tarts",
					"I'm in Belém now"
				],
				answer: 1,
				explain: "Ontem + fui + comi."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Fui” can mean I went or I was.",
				options: ["True", "False"],
				answer: 0,
				explain: "Ir and ser share the form."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“Não gostei” is…",
				options: [
					"I didn't like it",
					"I don't want it",
					"I'm leaving",
					"I'm lost"
				],
				answer: 0,
				explain: "Negated past of gostar."
			}
		]
	},
	{
		id: "a2-gosto",
		level: "A2",
		unitId: "a2-talk",
		unit: "Daily talk",
		order: 3,
		minutes: 12,
		title: "Gosto — opinions without a fight",
		titlePt: "Opiniões",
		skill: "speak",
		summary: "Like, prefer, and disagree politely over coffee, football, and fado.",
		goals: [
			"Use gostar de",
			"Prefer and compare",
			"Disagree without heat"
		],
		image: "/scenes/cafe.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A2 · 12 min",
				title: "Taste is conversation",
				body: "Opinions are how acquaintances become people. Gosto de, prefiro, não acho que… keep you in the talk without a lecture. Portugal argues with charm; you can too.",
				phrase: {
					pt: "Gosto de fado, mas prefiro jazz.",
					en: "I like fado, but I prefer jazz."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "gosto de / não gosto de",
						hint: "GOSH-too de",
						en: "I like / I don't like",
						examplePt: "Gosto de vinho verde.",
						exampleEn: "I like vinho verde."
					},
					{
						pt: "adoro / detesto",
						hint: "uh-DO-roo / duh-TESH-too",
						en: "I love / I can't stand",
						examplePt: "Adoro esta cidade.",
						exampleEn: "I love this city."
					},
					{
						pt: "prefiro",
						hint: "pre-FEE-roo",
						en: "I prefer",
						examplePt: "Prefiro o Porto no inverno.",
						exampleEn: "I prefer Porto in winter."
					},
					{
						pt: "acho que",
						hint: "AH-shoo kuh",
						en: "I think that",
						examplePt: "Acho que sim.",
						exampleEn: "I think so."
					},
					{
						pt: "também / também não",
						hint: "tum-BAIñ",
						en: "me too / me neither",
						examplePt: "Também gosto.",
						exampleEn: "I like it too."
					},
					{
						pt: "pois / pois não",
						hint: "poyzh",
						en: "right / of course (service)",
						examplePt: "Pois não, pode sentar-se.",
						exampleEn: "Of course, do sit down."
					},
					{
						pt: "mais… do que",
						hint: "mighzh doo kuh",
						en: "more … than",
						examplePt: "Lisboa é mais quente do que o Porto.",
						exampleEn: "Lisbon is warmer than Porto."
					}
				]
			},
			{
				type: "grammar",
				title: "Gostar de + noun / infinitive",
				body: "Always de: gosto de café, gosto de caminhar. Question: gostas de…? / gosta de…? To disagree: eu não acho, eu prefiro, não é bem assim. Avoid a blunt não. Comparatives: mais / menos / tão … como.",
				examples: [
					{
						pt: "Gostas de marisco?",
						en: "Do you like seafood?"
					},
					{
						pt: "Não gosto muito, prefiro peixe grelhado.",
						en: "Not that much — I prefer grilled fish."
					},
					{
						pt: "Acho que o Chiado é mais caro.",
						en: "I think Chiado is more expensive."
					}
				]
			},
			{
				type: "dialogue",
				setting: "A table outside, two glasses of vinho, late afternoon.",
				lines: [
					{
						speaker: "Friend",
						pt: "Gostas de fado?",
						en: "Do you like fado?"
					},
					{
						speaker: "You",
						pt: "Gosto, mas ainda estou a aprender a ouvir.",
						en: "I do, but I'm still learning how to listen."
					},
					{
						speaker: "Friend",
						pt: "Há quem adore, há quem deteste. Sem meio-termo.",
						en: "People either love it or hate it. No middle."
					},
					{
						speaker: "You",
						pt: "Eu prefiro ao vivo, num sítio pequeno.",
						en: "I prefer it live, in a small place."
					},
					{
						speaker: "Friend",
						pt: "Pois. Isso muda tudo.",
						en: "Right. That changes everything."
					}
				]
			},
			{
				type: "culture",
				title: "Pois não means yes",
				body: "In service speech, pois não is 'of course' — not a no. A waiter saying pois não is agreeing to your request. The language is full of these inversions. Collect them; they make you sound local faster than vocabulary lists."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "Gostar needs…",
				options: [
					"a",
					"de",
					"em",
					"por"
				],
				answer: 1,
				explain: "Gosto de…"
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "A waiter saying “pois não” is…",
				options: [
					"Refusing",
					"Agreeing / of course",
					"Asking you to leave",
					"Confused"
				],
				answer: 1,
				explain: "Service 'of course'."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "What's the preference?",
				speak: "Gosto de fado, mas prefiro jazz.",
				options: [
					"Only fado",
					"Prefers jazz",
					"Hates both",
					"Doesn't know"
				],
				answer: 1,
				explain: "Prefiro jazz."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Também não” means 'me neither'.",
				options: ["True", "False"],
				answer: 0,
				explain: "Negative agreement."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“Acho que sim” means…",
				options: [
					"I refuse",
					"I think so",
					"I don't know you",
					"See you"
				],
				answer: 1,
				explain: "I think that yes."
			}
		]
	},
	{
		id: "a2-trabalho",
		level: "A2",
		unitId: "a2-talk",
		unit: "Daily talk",
		order: 4,
		minutes: 12,
		title: "O trabalho — what you do",
		titlePt: "O trabalho",
		skill: "speak",
		summary: "Job, study, holidays — the small-talk that follows 'where are you from?'.",
		goals: [
			"Ask what someone does",
			"Answer without a CV",
			"Keep it short and human"
		],
		image: "/scenes/cafe.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A2 · 12 min",
				title: "Not a LinkedIn",
				body: "Portuguese small talk asks o que faz? the way English asks 'what do you do?'. They want a handle, not a career. One sentence. Then ask them back. That is the whole lesson.",
				phrase: {
					pt: "Trabalho com computadores. E o senhor?",
					en: "I work with computers. And you?"
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "o que faz?",
						hint: "oo kuh fash",
						en: "what do you do? (polite)",
						examplePt: "O que faz, na vida?",
						exampleEn: "What do you do, in life?"
					},
					{
						pt: "trabalho em / trabalho com",
						hint: "truh-BAH-lyoo",
						en: "I work in / I work with",
						examplePt: "Trabalho em informática.",
						exampleEn: "I work in IT."
					},
					{
						pt: "estudo / estou reformado",
						hint: "shtoo-doo / heh-for-MAH-doo",
						en: "I study / I'm retired",
						examplePt: "Estou reformado.",
						exampleEn: "I'm retired."
					},
					{
						pt: "estou de férias",
						hint: "DEH FEH-ryush",
						en: "I'm on holiday",
						examplePt: "Estou de férias em Lisboa.",
						exampleEn: "I'm on holiday in Lisbon."
					},
					{
						pt: "trabalho a partir de casa",
						hint: "ah pur-TEER de KAH-zuh",
						en: "I work from home",
						examplePt: "Trabalho a partir de casa.",
						exampleEn: "I work from home."
					},
					{
						pt: "gosto do que faço",
						hint: "GOSH-too doo kuh FAH-soo",
						en: "I like what I do",
						examplePt: "Gosto do que faço, na maior parte dos dias.",
						exampleEn: "I like what I do, most days."
					},
					{
						pt: "é complicado explicar",
						hint: "kom-plee-KAH-doo",
						en: "it's complicated to explain",
						examplePt: "É um pouco complicado de explicar.",
						exampleEn: "It's a bit complicated to explain."
					}
				]
			},
			{
				type: "grammar",
				title: "Fazer vs. trabalhar",
				body: "O que faz? is the question; trabalho em… is the answer. Em names a field (em educação, em informática); com names a material or tool (com madeira, com computadores). Sou + profession (sou professor) is fine when the noun is clean. If the job is a mess of titles, trabalho com… is more Portuguese than a calque of your English job title.",
				examples: [
					{
						pt: "O que faz? — Trabalho na área da saúde.",
						en: "What do you do? — I work in health."
					},
					{
						pt: "Sou engenheiro, mas agora estou de férias.",
						en: "I'm an engineer, but I'm on holiday now."
					},
					{
						pt: "E tu, em que trabalhas?",
						en: "And you, what do you work in?"
					}
				]
			},
			{
				type: "dialogue",
				setting: "A long queue at the padaria. Two strangers, one question.",
				lines: [
					{
						speaker: "Neighbour",
						pt: "Está cá de férias?",
						en: "Are you here on holiday?"
					},
					{
						speaker: "You",
						pt: "Sim. Trabalho na Alemanha, a partir de casa.",
						en: "Yes. I work in Germany, from home."
					},
					{
						speaker: "Neighbour",
						pt: "E o que faz, se não é indiscrição?",
						en: "And what do you do, if it's not too nosy?"
					},
					{
						speaker: "You",
						pt: "Trabalho com computadores. É um pouco complicado de explicar.",
						en: "I work with computers. It's a bit complicated to explain."
					},
					{
						speaker: "Neighbour",
						pt: "Pois. Eu sou professor. Estou de férias também.",
						en: "Right. I'm a teacher. Also on holiday."
					},
					{
						speaker: "You",
						pt: "Gosto do que faço. Na maior parte dos dias.",
						en: "I like what I do. Most days."
					}
				]
			},
			{
				type: "culture",
				title: "Se não é indiscrição",
				body: "The phrase softens a personal question: 'if it's not too nosy'. You can use it too. Portugal is less allergic to asking about work than Britain, and less identity-fused to job titles than the US. A shrug and trabalho com… is enough. Then: e o senhor?"
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "The polite 'what do you do?' is…",
				options: [
					"Como está?",
					"O que faz?",
					"Quanto custa?",
					"Onde fica?"
				],
				answer: 1,
				explain: "O que faz?"
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Estou de férias” means…",
				options: [
					"I'm angry",
					"I'm on holiday",
					"I'm late",
					"I'm retired"
				],
				answer: 1,
				explain: "De férias = on holiday."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "Where do they work?",
				speak: "Trabalho a partir de casa.",
				options: [
					"In an office tower",
					"From home",
					"At the café",
					"In a school"
				],
				answer: 1,
				explain: "A partir de casa."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Trabalho com” names a field like medicine.",
				options: ["True", "False"],
				answer: 1,
				explain: "Com is for tools/materials; em is for a field."
			},
			{
				id: "q5",
				kind: "type",
				prompt: "Type 'I like what I do'.",
				accept: ["gosto do que faço", "gosto do que faco"],
				explain: "Gosto do que faço."
			}
		]
	},
	{
		id: "a2-planos",
		level: "A2",
		unitId: "a2-life",
		unit: "Out in life",
		order: 4,
		minutes: 12,
		title: "Vamos? — making plans",
		titlePt: "Planos",
		skill: "speak",
		summary: "Propose a time, a place, and a graceful way out if they can't.",
		goals: [
			"Use ir + infinitive",
			"Suggest with vamos / que tal",
			"Accept or decline"
		],
		image: "/scenes/tram.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A2 · 12 min",
				title: "The text message",
				body: "Portuguese plans are often last-minute and verbal. Vamos tomar um café? is both a question and a life. You need future-of-intention (vou / vamos) and a polite não posso for the days you can't.",
				phrase: {
					pt: "Vamos jantar amanhã à noite?",
					en: "Shall we have dinner tomorrow night?"
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "vamos…?",
						hint: "VAH-moosh",
						en: "shall we…?",
						examplePt: "Vamos a um concerto?",
						exampleEn: "Shall we go to a concert?"
					},
					{
						pt: "que tal…?",
						hint: "kuh tahl",
						en: "how about…?",
						examplePt: "Que tal às oito?",
						exampleEn: "How about eight?"
					},
					{
						pt: "vou / vamos",
						hint: "voh",
						en: "I'm going to / we're going to",
						examplePt: "Vou ficar em casa.",
						exampleEn: "I'm going to stay home."
					},
					{
						pt: "pode ser",
						hint: "PAW-de sehr",
						en: "that works / maybe",
						examplePt: "Às nove pode ser.",
						exampleEn: "Nine could work."
					},
					{
						pt: "não posso",
						hint: "now̃ PAW-soo",
						en: "I can't",
						examplePt: "Hoje não posso.",
						exampleEn: "I can't today."
					},
					{
						pt: "marcar / desmarcar",
						hint: "mar-KAR",
						en: "to book / to cancel",
						examplePt: "Posso marcar mesa?",
						exampleEn: "Can I book a table?"
					},
					{
						pt: "à noite / de manhã / à tarde",
						hint: "uh NOY-te",
						en: "in the evening / morning / afternoon",
						examplePt: "À tarde estou livre.",
						exampleEn: "I'm free in the afternoon."
					}
				]
			},
			{
				type: "grammar",
				title: "Ir + infinitive is your future",
				body: "Before the proper future tense, Portuguese lives on vou + infinitive: vou telefonar, vamos sair. Invitations: vamos + infinitive, queres + infinitive, que tal se…? Accept: boa ideia, pode ser, combinado. Decline: hoje não dá, talvez outro dia.",
				examples: [
					{
						pt: "Vou telefonar ao restaurante.",
						en: "I'm going to call the restaurant."
					},
					{
						pt: "Queres vir connosco?",
						en: "Want to come with us? (connosco = with us, PT)"
					},
					{
						pt: "Combinado. Até amanhã.",
						en: "Deal. See you tomorrow."
					}
				]
			},
			{
				type: "dialogue",
				setting: "A voice note, then a reply — written here as speech.",
				lines: [
					{
						speaker: "Friend",
						pt: "Olá. Vamos jantar amanhã? Conheço um sítio no Bairro Alto.",
						en: "Hi. Dinner tomorrow? I know a place in Bairro Alto."
					},
					{
						speaker: "You",
						pt: "Boa ideia. Que tal às oito e meia?",
						en: "Good idea. How about half eight?"
					},
					{
						speaker: "Friend",
						pt: "Pode ser. Vou marcar mesa.",
						en: "That works. I'll book a table."
					},
					{
						speaker: "You",
						pt: "Obrigado. Até amanhã.",
						en: "Thanks. See you tomorrow."
					},
					{
						speaker: "Friend",
						pt: "Combinado.",
						en: "Deal."
					}
				]
			},
			{
				type: "culture",
				title: "Connosco, not conosco",
				body: "Portugal writes connosco, connosco, facto, aspeto. Brazil writes conosco, fato, aspecto. Tiny letters, big flag. Dinner at 20:30 is early-normal; 19:00 is for tourists and families with children."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Combinado” means…",
				options: [
					"I'm confused",
					"Deal / agreed",
					"Cancelled",
					"Expensive"
				],
				answer: 1,
				explain: "It's a handshake in a word."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "European Portuguese for 'with us'…",
				options: [
					"conosco",
					"connosco",
					"con nosotros",
					"com nós de"
				],
				answer: 1,
				explain: "Double n in Portugal."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "What's the plan?",
				speak: "Vamos jantar amanhã à noite?",
				options: [
					"Lunch today",
					"Dinner tomorrow night",
					"Breakfast now",
					"Cancel dinner"
				],
				answer: 1,
				explain: "Jantar amanhã à noite."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Não dá” can mean it doesn't work (for plans).",
				options: ["True", "False"],
				answer: 0,
				explain: "Very common decline."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“Que tal às oito?” proposes…",
				options: [
					"A place",
					"A time",
					"A dish",
					"A person"
				],
				answer: 1,
				explain: "Que tal + time."
			}
		]
	},
	{
		id: "a2-farmacia",
		level: "A2",
		unitId: "a2-life",
		unit: "Out in life",
		order: 5,
		minutes: 12,
		title: "Farmácia — asking for help",
		titlePt: "Saúde",
		skill: "speak",
		summary: "Body, chemist, and the sentences you hope not to need — and will.",
		goals: [
			"Name symptoms",
			"Ask at a farmácia",
			"Understand simple advice"
		],
		image: "/scenes/cafe.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A2 · 12 min",
				title: "The green cross",
				body: "Portuguese pharmacists are used to being the first doctor. You can walk in, describe a symptom, and leave with advice. Precision beats drama: dói-me a cabeça is enough.",
				phrase: {
					pt: "Dói-me a garganta. Pode ajudar?",
					en: "My throat hurts. Can you help?"
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "dói-me…",
						hint: "doy-muh",
						en: "…hurts (me)",
						examplePt: "Dói-me a barriga.",
						exampleEn: "My stomach hurts."
					},
					{
						pt: "a cabeça / a garganta / a tosse",
						hint: "kuh-BEH-suh / gar-GAN-tuh",
						en: "head / throat / cough",
						examplePt: "Tenho tosse há dois dias.",
						exampleEn: "I've had a cough for two days."
					},
					{
						pt: "tenho febre / estou constipado",
						hint: "FEH-bre / kon-stee-PAH-doo",
						en: "I have a fever / I have a cold",
						examplePt: "Estou constipado.",
						exampleEn: "I've got a cold."
					},
					{
						pt: "sem receita",
						hint: "saiñ ruh-SAY-tuh",
						en: "without a prescription",
						examplePt: "Isto é sem receita?",
						exampleEn: "Is this over the counter?"
					},
					{
						pt: "de manhã e à noite",
						hint: "",
						en: "morning and night (dosage)",
						examplePt: "Tome de manhã e à noite.",
						exampleEn: "Take it morning and night."
					},
					{
						pt: "preciso de um médico",
						hint: "pre-SEE-zoo",
						en: "I need a doctor",
						examplePt: "Preciso de um médico hoje?",
						exampleEn: "Do I need a doctor today?"
					},
					{
						pt: "o seguro / o cartão europeu",
						hint: "suh-GOO-roo",
						en: "insurance / EHIC-style card",
						examplePt: "Tenho o cartão europeu.",
						exampleEn: "I have the European health card."
					}
				]
			},
			{
				type: "grammar",
				title: "Dói-me + article + body part",
				body: "Portuguese often puts the pain first: dói-me a cabeça, doem-me os pés (plural doem). Estou + adjective: estou doente, cansado, constipado. Precisar de: preciso de água, preciso de ajuda. Instructions come in the imperative: tome, aplique, descanse.",
				examples: [
					{
						pt: "Doem-me os dentes.",
						en: "My teeth hurt."
					},
					{
						pt: "Tome um comprimido de oito em oito horas.",
						en: "Take a tablet every eight hours."
					},
					{
						pt: "Se não melhorar, vá ao médico.",
						en: "If it doesn't improve, go to the doctor."
					}
				]
			},
			{
				type: "dialogue",
				setting: "A neighbourhood farmácia, the pharmacist behind the counter.",
				lines: [
					{
						speaker: "You",
						pt: "Boa tarde. Dói-me a garganta e tenho tosse.",
						en: "Good afternoon. My throat hurts and I have a cough."
					},
					{
						speaker: "Pharmacist",
						pt: "Há quanto tempo?",
						en: "For how long?"
					},
					{
						speaker: "You",
						pt: "Desde ontem. Não tenho febre.",
						en: "Since yesterday. No fever."
					},
					{
						speaker: "Pharmacist",
						pt: "Isto é sem receita. Tome de manhã e à noite. Se piorar, vá ao médico.",
						en: "This is over the counter. Morning and night. If it gets worse, see a doctor."
					},
					{
						speaker: "You",
						pt: "Obrigado. Quanto custa?",
						en: "Thank you. How much is it?"
					}
				]
			},
			{
				type: "culture",
				title: "Farmácia vs. hospital",
				body: "For minor issues, the chemist is the door. Urgent care is urgências — expect a wait. EU residents should carry the European Health Insurance Card. Say se faz favor, describe, then listen; pharmacists speak clearly if you look lost."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Dói-me a cabeça” means…",
				options: [
					"I think too much",
					"My head hurts",
					"I need a hat",
					"I'm bored"
				],
				answer: 1,
				explain: "Pain + body part."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "A cold is…",
				options: [
					"estou constipado",
					"estou fresco",
					"tenho vento",
					"estou fechado"
				],
				answer: 0,
				explain: "Constipado = a cold (not constipation)."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "Advice?",
				speak: "Tome de manhã e à noite.",
				options: [
					"Only at night",
					"Morning and night",
					"Don't take it",
					"Take with wine"
				],
				answer: 1,
				explain: "De manhã e à noite."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Sem receita” means you need a prescription.",
				options: ["True", "False"],
				answer: 1,
				explain: "Sem = without."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "Urgent care is called…",
				options: [
					"farmácia",
					"urgências",
					"pastelaria",
					"estação"
				],
				answer: 1,
				explain: "Urgências."
			}
		]
	},
	{
		id: "a2-compras",
		level: "A2",
		unitId: "a2-life",
		unit: "Out in life",
		order: 6,
		minutes: 12,
		title: "O mercado — shopping talk",
		titlePt: "Compras",
		skill: "mix",
		summary: "Fruit, sizes, and the half-kilo of olives that starts a conversation.",
		goals: [
			"Ask for quantities",
			"Talk sizes and colours",
			"Handle a simple complaint"
		],
		image: "/scenes/cafe.jpg",
		sections: [
			{
				type: "intro",
				kicker: "A2 · 12 min",
				title: "By the kilo",
				body: "Markets and small shops still weigh, slice, and ask you something. Queria um quarto de quilo de… is a full sentence of belonging. This lesson is food and clothes — the two rooms where Portuguese happens to you.",
				phrase: {
					pt: "Queria um quarto de quilo de azeitonas, se faz favor.",
					en: "I'd like a quarter kilo of olives, please."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "um quarto / meio quilo",
						hint: "KWAR-too / MAY-oo KEE-loo",
						en: "¼ kg / ½ kg",
						examplePt: "Meio quilo de queijo.",
						exampleEn: "Half a kilo of cheese."
					},
					{
						pt: "mais um pouco / chega",
						hint: "SHAY-guh",
						en: "a bit more / that's enough",
						examplePt: "Chega, obrigado.",
						exampleEn: "That's enough, thanks."
					},
					{
						pt: "o tamanho / o número",
						hint: "tuh-MAN-yoo",
						en: "size (clothes) / size (shoes)",
						examplePt: "Tem o número quarenta?",
						exampleEn: "Do you have a forty?"
					},
					{
						pt: "provar",
						hint: "proo-VAR",
						en: "to try on / to taste",
						examplePt: "Posso provar?",
						exampleEn: "Can I try it on / taste?"
					},
					{
						pt: "ficam bem",
						hint: "FEE-kow̃ baiñ",
						en: "they suit you / they fit well",
						examplePt: "Esses ficam-lhe bem.",
						exampleEn: "Those suit you."
					},
					{
						pt: "a troca / o reembolso",
						hint: "TRO-kuh / hee-em-BOL-soo",
						en: "exchange / refund",
						examplePt: "Posso trocar?",
						exampleEn: "Can I exchange it?"
					},
					{
						pt: "demasiado caro",
						hint: "duh-muh-SYA-doo KAH-roo",
						en: "too expensive",
						examplePt: "É demasiado caro para mim.",
						exampleEn: "It's too expensive for me."
					}
				]
			},
			{
				type: "grammar",
				title: "Queria + quantity + de + noun",
				body: "Queria meio quilo de tomate. This + that: este queijo, essa camisola, aqueles sapatos. Clothes: o tamanho M, o número 42. Too: demasiado / demasiado + adjective. Chega is both 'enough' and 'it arrives'.",
				examples: [
					{
						pt: "Queria aquele pão, o mais escuro.",
						en: "I'd like that loaf, the darker one."
					},
					{
						pt: "Tem isto num tamanho mais pequeno?",
						en: "Do you have this in a smaller size?"
					},
					{
						pt: "Vou ficar com este.",
						en: "I'll take this one."
					}
				]
			},
			{
				type: "dialogue",
				setting: "A stall at Mercado da Ribeira, olives in tubs.",
				lines: [
					{
						speaker: "Vendor",
						pt: "Então, o que lhe apetece?",
						en: "So, what do you fancy?"
					},
					{
						speaker: "You",
						pt: "Queria um quarto de quilo destas azeitonas.",
						en: "A quarter kilo of these olives."
					},
					{
						speaker: "Vendor",
						pt: "Mais um pouco?",
						en: "A bit more?"
					},
					{
						speaker: "You",
						pt: "Chega, obrigado. E um pão alentejano.",
						en: "That's enough, thanks. And an Alentejo loaf."
					},
					{
						speaker: "Vendor",
						pt: "Fica em quatro euros e vinte.",
						en: "That's four twenty."
					}
				]
			},
			{
				type: "culture",
				title: "O que lhe apetece?",
				body: "Apetecer is 'to appeal' — o que lhe apetece? is 'what do you feel like?'. At markets, tasting (provar) is normal. Bargaining is not a sport here the way it is in some countries; a smile and exact quantities work better than haggling."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Chega” at a stall most likely means…",
				options: [
					"He's arriving",
					"That's enough",
					"It's expensive",
					"Come here"
				],
				answer: 1,
				explain: "Enough, stop pouring."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "Shoe size is…",
				options: [
					"o tamanho",
					"o número",
					"o quilo",
					"a receita"
				],
				answer: 1,
				explain: "Número for shoes."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "How much olive?",
				speak: "Queria um quarto de quilo destas azeitonas.",
				options: [
					"1 kg",
					"½ kg",
					"¼ kg",
					"2 kg"
				],
				answer: 2,
				explain: "Um quarto de quilo."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Posso provar?” can mean try on or taste.",
				options: ["True", "False"],
				answer: 0,
				explain: "Context decides."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“Vou ficar com este” means…",
				options: [
					"I'll leave it",
					"I'll take this one",
					"I'll think about it",
					"It's too small"
				],
				answer: 1,
				explain: "Ficar com = keep / take."
			}
		]
	}
];
//#endregion
//#region src/data/b1.ts
var b1Lessons = [
	{
		id: "b1-historia",
		level: "B1",
		unitId: "b1-listen-read",
		unit: "Listen & read",
		order: 1,
		minutes: 15,
		title: "Contar histórias — then vs. used to",
		titlePt: "Histórias",
		skill: "speak",
		summary: "Pretérito vs. imperfeito: the two pasts that make a story sound like a story.",
		goals: [
			"Choose perfeito vs. imperfeito",
			"Set a scene, then land an event",
			"Tell a 60-second anecdote"
		],
		image: "/scenes/books.jpg",
		sections: [
			{
				type: "intro",
				kicker: "B1 · 15 min",
				title: "The camera and the cut",
				body: "Imperfeito is the wide shot: it was raining, we used to live there, she was wearing blue. Pretérito is the cut: then the tram stopped, I saw her, we spoke. Mix them and you sound like a person, not a textbook.",
				phrase: {
					pt: "Chovia quando o eléctrico parou.",
					en: "It was raining when the tram stopped."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "quando / enquanto",
						hint: "KWAN-doo / en-KWAN-too",
						en: "when / while",
						examplePt: "Enquanto esperava, li o jornal.",
						exampleEn: "While I waited, I read the paper."
					},
					{
						pt: "costuma(va)",
						hint: "koosh-TOO-muh-vuh",
						en: "used to / would (habit)",
						examplePt: "Costumava ir a pé.",
						exampleEn: "I used to walk."
					},
					{
						pt: "de repente",
						hint: "duh ruh-PEN-te",
						en: "suddenly",
						examplePt: "De repente, apagaram-se as luzes.",
						exampleEn: "Suddenly the lights went out."
					},
					{
						pt: "ainda / já não",
						hint: "AYN-duh / zhah now̃",
						en: "still / no longer",
						examplePt: "Ainda morava no Porto.",
						exampleEn: "I still lived in Porto."
					},
					{
						pt: "naquela altura",
						hint: "nuh-KEH-luh AL-too-ruh",
						en: "at that time",
						examplePt: "Naquela altura não falava português.",
						exampleEn: "At that time I didn't speak Portuguese."
					},
					{
						pt: "lembro-me de",
						hint: "LEM-broo-muh de",
						en: "I remember",
						examplePt: "Lembro-me do cheiro a sardinhas.",
						exampleEn: "I remember the smell of sardines."
					},
					{
						pt: "aconteceu",
						hint: "uh-kon-te-SEH-oo",
						en: "it happened",
						examplePt: "Aconteceu no verão passado.",
						exampleEn: "It happened last summer."
					}
				]
			},
			{
				type: "grammar",
				title: "Background vs. event",
				body: "Era, estava, chovia, havia, queria — scene. Foi, esteve, choveu, houve, quis — event. Habit in the past is often imperfeito or costumava. A useful frame: Era… quando de repente…. Reflexive memory: lembro-me de + noun / infinitive (European).",
				examples: [
					{
						pt: "Era tarde e havia pouca gente na rua.",
						en: "It was late and there were few people in the street. (scene)"
					},
					{
						pt: "Quando cheguei, a loja já tinha fechado.",
						en: "When I arrived, the shop had already closed."
					},
					{
						pt: "Lembro-me de ouvir a rádio na cozinha dela.",
						en: "I remember hearing the radio in her kitchen."
					}
				]
			},
			{
				type: "dialogue",
				setting: "Telling a short story to a Portuguese colleague over lunch.",
				lines: [
					{
						speaker: "You",
						pt: "No primeiro dia em Lisboa, estava perdido. Chovia.",
						en: "On my first day in Lisbon I was lost. It was raining."
					},
					{
						speaker: "Colleague",
						pt: "Clássico.",
						en: "Classic."
					},
					{
						speaker: "You",
						pt: "Pedi ajuda a uma senhora. Ela riu-se e disse: 'isso acontece a toda a gente'.",
						en: "I asked a woman for help. She laughed and said, 'that happens to everyone'."
					},
					{
						speaker: "Colleague",
						pt: "E depois?",
						en: "And then?"
					},
					{
						speaker: "You",
						pt: "Levou-me até ao eléctrico. Nunca mais me perdi daquela maneira.",
						en: "She walked me to the tram. I never got that lost again."
					}
				]
			},
			{
				type: "culture",
				title: "Understatement",
				body: "Portuguese stories often land softly. Nunca mais me perdi daquela maneira is enough of a moral. You do not need to announce that it was meaningful. The tense work does the feeling."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Chovia quando o eléctrico parou” — chovia is…",
				options: [
					"A finished event",
					"Background / ongoing past",
					"Future",
					"Command"
				],
				answer: 1,
				explain: "Imperfeito paints the scene."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "European Portuguese 'I remember' is often…",
				options: [
					"eu recordo isso",
					"lembro-me de",
					"eu me lembro que de",
					"estou memória"
				],
				answer: 1,
				explain: "Lembrar-se de."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "What is the scene?",
				speak: "Era tarde e havia pouca gente na rua.",
				options: [
					"Morning rush hour",
					"Late, few people in the street",
					"A party",
					"The beach at noon"
				],
				answer: 1,
				explain: "Era tarde, pouca gente."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“De repente” often introduces a pretérito event.",
				options: ["True", "False"],
				answer: 0,
				explain: "Suddenly + cut."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“Costumava ir a pé” means…",
				options: [
					"I will walk",
					"I used to walk",
					"I never walk",
					"Walk now"
				],
				answer: 1,
				explain: "Past habit."
			}
		]
	},
	{
		id: "b1-noticias",
		level: "B1",
		unitId: "b1-listen-read",
		unit: "Listen & read",
		order: 2,
		minutes: 15,
		title: "As notícias — reading a short article",
		titlePt: "Notícias",
		skill: "read",
		summary: "A newspaper paragraph, the verbs journalists love, and how to skim in Portuguese.",
		goals: [
			"Spot the who/what/where",
			"Recognise journalistic past",
			"Guess unknown words from context"
		],
		image: "/scenes/books.jpg",
		sections: [
			{
				type: "intro",
				kicker: "B1 · 15 min",
				title: "One column, one coffee",
				body: "You do not need every word. Público, Observador, and local papers write a Portuguese you will meet in radio later. Strategy: title, first sentence, names, numbers — then the rest.",
				phrase: {
					pt: "A Câmara anunciou obras na Avenida.",
					en: "The city council announced roadworks on the avenue."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "a câmara municipal",
						hint: "KAH-muh-ruh",
						en: "city council (PT)",
						examplePt: "A Câmara aprovou o orçamento.",
						exampleEn: "The council passed the budget."
					},
					{
						pt: "foi anunciado",
						hint: "annoon-see-AH-doo",
						en: "it was announced",
						examplePt: "Foi anunciado esta manhã.",
						exampleEn: "It was announced this morning."
					},
					{
						pt: "segundo / de acordo com",
						hint: "suh-GOON-doo",
						en: "according to",
						examplePt: "Segundo a polícia…",
						exampleEn: "According to the police…"
					},
					{
						pt: "no entanto / apesar de",
						hint: "en-TAN-too / uh-pe-ZAR",
						en: "however / despite",
						examplePt: "No entanto, o trânsito continua.",
						exampleEn: "However, traffic continues."
					},
					{
						pt: "obras / cortes de trânsito",
						hint: "AW-brush",
						en: "roadworks / traffic closures",
						examplePt: "Há obras na Baixa.",
						exampleEn: "There are roadworks in Baixa."
					},
					{
						pt: "aumentar / reduzir",
						hint: "ow-men-TAR / ruh-doo-ZEER",
						en: "to increase / to reduce",
						examplePt: "Os preços aumentaram.",
						exampleEn: "Prices went up."
					},
					{
						pt: "ainda não se sabe",
						hint: "AYN-duh now̃ suh SAH-be",
						en: "it is not yet known",
						examplePt: "Ainda não se sabe a data.",
						exampleEn: "The date is not yet known."
					}
				]
			},
			{
				type: "grammar",
				title: "Se + verb, and the journalist's past",
				body: "Passive and impersonal se: anunciou-se, sabe-se, espera-se. Perfect for headlines. Pretérito for what happened; presente for what still holds. Numbers stay in digits — train your eye, not your mouth first.",
				examples: [
					{
						pt: "Sabe-se que as obras duram três meses.",
						en: "It is known that the works last three months."
					},
					{
						pt: "Os comboios circularam com atrasos.",
						en: "Trains ran with delays."
					},
					{
						pt: "Ainda não se sabe quando reabre.",
						en: "It's not yet known when it reopens."
					}
				]
			},
			{
				type: "dialogue",
				setting: "Read this as a short article — then the chat that follows.",
				lines: [
					{
						speaker: "Paper",
						pt: "A Câmara de Lisboa anunciou ontem um novo plano para o trânsito no centro. As obras na Avenida da Liberdade começam na segunda-feira.",
						en: "Lisbon council yesterday announced a new traffic plan for the centre. Works on Avenida da Liberdade start on Monday."
					},
					{
						speaker: "Paper",
						pt: "Segundo o vereador, os cortes serão pontuais. No entanto, recomenda-se o metro.",
						en: "According to the councillor, closures will be limited. However, the metro is recommended."
					},
					{
						speaker: "You",
						pt: "Então vou de metro na segunda.",
						en: "Then I'll take the metro on Monday."
					},
					{
						speaker: "Colleague",
						pt: "Pois. Toda a gente vai pensar o mesmo.",
						en: "Right. Everyone will think the same."
					}
				]
			},
			{
				type: "culture",
				title: "Câmara is not a hotel room",
				body: "Câmara municipal is the city government. A vereador is a councillor. Reading local news is how you pick up the verbs of civic life — the same verbs radio uses at 08:00. Ten minutes of a Portuguese paper beats another vocab list."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“A Câmara” in a Lisbon paper is usually…",
				options: [
					"A hotel room",
					"The city council",
					"A TV camera only",
					"A bakery"
				],
				answer: 1,
				explain: "Câmara municipal."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Segundo a polícia” means…",
				options: [
					"The police are second",
					"According to the police",
					"Under the police station",
					"Without police"
				],
				answer: 1,
				explain: "Segundo = according to."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "What starts Monday?",
				speak: "As obras na Avenida da Liberdade começam na segunda-feira.",
				options: [
					"A concert",
					"Roadworks on Avenida da Liberdade",
					"School",
					"A strike at the airport"
				],
				answer: 1,
				explain: "Obras começam na segunda."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Ainda não se sabe” means the fact is already certain.",
				options: ["True", "False"],
				answer: 1,
				explain: "It is not yet known."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“No entanto” is closest to…",
				options: [
					"And then",
					"However",
					"Because",
					"Please"
				],
				answer: 1,
				explain: "Contrast."
			}
		]
	},
	{
		id: "b1-radio",
		level: "B1",
		unitId: "b1-listen-read",
		unit: "Listen & read",
		order: 3,
		minutes: 15,
		title: "Rádio — training the ear",
		titlePt: "Antena",
		skill: "listen",
		summary: "A news-bulletin shape, filler words, and how to survive 90 seconds of RTP.",
		goals: [
			"Catch the lead sentence",
			"Ignore filler (portanto, ou seja)",
			"Note one fact to retell"
		],
		image: "/scenes/radio.jpg",
		sections: [
			{
				type: "intro",
				kicker: "B1 · 15 min",
				title: "Ninety seconds",
				body: "Radio is faster than your teacher and kinder than a crowded bar. Antena 1, TSF, Renascença: same grammar as the paper, more portanto. You will not get every word. You will get the spine.",
				phrase: {
					pt: "Em destaque hoje, o tempo e o trânsito em Lisboa.",
					en: "Today's headlines: weather and traffic in Lisbon."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "em destaque",
						hint: "desh-TA-ke",
						en: "headline / featured",
						examplePt: "Em destaque, as eleições.",
						exampleEn: "Headlines: the elections."
					},
					{
						pt: "segundo as últimas informações",
						hint: "",
						en: "according to the latest information",
						examplePt: "Segundo as últimas informações, o trânsito está condicionado.",
						exampleEn: "Latest: traffic is restricted."
					},
					{
						pt: "portanto / ou seja",
						hint: "poor-TAN-too / oh SAY-uh",
						en: "so / that is to say",
						examplePt: "Portanto, evitem a ponte.",
						exampleEn: "So, avoid the bridge."
					},
					{
						pt: "condicionado / cortado",
						hint: "kon-dee-syo-NAH-doo",
						en: "restricted / closed (traffic)",
						examplePt: "O trânsito está cortado.",
						exampleEn: "The road is closed."
					},
					{
						pt: "prevê-se que",
						hint: "pre-VEH-suh kuh",
						en: "it is forecast that",
						examplePt: "Prevê-se que chova à tarde.",
						exampleEn: "Rain is forecast for the afternoon."
					},
					{
						pt: "a seguir",
						hint: "uh se-GEER",
						en: "coming up / next",
						examplePt: "A seguir, desporto.",
						exampleEn: "Next, sport."
					},
					{
						pt: "em direto",
						hint: "aiñ dee-RE-too",
						en: "live (PT spelling)",
						examplePt: "Estamos em direto de Coimbra.",
						exampleEn: "We're live from Coimbra."
					}
				]
			},
			{
				type: "grammar",
				title: "Listen for the verb at the front",
				body: "Bulletins lead with the news verb: anunciou, confirmou, prevê-se, recomenda-se. Fillers (portanto, ou seja, efetivamente, aliás) are time you can use to breathe. Directo in Portugal is em direto (not ao vivo only — both exist).",
				examples: [
					{
						pt: "Confirmou-se o atraso dos comboios da linha de Cascais.",
						en: "Delays on the Cascais line were confirmed."
					},
					{
						pt: "Prevê-se vento forte na ponte.",
						en: "Strong wind is forecast on the bridge."
					},
					{
						pt: "A seguir, o desporto, com o Benfica.",
						en: "Next, sport, with Benfica."
					}
				]
			},
			{
				type: "dialogue",
				setting: "A simulated 40-second bulletin — listen with the speaker buttons.",
				lines: [
					{
						speaker: "Anchor",
						pt: "São oito horas em Lisboa. Em destaque, o tempo: prevê-se chuva a partir da tarde.",
						en: "Eight o'clock in Lisbon. Headlines — weather: rain expected from the afternoon."
					},
					{
						speaker: "Anchor",
						pt: "Na Avenida da Liberdade o trânsito está condicionado por obras. Recomenda-se o metro.",
						en: "On Avenida da Liberdade traffic is restricted due to works. The metro is recommended."
					},
					{
						speaker: "Anchor",
						pt: "A seguir, desporto. O Benfica joga esta noite em casa.",
						en: "Next, sport. Benfica play at home tonight."
					}
				]
			},
			{
				type: "culture",
				title: "How to practise after this lesson",
				body: "Put Antena 1 or TSF on for the 8 o'clock news while the kettle boils. Do not rewind. Write three words. Tomorrow, three more. Radio stations of Portugal were the goal — this is the on-ramp, not the whole highway."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Em direto” in Portugal means…",
				options: [
					"Recorded yesterday",
					"Live",
					"In a straight line only",
					"Cancelled"
				],
				answer: 1,
				explain: "Live broadcast."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Portanto” is mostly…",
				options: [
					"A place name",
					"A filler meaning 'so'",
					"A greeting",
					"Past tense of partir"
				],
				answer: 1,
				explain: "You can skip it and keep the meaning."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "Traffic on Liberdade?",
				speak: "Na Avenida da Liberdade o trânsito está condicionado por obras.",
				options: [
					"Clear",
					"Restricted because of roadworks",
					"A festival",
					"Snow"
				],
				answer: 1,
				explain: "Condicionado por obras."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Prevê-se que chova” is a forecast, not a report of rain now.",
				options: ["True", "False"],
				answer: 0,
				explain: "Prevê-se = it is forecast."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“A seguir” in a bulletin means…",
				options: [
					"Follow that car",
					"Coming up next",
					"Yesterday",
					"The end"
				],
				answer: 1,
				explain: "Next segment."
			}
		]
	},
	{
		id: "b1-livro",
		level: "B1",
		unitId: "b1-listen-read",
		unit: "Listen & read",
		order: 4,
		minutes: 15,
		title: "A primeira página — reading books",
		titlePt: "Livros",
		skill: "read",
		summary: "How to start a Portuguese novel without drowning on page one.",
		goals: [
			"Read a literary paragraph aloud",
			"Use context before the dictionary",
			"Keep a reading notebook"
		],
		image: "/scenes/books.jpg",
		sections: [
			{
				type: "intro",
				kicker: "B1 · 15 min",
				title: "Page one is supposed to be hard",
				body: "Books use a denser Portuguese than cafés. The trick is not to translate every line. Read a paragraph twice, mark three words, keep going. Meaning accumulates. This is how people actually finish novels.",
				phrase: {
					pt: "A casa cheirava a mar e a pão.",
					en: "The house smelled of sea and of bread."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "cheirar a",
						hint: "shay-RAR uh",
						en: "to smell of",
						examplePt: "Cheira a terra molhada.",
						exampleEn: "It smells of wet earth."
					},
					{
						pt: "a janela / o quintal",
						hint: "zhuh-NEH-luh / keen-TAHL",
						en: "window / back yard",
						examplePt: "A janela dava para o quintal.",
						exampleEn: "The window looked onto the yard."
					},
					{
						pt: "ainda hoje",
						hint: "AYN-duh OH-zhe",
						en: "to this day",
						examplePt: "Ainda hoje me lembro.",
						exampleEn: "I still remember to this day."
					},
					{
						pt: "quase / mal",
						hint: "KWAH-ze / mahl",
						en: "almost / barely",
						examplePt: "Mal se via o rio.",
						exampleEn: "You could barely see the river."
					},
					{
						pt: "a luz / a sombra",
						hint: "loosh / SOM-bruh",
						en: "light / shade",
						examplePt: "A luz da tarde.",
						exampleEn: "The afternoon light."
					},
					{
						pt: "pouco a pouco",
						hint: "PO-koo uh PO-koo",
						en: "little by little",
						examplePt: "Pouco a pouco, percebi o livro.",
						exampleEn: "Little by little I understood the book."
					},
					{
						pt: "uma frase",
						hint: "FRAH-ze",
						en: "a sentence",
						examplePt: "Uma frase de cada vez.",
						exampleEn: "One sentence at a time."
					}
				]
			},
			{
				type: "grammar",
				title: "Literary imperfect, and 'dar para'",
				body: "Novels live in the imperfect: cheirava, dava, havia. Dar para = to look out onto / to be enough. Mal + verb = barely. You will meet the personal infinitive (ao chegar, depois de falar) — treat it as 'on arriving', 'after speaking' for now.",
				examples: [
					{
						pt: "A janela dava para o rio.",
						en: "The window looked onto the river."
					},
					{
						pt: "Ao abrir o livro, reconheceu o cheiro.",
						en: "On opening the book, she recognised the smell."
					},
					{
						pt: "Mal entendia as palavras, mas continuou.",
						en: "He barely understood the words, but he continued."
					}
				]
			},
			{
				type: "dialogue",
				setting: "A paragraph in the style of a quiet Portuguese novel — read it twice.",
				lines: [
					{
						speaker: "Narrator",
						pt: "A casa cheirava a mar e a pão. A janela da cozinha dava para o quintal, onde a avó ainda estendia a roupa.",
						en: "The house smelled of sea and bread. The kitchen window looked onto the yard, where grandmother still hung the washing."
					},
					{
						speaker: "Narrator",
						pt: "Pouco a pouco, a luz da tarde descia. Mal se ouvia a rádio, algures na casa.",
						en: "Little by little the afternoon light sank. You could barely hear the radio, somewhere in the house."
					},
					{
						speaker: "You",
						pt: "Não percebi “algures”.",
						en: "I didn't get 'algures'."
					},
					{
						speaker: "Tutor",
						pt: "Quer dizer “algures” — somewhere. Não pares. Segue.",
						en: "It means somewhere. Don't stop. Keep going."
					}
				]
			},
			{
				type: "culture",
				title: "What to read first",
				body: "Start shorter: crónicas (Saramago wrote them; so did many newspaper writers), YA, or a Portuguese translation of a book you already know. Pessoa can wait. A page a day with a pencil is a radio-station-level habit for the eyes."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Cheirava a mar” means…",
				options: [
					"It sailed the sea",
					"It smelled of the sea",
					"It was expensive",
					"It was closed"
				],
				answer: 1,
				explain: "Cheirar a = smell of."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“A janela dava para o quintal” — dava para means…",
				options: [
					"Gave a gift",
					"Looked onto / opened onto",
					"Was broken",
					"Cost money"
				],
				answer: 1,
				explain: "Dar para a view."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "What could you barely do?",
				speak: "Mal se ouvia a rádio.",
				options: [
					"See the radio",
					"Hear the radio",
					"Buy a radio",
					"Fix the radio"
				],
				answer: 1,
				explain: "Mal se ouvia = barely heard."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "You should look up every unknown word before finishing a paragraph.",
				options: ["True", "False"],
				answer: 1,
				explain: "Mark a few, keep going."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“Algures” means…",
				options: [
					"Yesterday",
					"Somewhere",
					"Never",
					"Please"
				],
				answer: 1,
				explain: "Somewhere / someplace."
			}
		]
	},
	{
		id: "b1-subjuntivo",
		level: "B1",
		unitId: "b1-nuance",
		unit: "Nuance",
		order: 5,
		minutes: 15,
		title: "Espero que — a first subjunctive",
		titlePt: "Subjuntivo",
		skill: "speak",
		summary: "Wishes, doubts, and the little que that changes the verb.",
		goals: [
			"Form present subjunctive of common verbs",
			"Use espero que / é possível que",
			"Hear it in real talk"
		],
		image: "/scenes/radio.jpg",
		sections: [
			{
				type: "intro",
				kicker: "B1 · 15 min",
				title: "The mood of maybe",
				body: "Indicative is what is. Subjunctive is what you hope, doubt, or require. Portuguese uses it more than English. You already hear it: até amanhã, que corra tudo bem. Time to make it on purpose.",
				phrase: {
					pt: "Espero que gostes de Lisboa.",
					en: "I hope you like Lisbon."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "espero que",
						hint: "sh-PEH-roo kuh",
						en: "I hope that",
						examplePt: "Espero que esteja bem.",
						exampleEn: "I hope you are well."
					},
					{
						pt: "é possível que",
						hint: "eh po-SEE-vel kuh",
						en: "it's possible that",
						examplePt: "É possível que chova.",
						exampleEn: "It may rain."
					},
					{
						pt: "duvido que",
						hint: "doo-VEE-doo kuh",
						en: "I doubt that",
						examplePt: "Duvido que ele venha.",
						exampleEn: "I doubt he'll come."
					},
					{
						pt: "quero que",
						hint: "KEH-roo kuh",
						en: "I want (someone) to",
						examplePt: "Quero que te sentes.",
						exampleEn: "I want you to sit down."
					},
					{
						pt: "embora",
						hint: "em-BAW-ruh",
						en: "although",
						examplePt: "Embora esteja cansado, vou.",
						exampleEn: "Although I'm tired, I'll go."
					},
					{
						pt: "que corra tudo bem",
						hint: "KOR-ruh",
						en: "hope it all goes well",
						examplePt: "Que corra tudo bem no exame.",
						exampleEn: "Hope the exam goes well."
					},
					{
						pt: "talvez",
						hint: "tal-VEZH",
						en: "perhaps (often + subjunctive)",
						examplePt: "Talvez vá ao cinema.",
						exampleEn: "Perhaps I'll go to the cinema."
					}
				]
			},
			{
				type: "grammar",
				title: "Take the eles present, drop -m, add the opposite vowel",
				body: "Falar → falam → fale, fales, fale, falemos, falem. Comer → coma… Ir → vá, vás, vá, vamos, vão. Ser → seja. Estar → esteja. Ter → tenha. Haver → haja. Trigger: a different subject after que, plus wish/doubt/emotion/impersonal.",
				examples: [
					{
						pt: "Espero que venhas jantar.",
						en: "I hope you'll come to dinner."
					},
					{
						pt: "É importante que chegues a horas.",
						en: "It's important that you arrive on time."
					},
					{
						pt: "Talvez não haja mesas.",
						en: "There might not be tables."
					}
				]
			},
			{
				type: "dialogue",
				setting: "Texting a friend before an interview.",
				lines: [
					{
						speaker: "You",
						pt: "Amanhã tenho a entrevista. Estou nervoso.",
						en: "Tomorrow I have the interview. I'm nervous."
					},
					{
						speaker: "Friend",
						pt: "Que corra tudo bem. Espero que te saia bem.",
						en: "Hope it all goes well. I hope it goes well for you."
					},
					{
						speaker: "You",
						pt: "Talvez chova. Não quero chegar molhado.",
						en: "It might rain. I don't want to arrive wet."
					},
					{
						speaker: "Friend",
						pt: "Leva o guarda-chuva. Quero que estejas calmo.",
						en: "Take the umbrella. I want you to be calm."
					},
					{
						speaker: "You",
						pt: "Obrigado. Falo-te depois.",
						en: "Thanks. I'll talk to you after."
					}
				]
			},
			{
				type: "culture",
				title: "Blessings are subjunctive",
				body: "Que estejas bem, que corra tudo bem, até amanhã se Deus quiser — the language of care is this mood. You do not need the full table to join it. Learn the set phrases first; the table starts to look obvious."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "After “espero que” the next verb is often…",
				options: [
					"Infinitive only",
					"Subjunctive",
					"Future obligatory",
					"English"
				],
				answer: 1,
				explain: "Hope + que + subjunctive."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Espero que gostes” is aimed at…",
				options: [
					"tu",
					"nós",
					"eles only",
					"a senhora only"
				],
				answer: 0,
				explain: "Gostes = tu form."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "What's the wish?",
				speak: "Que corra tudo bem.",
				options: [
					"Everything went badly",
					"Hope it all goes well",
					"Come here now",
					"It's raining"
				],
				answer: 1,
				explain: "Set phrase of goodwill."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Talvez” often takes the subjunctive in Portuguese.",
				options: ["True", "False"],
				answer: 0,
				explain: "Talvez vá, talvez haja."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "Subjunctive of estar (eu/ele) is…",
				options: [
					"está",
					"esteja",
					"esteve",
					"estava"
				],
				answer: 1,
				explain: "Esteja."
			}
		]
	}
];
//#endregion
//#region src/data/b2.ts
var b2Lessons = [
	{
		id: "b2-saudade",
		level: "B2",
		unitId: "b2-fluent",
		unit: "Fluency",
		order: 1,
		minutes: 15,
		title: "Saudade — talking about feeling",
		titlePt: "Saudade",
		skill: "speak",
		summary: "The famous word, plus the ordinary ones people actually use for missing, longing, and being fine.",
		goals: [
			"Use saudade without cliché",
			"Name feelings precisely",
			"Respond to how are you at B2"
		],
		image: "/scenes/radio.jpg",
		sections: [
			{
				type: "intro",
				kicker: "B2 · 15 min",
				title: "More than a postcard",
				body: "Saudade is real and over-sold. Portuguese people also say tenho pena, estou farto, faz-me confusão, estou descansado. Fluency is having the un-poetic verbs too. Then saudade can come back as itself, not as a souvenir.",
				phrase: {
					pt: "Tenho saudades de ouvir a rádio na cozinha da minha avó.",
					en: "I miss hearing the radio in my grandmother's kitchen."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "ter saudades de",
						hint: "SAW-dah-desh",
						en: "to miss (someone / something)",
						examplePt: "Tenho saudades tuas.",
						exampleEn: "I miss you."
					},
					{
						pt: "tenho pena",
						hint: "PEH-nuh",
						en: "I'm sorry / I feel bad (about a situation)",
						examplePt: "Tenho pena que não possas vir.",
						exampleEn: "I'm sorry you can't come."
					},
					{
						pt: "estou farto de",
						hint: "FAR-too",
						en: "I'm fed up with",
						examplePt: "Estou farto deste ruído.",
						exampleEn: "I'm fed up with this noise."
					},
					{
						pt: "faz-me confusão",
						hint: "kon-foo-ZOW̃",
						en: "it puzzles / bothers me",
						examplePt: "Essa regra faz-me confusão.",
						exampleEn: "That rule throws me."
					},
					{
						pt: "à-vontade",
						hint: "ah von-TAH-de",
						en: "at ease",
						examplePt: "Sinto-me à-vontade aqui.",
						exampleEn: "I feel at ease here."
					},
					{
						pt: "comovente / banal",
						hint: "koo-moo-VEN-te",
						en: "moving / ordinary",
						examplePt: "O filme é comovente sem ser piegas.",
						exampleEn: "The film is moving without being soppy."
					},
					{
						pt: "não é fácil de explicar",
						hint: "",
						en: "it's not easy to explain",
						examplePt: "Saudade não é fácil de explicar.",
						exampleEn: "Saudade isn't easy to explain."
					}
				]
			},
			{
				type: "grammar",
				title: "Ter saudades de + noun / infinitive",
				body: "Tenho saudades de casa, de ti, de caminhar ao fim da tarde. Pena que + subjunctive. Estar farto de + noun / infinitive. Feelings as verbs: apetecer (o que te apetece?), custar (custa-me acordar cedo), dar (deu-me uma alegria). European clitics: faz-me, custa-me, deu-me.",
				examples: [
					{
						pt: "Custa-me partir.",
						en: "It's hard for me to leave."
					},
					{
						pt: "Apetece-me um café.",
						en: "I fancy a coffee."
					},
					{
						pt: "Tenho pena que o verão acabe.",
						en: "I'm sorry summer is ending."
					}
				]
			},
			{
				type: "dialogue",
				setting: "A long-ish talk on a balcony after a guest has been in Lisbon a month.",
				lines: [
					{
						speaker: "Host",
						pt: "Já te sentes à-vontade?",
						en: "Do you feel at ease yet?"
					},
					{
						speaker: "You",
						pt: "Mais. Ainda tenho saudades de casa, mas já menos.",
						en: "More. I still miss home, but less."
					},
					{
						speaker: "Host",
						pt: "É normal. A mim também me custa quando viajo.",
						en: "That's normal. I find it hard too when I travel."
					},
					{
						speaker: "You",
						pt: "O que mais me faz confusão é o eléctrico. Nunca sei quando parar.",
						en: "What still throws me is the tram. I never know when to get off."
					},
					{
						speaker: "Host",
						pt: "Isso passa. Um dia paras no sítio certo sem pensar.",
						en: "That passes. One day you stop in the right place without thinking."
					}
				]
			},
			{
				type: "culture",
				title: "Don't perform saudade",
				body: "Using the word about a pastry you ate once will get a smile and a quiet downgrade. Using it about a person, a house, a sound, a season — that is the register. Understatement again: já menos is a whole emotional arc."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Tenho saudades tuas” means…",
				options: [
					"I have your keys",
					"I miss you",
					"I don't know you",
					"I'm angry at you"
				],
				answer: 1,
				explain: "Ter saudades de alguém."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Apetece-me um café” is closest to…",
				options: [
					"I must drink coffee",
					"I fancy a coffee",
					"Coffee is expensive",
					"I spilled coffee"
				],
				answer: 1,
				explain: "Apetecer."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "How does he feel about home?",
				speak: "Ainda tenho saudades de casa, mas já menos.",
				options: [
					"He doesn't miss it",
					"He still misses it, but less",
					"He's moving tomorrow",
					"He hates Lisbon"
				],
				answer: 1,
				explain: "Ainda… mas já menos."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Faz-me confusão” can mean something is confusing / bothersome.",
				options: ["True", "False"],
				answer: 0,
				explain: "Very common."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“Estou farto de” is…",
				options: [
					"I'm full of food only",
					"I'm fed up with",
					"I'm in love with",
					"I'm late for"
				],
				answer: 1,
				explain: "Fed up."
			}
		]
	},
	{
		id: "b2-pessoa",
		level: "B2",
		unitId: "b2-fluent",
		unit: "Fluency",
		order: 2,
		minutes: 18,
		title: "Pessoa — a page of literature",
		titlePt: "Pessoa",
		skill: "read",
		summary: "A short encounter with Fernando Pessoa: heteronyms, Lisbon, and reading aloud.",
		goals: [
			"Read a compact literary extract",
			"Talk about a writer in Portuguese",
			"Keep unknown words in their sentences"
		],
		image: "/scenes/books.jpg",
		sections: [
			{
				type: "intro",
				kicker: "B2 · 18 min",
				title: "Several men, one city",
				body: "Pessoa wrote as himself and as others: Alberto Caeiro, Ricardo Reis, Álvaro de Campos. You do not need the academic map. You need a few lines, read slowly, and the courage to say não percebi esta frase — and then read it again.",
				phrase: {
					pt: "A minha pátria é a língua portuguesa.",
					en: "My homeland is the Portuguese language."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "a pátria",
						hint: "PAH-tree-uh",
						en: "homeland",
						examplePt: "A pátria, para ele, era a língua.",
						exampleEn: "Homeland, for him, was the language."
					},
					{
						pt: "o heterónimo",
						hint: "he-te-RO-nee-moo",
						en: "heteronym (a fully invented author-self)",
						examplePt: "Caeiro é um heterónimo.",
						exampleEn: "Caeiro is a heteronym."
					},
					{
						pt: "o olhar",
						hint: "oh-LYAR",
						en: "the gaze / looking",
						examplePt: "O olhar sobre a cidade.",
						exampleEn: "The gaze upon the city."
					},
					{
						pt: "mesmo assim",
						hint: "MAYZ-moo uh-SEEÑ",
						en: "even so",
						examplePt: "É difícil. Mesmo assim, vale a pena.",
						exampleEn: "It's hard. Even so, it's worth it."
					},
					{
						pt: "vale a pena",
						hint: "VAH-le uh PEH-nuh",
						en: "it's worth it",
						examplePt: "Vale a pena ler em voz alta.",
						exampleEn: "It's worth reading aloud."
					},
					{
						pt: "em voz alta",
						hint: "aiñ voz AL-tuh",
						en: "aloud",
						examplePt: "Lê em voz alta.",
						exampleEn: "Read it aloud."
					},
					{
						pt: "uma linha",
						hint: "LEEN-yuh",
						en: "a line (of verse/text)",
						examplePt: "Uma linha de cada vez.",
						exampleEn: "One line at a time."
					}
				]
			},
			{
				type: "grammar",
				title: "Nominal style and inversion",
				body: "Literary Portuguese likes nouns where English likes verbs, and sometimes puts the complement first. A minha pátria é a língua portuguesa is a full argument in one copula. When lost, find the verb, then the subject — they may not be in English order.",
				examples: [
					{
						pt: "Não sou nada. Nunca serei nada.",
						en: "I am nothing. I shall never be anything. (Álvaro de Campos, opening of 'Tabacaria')"
					},
					{
						pt: "Mesmo assim, vale a pena ler.",
						en: "Even so, it is worth reading."
					},
					{
						pt: "Lisboa, para Pessoa, era matéria e metáfora.",
						en: "Lisbon, for Pessoa, was matter and metaphor."
					}
				]
			},
			{
				type: "dialogue",
				setting: "A bookshop conversation after you've read one page.",
				lines: [
					{
						speaker: "Bookseller",
						pt: "Primeira vez a ler Pessoa?",
						en: "First time reading Pessoa?"
					},
					{
						speaker: "You",
						pt: "Sim. Li uma página. Percebi metade.",
						en: "Yes. I read a page. I got half of it."
					},
					{
						speaker: "Bookseller",
						pt: "Isso já é muito. Lê em voz alta. A cadência ajuda.",
						en: "That's already a lot. Read aloud. The cadence helps."
					},
					{
						speaker: "You",
						pt: "A frase da pátria… essa percebi.",
						en: "The homeland sentence — that one I got."
					},
					{
						speaker: "Bookseller",
						pt: "Pois. Fica-se com ela. O resto vem.",
						en: "Yes. That one stays with you. The rest comes."
					}
				]
			},
			{
				type: "culture",
				title: "Where to meet him",
				body: "Casa Fernando Pessoa in Campo de Ourique is a house-museum, not a temple. A café with a book is also a meeting. If verse is too steep, try the Livro do Desassossego in tiny doses — it was built of fragments anyway."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "A heteronym is…",
				options: [
					"A synonym",
					"A fully invented author-self",
					"A printing error",
					"A Lisbon tram"
				],
				answer: 1,
				explain: "Pessoa's method."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Vale a pena” means…",
				options: [
					"It's raining",
					"It's worth it",
					"It's expensive",
					"It's over"
				],
				answer: 1,
				explain: "Worth the trouble."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "Advice?",
				speak: "Lê em voz alta. A cadência ajuda.",
				options: [
					"Read silently only",
					"Read aloud; the cadence helps",
					"Give up",
					"Translate first"
				],
				answer: 1,
				explain: "Em voz alta."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“A minha pátria é a língua portuguesa” identifies language with home.",
				options: ["True", "False"],
				answer: 0,
				explain: "The famous line."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“Mesmo assim” is…",
				options: [
					"Never",
					"Even so",
					"Yesterday",
					"Please sit"
				],
				answer: 1,
				explain: "Contrast / persistence."
			}
		]
	},
	{
		id: "b2-debate",
		level: "B2",
		unitId: "b2-fluent",
		unit: "Fluency",
		order: 3,
		minutes: 15,
		title: "Discordo — disagreeing well",
		titlePt: "Debate",
		skill: "speak",
		summary: "City life, housing, tourism: how to take a position without burning the table.",
		goals: [
			"Concede, then contrast",
			"Use hedging",
			"Close a disagreement cleanly"
		],
		image: "/scenes/tram.jpg",
		sections: [
			{
				type: "intro",
				kicker: "B2 · 15 min",
				title: "Heat, with manners",
				body: "Lisbon arguments at dinner are about rents, tourists, and whether the city is still itself. You need por um lado, por outro, percebo o que dizes, mesmo assim. Fluency is staying in the room.",
				phrase: {
					pt: "Percebo o que dizes, mas não concordo de todo.",
					en: "I see what you're saying, but I don't agree entirely."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "concordo / discordo",
						hint: "kon-KOR-doo / dish-KOR-doo",
						en: "I agree / I disagree",
						examplePt: "Discordo em parte.",
						exampleEn: "I disagree in part."
					},
					{
						pt: "por um lado / por outro",
						hint: "",
						en: "on one hand / on the other",
						examplePt: "Por um lado, traz dinheiro.",
						exampleEn: "On one hand, it brings money."
					},
					{
						pt: "em parte / de todo",
						hint: "",
						en: "in part / entirely",
						examplePt: "Não concordo de todo.",
						exampleEn: "I don't agree at all."
					},
					{
						pt: "há quem diga que",
						hint: "ah kaiñ DEE-guh",
						en: "some people say that",
						examplePt: "Há quem diga que a cidade perdeu a alma.",
						exampleEn: "Some say the city has lost its soul."
					},
					{
						pt: "o que está em causa",
						hint: "em KOW-zuh",
						en: "what's at stake",
						examplePt: "O que está em causa é a habitação.",
						exampleEn: "What's at stake is housing."
					},
					{
						pt: "ainda assim",
						hint: "",
						en: "even so / still",
						examplePt: "Ainda assim, vale a pena discutir.",
						exampleEn: "Still, it's worth discussing."
					},
					{
						pt: "vamos deixar isso",
						hint: "day-SHAR",
						en: "let's leave that (for now)",
						examplePt: "Vamos deixar isso para depois.",
						exampleEn: "Let's leave that for later."
					}
				]
			},
			{
				type: "grammar",
				title: "Há quem + subjunctive, and hedges",
				body: "Há quem diga / pense / ache que… lets you quote a view without owning it. Hedges: talvez, se calhar, não sei se, diria que, em certa medida. Concession: percebo, admito, é verdade, mas… Closing: estamos de acordo nisto, pelo menos.",
				examples: [
					{
						pt: "Há quem ache que o turismo estragou o Alfama.",
						en: "Some people think tourism has spoiled Alfama."
					},
					{
						pt: "Diria que o problema é mais o preço das casas do que os visitantes.",
						en: "I'd say the problem is more house prices than visitors."
					},
					{
						pt: "Em certa medida, tens razão.",
						en: "To some extent you're right."
					}
				]
			},
			{
				type: "dialogue",
				setting: "A dinner table in Arroios. Someone has just said Lisbon is ruined.",
				lines: [
					{
						speaker: "A",
						pt: "Esta cidade já não é para quem cá vive.",
						en: "This city isn't for the people who live here anymore."
					},
					{
						speaker: "You",
						pt: "Percebo o que dizes. O que está em causa é a habitação, não o turista em si.",
						en: "I see what you mean. What's at stake is housing, not the tourist as such."
					},
					{
						speaker: "A",
						pt: "Mas são as mesmas coisas.",
						en: "But they're the same thing."
					},
					{
						speaker: "You",
						pt: "Em parte. Por outro lado, sem visitantes muita gente não trabalhava.",
						en: "In part. On the other hand, without visitors a lot of people wouldn't be working."
					},
					{
						speaker: "B",
						pt: "Pois. Não se resolve à sobremesa.",
						en: "Right. We won't solve it over dessert."
					}
				]
			},
			{
				type: "culture",
				title: "Leave the door open",
				body: "A Portuguese disagreement often ends with a shrug and more wine, not a verdict. Vamos deixar isso is not cowardice; it is the social technology that lets you have lunch next Sunday. Learn it as seriously as the subjunctive."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Há quem diga que” lets you…",
				options: [
					"Give an order",
					"Report a view without owning it",
					"Apologise",
					"Order coffee"
				],
				answer: 1,
				explain: "Há quem + subjunctive."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Em certa medida” hedges as…",
				options: [
					"Never",
					"To some extent",
					"Absolutely",
					"Yesterday"
				],
				answer: 1,
				explain: "Soft agreement."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "What's at stake?",
				speak: "O que está em causa é a habitação.",
				options: [
					"Dessert",
					"Housing",
					"Football",
					"The tram timetable"
				],
				answer: 1,
				explain: "Habitação."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Não concordo de todo” is a total disagreement.",
				options: ["True", "False"],
				answer: 0,
				explain: "De todo = at all."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "A graceful pause is…",
				options: [
					"Cala-te",
					"Vamos deixar isso",
					"Estás errado sempre",
					"Não falo mais nunca"
				],
				answer: 1,
				explain: "Leave it for later."
			}
		]
	},
	{
		id: "b2-rua",
		level: "B2",
		unitId: "b2-fluent",
		unit: "Fluency",
		order: 4,
		minutes: 12,
		title: "Na rua — small talk that holds",
		titlePt: "Na rua",
		skill: "speak",
		summary: "Twenty durable lines for counters, queues, neighbours, and the radio of daily life.",
		goals: [
			"Keep a 3-minute chat going",
			"Use fillers as a native does",
			"Exit a conversation politely"
		],
		image: "/scenes/tram.jpg",
		sections: [
			{
				type: "intro",
				kicker: "B2 · 12 min",
				title: "The last mile",
				body: "Proficiency, for this course, is not a certificate. It is the ability to stand in a queue, talk to the person next to you, read a column, and leave the radio on. These lines are the last mile.",
				phrase: {
					pt: "Então, conte-me lá. Como é que foi?",
					en: "So, tell me then. How did it go?"
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "conte-me lá",
						hint: "KON-te-muh lah",
						en: "go on, tell me",
						examplePt: "Conte-me lá essa história.",
						exampleEn: "Go on, tell me that story."
					},
					{
						pt: "olhe / veja lá",
						hint: "OH-lye / VEH-zhuh lah",
						en: "look / mind you (discourse)",
						examplePt: "Veja lá, não se atrase.",
						exampleEn: "Mind you don't be late."
					},
					{
						pt: "está bem visto",
						hint: "shtah baiñ VEESH-too",
						en: "that's a fair point",
						examplePt: "Está bem visto.",
						exampleEn: "Fair point."
					},
					{
						pt: "já agora",
						hint: "zhah uh-GO-ruh",
						en: "while we're at it / actually",
						examplePt: "Já agora, viu o João?",
						exampleEn: "While I think of it, have you seen João?"
					},
					{
						pt: "antes que me esqueça",
						hint: "esh-KEH-suh",
						en: "before I forget",
						examplePt: "Antes que me esqueça, obrigado pelo livro.",
						exampleEn: "Before I forget — thanks for the book."
					},
					{
						pt: "fico por aqui",
						hint: "FEE-koo poor uh-KEE",
						en: "I'll stop here / this is my stop",
						examplePt: "Fico por aqui. Foi um gosto.",
						exampleEn: "I'll get off here. It was a pleasure."
					},
					{
						pt: "foi um gosto",
						hint: "gosh-too",
						en: "it was a pleasure",
						examplePt: "Foi um gosto falar consigo.",
						exampleEn: "It was a pleasure talking with you."
					}
				]
			},
			{
				type: "grammar",
				title: "Consigo, consigo, and the polite third person",
				body: "Falar consigo (with you, polite). How was it: como é que foi? Lá as a softener: diz-me lá, explique-me lá. Exit formulas: tenho de ir andando, deixo-vos, um abraço, até já. Keep one in your pocket for every conversation you start.",
				examples: [
					{
						pt: "Foi um gosto falar consigo.",
						en: "It was a pleasure to talk with you."
					},
					{
						pt: "Tenho de ir andando. Até amanhã.",
						en: "I should be getting along. Until tomorrow."
					},
					{
						pt: "Já agora: o seu telemóvel, se faz favor?",
						en: "While I think of it — your mobile, please?"
					}
				]
			},
			{
				type: "dialogue",
				setting: "A short queue at the bakery, then the door.",
				lines: [
					{
						speaker: "Neighbour",
						pt: "Então? Já chegou o calor.",
						en: "So? The heat's here."
					},
					{
						speaker: "You",
						pt: "Pois chegou. Ontem ainda estava fresco.",
						en: "It has. Yesterday it was still cool."
					},
					{
						speaker: "Neighbour",
						pt: "Já agora, viu que a mercearia fecha em agosto?",
						en: "While I think of it — did you see the grocer closes in August?"
					},
					{
						speaker: "You",
						pt: "Não tinha visto. Obrigado. Olhe, fico por aqui — é a minha vez.",
						en: "I hadn't. Thanks. Look, I'll stop here — it's my turn."
					},
					{
						speaker: "Neighbour",
						pt: "Pois. Foi um gosto. Até já.",
						en: "Right. Pleasure. See you."
					},
					{
						speaker: "You",
						pt: "Até já.",
						en: "See you."
					}
				]
			},
			{
				type: "culture",
				title: "You are in the language now",
				body: "If you can do this queue, you can do a dinner. If you can do a dinner, you can keep a radio on. Books will still be hard — they are supposed to be. Turn the page anyway. Até já is not goodbye. It is a promise to continue."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Foi um gosto” is…",
				options: [
					"I hated that",
					"It was a pleasure",
					"I'm hungry",
					"It's raining"
				],
				answer: 1,
				explain: "Leave-taking courtesy."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Já agora” often means…",
				options: [
					"Never again",
					"While we're at it",
					"Yesterday morning",
					"Run"
				],
				answer: 1,
				explain: "A sidebar in the talk."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "Why stop talking?",
				speak: "Fico por aqui — é a minha vez.",
				options: [
					"They're angry",
					"It's their turn (in the queue)",
					"The shop is closed",
					"They missed the tram"
				],
				answer: 1,
				explain: "My turn."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Falar consigo” is a polite 'talk with you'.",
				options: ["True", "False"],
				answer: 0,
				explain: "Consigo = with you (polite)."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "A natural exit is…",
				options: [
					"Tenho de ir andando",
					"Tu és chato, adeus",
					"Não falo português",
					"Silêncio"
				],
				answer: 0,
				explain: "I should be getting along."
			}
		]
	}
];
//#endregion
//#region src/data/c1.ts
var c1Lessons = [
	{
		id: "c1-antena",
		level: "C1",
		unitId: "c1-speed",
		unit: "At speed",
		order: 1,
		minutes: 16,
		title: "The bulletin at speed",
		titlePt: "O boletim",
		skill: "listen",
		summary: "A news read at the speed of the kitchen radio. Three facts. No rewind as a habit.",
		goals: [
			"Catch the lead without a transcript",
			"Hold a number, a place, a stance",
			"Say what you heard, not every word"
		],
		image: "/scenes/radio.jpg",
		sections: [
			{
				type: "intro",
				kicker: "C1 · 16 min",
				title: "Leave the glossary on the table",
				body: "At this speed the bulletin is not a dictation. You want the lead, one number, one place, and the verb that carries the stance — admite, recusa, pondera. The rest can blur. That is how people listen while buttering bread.",
				phrase: {
					pt: "O Governo admite rever o pacote, mas não hoje.",
					en: "The government admits it may revisit the package, but not today."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "o boletim",
						hint: "boo-le-TEEÑ",
						en: "the bulletin",
						examplePt: "O boletim das oito.",
						exampleEn: "The eight o'clock bulletin."
					},
					{
						pt: "admitir",
						hint: "ad-mee-TEER",
						en: "to admit / allow (that)",
						examplePt: "Admite que o prazo é curto.",
						exampleEn: "It admits the deadline is tight."
					},
					{
						pt: "rever",
						hint: "re-VER",
						en: "to review / revisit",
						examplePt: "Vão rever as contas.",
						exampleEn: "They will revisit the figures."
					},
					{
						pt: "o pacote",
						hint: "pa-KO-te",
						en: "the package (of measures)",
						examplePt: "O pacote de habitação.",
						exampleEn: "The housing package."
					},
					{
						pt: "em vigor",
						hint: "aiñ vee-GOR",
						en: "in force",
						examplePt: "A regra entra em vigor na segunda.",
						exampleEn: "The rule comes into force on Monday."
					},
					{
						pt: "ao que tudo indica",
						hint: "ow ke TOO-doo in-DEE-ka",
						en: "by all indications",
						examplePt: "Ao que tudo indica, o metro fecha mais cedo.",
						exampleEn: "By all indications the metro will close earlier."
					},
					{
						pt: "sem mais pormenores",
						hint: "por-me-NO-resh",
						en: "without further details",
						examplePt: "Confirmaram o acordo, sem mais pormenores.",
						exampleEn: "They confirmed the deal, without further details."
					}
				]
			},
			{
				type: "grammar",
				title: "The news verb sits in the middle",
				body: "Portuguese news likes a delayed verb: O Governo, confrontado com os números, admite rever. Find admite, then hang the rest on it. Futuro do conjuntivo after quando / se / assim que: quando chegar o pacote, se quiserem mesmo. Rumour uses the future perfect: terá dito, terão recusado.",
				examples: [
					{
						pt: "Quando chegar o pacote, falamos.",
						en: "When the package arrives, we'll talk."
					},
					{
						pt: "O ministro terá dito que não há recuo.",
						en: "The minister is said to have said there is no climb-down."
					},
					{
						pt: "Se quiserem mesmo rever, que o digam.",
						en: "If they really want to revisit it, let them say so."
					}
				]
			},
			{
				type: "dialogue",
				setting: "Kitchen radio on. Someone asks what you caught.",
				lines: [
					{
						speaker: "Host",
						pt: "Ouviste? O que é que disseram?",
						en: "Did you hear? What did they say?"
					},
					{
						speaker: "You",
						pt: "Admite rever o pacote. Mas não hoje.",
						en: "It admits it may revisit the package. But not today."
					},
					{
						speaker: "Host",
						pt: "E a habitação?",
						en: "And housing?"
					},
					{
						speaker: "You",
						pt: "Entra em vigor na segunda. Sem mais pormenores.",
						en: "It comes into force on Monday. No further details."
					},
					{
						speaker: "Host",
						pt: "Pois. Sempre a mesma música.",
						en: "Right. Always the same tune."
					}
				]
			},
			{
				type: "culture",
				title: "Três coisas, não o texto",
				body: "A Portuguese kitchen does not pause Antena 1. If you can hand back three things — a verb, a day, a shrug — you were listening like a person, not like an exam."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Admite rever” in a bulletin usually means…",
				options: [
					"A hard refusal",
					"It may revisit, without promising",
					"The law is already in force",
					"A sports result"
				],
				answer: 1,
				explain: "Admitir + infinitive = allow the possibility."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Em vigor” means…",
				options: [
					"In vigour / in force",
					"On holiday",
					"In the metro",
					"In English"
				],
				answer: 0,
				explain: "A rule in force."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'by all indications'.",
				accept: ["ao que tudo indica"],
				explain: "A news hedge."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“O ministro terá dito” presents the quote as rumour, not a tape.",
				options: ["True", "False"],
				answer: 0,
				explain: "Future perfect of report."
			},
			{
				id: "q5",
				kind: "listen",
				prompt: "When, if at all?",
				speak: "O Governo admite rever o pacote, mas não hoje.",
				options: [
					"Today",
					"Not today",
					"Never",
					"On Sunday only"
				],
				answer: 1,
				explain: "Mas não hoje."
			},
			{
				id: "q6",
				kind: "choice",
				prompt: "After “quando” for a future event, European Portuguese often uses…",
				options: [
					"Present indicative only",
					"Futuro do conjuntivo: quando chegar",
					"The English will-future calqued",
					"The imperfect"
				],
				answer: 1,
				explain: "Quando chegar."
			}
		]
	},
	{
		id: "c1-cronica",
		level: "C1",
		unitId: "c1-speed",
		unit: "At speed",
		order: 2,
		minutes: 18,
		title: "A column, not a page",
		titlePt: "A crónica",
		skill: "read",
		summary: "A Lisbon crónica at column length: irony, a tram, a city that argues with itself.",
		goals: [
			"Read five paragraphs without translating each line",
			"Catch the turn in the last paragraph",
			"Keep unknown words inside their sentences"
		],
		image: "/scenes/books.jpg",
		sections: [
			{
				type: "intro",
				kicker: "C1 · 18 min",
				title: "The crónica is the national essay",
				body: "Portugal writes the city in columns: a tram, a queue, a minister, a pastry, then a turn. You do not need every word. You need the stance, the image that repeats, and the last sentence — that is where the writer puts the knife, gently.",
				phrase: {
					pt: "A cidade muda, dizem. Muda sempre. O eléctrico, esse, teima.",
					en: "The city is changing, they say. It always is. The tram, though, persists."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "a crónica",
						hint: "KRO-nee-ka",
						en: "newspaper column / chronicle",
						examplePt: "Li a crónica no jornal.",
						exampleEn: "I read the column in the paper."
					},
					{
						pt: "teimar",
						hint: "tay-MAR",
						en: "to persist / be stubborn",
						examplePt: "O eléctrico teima no mesmo sítio.",
						exampleEn: "The tram persists in the same place."
					},
					{
						pt: "o recuo",
						hint: "re-KOO",
						en: "climb-down / stepping back",
						examplePt: "Não houve recuo.",
						exampleEn: "There was no climb-down."
					},
					{
						pt: "à primeira vista",
						hint: "ah pree-MAY-ra VEESH-ta",
						en: "at first glance",
						examplePt: "À primeira vista, parece simples.",
						exampleEn: "At first glance it looks simple."
					},
					{
						pt: "no fundo",
						hint: "noo FOON-doo",
						en: "deep down / in the end",
						examplePt: "No fundo, ninguém se espanta.",
						exampleEn: "Deep down, nobody is surprised."
					},
					{
						pt: "um lugar-comum",
						hint: "loo-GAR koo-MOOÑ",
						en: "a commonplace / cliché",
						examplePt: "É um lugar-comum, e mesmo assim é verdade.",
						exampleEn: "It's a commonplace, and still true."
					},
					{
						pt: "não deixa de ser",
						hint: "DAY-sha de ser",
						en: "it remains / it is still",
						examplePt: "Não deixa de ser a mesma rua.",
						exampleEn: "It remains the same street."
					}
				]
			},
			{
				type: "grammar",
				title: "The turn sits in no fundo / mesmo assim",
				body: "A crónica often concedes, then cuts. Por um lado… no fundo…. Não deixa de ser keeps the thing in the room while changing the light on it. Relative clauses stack: a cidade que dizem que mudou, e que teima. Read them as one breath.",
				examples: [
					{
						pt: "Não deixa de ser a minha rua.",
						en: "It remains my street."
					},
					{
						pt: "No fundo, o eléctrico é que manda.",
						en: "Deep down, it is the tram that decides."
					},
					{
						pt: "A cidade que dizem que mudou teima no mesmo sítio.",
						en: "The city they say has changed persists in the same place."
					}
				]
			},
			{
				type: "dialogue",
				setting: "A café after you've read the column. Someone asks if it was good.",
				lines: [
					{
						speaker: "Friend",
						pt: "E então? Valeu a pena?",
						en: "So? Was it worth it?"
					},
					{
						speaker: "You",
						pt: "Valeu. No fundo, é sobre o eléctrico.",
						en: "It was. Deep down it's about the tram."
					},
					{
						speaker: "Friend",
						pt: "Sempre o eléctrico.",
						en: "Always the tram."
					},
					{
						speaker: "You",
						pt: "Pois. Não deixa de ser a mesma cidade.",
						en: "Right. It remains the same city."
					},
					{
						speaker: "Friend",
						pt: "Isso é um lugar-comum. E mesmo assim.",
						en: "That's a commonplace. And even so."
					}
				]
			},
			{
				type: "culture",
				title: "Don't hunt every word",
				body: "A column that you fully gloss is a vocabulary list. A column that you can retell in three lines is reading. Unknown words can stay in their sentences until they turn up again — they will."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "A crónica in a Portuguese paper is…",
				options: [
					"Only a medieval chronicle",
					"A column / short essay on the city",
					"A recipe",
					"A sports table"
				],
				answer: 1,
				explain: "The national essay form."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Teimar” here is closest to…",
				options: [
					"To whisper",
					"To persist / refuse to move",
					"To translate",
					"To pay"
				],
				answer: 1,
				explain: "The tram teima."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'deep down' as used in columns.",
				accept: ["no fundo"],
				explain: "No fundo."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Não deixa de ser” cancels the previous sentence.",
				options: ["True", "False"],
				answer: 1,
				explain: "It keeps the thing and changes the light."
			},
			{
				id: "q5",
				kind: "listen",
				prompt: "What persists?",
				speak: "A cidade muda, dizem. Muda sempre. O eléctrico, esse, teima.",
				options: [
					"The government",
					"The tram",
					"The weather",
					"The price of bread"
				],
				answer: 1,
				explain: "O eléctrico teima."
			},
			{
				id: "q6",
				kind: "choice",
				prompt: "“Um lugar-comum” is…",
				options: [
					"A bus stop",
					"A commonplace / cliché",
					"A secret",
					"A law"
				],
				answer: 1,
				explain: "And even so, it can be true."
			}
		]
	},
	{
		id: "c1-discussao",
		level: "C1",
		unitId: "c1-speed",
		unit: "At speed",
		order: 3,
		minutes: 16,
		title: "Stay in the argument",
		titlePt: "A mesa",
		skill: "speak",
		summary: "A table that turns political. Concede. Hedge. Disagree. Don't leave.",
		goals: [
			"Use ainda que / mesmo que without sounding like a textbook",
			"Quote a view you don't own: há quem diga",
			"Exit without slamming the door"
		],
		image: "/scenes/tram.jpg",
		sections: [
			{
				type: "intro",
				kicker: "C1 · 16 min",
				title: "The table is the exam",
				body: "C1 is not a harder quiz. It is staying when the queue, the dinner, the tram-stop chat turns into housing, tourism, the government. You concede what is true. You keep a piece. You do not lecture. Pronto is allowed. Storming off is not fluency.",
				phrase: {
					pt: "Ainda que a cidade tenha mudado, não acho que esteja perdida.",
					en: "Even if the city has changed, I don't think it's lost."
				}
			},
			{
				type: "vocab",
				items: [
					{
						pt: "ainda que",
						hint: "aiñ-da ke",
						en: "even if / although (+ subjunctive)",
						examplePt: "Ainda que seja caro, fico.",
						exampleEn: "Even if it's expensive, I'll stay."
					},
					{
						pt: "por mais que",
						hint: "poor MAISH ke",
						en: "however much (+ subjunctive)",
						examplePt: "Por mais que explique, não convence.",
						exampleEn: "However much he explains, it doesn't convince."
					},
					{
						pt: "não discuto isso",
						hint: "dish-KOO-too",
						en: "I'm not arguing that point",
						examplePt: "Não discuto isso. Discuto o prazo.",
						exampleEn: "I'm not arguing that. I'm arguing the deadline."
					},
					{
						pt: "isso é outra conversa",
						hint: "OW-tra con-VER-sa",
						en: "that's another conversation",
						examplePt: "O turismo é uma coisa. A habitação é outra conversa.",
						exampleEn: "Tourism is one thing. Housing is another conversation."
					},
					{
						pt: "tenho as minhas dúvidas",
						hint: "DOO-vee-dash",
						en: "I have my doubts",
						examplePt: "Tenho as minhas dúvidas de que resulte.",
						exampleEn: "I have my doubts that it will work."
					},
					{
						pt: "deixa-me acabar",
						hint: "DAY-sha-me a-ka-BAR",
						en: "let me finish",
						examplePt: "Deixa-me acabar o raciocínio.",
						exampleEn: "Let me finish the thought."
					},
					{
						pt: "podemos ficar por aqui",
						hint: "fee-KAR poor uh-KEE",
						en: "we can leave it there",
						examplePt: "Podemos ficar por aqui, se calhar.",
						exampleEn: "We can leave it there, maybe."
					}
				]
			},
			{
				type: "grammar",
				title: "Ainda que + subjunctive, then the indicative you actually mean",
				body: "Ainda que tenha mudado (concede in the subjunctive). Não acho que esteja perdida (your claim, still subjunctive after não acho que). Há quem diga que… quotes a view without owning it. Tenho as minhas dúvidas de que + subjunctive. Then a landing: podemos ficar por aqui.",
				examples: [
					{
						pt: "Ainda que tenha mudado, não acho que esteja perdida.",
						en: "Even if it has changed, I don't think it's lost."
					},
					{
						pt: "Há quem diga que já não há cidade.",
						en: "Some people say there is no city left."
					},
					{
						pt: "Tenho as minhas dúvidas de que o pacote chegue.",
						en: "I have my doubts the package will be enough."
					}
				]
			},
			{
				type: "dialogue",
				setting: "A dinner in Arroios. Housing, again. You stay.",
				lines: [
					{
						speaker: "Joana",
						pt: "Esta cidade já não é para quem cá vive. Ponto.",
						en: "This city is no longer for the people who live here. Full stop."
					},
					{
						speaker: "You",
						pt: "Não discuto isso no todo. Ainda que tenha mudado, não acho que esteja perdida.",
						en: "I'm not arguing the whole of that. Even if it has changed, I don't think it's lost."
					},
					{
						speaker: "Joana",
						pt: "Há quem diga que sim.",
						en: "Some people say it is."
					},
					{
						speaker: "You",
						pt: "Pois. Tenho as minhas dúvidas de que o pacote chegue. Mas isso é outra conversa.",
						en: "Right. I have my doubts the package will be enough. But that's another conversation."
					},
					{
						speaker: "Joana",
						pt: "Pronto. Podemos ficar por aqui.",
						en: "Alright. We can leave it there."
					},
					{
						speaker: "You",
						pt: "Ficamos. O pão ainda está quente.",
						en: "We will. The bread is still warm."
					}
				]
			},
			{
				type: "culture",
				title: "The bread is the exit",
				body: "Portuguese disagreement often ends in the room, not in a verdict. Food, a toast, pronto. You can be precise and still pass the water. That is the skill the exam never writes down."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "After “ainda que”, the verb is usually…",
				options: [
					"Indicative present only",
					"Subjunctive",
					"Infinitive only",
					"Future of the indicative"
				],
				answer: 1,
				explain: "Ainda que tenha."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Não discuto isso” is useful because it…",
				options: [
					"Ends the friendship",
					"Concedes a piece and keeps another",
					"Means you agree entirely",
					"Is Brazilian only"
				],
				answer: 1,
				explain: "Stay in the room."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'that's another conversation'.",
				accept: ["isso é outra conversa", "é outra conversa"],
				explain: "A sidebar, not a storm-off."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Há quem diga” lets you quote a view without owning it.",
				options: ["True", "False"],
				answer: 0,
				explain: "Há quem + subjunctive."
			},
			{
				id: "q5",
				kind: "listen",
				prompt: "What is she not claiming?",
				speak: "Ainda que a cidade tenha mudado, não acho que esteja perdida.",
				options: [
					"That the city is lost",
					"That the city changed a bit",
					"That bread is warm",
					"That she is leaving"
				],
				answer: 0,
				explain: "Não acho que esteja perdida."
			},
			{
				id: "q6",
				kind: "choice",
				prompt: "A landing, not a slam…",
				options: [
					"Cala-te",
					"Podemos ficar por aqui",
					"Nunca mais falo",
					"Estás enganado e ponto"
				],
				answer: 1,
				explain: "Leave it there."
			}
		]
	}
];
//#endregion
//#region src/data/grammar.ts
var grammarDrills = [
	{
		id: "gram-a1-ser-estar",
		level: "A1",
		minutes: 8,
		title: "Ser vs estar",
		titlePt: "Ser e estar",
		focus: "Who you are, and how you are today",
		body: "Ser is the long story: identity, origin, profession, the time. Estar is the weather of the moment: location, mood, the coffee being hot. Mix them and you sound foreign; keep them apart and Portuguese opens.",
		examples: [
			{
				pt: "Sou alemão. Estou em Lisboa.",
				en: "I am German. I am in Lisbon (right now)."
			},
			{
				pt: "A loja é grande. A loja está fechada.",
				en: "The shop is big. The shop is closed (today)."
			},
			{
				pt: "São três horas. Estou cansado.",
				en: "It's three o'clock. I'm tired."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Sou de Frankfurt” uses…",
				options: [
					"estar",
					"ser",
					"ficar",
					"ir"
				],
				answer: 1,
				explain: "Origin is ser."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "You are tired after the tram. You say…",
				options: [
					"Sou cansado",
					"Estou cansado",
					"Fico cansado agora ser",
					"É cansado"
				],
				answer: 1,
				explain: "Temporary state → estar."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'I am in Lisbon' (right now).",
				accept: ["estou em lisboa"],
				explain: "Estou em + city."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "Clock time uses ser: são duas horas.",
				options: ["True", "False"],
				answer: 0,
				explain: "Time of day is ser."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "The bakery is shut this afternoon…",
				options: [
					"A pastelaria é fechada",
					"A pastelaria está fechada",
					"A pastelaria fica ser fechada",
					"A pastelaria sou fechada"
				],
				answer: 1,
				explain: "Closed today = estar."
			},
			{
				id: "q6",
				kind: "choice",
				prompt: "Profession: 'I'm a teacher'…",
				options: [
					"Estou professor",
					"Sou professor",
					"Fico professor",
					"Vou professor"
				],
				answer: 1,
				explain: "Who you are = ser."
			},
			{
				id: "q7",
				kind: "listen",
				prompt: "Which verb did you hear?",
				speak: "Estou bem, obrigado.",
				options: [
					"ser",
					"estar",
					"ir",
					"ter"
				],
				answer: 1,
				explain: "Estou = I am (state)."
			}
		]
	},
	{
		id: "gram-a1-acordo",
		level: "A1",
		minutes: 8,
		title: "Agreement — gender, you, thank you",
		titlePt: "Concordância",
		focus: "The word agrees with the speaker or the thing",
		body: "Obrigado is about you, not them. Articles and possessives match the noun: o meu pai, a minha mãe. And 'you' is a relationship: tu with friends, o senhor / a senhora with older strangers.",
		examples: [
			{
				pt: "Obrigado. / Obrigada.",
				en: "Thank you (man speaking / woman speaking)."
			},
			{
				pt: "O meu café. A minha bica.",
				en: "My coffee. My espresso. (noun gender)"
			},
			{
				pt: "Como está, senhora Silva?",
				en: "How are you, Mrs Silva? (polite)"
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "A woman saying thank you uses…",
				options: [
					"Obrigado",
					"Obrigada",
					"De nada",
					"Por favor"
				],
				answer: 1,
				explain: "Agrees with the speaker."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "To a close friend: how are you?",
				options: [
					"Como está?",
					"Como estás?",
					"Como está o senhor?",
					"Como é?"
				],
				answer: 1,
				explain: "Tu takes estás."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'my mother' in Portuguese.",
				accept: ["a minha mãe", "minha mãe"],
				explain: "Mãe is feminine: a minha."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Uma bica” is feminine, so uma not um.",
				options: ["True", "False"],
				answer: 0,
				explain: "Bica takes uma."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“O meu pai” — meu agrees with…",
				options: [
					"The speaker",
					"The father (the noun)",
					"The listener",
					"The city"
				],
				answer: 1,
				explain: "Possessives match the thing possessed."
			},
			{
				id: "q6",
				kind: "choice",
				prompt: "A shopkeeper's 'you' to an older customer…",
				options: [
					"tu",
					"o senhor / a senhora",
					"vocês always",
					"ele"
				],
				answer: 1,
				explain: "Polite third person."
			},
			{
				id: "q7",
				kind: "listen",
				prompt: "Who is speaking?",
				speak: "Obrigada.",
				options: [
					"A man",
					"A woman",
					"A child only",
					"Nobody"
				],
				answer: 1,
				explain: "Obrigada = feminine speaker."
			}
		]
	},
	{
		id: "gram-a1-ha",
		level: "A1",
		minutes: 8,
		title: "Há, tem, está — existing, having, being",
		titlePt: "Há",
		focus: "There is, I have, it is (over there)",
		body: "Há means there is / there are — existence, no owner. Tem is possession (or a shop 'having' pastel de nata). Está locates a thing you already named. English 'there is' is almost always há, not tem, in Portugal.",
		examples: [
			{
				pt: "Há uma pastelaria na esquina.",
				en: "There's a pastry shop on the corner."
			},
			{
				pt: "Não há pão. Tem pão em casa?",
				en: "There's no bread (here). Do you have bread at home?"
			},
			{
				pt: "O WC está ao fundo, à direita.",
				en: "The toilet is at the back, on the right."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“There's a tram stop here” in Portugal…",
				options: [
					"Tem uma paragem aqui",
					"Há uma paragem aqui",
					"Está uma paragem aqui",
					"É uma paragem há"
				],
				answer: 1,
				explain: "Existence = há."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "Asking if the shop has stamps…",
				options: [
					"Há selos, a loja?",
					"Tem selos?",
					"Está selos?",
					"É selos?"
				],
				answer: 1,
				explain: "Possession / stock = ter."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'there is no bread'.",
				accept: [
					"não há pão",
					"nao ha pao",
					"não ha pão"
				],
				explain: "Não há + noun."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Onde está o WC?” locates a known toilet.",
				options: ["True", "False"],
				answer: 0,
				explain: "Estar for the location of a specific thing."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "On a closed Monday, the clerk says…",
				options: [
					"Não tem segunda",
					"Não há pão à segunda",
					"Está pão não",
					"Sou sem pão"
				],
				answer: 1,
				explain: "Não há = there isn't."
			},
			{
				id: "q6",
				kind: "listen",
				prompt: "What is missing?",
				speak: "Não há leite.",
				options: [
					"Bread",
					"Milk",
					"Coffee",
					"The bill"
				],
				answer: 1,
				explain: "Leite = milk."
			},
			{
				id: "q7",
				kind: "choice",
				prompt: "“Há quanto tempo?” asks…",
				options: [
					"How much it costs",
					"How long",
					"What time it is",
					"Where it is"
				],
				answer: 1,
				explain: "Há + duration."
			}
		]
	},
	{
		id: "gram-a2-continuo",
		level: "A2",
		minutes: 8,
		title: "The European continuous",
		titlePt: "Está a…",
		focus: "Estar a + infinitive, not the Brazilian -ndo",
		body: "In Portugal, right-now action is estar a + infinitive: estou a aprender, está a chover, estamos a jantar. Está chovendo is Brazilian. Tag questions (não está?, não é?) keep small talk going.",
		examples: [
			{
				pt: "Está a chover.",
				en: "It's raining."
			},
			{
				pt: "Estou a aprender português.",
				en: "I'm learning Portuguese."
			},
			{
				pt: "Está um dia lindo, não está?",
				en: "It's a lovely day, isn't it?"
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "European Portuguese for 'it's raining'…",
				options: [
					"Está chovendo",
					"Está a chover",
					"Choveu agora não",
					"Faz rain"
				],
				answer: 1,
				explain: "Está a + infinitive."
			},
			{
				id: "q2",
				kind: "type",
				prompt: "Type 'I am learning Portuguese'.",
				accept: ["estou a aprender português", "estou a aprender portugues"],
				explain: "Estou a aprender."
			},
			{
				id: "q3",
				kind: "truefalse",
				prompt: "“Está chovendo” is the form these lessons want.",
				options: ["True", "False"],
				answer: 1,
				explain: "That's Brazilian. Portugal: está a chover."
			},
			{
				id: "q4",
				kind: "choice",
				prompt: "“Não está?” is…",
				options: [
					"A refusal",
					"A tag seeking agreement",
					"The past",
					"A goodbye"
				],
				answer: 1,
				explain: "Tag question."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "We are having dinner, right now…",
				options: [
					"Jantamos ontem",
					"Estamos a jantar",
					"Estamos jantando já",
					"Vamos ser jantar"
				],
				answer: 1,
				explain: "Estar a + infinitive."
			},
			{
				id: "q6",
				kind: "listen",
				prompt: "What is happening?",
				speak: "Está a fazer sol.",
				options: [
					"It's raining",
					"The sun is out",
					"It's night",
					"A storm"
				],
				answer: 1,
				explain: "Fazer sol."
			},
			{
				id: "q7",
				kind: "choice",
				prompt: "Weather almost always uses…",
				options: [
					"ser",
					"estar",
					"haver only",
					"ir"
				],
				answer: 1,
				explain: "Está calor, está frio, está sol."
			}
		]
	},
	{
		id: "gram-a2-passado",
		level: "A2",
		minutes: 10,
		title: "Yesterday — the pretérito",
		titlePt: "Pretérito",
		focus: "Finished events, plus gostar de",
		body: "A closed action takes the pretérito: falei, comi, fui. Ir and ser share fui — context decides. Gostar always needs de: gostei de, gosto de caminhar. Tomorrow's plans live on vou + infinitive until you need the real future.",
		examples: [
			{
				pt: "Ontem fui a Belém e comi um pastel.",
				en: "Yesterday I went to Belém and ate a tart."
			},
			{
				pt: "Gostei do filme.",
				en: "I liked the film."
			},
			{
				pt: "Amanhã vou telefonar.",
				en: "Tomorrow I'll call."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“I went” is…",
				options: [
					"vou",
					"fui",
					"ia",
					"irei"
				],
				answer: 1,
				explain: "Fui is pretérito of ir (and ser)."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "Gostar needs the preposition…",
				options: [
					"a",
					"de",
					"em",
					"por"
				],
				answer: 1,
				explain: "Gosto de / gostei de."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'I liked it' (gostar, past).",
				accept: [
					"gostei",
					"gostei disto",
					"gostei disso"
				],
				explain: "Gostei."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Fui” can mean I went or I was.",
				options: ["True", "False"],
				answer: 0,
				explain: "Ir and ser share the form."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "A plan for tonight, before the proper future…",
				options: [
					"Sairei sempre",
					"Vou sair",
					"Estava a sair ontem",
					"Saía"
				],
				answer: 1,
				explain: "Vou + infinitive."
			},
			{
				id: "q6",
				kind: "listen",
				prompt: "What happened?",
				speak: "Ontem fui a Belém e comi um pastel.",
				options: [
					"Tomorrow I'll go",
					"Yesterday I went to Belém and ate a tart",
					"I never eat tarts",
					"I'm in Belém now"
				],
				answer: 1,
				explain: "Ontem + fui + comi."
			},
			{
				id: "q7",
				kind: "choice",
				prompt: "“Não gostei” means…",
				options: [
					"I didn't like it",
					"I don't want it",
					"I'm leaving",
					"I'm lost"
				],
				answer: 0,
				explain: "Negated past of gostar."
			}
		]
	},
	{
		id: "gram-a2-preps",
		level: "A2",
		minutes: 8,
		title: "A, em, de, para — the four roads",
		titlePt: "Preposições",
		focus: "Go to, live in, come from, this is for",
		body: "Vou a Lisboa (movement toward). Moro em Lisboa (being in). Sou de Frankfurt (origin). Isto é para ti (beneficiary / purpose). Chegar a, ir ao (a + o), estar no (em + o). Brazilian 'vou em' for movement is not the Lisbon habit.",
		examples: [
			{
				pt: "Vou ao mercado. Moro no Bairro Alto.",
				en: "I'm going to the market. I live in Bairro Alto."
			},
			{
				pt: "O comboio chega às nove.",
				en: "The train arrives at nine."
			},
			{
				pt: "Isto é para a Maria.",
				en: "This is for Maria."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "I'm going to Porto…",
				options: [
					"Vou em Porto",
					"Vou ao Porto",
					"Vou de Porto",
					"Vou para o Porto sempre ser"
				],
				answer: 1,
				explain: "Ir a + o Porto → ao Porto."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "I live in Lisbon…",
				options: [
					"Moro a Lisboa",
					"Moro em Lisboa",
					"Moro de Lisboa",
					"Moro para Lisboa"
				],
				answer: 1,
				explain: "Residence = em."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'I am from Frankfurt'.",
				accept: ["sou de frankfurt", "sou de Frankfurt"],
				explain: "Ser de + place."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Chegar a” takes a, not em: cheguei a casa.",
				options: ["True", "False"],
				answer: 0,
				explain: "Arrive at = chegar a."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "A gift for you (informal)…",
				options: [
					"Isto é de ti",
					"Isto é para ti",
					"Isto é em ti",
					"Isto é a ti pão"
				],
				answer: 1,
				explain: "Para = for / intended for."
			},
			{
				id: "q6",
				kind: "listen",
				prompt: "Where is the train going?",
				speak: "Este comboio vai para o Porto.",
				options: [
					"Lisbon",
					"Porto",
					"Madrid",
					"The airport only"
				],
				answer: 1,
				explain: "Para o Porto — destination."
			},
			{
				id: "q7",
				kind: "choice",
				prompt: "a + o contracts to…",
				options: [
					"ao",
					"no",
					"do",
					"pelo"
				],
				answer: 0,
				explain: "ao. em + o = no; de + o = do."
			}
		]
	},
	{
		id: "gram-b1-dois-passados",
		level: "B1",
		minutes: 10,
		title: "Two pasts — scene and cut",
		titlePt: "Dois passados",
		focus: "Imperfeito paints; pretérito cuts",
		body: "Imperfeito is the wide shot: chovia, era tarde, costumava ir a pé. Pretérito is the cut: o eléctrico parou, vi-a, falámos. A useful frame: Era… quando de repente…. Mix them and you sound like a person telling a story.",
		examples: [
			{
				pt: "Chovia quando o eléctrico parou.",
				en: "It was raining when the tram stopped."
			},
			{
				pt: "Era tarde e havia pouca gente na rua.",
				en: "It was late and there were few people in the street."
			},
			{
				pt: "Costumava ir a pé.",
				en: "I used to walk."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "In “Chovia quando o eléctrico parou”, chovia is…",
				options: [
					"A finished event",
					"Background / ongoing past",
					"Future",
					"A command"
				],
				answer: 1,
				explain: "Imperfeito paints the scene."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“De repente” often introduces…",
				options: [
					"An imperfect scene",
					"A pretérito event",
					"A future plan",
					"A subjunctive wish"
				],
				answer: 1,
				explain: "Suddenly + cut."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'I used to walk' with costumar.",
				accept: ["costumava ir a pé", "costumava andar a pé"],
				explain: "Costumava + infinitive."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "Havia (there was/were, scene) is typically imperfect.",
				options: ["True", "False"],
				answer: 0,
				explain: "Havia sets the room; houve is the event."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "European 'I remember' is often…",
				options: [
					"eu recordo isso",
					"lembro-me de",
					"eu me lembro que de",
					"estou memória"
				],
				answer: 1,
				explain: "Lembrar-se de."
			},
			{
				id: "q6",
				kind: "listen",
				prompt: "What is the scene?",
				speak: "Era tarde e havia pouca gente na rua.",
				options: [
					"Morning rush hour",
					"Late, few people in the street",
					"A party",
					"The beach at noon"
				],
				answer: 1,
				explain: "Era tarde, pouca gente."
			},
			{
				id: "q7",
				kind: "choice",
				prompt: "Pick the cut, not the scene.",
				options: [
					"Estava a chover",
					"O comboio chegou",
					"Havia sol",
					"Era verão"
				],
				answer: 1,
				explain: "Chegou is a finished event."
			}
		]
	},
	{
		id: "gram-b1-subjuntivo",
		level: "B1",
		minutes: 10,
		title: "The first subjunctive",
		titlePt: "O subjuntivo",
		focus: "Wish, doubt, emotion, and a different subject after que",
		body: "Take the eles present, drop -m, add the opposite vowel: falar → fale; comer → coma. Ir → vá. Ser → seja. Estar → esteja. Ter → tenha. Haver → haja. You need it after que when the subject changes and you wish, doubt, or feel: quero que venhas, é importante que esteja.",
		examples: [
			{
				pt: "Quero que venhas jantar.",
				en: "I want you to come to dinner."
			},
			{
				pt: "É importante que esteja a horas.",
				en: "It's important that you/he be on time."
			},
			{
				pt: "Talvez chova amanhã.",
				en: "It might rain tomorrow."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "Present subjunctive of falar (ele) is…",
				options: [
					"fala",
					"fale",
					"falou",
					"falava"
				],
				answer: 1,
				explain: "Falam → drop m → fale."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "Ser in the present subjunctive (ele) is…",
				options: [
					"é",
					"foi",
					"seja",
					"fosse"
				],
				answer: 2,
				explain: "Ser → seja."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type the missing verb: Quero que tu _____ (vir).",
				accept: ["venhas"],
				explain: "Vir → venhas (tu)."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "Same subject after que often stays in the infinitive: quero ir.",
				options: ["True", "False"],
				answer: 0,
				explain: "Quero ir (I want to go). Quero que venhas (I want you to come)."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“Talvez chova” uses subjunctive because…",
				options: [
					"It's a command",
					"There's doubt / possibility",
					"It's the past",
					"It's Brazilian only"
				],
				answer: 1,
				explain: "Talvez triggers it."
			},
			{
				id: "q6",
				kind: "listen",
				prompt: "What is wanted?",
				speak: "Quero que venhas jantar.",
				options: [
					"I will come to dinner",
					"I want you to come to dinner",
					"We already ate",
					"Don't come"
				],
				answer: 1,
				explain: "Quero que + subjunctive."
			},
			{
				id: "q7",
				kind: "choice",
				prompt: "Estar (nós) present subjunctive…",
				options: [
					"estamos",
					"estejamos",
					"estivemos",
					"estávamos"
				],
				answer: 1,
				explain: "Estejamos."
			}
		]
	},
	{
		id: "gram-b1-infinitivo",
		level: "B1",
		minutes: 10,
		title: "The personal infinitive",
		titlePt: "Infinitivo pessoal",
		focus: "Para eu ir, para tu ires — Europe's favourite trick",
		body: "Portuguese inflects the infinitive when the subject is named or changes: para eu ir, para tu ires, para ele ir, para nós irmos, para vocês irem, para eles irem. After para, até, ao, sem, por. English hides this in 'for me to go'. Get it right and you sound like the radio.",
		examples: [
			{
				pt: "Trouxe o guarda-chuva para não nos molharmos.",
				en: "I brought the umbrella so we wouldn't get wet."
			},
			{
				pt: "Antes de saíres, fecha a porta.",
				en: "Before you leave, close the door."
			},
			{
				pt: "Ao chegarmos, o café já estava cheio.",
				en: "When we arrived, the café was already full."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "Personal infinitive of ir, tu…",
				options: [
					"ir",
					"ires",
					"vai",
					"fores"
				],
				answer: 1,
				explain: "Para tu ires."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "Nós of falar in the personal infinitive…",
				options: [
					"falar",
					"falarmos",
					"falamos",
					"falemos"
				],
				answer: 1,
				explain: "Para nós falarmos."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'for me to go' with para.",
				accept: ["para eu ir", "para mim ir"],
				explain: "Para eu ir — subject in the nominative."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "Same subject can stay in the plain infinitive: quero sair.",
				options: ["True", "False"],
				answer: 0,
				explain: "No new subject, no inflection needed."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“Ao chegarmos” means roughly…",
				options: [
					"We will arrive",
					"When we arrived / on arriving",
					"Don't arrive",
					"They arrived without us"
				],
				answer: 1,
				explain: "Ao + personal infinitive = on doing."
			},
			{
				id: "q6",
				kind: "listen",
				prompt: "What should you do?",
				speak: "Antes de saíres, fecha a porta.",
				options: [
					"Leave now",
					"Close the door before you leave",
					"Open the window",
					"Stay forever"
				],
				answer: 1,
				explain: "Antes de saíres."
			},
			{
				id: "q7",
				kind: "choice",
				prompt: "Eles of ir (personal infinitive)…",
				options: [
					"irem",
					"vão",
					"foram",
					"iriam"
				],
				answer: 0,
				explain: "Para eles irem."
			}
		]
	},
	{
		id: "gram-b2-cliticos",
		level: "B2",
		minutes: 10,
		title: "Clitics that make you sound local",
		titlePt: "Clíticos",
		focus: "Custa-me, faz-me, falar consigo",
		body: "European Portuguese hangs pronouns on the verb: custa-me acordar, deu-me uma alegria, lembro-me de ti. Polite 'you' is often third person: falar consigo, como está. Lá softens a request: diz-me lá. Feelings are often verbs with a clitic, not adjectives.",
		examples: [
			{
				pt: "Custa-me acordar cedo.",
				en: "It's hard for me to wake up early."
			},
			{
				pt: "O que te apetece?",
				en: "What do you feel like?"
			},
			{
				pt: "Posso falar consigo um momento?",
				en: "May I speak with you a moment? (polite)"
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Custa-me” literally hangs the pronoun…",
				options: [
					"Before the verb always",
					"On the verb: custa-me",
					"In a separate word 'para mim' only",
					"Never in Portugal"
				],
				answer: 1,
				explain: "European enclitic: verb-me."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "Polite 'with you' is…",
				options: [
					"com tu",
					"consigo",
					"convosco always",
					"com você-te"
				],
				answer: 1,
				explain: "Falar consigo."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'I remember you' (European, informal).",
				accept: ["lembro-me de ti", "lembro-me de você"],
				explain: "Lembrar-se de + ti."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“O que te apetece?” is a natural 'what do you feel like?'.",
				options: ["True", "False"],
				answer: 0,
				explain: "Apetecer with a clitic."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“Diz-me lá” — lá here is…",
				options: [
					"There (location)",
					"A softener",
					"The past",
					"A negation"
				],
				answer: 1,
				explain: "Particle, not a place."
			},
			{
				id: "q6",
				kind: "listen",
				prompt: "What's hard?",
				speak: "Custa-me acordar cedo.",
				options: [
					"Going to bed",
					"Waking up early",
					"Coffee",
					"The tram"
				],
				answer: 1,
				explain: "Acordar cedo."
			},
			{
				id: "q7",
				kind: "choice",
				prompt: "Tenho saudades…",
				options: [
					"de casa",
					"a casa",
					"em casa always",
					"para casa"
				],
				answer: 0,
				explain: "Ter saudades de."
			}
		]
	},
	{
		id: "gram-b2-hedges",
		level: "B2",
		minutes: 10,
		title: "Disagree without leaving the room",
		titlePt: "Matizes",
		focus: "Há quem + subjunctive, hedges, concession",
		body: "Há quem diga / pense / ache que… lets you quote a view without owning it. Hedges: talvez, se calhar, diria que, em certa medida. Concession: percebo, admito, é verdade, mas… You stay in the conversation. That is fluency more than vocabulary.",
		examples: [
			{
				pt: "Há quem diga que Lisboa já não é para quem cá vive.",
				en: "Some people say Lisbon is no longer for those who live here."
			},
			{
				pt: "Diria que sim, em certa medida.",
				en: "I'd say so, to some extent."
			},
			{
				pt: "Percebo, mas não estou de acordo.",
				en: "I see that, but I don't agree."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "After “há quem”, the verb is usually…",
				options: [
					"Indicative present only",
					"Subjunctive: há quem diga",
					"Infinitive only",
					"Future"
				],
				answer: 1,
				explain: "Há quem + subjunctive."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "A hedge that means 'I'd say'…",
				options: [
					"Exijo que",
					"Diria que",
					"Nunca",
					"Pronto, chega"
				],
				answer: 1,
				explain: "Diria que."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'I see that, but…' using percebo.",
				accept: ["percebo, mas", "percebo mas"],
				explain: "Percebo, mas…"
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Se calhar” is a casual 'maybe / probably'.",
				options: ["True", "False"],
				answer: 0,
				explain: "Very spoken European Portuguese."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“Em certa medida” means…",
				options: [
					"Immediately",
					"To some extent",
					"Never",
					"In the metro"
				],
				answer: 1,
				explain: "A measured hedge."
			},
			{
				id: "q6",
				kind: "listen",
				prompt: "Whose view is this?",
				speak: "Há quem diga que a cidade mudou.",
				options: [
					"Only the speaker's",
					"Some people's (not owned)",
					"The government's official line",
					"A child's"
				],
				answer: 1,
				explain: "Há quem diga = some say."
			},
			{
				id: "q7",
				kind: "choice",
				prompt: "A soft landing: 'we agree on this, at least'…",
				options: [
					"Estamos de acordo nisto, pelo menos",
					"Tens de calar",
					"Não falo mais",
					"É mentira e ponto"
				],
				answer: 0,
				explain: "Stay in the room."
			}
		]
	},
	{
		id: "gram-b2-relativos",
		level: "B2",
		minutes: 10,
		title: "Relatives — que, o que, quem, cujo",
		titlePt: "Relativos",
		focus: "The clause that lets you stay in one sentence",
		body: "Que is the workhorse: o livro que li, a pessoa que telefonei. Quem after a preposition for people: a pessoa com quem falei. O que points at a whole idea: o que me custa é acordar. Cujo agrees with what follows, not the owner: o escritor cuja obra li. Drop the English 'that' habit of stacking sentences.",
		examples: [
			{
				pt: "O eléctrico que apanhei ia para a Graça.",
				en: "The tram I caught was going to Graça."
			},
			{
				pt: "A pessoa com quem falei era a dona.",
				en: "The person I spoke with was the owner."
			},
			{
				pt: "O que me irrita é a fila, não a espera.",
				en: "What irritates me is the queue, not the wait."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“The book I read”…",
				options: [
					"O livro o qual eu",
					"O livro que li",
					"O livro quem li",
					"O livro cujo li"
				],
				answer: 1,
				explain: "Que for things (and many people)."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "After a preposition, people often take…",
				options: [
					"que only",
					"quem: com quem falei",
					"cujo always",
					"o que for people"
				],
				answer: 1,
				explain: "Com quem, a quem, de quem."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'what irritates me' using o que.",
				accept: ["o que me irrita", "o que me custa"],
				explain: "O que + clitic + verb."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "Cujo agrees with the following noun: cuja obra, cujo livro.",
				options: ["True", "False"],
				answer: 0,
				explain: "Not with the owner."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "“O que” here points to…",
				options: [
					"One named person",
					"A whole idea / 'what'",
					"Only a time",
					"A city"
				],
				answer: 1,
				explain: "O que = what / that which."
			},
			{
				id: "q6",
				kind: "listen",
				prompt: "Who was she?",
				speak: "A pessoa com quem falei era a dona.",
				options: [
					"A tourist",
					"The owner",
					"The waiter",
					"Nobody"
				],
				answer: 1,
				explain: "A dona."
			},
			{
				id: "q7",
				kind: "choice",
				prompt: "Avoid calquing English 'the man that I spoke' — prefer…",
				options: [
					"o homem que falei",
					"o homem com quem falei",
					"o homem cujo falei",
					"o homem o que falei"
				],
				answer: 1,
				explain: "Falar com + quem."
			}
		]
	},
	{
		id: "gram-c1-ainda-que",
		level: "C1",
		minutes: 10,
		title: "Ainda que — concede, then stay",
		titlePt: "Ainda que",
		focus: "Concession in the subjunctive, claim in the next clause",
		body: "Ainda que, mesmo que, por mais que take the subjunctive: ainda que tenha mudado. Then you say what you actually mean, often with não acho que + subjunctive, or an indicative landing. English 'even if' is not even though — ainda que covers both, context decides.",
		examples: [
			{
				pt: "Ainda que seja tarde, fico.",
				en: "Even if it's late, I'll stay."
			},
			{
				pt: "Mesmo que o pacote chegue, tenho dúvidas.",
				en: "Even if the package arrives, I have doubts."
			},
			{
				pt: "Por mais que explique, não convence.",
				en: "However much he explains, it doesn't convince."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Ainda que tenha” uses…",
				options: [
					"Indicative",
					"Subjunctive",
					"Infinitive",
					"The future of the indicative only"
				],
				answer: 1,
				explain: "Concession → subjunctive."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Por mais que” is closest to…",
				options: [
					"Because",
					"However much",
					"Before",
					"Instead of"
				],
				answer: 1,
				explain: "Por mais que + subjunctive."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'even if it's late, I'll stay'.",
				accept: ["ainda que seja tarde, fico", "ainda que seja tarde fico"],
				explain: "Ainda que seja."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Mesmo que” also takes the subjunctive.",
				options: ["True", "False"],
				answer: 0,
				explain: "Mesmo que chegue."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "After conceding, a natural claim is…",
				options: [
					"Cala-te",
					"Não acho que esteja perdida",
					"Adeus para sempre",
					"Não falo"
				],
				answer: 1,
				explain: "Não acho que + subjunctive."
			},
			{
				id: "q6",
				kind: "listen",
				prompt: "Will they stay?",
				speak: "Ainda que seja tarde, fico.",
				options: [
					"They're leaving",
					"They'll stay even if it's late",
					"They never stay",
					"It's morning"
				],
				answer: 1,
				explain: "Fico."
			},
			{
				id: "q7",
				kind: "choice",
				prompt: "English 'even though it changed' (it did) can still be…",
				options: [
					"ainda que tenha mudado",
					"ainda que vai mudar only",
					"por causa que mudou",
					"quando mudará"
				],
				answer: 0,
				explain: "Portuguese often uses the same frame."
			}
		]
	},
	{
		id: "gram-c1-futuro",
		level: "C1",
		minutes: 10,
		title: "When it happens — futuro do conjuntivo",
		titlePt: "Quando chegar",
		focus: "Quando, se, assim que + the future subjunctive",
		body: "For a future event that is not yet real, European Portuguese inflects the infinitive stem: quando chegar, se quiseres, assim que soubermos. English uses a present: when it arrives. Calque that and you sound like a tourist. Irregulars: for / fores / for; quiser; souber; puder; tiver; houver.",
		examples: [
			{
				pt: "Quando chegar o comboio, telefonamos.",
				en: "When the train arrives, we'll call."
			},
			{
				pt: "Se quiseres, fico.",
				en: "If you want, I'll stay."
			},
			{
				pt: "Assim que soubermos, dizemos.",
				en: "As soon as we know, we'll say."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“When the train arrives” (future)…",
				options: [
					"Quando o comboio chega sempre",
					"Quando chegar o comboio",
					"Quando o comboio chegou",
					"Quando vai chegar se"
				],
				answer: 1,
				explain: "Quando chegar."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "Se + tu of querer, future subjunctive…",
				options: [
					"se queres",
					"se quiseres",
					"se querias",
					"se quererás"
				],
				answer: 1,
				explain: "Se quiseres."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'as soon as we know'.",
				accept: ["assim que soubermos"],
				explain: "Assim que + soubermos."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "Ser and ir share for / fores / for in this tense.",
				options: ["True", "False"],
				answer: 0,
				explain: "Quando for preciso; quando fores a Lisboa."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "Haver in the future subjunctive (ele)…",
				options: [
					"há",
					"houve",
					"houver",
					"haverá only"
				],
				answer: 2,
				explain: "Se houver pão."
			},
			{
				id: "q6",
				kind: "listen",
				prompt: "What is the condition?",
				speak: "Se quiseres, fico.",
				options: [
					"If you want, I'll stay",
					"I already stayed",
					"Never stay",
					"They must leave"
				],
				answer: 0,
				explain: "Se quiseres."
			},
			{
				id: "q7",
				kind: "choice",
				prompt: "Avoid…",
				options: [
					"Quando chegar, falamos",
					"Quando vai chegar, nós vamos falar (English calque)",
					"Assim que soubermos, dizemos",
					"Se puderes, vem"
				],
				answer: 1,
				explain: "Don't calque will-arrive."
			}
		]
	},
	{
		id: "gram-c1-registo",
		level: "C1",
		minutes: 8,
		title: "Register — the room you are in",
		titlePt: "Registo",
		focus: "Pois, pronto, a gente, houver, the news future",
		body: "C1 is choosing the room. Pois agrees without adding. Pronto closes. A gente (with third-person verb) is spoken and not wrong. Terá dito is the news, not your mouth at dinner. Há quem diga quotes. Mixing them is how you sound like the radio in the kitchen instead of a textbook.",
		examples: [
			{
				pt: "Pois. Pronto. Ficamos por aqui.",
				en: "Right. Alright. We'll leave it there."
			},
			{
				pt: "A gente vê isso amanhã.",
				en: "We'll look at that tomorrow. (spoken)"
			},
			{
				pt: "O ministro terá dito que não há recuo.",
				en: "The minister is said to have said there is no climb-down."
			}
		],
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "“Pois” in a disagreement often…",
				options: [
					"Means never",
					"Agrees with the last move without adding much",
					"Is only for farms",
					"Cancels the previous sentence"
				],
				answer: 1,
				explain: "A soft yes."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "Spoken “a gente” takes…",
				options: [
					"Nós verbs: a gente vamos",
					"Third person: a gente vê",
					"Tu verbs",
					"The infinitive only"
				],
				answer: 1,
				explain: "A gente vê."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'we'll leave it there' with ficar.",
				accept: [
					"ficamos por aqui",
					"podemos ficar por aqui",
					"ficamos por aqui se calhar"
				],
				explain: "Ficar por aqui."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "“Terá dito” is a rumour/report form, not a dinner-table past.",
				options: ["True", "False"],
				answer: 0,
				explain: "News register."
			},
			{
				id: "q5",
				kind: "choice",
				prompt: "A close that stays in the room…",
				options: [
					"Pronto. Ficamos por aqui",
					"Cala-te agora",
					"Adeus para sempre",
					"Não existes"
				],
				answer: 0,
				explain: "Pronto is allowed."
			},
			{
				id: "q6",
				kind: "listen",
				prompt: "What is the landing?",
				speak: "Pois. Pronto. Ficamos por aqui.",
				options: [
					"They storm out",
					"They leave it there",
					"They order more wine only",
					"They switch to English"
				],
				answer: 1,
				explain: "Ficamos por aqui."
			},
			{
				id: "q7",
				kind: "choice",
				prompt: "Quote a view you don't own…",
				options: [
					"Eu exijo que",
					"Há quem diga que",
					"É mentira ponto",
					"Cala"
				],
				answer: 1,
				explain: "Há quem diga."
			}
		]
	}
];
//#endregion
//#region src/data/radio.ts
var radioBulletins = [
	{
		id: "radio-tempo",
		level: "A1",
		minutes: 6,
		station: "Antena 1",
		title: "This morning's weather",
		titlePt: "O tempo",
		kicker: "A short bulletin. One listen. Three facts.",
		script: "Bom dia. São oito horas em Lisboa. O tempo para hoje: de manhã, nublado. À tarde, prevê-se chuva. Levem o guarda-chuva. Temperaturas entre catorze e vinte graus. A seguir, o trânsito.",
		translation: "Good morning. It's eight o'clock in Lisbon. Weather for today: cloudy in the morning. Rain is forecast for the afternoon. Take an umbrella. Temperatures between fourteen and twenty degrees. Next, traffic.",
		image: "/scenes/radio.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "In the morning it is…",
				options: [
					"Sunny",
					"Cloudy",
					"Snowing",
					"Very hot"
				],
				answer: 1,
				explain: "De manhã, nublado."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "When is the rain?",
				options: [
					"Now",
					"This morning",
					"This afternoon",
					"Tonight only"
				],
				answer: 2,
				explain: "À tarde, prevê-se chuva."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type the city named in the bulletin.",
				accept: ["Lisboa", "lisboa"],
				explain: "São oito horas em Lisboa."
			},
			{
				id: "q4",
				kind: "listen",
				prompt: "What should you take?",
				speak: "Levem o guarda-chuva.",
				options: [
					"A coat",
					"An umbrella",
					"The tram",
					"Sunglasses"
				],
				answer: 1,
				explain: "Guarda-chuva = umbrella."
			}
		]
	},
	{
		id: "radio-mercado",
		level: "A1",
		minutes: 6,
		station: "Rádio Municipal",
		title: "Market hours",
		titlePt: "O mercado",
		kicker: "A public notice, the kind that lives on a loudspeaker.",
		script: "Atenção. O mercado da Ribeira abre às sete da manhã e fecha às três da tarde. Ao domingo está fechado. O peixe fresco chega às oito. Obrigado.",
		translation: "Attention. Ribeira market opens at seven in the morning and closes at three in the afternoon. On Sunday it is closed. Fresh fish arrives at eight. Thank you.",
		image: "/scenes/radio.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "The market opens at…",
				options: [
					"6:00",
					"7:00",
					"8:00",
					"15:00"
				],
				answer: 1,
				explain: "Abre às sete da manhã."
			},
			{
				id: "q2",
				kind: "truefalse",
				prompt: "The market is open on Sunday.",
				options: ["True", "False"],
				answer: 1,
				explain: "Ao domingo está fechado."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "What arrives at eight? Type the Portuguese word.",
				accept: [
					"peixe",
					"o peixe",
					"peixe fresco",
					"o peixe fresco"
				],
				explain: "O peixe fresco chega às oito."
			}
		]
	},
	{
		id: "radio-eletrico",
		level: "A2",
		minutes: 7,
		station: "Carris",
		title: "Tram delay",
		titlePt: "Atraso",
		kicker: "Service announcements are real Portuguese — short, polite, full of por.",
		script: "Informação à circulação. O eléctrico vinte e oito circula com atraso devido a obras na Graça. O tempo de espera é de cerca de vinte minutos. Recomenda-se o autocarro setecentos e trinta e sete, ou o metro até Martim Moniz. Pedimos desculpa pelo incómodo.",
		translation: "Service information. Tram twenty-eight is running late due to roadworks in Graça. Waiting time is about twenty minutes. We recommend bus 737, or the metro to Martim Moniz. Sorry for the inconvenience.",
		image: "/scenes/tram.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "Why is the tram late?",
				options: [
					"A strike",
					"Roadworks in Graça",
					"Rain",
					"A football match"
				],
				answer: 1,
				explain: "Devido a obras na Graça."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "Waiting time is about…",
				options: [
					"Five minutes",
					"Ten minutes",
					"Twenty minutes",
					"An hour"
				],
				answer: 2,
				explain: "Cerca de vinte minutos."
			},
			{
				id: "q3",
				kind: "truefalse",
				prompt: "They recommend the bus or the metro as alternatives.",
				options: ["True", "False"],
				answer: 0,
				explain: "Autocarro 737 or metro to Martim Moniz."
			},
			{
				id: "q4",
				kind: "type",
				prompt: "Type the Portuguese word for tram used here.",
				accept: [
					"eléctrico",
					"eletrico",
					"o eléctrico",
					"o eletrico"
				],
				explain: "Eléctrico — European Portuguese, not bonde."
			}
		]
	},
	{
		id: "radio-fim-de-semana",
		level: "A2",
		minutes: 7,
		station: "Antena 1",
		title: "A weekend in Belém",
		titlePt: "Fim de semana",
		kicker: "Plans, weather, and a closed car park — small-talk fuel.",
		script: "Este fim de semana há festa em Belém. O tempo está bom: sol e pouco vento. Os museus estão abertos até às sete. Se vai de carro, o parque enche cedo. É melhor ir de eléctrico ou a pé. Bom fim de semana.",
		translation: "This weekend there is a festival in Belém. The weather is good: sun and little wind. The museums are open until seven. If you go by car, the car park fills early. Better to go by tram or on foot. Have a good weekend.",
		image: "/scenes/tram.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "Where is the festival?",
				options: [
					"Alfama",
					"Belém",
					"Porto",
					"Cascais"
				],
				answer: 1,
				explain: "Há festa em Belém."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "How should you travel, according to the bulletin?",
				options: [
					"By car, late",
					"By tram or on foot",
					"Only by taxi",
					"Don't go"
				],
				answer: 1,
				explain: "É melhor ir de eléctrico ou a pé."
			},
			{
				id: "q3",
				kind: "listen",
				prompt: "Until when are the museums open?",
				speak: "Os museus estão abertos até às sete.",
				options: [
					"Until five",
					"Until seven",
					"All night",
					"They are closed"
				],
				answer: 1,
				explain: "Até às sete."
			}
		]
	},
	{
		id: "radio-liberdade",
		level: "B1",
		minutes: 8,
		station: "TSF",
		title: "Works on Liberdade",
		titlePt: "Obras",
		kicker: "Catch the lead verb. Ignore portanto. Write one fact.",
		script: "São oito horas em Lisboa. Em destaque, o trânsito. Segundo as últimas informações, a Avenida da Liberdade está condicionada por obras até sexta-feira. Recomenda-se o metro. Na ponte vinte e cinco de Abril, vento forte. Portanto, evitem deslocações desnecessárias de carro. A seguir, desporto. O Benfica joga esta noite em casa.",
		translation: "Eight o'clock in Lisbon. Headlines: traffic. According to the latest information, Avenida da Liberdade is restricted by roadworks until Friday. The metro is recommended. On the 25 de Abril bridge, strong wind. So avoid unnecessary car trips. Next, sport. Benfica play at home tonight.",
		image: "/scenes/radio.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "Liberdade is restricted until…",
				options: [
					"Tonight",
					"Monday",
					"Friday",
					"Next month"
				],
				answer: 2,
				explain: "Até sexta-feira."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "What is the recommended alternative?",
				options: [
					"A taxi",
					"The metro",
					"Walking the bridge",
					"Waiting in the car"
				],
				answer: 1,
				explain: "Recomenda-se o metro."
			},
			{
				id: "q3",
				kind: "truefalse",
				prompt: "Benfica play at home tonight.",
				options: ["True", "False"],
				answer: 0,
				explain: "O Benfica joga esta noite em casa."
			},
			{
				id: "q4",
				kind: "type",
				prompt: "Type the filler word that means 'so' in the bulletin.",
				accept: ["portanto"],
				explain: "Portanto — you can skip it and keep the meaning."
			}
		]
	},
	{
		id: "radio-livraria",
		level: "B1",
		minutes: 8,
		station: "Antena 2",
		title: "A book for the week",
		titlePt: "A recomendação",
		kicker: "Culture radio is slower. Listen for the recommendation, then the price.",
		script: "A recomendação da semana vem de uma livraria pequena em Lisboa. Crónicas da cidade, em prosa clara. Serve bem a quem está a aprender a língua e quer ouvir a rua nas páginas. O livro está na montra, à entrada. Custa catorze euros. Vale o café que se leva para o ler.",
		translation: "This week's recommendation comes from a small bookshop in Lisbon. City chronicles, in clear prose. It suits anyone learning the language who wants to hear the street on the page. The book is in the window, by the door. It costs fourteen euros. Worth the coffee you take to read it.",
		image: "/scenes/books.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "What kind of book is recommended?",
				options: [
					"A grammar",
					"City chronicles",
					"A cookbook",
					"A thriller in English"
				],
				answer: 1,
				explain: "Crónicas da cidade."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "The price is…",
				options: [
					"Four euros",
					"Forty euros",
					"Fourteen euros",
					"Free"
				],
				answer: 2,
				explain: "Custa catorze euros."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Where is the book? Type the Portuguese word for shop window.",
				accept: [
					"montra",
					"na montra",
					"a montra"
				],
				explain: "Na montra, à entrada."
			}
		]
	},
	{
		id: "radio-cidade",
		level: "B2",
		minutes: 8,
		station: "TSF",
		title: "Who the city is for",
		titlePt: "A cidade",
		kicker: "Opinion radio. Hedge, concede, then land.",
		script: "Há quem diga que Lisboa já não é para quem cá vive. Por um lado, o turismo trouxe movimento e trabalho. Por outro, a renda dispara e os vizinhos partem. Diria que a cidade precisa de equilíbrio — não de nostalgia fácil, nem de um centro feito só para quem passa. Fica o recado. A seguir, o tempo.",
		translation: "Some say Lisbon is no longer for the people who live here. On the one hand, tourism brought movement and work. On the other, rents shoot up and neighbours leave. I would say the city needs balance — not easy nostalgia, nor a centre made only for people passing through. That's the note. Next, the weather.",
		image: "/scenes/tram.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "The speaker's position is…",
				options: [
					"Tourism should stop tomorrow",
					"The city needs balance",
					"Rents are fine",
					"Nostalgia is the answer"
				],
				answer: 1,
				explain: "Diria que a cidade precisa de equilíbrio."
			},
			{
				id: "q2",
				kind: "truefalse",
				prompt: "“Há quem diga” presents other people's view, not the speaker's yet.",
				options: ["True", "False"],
				answer: 0,
				explain: "Há quem + subjunctive: some people say…"
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type the two-word hedge that starts the speaker's own view (Diria…).",
				accept: ["Diria que", "diria que"],
				explain: "Diria que — I would say that."
			}
		]
	},
	{
		id: "radio-cozinha",
		level: "B2",
		minutes: 6,
		station: "Antena 1",
		title: "Radio in the kitchen",
		titlePt: "Na cozinha",
		kicker: "How to keep listening after the course: three words, no rewind.",
		script: "Às vezes a rádio na cozinha chega mais longe do que um manual. Uma voz, o cheiro do café, três palavras que ficam. Não se rebobina. Amanhã ouvem-se outras três. É assim que a língua entra em casa — sem cerimónia, entre o pão e a chávena.",
		translation: "Sometimes the radio in the kitchen goes further than a textbook. A voice, the smell of coffee, three words that stay. You do not rewind. Tomorrow you hear another three. That is how the language comes into the house — without ceremony, between the bread and the cup.",
		image: "/scenes/radio.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "The advice is to…",
				options: [
					"Transcribe every word",
					"Let three words stick, and not rewind",
					"Turn the radio off",
					"Only listen to lessons"
				],
				answer: 1,
				explain: "Três palavras que ficam. Não se rebobina."
			},
			{
				id: "q2",
				kind: "listen",
				prompt: "Where does the language enter?",
				speak: "É assim que a língua entra em casa.",
				options: [
					"At school only",
					"Into the house",
					"On the tram",
					"In the exam"
				],
				answer: 1,
				explain: "Entra em casa."
			},
			{
				id: "q3",
				kind: "truefalse",
				prompt: "The speaker prefers ceremony and a desk.",
				options: ["True", "False"],
				answer: 1,
				explain: "Sem cerimónia, entre o pão e a chávena."
			}
		]
	},
	{
		id: "radio-pacote",
		level: "C1",
		minutes: 10,
		station: "TSF",
		title: "The housing package",
		titlePt: "O pacote",
		kicker: "Natural speed. Three facts. No rewind as a habit.",
		script: "Bom dia. São oito horas. O Governo admite rever o pacote de habitação, mas não hoje. Ao que tudo indica, as novas regras entram em vigor na segunda, sem mais pormenores. Em Lisboa, o metro fecha mais cedo na véspera de feriado. A seguir, o trânsito na Segunda Circular.",
		translation: "Good morning. It's eight o'clock. The government admits it may revisit the housing package, but not today. By all indications the new rules come into force on Monday, without further details. In Lisbon the metro closes earlier on the eve of a public holiday. Next, traffic on the Segunda Circular.",
		image: "/scenes/radio.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "The housing package…",
				options: [
					"Is cancelled",
					"May be revisited, but not today",
					"Starts this afternoon",
					"Is only about the metro"
				],
				answer: 1,
				explain: "Admite rever… mas não hoje."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "The new rules come into force…",
				options: [
					"Today",
					"On Monday",
					"Never",
					"In December only"
				],
				answer: 1,
				explain: "Entram em vigor na segunda."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type the hedge 'by all indications'.",
				accept: ["ao que tudo indica"],
				explain: "Ao que tudo indica."
			},
			{
				id: "q4",
				kind: "listen",
				prompt: "What happens to the metro?",
				speak: "Em Lisboa, o metro fecha mais cedo na véspera de feriado.",
				options: [
					"It stays open all night",
					"It closes earlier the evening before a holiday",
					"It is free",
					"It does not run on Mondays"
				],
				answer: 1,
				explain: "Fecha mais cedo na véspera de feriado."
			},
			{
				id: "q5",
				kind: "truefalse",
				prompt: "The bulletin gives full details of the housing rules.",
				options: ["True", "False"],
				answer: 1,
				explain: "Sem mais pormenores."
			}
		]
	}
];
//#endregion
//#region src/data/reading.ts
var readingPieces = [
	{
		id: "read-aviso",
		level: "A1",
		minutes: 8,
		kind: "notice",
		source: "A shop door in Campo de Ourique",
		title: "A closed sign",
		titlePt: "Aviso",
		paragraphs: [{
			pt: "Estamos fechados para almoço. Abrimos às 15:00. Obrigado.",
			en: "We are closed for lunch. We open at 15:00. Thank you."
		}, {
			pt: "Às segundas estamos encerrados.",
			en: "On Mondays we are closed."
		}],
		notes: [{
			pt: "fechado / encerrado",
			en: "closed (door / more formal)"
		}, {
			pt: "almoço",
			en: "lunch — often 12:30 to 15:00 in Portugal"
		}],
		image: "/scenes/cafe.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "You arrive at 13:10. The shop is…",
				options: [
					"Open",
					"Closed for lunch",
					"Closed all day",
					"Open only on Mondays"
				],
				answer: 1,
				explain: "Fechados para almoço; they reopen at 15:00."
			},
			{
				id: "q2",
				kind: "truefalse",
				prompt: "The shop opens on Mondays.",
				options: ["True", "False"],
				answer: 1,
				explain: "Às segundas estamos encerrados."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type the Portuguese word for lunch used on the sign.",
				accept: ["almoço", "almoco"],
				explain: "Almoço — lunch."
			}
		]
	},
	{
		id: "read-postal",
		level: "A1",
		minutes: 8,
		kind: "message",
		source: "A postcard from a friend in Porto",
		title: "A few lines from Porto",
		titlePt: "Postal",
		paragraphs: [{
			pt: "Olá. Estou no Porto. O tempo está bom e o rio é giro.",
			en: "Hi. I'm in Porto. The weather is good and the river is lovely."
		}, {
			pt: "Hoje como francesinha. Amanhã vou a Gaia. Beijos, Ana.",
			en: "Today I'm eating francesinha. Tomorrow I'm going to Gaia. Kisses, Ana."
		}],
		notes: [{
			pt: "giro / gira",
			en: "nice / lovely (very Portuguese)"
		}, {
			pt: "beijos",
			en: "kisses — a normal sign-off, not a romance plot"
		}],
		image: "/scenes/tram.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "Where is Ana?",
				options: [
					"Lisbon",
					"Porto",
					"Gaia today",
					"Coimbra"
				],
				answer: 1,
				explain: "Estou no Porto. Gaia is tomorrow."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Giro” here means…",
				options: [
					"Spinning",
					"Lovely",
					"Expensive",
					"Cold"
				],
				answer: 1,
				explain: "Giro = nice, attractive — everyday PT."
			},
			{
				id: "q3",
				kind: "truefalse",
				prompt: "She is eating francesinha today.",
				options: ["True", "False"],
				answer: 0,
				explain: "Hoje como francesinha."
			}
		]
	},
	{
		id: "read-mensagem",
		level: "A2",
		minutes: 8,
		kind: "message",
		source: "A text from Inês",
		title: "Tomorrow night",
		titlePt: "Mensagem",
		paragraphs: [
			{
				pt: "Olá! Então, vais ter tempo amanhã à noite?",
				en: "Hi! So, will you have time tomorrow night?"
			},
			{
				pt: "Podemos jantar no bairro. Há um sítio simples, não é caro. Que tal às vinte?",
				en: "We could have dinner in the neighbourhood. There's a simple place, it's not expensive. How about eight?"
			},
			{
				pt: "Se não der, diz. Combinado?",
				en: "If it doesn't work, say so. Deal?"
			}
		],
		notes: [
			{
				pt: "que tal",
				en: "how about…"
			},
			{
				pt: "se não der",
				en: "if it doesn't work out (dar = to work / be possible)"
			},
			{
				pt: "combinado",
				en: "deal / agreed"
			}
		],
		image: "/scenes/cafe.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "What time does she propose?",
				options: [
					"12:00",
					"18:00",
					"20:00",
					"22:00"
				],
				answer: 2,
				explain: "Que tal às vinte? — 20:00."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Combinado” is how you…",
				options: [
					"Order wine",
					"Close a plan",
					"Say goodbye forever",
					"Ask the price"
				],
				answer: 1,
				explain: "The standard 'deal'."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type the two-word phrase that means 'how about'.",
				accept: ["que tal", "Que tal"],
				explain: "Que tal às vinte?"
			}
		]
	},
	{
		id: "read-talho",
		level: "A2",
		minutes: 9,
		kind: "notice",
		source: "A note on the butcher's counter",
		title: "What they have today",
		titlePt: "O talho",
		paragraphs: [{
			pt: "Hoje há frango do campo e alheira. O peixe está na banca ao lado.",
			en: "Today there is free-range chicken and alheira. The fish is at the stall next door."
		}, {
			pt: "Querida? Diga o peso. Passo-lhe a conta no fim. Cartão ou dinheiro, tanto faz.",
			en: "Darling? Tell me the weight. I'll give you the bill at the end. Card or cash, either is fine."
		}],
		notes: [
			{
				pt: "alheira",
				en: "a smoked sausage from Trás-os-Montes"
			},
			{
				pt: "tanto faz",
				en: "either is fine / it makes no difference"
			},
			{
				pt: "querida / ó senhor",
				en: "warm counter-talk, not intimacy"
			}
		],
		image: "/scenes/cafe.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "Where is the fish?",
				options: [
					"Here",
					"At the stall next door",
					"Sold out",
					"In the fridge only"
				],
				answer: 1,
				explain: "O peixe está na banca ao lado."
			},
			{
				id: "q2",
				kind: "truefalse",
				prompt: "They only take cash.",
				options: ["True", "False"],
				answer: 1,
				explain: "Cartão ou dinheiro, tanto faz."
			},
			{
				id: "q3",
				kind: "choice",
				prompt: "“Tanto faz” means…",
				options: [
					"That's expensive",
					"Either is fine",
					"Come back tomorrow",
					"No chicken"
				],
				answer: 1,
				explain: "It makes no difference."
			}
		]
	},
	{
		id: "read-noticia",
		level: "B1",
		minutes: 12,
		kind: "news",
		source: "A short regional column",
		title: "Rain and the bridge",
		titlePt: "A ponte",
		paragraphs: [
			{
				pt: "Lisboa acordou com chuva. Segundo o Instituto do Mar e da Atmosfera, o temporal mantém-se até ao início da noite.",
				en: "Lisbon woke to rain. According to the sea and atmosphere institute, the storm holds until early evening."
			},
			{
				pt: "Na ponte 25 de Abril o vento cortou o trânsito de camiões durante a manhã. Os comboios da linha de Cascais circularam com atraso.",
				en: "On the 25 de Abril bridge the wind stopped lorry traffic during the morning. Cascais-line trains ran late."
			},
			{
				pt: "A Câmara recomenda transportes públicos e pede calma. “Não é dia para ir de carro à toa”, disse uma vereadora.",
				en: "City hall recommends public transport and asks for calm. “It's not a day to go by car on a whim,” a councillor said."
			}
		],
		notes: [
			{
				pt: "a Câmara",
				en: "city hall — not a hotel room"
			},
			{
				pt: "à toa",
				en: "aimlessly / on a whim"
			},
			{
				pt: "vereadora",
				en: "a city councillor (woman)"
			}
		],
		image: "/scenes/radio.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "Lorry traffic on the bridge was…",
				options: [
					"Normal",
					"Stopped during the morning",
					"Moved to the metro",
					"Only at night"
				],
				answer: 1,
				explain: "O vento cortou o trânsito de camiões durante a manhã."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "In this article, “Câmara” means…",
				options: [
					"A hotel room",
					"City hall",
					"A camera shop",
					"Parliament"
				],
				answer: 1,
				explain: "A Câmara = the municipality."
			},
			{
				id: "q3",
				kind: "truefalse",
				prompt: "Cascais-line trains ran on time.",
				options: ["True", "False"],
				answer: 1,
				explain: "Circularam com atraso."
			},
			{
				id: "q4",
				kind: "type",
				prompt: "Type the two-word phrase meaning 'on a whim'.",
				accept: ["à toa", "a toa"],
				explain: "À toa."
			}
		]
	},
	{
		id: "read-cronica",
		level: "B1",
		minutes: 12,
		kind: "page",
		source: "A newspaper crónica (original)",
		title: "The hour of the bica",
		titlePt: "A hora da bica",
		paragraphs: [{
			pt: "Há uma hora em que a cidade baixa a voz. Não é a noite. É o intervalo entre o correio e o almoço, quando a bica chega pequena e o copo de água vem sem se pedir.",
			en: "There is an hour when the city lowers its voice. It is not night. It is the gap between the post and lunch, when the espresso arrives small and the glass of water comes without being asked for."
		}, {
			pt: "Ninguém fala alto. Fala-se do tempo, de um primo no Canadá, de um eléctrico que não veio. É conversa que não precisa de destino.",
			en: "Nobody speaks loudly. People talk about the weather, a cousin in Canada, a tram that didn't come. It is conversation that does not need a destination."
		}],
		notes: [{
			pt: "bica",
			en: "a Lisbon espresso — small, short, the point of this app"
		}, {
			pt: "sem se pedir",
			en: "without being asked for"
		}],
		image: "/scenes/cafe.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "The quiet hour is…",
				options: [
					"Midnight",
					"Between post and lunch",
					"Sunday mass",
					"Rush hour"
				],
				answer: 1,
				explain: "O intervalo entre o correio e o almoço."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "The water glass…",
				options: [
					"Must be ordered",
					"Comes unasked",
					"Costs extra",
					"Is never served"
				],
				answer: 1,
				explain: "Vem sem se pedir."
			},
			{
				id: "q3",
				kind: "truefalse",
				prompt: "The talk at the counter needs a clear destination.",
				options: ["True", "False"],
				answer: 1,
				explain: "Conversa que não precisa de destino."
			}
		]
	},
	{
		id: "read-pessoa",
		level: "B2",
		minutes: 12,
		kind: "page",
		source: "A page in the style of a Lisbon notebook (original)",
		title: "Several men, one river",
		titlePt: "O rio",
		paragraphs: [
			{
				pt: "Às vezes sou o homem que espera o eléctrico. Outras, o que já partiu. A cidade permite estas trocas sem pedir documentos.",
				en: "Sometimes I am the man waiting for the tram. Other times, the one who already left. The city allows these swaps without asking for papers."
			},
			{
				pt: "O Tejo não explica nada e, por isso, explica tudo. Olha-se para a água como se fosse uma frase por acabar.",
				en: "The Tagus explains nothing and therefore explains everything. You look at the water as if it were a sentence left unfinished."
			},
			{
				pt: "Se alguém perguntar como estou, digo que estou. É quase verdade.",
				en: "If someone asks how I am, I say that I am. It is almost true."
			}
		],
		notes: [{
			pt: "por acabar",
			en: "unfinished / still to be finished"
		}, {
			pt: "digo que estou",
			en: "I say that I am — a B2 non-answer that still answers"
		}],
		image: "/scenes/books.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "The river “explains everything” because it…",
				options: [
					"Has a tourist map",
					"Explains nothing",
					"Is very wide",
					"Sings"
				],
				answer: 1,
				explain: "Não explica nada e, por isso, explica tudo."
			},
			{
				id: "q2",
				kind: "truefalse",
				prompt: "The speaker gives a full, practical answer to “how are you”.",
				options: ["True", "False"],
				answer: 1,
				explain: "Digo que estou. É quase verdade."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type the river's name in Portuguese.",
				accept: [
					"Tejo",
					"o Tejo",
					"O Tejo"
				],
				explain: "O Tejo."
			}
		]
	},
	{
		id: "read-desacordo",
		level: "B2",
		minutes: 10,
		kind: "page",
		source: "A column, after dinner",
		title: "Leaving the door open",
		titlePt: "A porta",
		paragraphs: [{
			pt: "Discordo, mas não vale a pena fechar a porta. Há uma diferença entre ter razão e precisar de a ter à frente de toda a gente.",
			en: "I disagree, but it isn't worth shutting the door. There is a difference between being right and needing to be right in front of everyone."
		}, {
			pt: "Por um lado, o argumento pesa. Por outro, a mesa ainda tem pão. Fico-me pelo “talvez”. É uma palavra adulta.",
			en: "On the one hand, the argument has weight. On the other, there is still bread on the table. I settle for “maybe”. It is an adult word."
		}],
		notes: [{
			pt: "não vale a pena",
			en: "it's not worth it"
		}, {
			pt: "fico-me pelo",
			en: "I'll settle for / I'll stick with"
		}],
		image: "/scenes/books.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "The writer chooses…",
				options: [
					"To win the table",
					"To shut the door",
					"The word talvez",
					"Silence only"
				],
				answer: 2,
				explain: "Fico-me pelo “talvez”."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Não vale a pena” means…",
				options: [
					"It's cheap",
					"It's not worth it",
					"It's early",
					"It's raining"
				],
				answer: 1,
				explain: "A B2 workhorse."
			},
			{
				id: "q3",
				kind: "truefalse",
				prompt: "The piece treats “talvez” as a weak word.",
				options: ["True", "False"],
				answer: 1,
				explain: "É uma palavra adulta."
			}
		]
	},
	{
		id: "read-cronica-electrico",
		level: "C1",
		minutes: 15,
		kind: "column",
		source: "A Sunday crónica in a Lisbon paper",
		title: "The tram that persists",
		titlePt: "O eléctrico teima",
		paragraphs: [
			{
				pt: "A cidade muda, dizem. Muda sempre. Há um pacote, há um ministro, há quem diga que já não há cidade. À primeira vista, parece o mesmo artigo de sempre. No fundo, ninguém se espanta.",
				en: "The city is changing, they say. It always is. There is a package, a minister, people who say there is no city left. At first glance it looks like the same old piece. Deep down, nobody is surprised."
			},
			{
				pt: "Eu apanho o eléctrico na Graça. O mesmo sítio. O mesmo atraso, se calhar. O motorista conhece as caras e não as nomeia. Teima. É um verbo pouco elegante e, mesmo assim, o mais honesto.",
				en: "I catch the tram in Graça. The same place. The same delay, probably. The driver knows the faces and does not name them. It persists. An inelegant verb, and still the most honest."
			},
			{
				pt: "Por um lado, o argumento pesa: os alugueres, o ruído, a fila para um café que já foi nossa. Por outro, a rua não deixou de ser a rua. Não deixa de ser. Há uma diferença pequena e teimosa entre as duas frases.",
				en: "On the one hand the argument has weight: the rents, the noise, the queue for a café that used to be ours. On the other, the street has not stopped being the street. It remains so. There is a small, stubborn difference between those two sentences."
			},
			{
				pt: "Li ontem que o pacote entra em vigor na segunda, sem mais pormenores. Os pormenores, em Lisboa, chegam no eléctrico. Alguém diz “pois”. Alguém diz “pronto”. Ninguém resolve a cidade. Resolvem a paragem.",
				en: "I read yesterday that the package comes into force on Monday, without further details. In Lisbon the details arrive on the tram. Someone says “right”. Someone says “alright”. Nobody solves the city. They solve the stop."
			},
			{
				pt: "É um lugar-comum, e mesmo assim é verdade: a cidade que dizem que mudou teima no mesmo sítio. Eu também. Desço na minha. O pão, se houver, ainda está quente.",
				en: "It is a commonplace, and still true: the city they say has changed persists in the same place. So do I. I get off at mine. The bread, if there is any, is still warm."
			}
		],
		notes: [
			{
				pt: "teimar",
				en: "to persist — inelegant and honest"
			},
			{
				pt: "não deixa de ser",
				en: "it remains / it is still"
			},
			{
				pt: "sem mais pormenores",
				en: "without further details"
			}
		],
		image: "/scenes/tram.jpg",
		quiz: [
			{
				id: "q1",
				kind: "choice",
				prompt: "The writer’s honest verb for the tram is…",
				options: [
					"voar",
					"teimar",
					"desaparecer",
					"traduzir"
				],
				answer: 1,
				explain: "Teima."
			},
			{
				id: "q2",
				kind: "choice",
				prompt: "“Não deixa de ser” here keeps…",
				options: [
					"The street in the room",
					"A cancellation",
					"A sports result",
					"Silence only"
				],
				answer: 0,
				explain: "It remains the street."
			},
			{
				id: "q3",
				kind: "type",
				prompt: "Type 'deep down' as in the column.",
				accept: ["no fundo"],
				explain: "No fundo."
			},
			{
				id: "q4",
				kind: "truefalse",
				prompt: "The column claims the package will solve Lisbon.",
				options: ["True", "False"],
				answer: 1,
				explain: "Ninguém resolve a cidade. Resolvem a paragem."
			},
			{
				id: "q5",
				kind: "listen",
				prompt: "What is still warm?",
				speak: "Desço na minha. O pão, se houver, ainda está quente.",
				options: [
					"The metro",
					"The bread, if there is any",
					"The minister",
					"The sea"
				],
				answer: 1,
				explain: "O pão, se houver."
			}
		]
	}
];
//#endregion
//#region src/data/scenarios.ts
var speakScenarios = [
	{
		id: "pastelaria",
		level: "A1",
		minutes: 8,
		title: "At the pastelaria",
		titlePt: "Na pastelaria",
		setting: "You are at the counter of a neighbourhood pastelaria in Campo de Ourique, Lisbon. Morning rush. Order a drink and something to eat. Pay. Be brief and polite.",
		partner: "Teresa, behind the bar",
		openerPt: "Bom dia. Então, o que vai ser?",
		openerEn: "Good morning. So, what will it be?",
		goals: [
			"Order a bica or galão",
			"Ask the price",
			"Say para aqui or para levar"
		],
		image: "/scenes/cafe.jpg"
	},
	{
		id: "direcoes",
		level: "A1",
		minutes: 8,
		title: "Lost near the castle",
		titlePt: "Perto do Castelo",
		setting: "You are on a steep Alfama street, looking for tram 28 or the castle entrance. Ask a local. Confirm left, right, walking time.",
		partner: "Sr. António, a neighbour",
		openerPt: "Pois, está perdido? Diga lá.",
		openerEn: "Ah, you're lost? Go on, tell me.",
		goals: [
			"Ask onde fica",
			"Confirm a pé / longe",
			"Thank them"
		],
		image: "/scenes/tram.jpg"
	},
	{
		id: "bilhete",
		level: "A1",
		minutes: 8,
		title: "The ticket desk",
		titlePt: "O bilhete",
		setting: "Cais do Sodré station. You need a train ticket to Cascais, return, for today. Ask about times and price.",
		partner: "Clerk at the window",
		openerPt: "Boa tarde. Em que posso ajudar?",
		openerEn: "Good afternoon. How can I help?",
		goals: [
			"Ask for ida e volta",
			"Confirm the platform",
			"Check the next comboio"
		],
		image: "/scenes/tram.jpg"
	},
	{
		id: "origem",
		level: "A1",
		minutes: 8,
		title: "Where you're from",
		titlePt: "De onde é?",
		setting: "A neighbour in the stairwell has heard you speak German on the phone. They ask where you are from, what you speak, and whether this is your first time in Lisbon. Keep it short.",
		partner: "Dona Lurdes, next door",
		openerPt: "Boa tarde. Desculpe, de onde é o senhor?",
		openerEn: "Good afternoon. Excuse me — where are you from?",
		goals: [
			"Say sou alemão / alemã",
			"Say vivo em…",
			"Say estou a aprender português"
		],
		image: "/scenes/cafe.jpg"
	},
	{
		id: "planos",
		level: "A2",
		minutes: 10,
		title: "Making dinner plans",
		titlePt: "Marcar jantar",
		setting: "You are texting — here, speaking — with a Portuguese friend. Propose dinner tomorrow. Negotiate time. One of you will book.",
		partner: "Inês, a friend",
		openerPt: "Olá! Então, vais ter tempo amanhã à noite?",
		openerEn: "Hi! So, will you have time tomorrow night?",
		goals: [
			"Propose a time with que tal",
			"Accept or suggest another",
			"Close with combinado"
		],
		image: "/scenes/cafe.jpg"
	},
	{
		id: "trabalho-chat",
		level: "A2",
		minutes: 8,
		title: "What you do",
		titlePt: "O trabalho",
		setting: "You are sharing a table at a tasca because the place is full. After the weather, they ask what you do. Answer in one sentence. Ask them back.",
		partner: "Rui, across the paper tablecloth",
		openerPt: "E então, o que faz? Se não é indiscrição.",
		openerEn: "So, what do you do? If it's not too nosy.",
		goals: [
			"Use trabalho em / com",
			"Say estou de férias if true",
			"Ask e o senhor?"
		],
		image: "/scenes/cafe.jpg"
	},
	{
		id: "farmacia",
		level: "A2",
		minutes: 8,
		title: "At the chemist",
		titlePt: "Na farmácia",
		setting: "You have a sore throat and a cough since yesterday, no fever. Describe symptoms. Ask if you need a doctor. Buy something sem receita.",
		partner: "The pharmacist",
		openerPt: "Boa tarde. Diga.",
		openerEn: "Good afternoon. Go ahead.",
		goals: [
			"Use dói-me",
			"Answer há quanto tempo",
			"Ask quanto custa"
		],
		image: "/scenes/cafe.jpg"
	},
	{
		id: "fim-de-semana",
		level: "A2",
		minutes: 10,
		title: "How was the weekend?",
		titlePt: "O fim de semana",
		setting: "Monday at a café with a colleague. They ask about your weekend. Tell a short story in the pretérito. Ask them back.",
		partner: "Rui, a colleague",
		openerPt: "Então, como correu o fim de semana?",
		openerEn: "So, how was the weekend?",
		goals: [
			"Use fui / vi / gostei",
			"Ask a follow-up",
			"Keep it to a few sentences"
		],
		image: "/scenes/cafe.jpg"
	},
	{
		id: "radio-chat",
		level: "B1",
		minutes: 10,
		title: "After the news",
		titlePt: "Depois das notícias",
		setting: "You and a neighbour both heard the morning bulletin: rain this afternoon, roadworks on Liberdade. React, plan your route, complain a little.",
		partner: "Dona Lurdes, your neighbour",
		openerPt: "Ouviu as notícias? Outra vez obras na Liberdade.",
		openerEn: "Did you hear the news? Roadworks on Liberdade again.",
		goals: [
			"Refer to what you heard",
			"Use portanto / pois",
			"Say what you'll do instead"
		],
		image: "/scenes/radio.jpg"
	},
	{
		id: "livro",
		level: "B1",
		minutes: 10,
		title: "In the bookshop",
		titlePt: "Na livraria",
		setting: "A small Lisbon bookshop. You want something not too hard — crónicas, or a novel in clear prose. Ask for a recommendation. Admit your level honestly.",
		partner: "The bookseller",
		openerPt: "Boa tarde. Anda à procura de alguma coisa em especial?",
		openerEn: "Good afternoon. Looking for anything in particular?",
		goals: [
			"Describe your level",
			"Ask for a recommendation",
			"Buy or say you'll think about it"
		],
		image: "/scenes/books.jpg"
	},
	{
		id: "habitacao",
		level: "B2",
		minutes: 12,
		title: "Over dinner: the city",
		titlePt: "À mesa",
		setting: "A dinner in Arroios. The table is talking about tourism and housing in Lisbon. Take a nuanced position. Concede. Disagree in part. Don't lecture.",
		partner: "A friend of a friend, Joana",
		openerPt: "E tu, o que achas? Esta cidade ainda é para quem cá vive?",
		openerEn: "And you, what do you think? Is this city still for the people who live here?",
		goals: [
			"Use por um lado / por outro",
			"Hedge with diria que",
			"Leave the door open"
		],
		image: "/scenes/tram.jpg"
	},
	{
		id: "saudade-talk",
		level: "B2",
		minutes: 10,
		title: "Missing home, a little less",
		titlePt: "Saudades",
		setting: "A balcony at dusk after a month in Portugal. A host asks how you really are. Be precise about feeling. Not a postcard.",
		partner: "Miguel, your host",
		openerPt: "Já te sentes à-vontade, ou ainda tens saudades de casa?",
		openerEn: "Do you feel at ease yet, or do you still miss home?",
		goals: [
			"Use ter saudades de",
			"Qualify with já menos",
			"Ask them something back"
		],
		image: "/scenes/radio.jpg"
	},
	{
		id: "mesa-serio",
		level: "C1",
		minutes: 12,
		title: "The table, in earnest",
		titlePt: "A mesa, a sério",
		setting: "Dinner in Arroios. Housing again. Concede what is true. Keep a piece. Do not lecture. Leave with the bread still warm.",
		partner: "Joana, a friend of a friend",
		openerPt: "Esta cidade já não é para quem cá vive. Ponto. Ou ainda achas que não?",
		openerEn: "This city is no longer for the people who live here. Full stop. Or do you still think otherwise?",
		goals: [
			"Use ainda que + subjunctive",
			"Quote without owning: há quem diga",
			"Land with podemos ficar por aqui"
		],
		image: "/scenes/tram.jpg"
	}
];
//#endregion
//#region src/data/curriculum.ts
var cefrRank = {
	A1: 0,
	A2: 1,
	B1: 2,
	B2: 3,
	C1: 4
};
var levels = [
	{
		id: "A1",
		title: "Survive the counter",
		blurb: "Greet, order, count, and ask where you are. The first week in Portugal."
	},
	{
		id: "A2",
		title: "Hold a small talk",
		blurb: "Weather, yesterday, plans, the chemist, the market — conversations that last two minutes."
	},
	{
		id: "B1",
		title: "Follow the country",
		blurb: "Stories with two pasts, a news paragraph, the radio, a page of a book, a first subjunctive."
	},
	{
		id: "B2",
		title: "Stay in the room",
		blurb: "Feeling, literature, disagreement, and the queue that turns into a chat."
	},
	{
		id: "C1",
		title: "The country at speed",
		blurb: "A bulletin without the glossary, a column, an argument you don't leave."
	}
];
var units = [
	{
		id: "a1-first",
		level: "A1",
		title: "First words",
		titlePt: "Primeiras palavras",
		blurb: "Hello, names, numbers, people.",
		image: "/scenes/cafe.jpg"
	},
	{
		id: "a1-city",
		level: "A1",
		title: "In the city",
		titlePt: "Na cidade",
		blurb: "Coffee, streets, time, tickets, a table.",
		image: "/scenes/tram.jpg"
	},
	{
		id: "a2-talk",
		level: "A2",
		title: "Daily talk",
		titlePt: "Conversas do dia",
		blurb: "Weather, the past, opinions.",
		image: "/scenes/cafe.jpg"
	},
	{
		id: "a2-life",
		level: "A2",
		title: "Out in life",
		titlePt: "Ir à vida",
		blurb: "Plans, health, shopping.",
		image: "/scenes/tram.jpg"
	},
	{
		id: "b1-listen-read",
		level: "B1",
		title: "Listen & read",
		titlePt: "Ouvir e ler",
		blurb: "Stories, news, radio, books.",
		image: "/scenes/radio.jpg"
	},
	{
		id: "b1-nuance",
		level: "B1",
		title: "Nuance",
		titlePt: "Matizes",
		blurb: "Hope, doubt, the subjunctive.",
		image: "/scenes/books.jpg"
	},
	{
		id: "b2-fluent",
		level: "B2",
		title: "Fluency",
		titlePt: "Fluência",
		blurb: "Feeling, pages, argument, the street.",
		image: "/scenes/books.jpg"
	},
	{
		id: "c1-speed",
		level: "C1",
		title: "At speed",
		titlePt: "Em velocidade",
		blurb: "Radio, a column, the table that turns political.",
		image: "/scenes/radio.jpg"
	}
];
var lessons = [
	...a1Lessons,
	...a2Lessons,
	...b1Lessons,
	...b2Lessons,
	...c1Lessons
];
function catalogVocab() {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const lesson of lessons) for (const section of lesson.sections) {
		if (section.type !== "vocab") continue;
		for (const item of section.items) {
			const id = `${lesson.id}:${normalizePt(item.pt)}`;
			if (seen.has(id)) continue;
			seen.add(id);
			out.push({
				...item,
				id,
				lessonId: lesson.id,
				level: lesson.level
			});
		}
	}
	return out;
}
function vocabFromCompleted(completedIds) {
	const done = new Set(completedIds);
	return catalogVocab().filter((item) => done.has(item.lessonId));
}
function dueVocab(completedIds, cards, today, level) {
	return vocabFromCompleted(completedIds).filter((item) => {
		if (level && item.level !== level) return false;
		return isDue(cards[item.id], today);
	});
}
function getLesson(id) {
	return lessons.find((l) => l.id === id);
}
function getBulletin(id) {
	return radioBulletins.find((b) => b.id === id);
}
function getReading(id) {
	return readingPieces.find((p) => p.id === id);
}
function getGrammar(id) {
	return grammarDrills.find((d) => d.id === id);
}
function nextLesson(id) {
	const i = lessons.findIndex((l) => l.id === id);
	if (i < 0 || i === lessons.length - 1) return void 0;
	return lessons[i + 1];
}
function firstIncomplete(completedIds, floor = "A1") {
	const min = cefrRank[floor];
	const pool = lessons.filter((l) => cefrRank[l.level] >= min);
	return pool.find((l) => !completedIds.has(l.id)) ?? pool[pool.length - 1] ?? lessons[lessons.length - 1];
}
function workingLevel(completedIds, floor = "A1") {
	if (completedIds.size === 0) return floor;
	const est = estimatedLevel(completedIds);
	return cefrRank[est] >= cefrRank[floor] ? est : floor;
}
function firstIncompleteOf(items, completedIds, prefer) {
	if (prefer) {
		const inLevel = items.find((i) => i.level === prefer && !completedIds.has(i.id));
		if (inLevel) return inLevel;
	}
	return items.find((i) => !completedIds.has(i.id)) ?? items[items.length - 1];
}
function estimatedLevel(completedIds) {
	return [...levels].reverse().find((lv) => {
		const inLevel = lessons.filter((l) => l.level === lv.id);
		return inLevel.filter((l) => completedIds.has(l.id)).length >= Math.ceil(inLevel.length * .5);
	})?.id ?? "A1";
}
lessons.reduce((n, l) => n + l.minutes, 0);
//#endregion
//#region src/components/start-level.tsx
function StartLevelPicker({ label = "Start from" }) {
	const floor = useProgress((s) => s.floor);
	const setFloor = useProgress((s) => s.setFloor);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs font-medium uppercase tracking-wider text-muted",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-2 flex flex-wrap gap-2",
		children: levels.map((lv) => {
			const on = floor === lv.id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setFloor(lv.id),
				className: cn("min-h-11 rounded-[var(--radius-md)] px-4 text-sm font-medium transition-colors duration-[var(--motion-quick)]", on ? "bg-accent text-accent-fg" : "bg-surface text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"),
				children: lv.id
			}, lv.id);
		})
	})] });
}
//#endregion
//#region src/components/ui/button.tsx
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-[color,background-color,box-shadow,transform,opacity] duration-[var(--motion-quick)] ease-[var(--ease-out)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:bg-tile",
			secondary: "bg-surface-2 text-fg hover:bg-border",
			outline: "bg-surface text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			ghost: "text-fg hover:bg-surface-2",
			success: "bg-success text-success-fg hover:opacity-90",
			danger: "bg-danger text-danger-fg hover:opacity-90"
		},
		size: {
			default: "h-11 min-h-11 px-4",
			sm: "h-9 min-h-9 px-3 text-sm",
			lg: "h-12 min-h-12 px-5 text-base",
			icon: "size-11 min-h-11 min-w-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
//#region src/components/ui/progress.tsx
function Progress({ value = 0, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		value,
		className: cn("relative h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
			className: "h-full bg-accent transition-transform duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)]",
			style: { transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)` }
		})
	});
}
//#endregion
//#region src/lib/tts-server.ts
var inputSchema = object({
	text: string().trim().min(1).max(1500),
	speed: number().min(.7).max(1.5).optional(),
	voice: _enum([
		"eve",
		"leo",
		"luna"
	]).optional()
});
var memory = /* @__PURE__ */ new Map();
var MAX_CACHE = 400;
function keyOf(text, voice, speed) {
	return `${voice}|${speed.toFixed(2)}|${text}`;
}
var synthesizePt = createServerFn({ method: "POST" }).validator((input) => inputSchema.parse(input)).handler(async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "unavailable"
	};
	const voice = data.voice ?? "eve";
	const speed = data.speed ?? .92;
	const key = keyOf(data.text, voice, speed);
	const cached = memory.get(key);
	if (cached) return {
		ok: true,
		audio: cached
	};
	const res = await fetch("https://api.x.ai/v1/tts", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			text: data.text,
			voice_id: voice,
			language: "pt-PT",
			speed,
			text_normalization: true,
			output_format: {
				codec: "mp3",
				sample_rate: 24e3,
				bit_rate: 64e3
			}
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `tts ${res.status}`
	};
	const buf = Buffer.from(await res.arrayBuffer());
	if (buf.byteLength < 80 || buf.byteLength > 9e5) return {
		ok: false,
		error: "bad audio"
	};
	const audio = buf.toString("base64");
	if (memory.size >= MAX_CACHE) {
		const first = memory.keys().next().value;
		if (first) memory.delete(first);
	}
	memory.set(key, audio);
	return {
		ok: true,
		audio
	};
});
//#endregion
//#region src/lib/tts.ts
var voicesReady = false;
var currentAudio = null;
var currentResolve = null;
var urlCache = /* @__PURE__ */ new Map();
function pickPtVoice() {
	if (typeof window === "undefined" || !window.speechSynthesis) return null;
	const voices = window.speechSynthesis.getVoices();
	return voices.find((v) => v.lang === "pt-PT") ?? voices.find((v) => v.lang.toLowerCase().startsWith("pt-pt")) ?? voices.find((v) => v.lang.toLowerCase().startsWith("pt")) ?? null;
}
function warmVoices() {
	if (typeof window === "undefined" || !window.speechSynthesis) return;
	const mark = () => {
		voicesReady = true;
	};
	window.speechSynthesis.addEventListener("voiceschanged", mark, { once: true });
	window.speechSynthesis.getVoices();
}
function speakBrowser(text, rate) {
	if (typeof window === "undefined" || !window.speechSynthesis) return;
	window.speechSynthesis.cancel();
	const utter = new SpeechSynthesisUtterance(text);
	utter.lang = "pt-PT";
	utter.rate = rate;
	const voice = pickPtVoice();
	if (voice) utter.voice = voice;
	if (!voicesReady) window.speechSynthesis.getVoices();
	window.speechSynthesis.speak(utter);
}
function playDataUrl(url) {
	stopSpeaking();
	return new Promise((resolve) => {
		const audio = new Audio(url);
		currentAudio = audio;
		currentResolve = resolve;
		const done = () => {
			if (currentAudio === audio) currentAudio = null;
			if (currentResolve === resolve) currentResolve = null;
			resolve();
		};
		audio.addEventListener("ended", done, { once: true });
		audio.addEventListener("error", done, { once: true });
		audio.play().catch(() => done());
	});
}
async function speakPt(text, rate = .88, voice = "eve") {
	const trimmed = text.trim();
	if (!trimmed || typeof window === "undefined") return;
	const speed = Math.min(1.5, Math.max(.7, rate));
	const cacheKey = `${voice}|${speed}|${trimmed}`;
	const hit = urlCache.get(cacheKey);
	if (hit) {
		await playDataUrl(hit);
		return;
	}
	try {
		const res = await synthesizePt({ data: {
			text: trimmed.slice(0, 1500),
			speed,
			voice
		} });
		if (res.ok) {
			const url = `data:audio/mpeg;base64,${res.audio}`;
			if (urlCache.size > 200) {
				const first = urlCache.keys().next().value;
				if (first) urlCache.delete(first);
			}
			urlCache.set(cacheKey, url);
			await playDataUrl(url);
			return;
		}
	} catch {}
	speakBrowser(trimmed, rate);
}
function stopSpeaking() {
	if (typeof window === "undefined") return;
	if (window.speechSynthesis) window.speechSynthesis.cancel();
	if (currentAudio) {
		currentAudio.pause();
		currentAudio.src = "";
		currentAudio = null;
	}
	if (currentResolve) {
		const r = currentResolve;
		currentResolve = null;
		r();
	}
}
//#endregion
//#region src/routes/index.tsx
var Route$15 = createFileRoute("/")({ component: Home });
function Home() {
	const completed = useProgress((s) => s.completed);
	const xp = useProgress((s) => s.xp);
	const streak = useProgress((s) => s.streak);
	const floor = useProgress((s) => s.floor);
	const cards = useProgress((s) => s.cards);
	const [hour, setHour] = (0, import_react.useState)(9);
	(0, import_react.useEffect)(() => {
		setHour((/* @__PURE__ */ new Date()).getHours());
		warmVoices();
	}, []);
	const greet = greetingForHour(hour);
	const doneIds = (0, import_react.useMemo)(() => new Set(Object.keys(completed)), [completed]);
	const next = firstIncomplete(doneIds, floor);
	const level = workingLevel(doneIds, floor);
	const nextRadio = firstIncompleteOf(radioBulletins, doneIds, level);
	const nextRead = firstIncompleteOf(readingPieces, doneIds, level);
	const nextGram = firstIncompleteOf(grammarDrills, doneIds, level);
	const dueCount = dueVocab(Object.keys(completed), cards, todayKey()).length;
	const doneCount = lessons.filter((l) => doneIds.has(l.id)).length;
	const pct = Math.round(doneCount / lessons.length * 100);
	const todayDone = Object.values(completed).some((r) => {
		const d = new Date(r.completedAt);
		const now = /* @__PURE__ */ new Date();
		return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium tracking-wide text-accent",
			children: greet.pt
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 font-display text-3xl font-medium tracking-tight",
			children: "Portuguese in sips."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-prose text-muted",
			children: "European Portuguese, under twenty minutes. Built for the gap between meetings — then the café, the book, the radio."
		}),
		doneCount === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartLevelPicker, { label: "I am starting at" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-subtle",
				children: "Jump the early units if you already greet and order. The path stays open."
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 overflow-hidden rounded-[var(--radius-xl)] bg-surface shadow-[var(--shadow-border)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: next.image,
				alt: "",
				className: "scene h-44 w-full object-cover"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-medium uppercase tracking-wider text-muted",
						children: [
							todayDone ? "Done for today — or one more" : "Continue",
							" · ",
							next.level,
							" ·",
							" ",
							next.minutes,
							" min"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-2xl font-medium",
						children: next.titlePt
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-muted",
						children: next.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: next.summary
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "mt-4 w-full sm:w-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/lesson/$id",
							params: { id: next.id },
							children: [doneIds.has(next.id) ? "Revise" : "Start lesson", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
						})
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-5 grid grid-cols-3 gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Streak",
					value: `${streak}`,
					hint: "days"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Lessons",
					value: `${doneCount}`,
					hint: `of ${lessons.length}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "XP",
					value: `${xp}`,
					hint: "quiet points"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1.5 flex justify-between text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Path" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "tabular-nums",
					children: [pct, "%"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: pct })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/review",
			className: "mt-5 flex items-start gap-3 rounded-[var(--radius-lg)] bg-surface p-4 no-underline shadow-[var(--shadow-border)] transition-shadow duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "mt-0.5 size-5 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block text-xs font-medium uppercase tracking-wider text-accent",
						children: ["Palavras", dueCount > 0 ? ` · ${dueCount} due` : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block font-medium text-fg",
						children: dueCount > 0 ? "Words waiting" : "Caught up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm text-muted",
						children: dueCount > 0 ? "Flip, listen, type. Three minutes, then back to the path." : "Finish a lesson and new words join the pile."
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8 grid gap-3 sm:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/listen/$id",
					params: { id: nextRadio.id },
					className: "flex items-start gap-3 rounded-[var(--radius-lg)] bg-accent p-4 text-accent-fg no-underline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headphones, { className: "mt-0.5 size-5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium",
						children: "Listen"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-1 block text-sm text-accent-fg/80",
						children: [
							nextRadio.station,
							" · ",
							nextRadio.titlePt
						]
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/read/$id",
					params: { id: nextRead.id },
					className: "flex items-start gap-3 rounded-[var(--radius-lg)] bg-surface p-4 no-underline shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "mt-0.5 size-5 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium text-fg",
						children: "Read"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm text-muted",
						children: nextRead.titlePt
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/speak",
					className: "flex items-start gap-3 rounded-[var(--radius-lg)] bg-surface p-4 no-underline shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "mt-0.5 size-5 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium text-fg",
						children: "Speak"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm text-muted",
						children: "A short scene"
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/grammar",
					className: "flex items-start gap-3 rounded-[var(--radius-lg)] bg-surface p-4 no-underline shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "mt-0.5 size-5 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium text-fg",
						children: "Grammar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-1 block text-sm text-muted",
						children: [
							nextGram.level,
							" · ",
							nextGram.titlePt
						]
					})] })]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium",
				children: "Levels"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-3",
				children: levels.map((lv) => {
					const inLevel = lessons.filter((l) => l.level === lv.id);
					const done = inLevel.filter((l) => doneIds.has(l.id)).length;
					const grams = grammarDrills.filter((d) => d.level === lv.id);
					const gDone = grams.filter((d) => doneIds.has(d.id)).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/path",
						className: "flex items-start gap-4 rounded-[var(--radius-lg)] bg-surface p-4 no-underline shadow-[var(--shadow-border)] transition-shadow duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-soft font-display text-sm font-semibold text-accent",
							children: lv.id
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-medium text-fg",
									children: lv.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block text-sm text-muted",
									children: lv.blurb
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-2 block text-xs tabular-nums text-subtle",
									children: [
										done,
										"/",
										inLevel.length,
										" lessons · ",
										gDone,
										"/",
										grams.length,
										" ",
										"grammar"
									]
								})
							]
						})]
					}) }, lv.id);
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-8 flex items-center gap-2 text-sm text-subtle",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-4" }),
				lessons.length,
				" lessons · ",
				grammarDrills.length,
				" grammar drills · none over 18 minutes"
			]
		})
	] });
}
function Stat({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[var(--radius-lg)] bg-surface px-3 py-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wider text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-display text-2xl font-medium tabular-nums leading-none",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-subtle",
				children: hint
			})
		]
	});
}
//#endregion
//#region src/routes/grammar.tsx
var Route$14 = createFileRoute("/grammar")({ component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
//#endregion
//#region src/routes/login.tsx
var Route$13 = createFileRoute("/login")({ component: Login });
function Login() {
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "azulejo-band h-2 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid min-h-[calc(100dvh-8px)] max-w-md content-center px-6 py-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "mb-8 flex items-center gap-2 font-display text-2xl font-medium text-fg no-underline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AzulejoMark, { className: "size-9" }), "Bica"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight",
					children: "Keep your streak."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-muted",
					children: "Sign in to save progress, sync across devices, and practise speaking with a Lisbon conversation partner."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 space-y-3",
					children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						className: "h-12 w-full",
						disabled: busy !== null,
						onClick: () => {
							setError(null);
							setBusy(p.providerId);
							signIn(p.providerId, { callbackURL: "/" }).catch((err) => {
								setBusy(null);
								setError(err instanceof Error ? err.message : "Sign-in failed. Try again.");
							});
						},
						children: busy === p.providerId ? "Opening…" : `Continue with ${p.label}`
					}, p.providerId))
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-danger",
					role: "alert",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm text-subtle",
					children: "Lessons work without an account. Progress stays on this device until you sign in."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-4 inline-block text-sm font-medium text-accent no-underline hover:underline",
					children: "Continue as guest"
				})
			]
		})]
	});
}
//#endregion
//#region src/components/speak-button.tsx
function SpeakButton({ text, rate = .88, voice = "eve", label = "Play pronunciation", className }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "ghost",
		size: "icon",
		"aria-label": label,
		disabled: busy,
		className: cn("text-accent hover:bg-soft", className),
		onClick: (e) => {
			e.stopPropagation();
			setBusy(true);
			speakPt(text, rate, voice).finally(() => setBusy(false));
		},
		children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {})
	});
}
//#endregion
//#region src/routes/me.tsx
var Route$12 = createFileRoute("/me")({ component: MePage });
function MePage() {
	const { user, isPending } = useCurrentUserState();
	const completed = useProgress((s) => s.completed);
	const xp = useProgress((s) => s.xp);
	const streak = useProgress((s) => s.streak);
	const floor = useProgress((s) => s.floor);
	const doneIds = Object.keys(completed);
	const doneSet = new Set(doneIds);
	const lessonDone = lessons.filter((l) => doneSet.has(l.id)).length;
	const vocab = vocabFromCompleted(doneIds).slice(0, 24);
	const estimated = workingLevel(doneSet, floor);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-medium tracking-tight",
			children: "You"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "A quiet record. No leagues. Show up, sip, leave."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-6 rounded-[var(--radius-xl)] bg-surface p-5 shadow-[var(--shadow-border)]",
			children: isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-40 animate-pulse rounded bg-surface-2" }) : user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: user.displayName ?? "Signed in"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: user.primaryEmail
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => void signOut(),
					children: "Sign out"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: "Learning as a guest"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Sign in to keep the streak if you switch phones, and to speak with a live partner."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						children: "Sign in"
					})
				})
			] })
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4 grid grid-cols-3 gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-[var(--radius-lg)] bg-surface p-3 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Streak"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl tabular-nums",
						children: streak
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-[var(--radius-lg)] bg-surface p-3 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Around"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl",
						children: estimated
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-[var(--radius-lg)] bg-surface p-3 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "XP"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl tabular-nums",
						children: xp
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-sm text-subtle",
			children: [lessonDone, " lessons on the path. Review lives under Practice."]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartLevelPicker, { label: "Treat me as" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-subtle",
				children: "Today will offer the next unfinished lesson from this level up."
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium",
					children: "Phrasebook"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Words from lessons you have finished. Tap the speaker."
				})] }), vocab.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/review",
						children: "Palavras"
					})
				})]
			}), vocab.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-subtle",
				children: "Finish a lesson to fill this page."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 divide-y divide-border rounded-[var(--radius-lg)] bg-surface shadow-[var(--shadow-border)]",
				children: vocab.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-medium",
							children: item.pt
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm text-muted",
							children: item.en
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, { text: item.pt })]
				}, item.id))
			})]
		})
	] });
}
//#endregion
//#region src/routes/path.tsx
var Route$11 = createFileRoute("/path")({ component: PathPage });
function PathPage() {
	const completed = useProgress((s) => s.completed);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-medium tracking-tight",
			children: "The path"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "A1 through C1, in European Portuguese. Jump in anywhere — adults skip what they already know. After each level, grammar drills to lock the pattern."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 space-y-12",
			children: levels.map((lv) => {
				const levelUnits = units.filter((u) => u.level === lv.id);
				const drills = grammarDrills.filter((d) => d.level === lv.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wider text-accent",
						children: lv.id
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-medium",
						children: lv.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: lv.blurb
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 space-y-8",
						children: [levelUnits.map((unit) => {
							const unitLessons = lessons.filter((l) => l.unitId === unit.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium uppercase tracking-wider text-muted",
										children: unit.titlePt
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display text-xl font-medium",
										children: unit.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted",
										children: unit.blurb
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "grid gap-2",
								children: unitLessons.map((lesson) => {
									const done = Boolean(completed[lesson.id]);
									const score = completed[lesson.id];
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/lesson/$id",
										params: { id: lesson.id },
										className: "flex items-center gap-3 rounded-[var(--radius-lg)] bg-surface p-3 no-underline shadow-[var(--shadow-border)] transition-shadow duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]", done ? "bg-success text-success-fg" : "bg-soft text-accent"),
											children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-4" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "block truncate font-medium text-fg",
												children: [lesson.titlePt, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "ml-2 font-sans text-sm font-normal text-muted",
													children: lesson.title.includes("—") ? lesson.title.split("—").slice(1).join("—").trim() : lesson.title
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mt-0.5 block text-xs text-subtle",
												children: [
													lesson.minutes,
													" min",
													score ? ` · ${score.quizScore}/${score.quizTotal} on the quiz` : ""
												]
											})]
										})]
									}) }, lesson.id);
								})
							})] }, unit.id);
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							id: `grammar-${lv.id}`,
							className: "scroll-mt-20 min-w-0 rounded-[var(--radius-xl)] bg-soft p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3 flex flex-col gap-2 px-1 sm:flex-row sm:items-end sm:justify-between sm:gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs font-medium uppercase tracking-wider text-accent",
											children: [
												lv.id,
												" · Gramática · ",
												drills.length,
												" drills"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-display text-xl font-medium",
											children: "Grammar"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted",
											children: "Patterns from this level. A rule, three lines, a quiz."
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/grammar",
									className: "shrink-0 text-sm font-medium text-accent no-underline hover:underline",
									children: "All levels"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "grid min-w-0 gap-2",
								children: drills.map((drill) => {
									const score = completed[drill.id];
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: "min-w-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/grammar/$id",
											params: { id: drill.id },
											className: "flex min-w-0 items-center gap-3 rounded-[var(--radius-md)] bg-surface p-3 no-underline shadow-[var(--shadow-border)] transition-shadow duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: cn("grid size-10 shrink-0 place-items-center rounded-[var(--radius-sm)]", score ? "bg-success text-success-fg" : "bg-accent text-accent-fg"),
												children: score ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "size-4" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "min-w-0 flex-1 overflow-hidden",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "block truncate font-medium text-fg",
													children: [drill.titlePt, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "ml-2 hidden font-sans text-sm font-normal text-muted sm:inline",
														children: drill.title
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "mt-0.5 block truncate text-xs text-subtle",
													children: [
														drill.minutes,
														" min · ",
														drill.focus,
														score ? ` · ${score.quizScore}/${score.quizTotal} on the quiz` : ""
													]
												})]
											})]
										})
									}, drill.id);
								})
							})]
						})]
					})
				] }, lv.id);
			})
		})
	] });
}
//#endregion
//#region src/routes/practice.tsx
var Route$10 = createFileRoute("/practice")({ component: PracticePage });
function PracticePage() {
	const completed = useProgress((s) => s.completed);
	const cards = useProgress((s) => s.cards);
	const floor = useProgress((s) => s.floor);
	const doneIds = new Set(Object.keys(completed));
	const level = workingLevel(doneIds, floor);
	const nextRadio = firstIncompleteOf(radioBulletins, doneIds, level);
	const nextRead = firstIncompleteOf(readingPieces, doneIds, level);
	const nextGram = firstIncompleteOf(grammarDrills, doneIds, level);
	const radioDone = radioBulletins.filter((b) => doneIds.has(b.id)).length;
	const readDone = readingPieces.filter((p) => doneIds.has(p.id)).length;
	const gramDone = grammarDrills.filter((d) => doneIds.has(d.id)).length;
	const dueCount = dueVocab(Object.keys(completed), cards, todayKey()).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-medium tracking-tight",
			children: "Practice"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "The path teaches. This page is the country: a bulletin, a page, a café counter, a grammar drill, the words you already met."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "mt-6 grid gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/listen/$id",
					params: { id: nextRadio.id },
					className: "block overflow-hidden rounded-[var(--radius-lg)] bg-surface no-underline shadow-[var(--shadow-border)] transition-shadow duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/scenes/radio.jpg",
							alt: "",
							className: "scene hidden h-32 w-28 shrink-0 object-cover sm:block"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-1 items-start gap-3 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headphones, { className: "mt-0.5 size-5 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs font-medium uppercase tracking-wider text-accent",
										children: [
											"Listen · ",
											radioDone,
											"/",
											radioBulletins.length
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-1 font-display text-xl font-medium",
										children: "Rádio"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-muted",
										children: [
											nextRadio.station,
											": ",
											nextRadio.titlePt,
											". Under ",
											nextRadio.minutes,
											" ",
											"minutes."
										]
									})
								]
							})]
						})]
					})
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/read/$id",
					params: { id: nextRead.id },
					className: "block overflow-hidden rounded-[var(--radius-lg)] bg-surface no-underline shadow-[var(--shadow-border)] transition-shadow duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/scenes/books.jpg",
							alt: "",
							className: "scene hidden h-32 w-28 shrink-0 object-cover sm:block"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-1 items-start gap-3 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "mt-0.5 size-5 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs font-medium uppercase tracking-wider text-accent",
										children: [
											"Read · ",
											readDone,
											"/",
											readingPieces.length
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-1 font-display text-xl font-medium",
										children: "Uma página"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-muted",
										children: [
											nextRead.titlePt,
											" — ",
											nextRead.source,
											"."
										]
									})
								]
							})]
						})]
					})
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/grammar",
					className: "flex items-start gap-3 rounded-[var(--radius-lg)] bg-surface p-4 no-underline shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "mt-0.5 size-5 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-xs font-medium uppercase tracking-wider text-accent",
							children: [
								"Grammar · ",
								gramDone,
								"/",
								grammarDrills.length
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block font-display text-xl font-medium text-fg",
							children: "Gramática"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 block text-sm text-muted",
							children: [
								nextGram.level,
								": ",
								nextGram.titlePt,
								". Three drills on every level, ",
								nextGram.minutes,
								" min each."
							]
						})
					] })]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/speak",
					className: "flex items-start gap-3 rounded-[var(--radius-lg)] bg-accent p-4 text-accent-fg no-underline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "mt-0.5 size-5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-xs font-medium uppercase tracking-wider text-accent-fg/70",
							children: [
								"Speak · ",
								speakScenarios.length,
								" scenes"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block font-display text-xl font-medium",
							children: "Conversas"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-sm text-accent-fg/80",
							children: "Café, tickets, disagreement — a Lisbon partner."
						})
					] })]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/review",
					className: "flex items-start gap-3 rounded-[var(--radius-lg)] bg-surface p-4 no-underline shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "mt-0.5 size-5 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-xs font-medium uppercase tracking-wider text-accent",
							children: ["Review", dueCount > 0 ? ` · ${dueCount} due` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block font-display text-xl font-medium text-fg",
							children: "Palavras"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-sm text-muted",
							children: dueCount > 0 ? "Flip, listen, type. Due today, then tomorrow, a week, a month." : "Finish a lesson and new words join the pile."
						})
					] })]
				}) })
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium",
				children: "Bulletins"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-2",
				children: radioBulletins.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/listen/$id",
					params: { id: b.id },
					className: "flex items-center gap-3 rounded-[var(--radius-md)] bg-surface px-3 py-3 no-underline shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)]", doneIds.has(b.id) ? "bg-success text-success-fg" : "bg-soft text-accent"),
						children: doneIds.has(b.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headphones, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate font-medium text-fg",
							children: b.titlePt
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-xs text-subtle",
							children: [
								b.level,
								" · ",
								b.station,
								" · ",
								b.minutes,
								" min"
							]
						})]
					})]
				}) }, b.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium",
				children: "Pages"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-2",
				children: readingPieces.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/read/$id",
					params: { id: p.id },
					className: "flex items-center gap-3 rounded-[var(--radius-md)] bg-surface px-3 py-3 no-underline shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)]", doneIds.has(p.id) ? "bg-success text-success-fg" : "bg-soft text-accent"),
						children: doneIds.has(p.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate font-medium text-fg",
							children: p.titlePt
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-xs text-subtle",
							children: [
								p.level,
								" · ",
								p.minutes,
								" min"
							]
						})]
					})]
				}) }, p.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium",
				children: "Grammar by level"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 space-y-6",
				children: levels.map((lv) => {
					const drills = grammarDrills.filter((d) => d.level === lv.id);
					const done = drills.filter((d) => doneIds.has(d.id)).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-2 text-xs font-medium uppercase tracking-wider text-accent",
						children: [
							lv.id,
							" · ",
							done,
							"/",
							drills.length
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid min-w-0 gap-2",
						children: drills.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "min-w-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/grammar/$id",
								params: { id: d.id },
								className: "flex min-w-0 w-full items-center gap-3 rounded-[var(--radius-md)] bg-surface px-3 py-3 no-underline shadow-[var(--shadow-border)]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)]", doneIds.has(d.id) ? "bg-success text-success-fg" : "bg-soft text-accent"),
									children: doneIds.has(d.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "size-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1 overflow-hidden",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate font-medium text-fg",
										children: d.titlePt
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block truncate text-xs text-subtle",
										children: [
											d.minutes,
											" min · ",
											d.focus
										]
									})]
								})]
							})
						}, d.id))
					})] }, lv.id);
				})
			})]
		})
	] });
}
//#endregion
//#region src/routes/review.tsx
var Route$9 = createFileRoute("/review")({ component: ReviewPage });
function shuffle(items) {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}
function acceptFor(pt) {
	const list = [pt];
	const stripped = pt.replace(/^(o|a|os|as|um|uma)\s+/i, "");
	if (stripped !== pt) list.push(stripped);
	return list;
}
function buildQueue(items, mode) {
	return shuffle(items).slice(0, 12).map((item, i) => ({
		...item,
		kind: mode === "type" ? "type" : mode === "flip" ? "flip" : i % 2 === 0 ? "flip" : "type",
		seen: 0
	}));
}
function ReviewPage() {
	const user = useCurrentUser();
	const completed = useProgress((s) => s.completed);
	const cards = useProgress((s) => s.cards);
	const gradeVocab = useProgress((s) => s.gradeVocab);
	const touchStudy = useProgress((s) => s.touchStudy);
	const today = todayKey();
	const doneIds = (0, import_react.useMemo)(() => Object.keys(completed), [completed]);
	const pool = (0, import_react.useMemo)(() => vocabFromCompleted(doneIds), [doneIds]);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const due = (0, import_react.useMemo)(() => dueVocab(doneIds, cards, today, filter === "all" ? void 0 : filter), [
		doneIds,
		cards,
		today,
		filter
	]);
	const dueAll = (0, import_react.useMemo)(() => dueVocab(doneIds, cards, today), [
		doneIds,
		cards,
		today
	]);
	const [phase, setPhase] = (0, import_react.useState)("hub");
	const [queue, setQueue] = (0, import_react.useState)([]);
	const [index, setIndex] = (0, import_react.useState)(0);
	const [flipped, setFlipped] = (0, import_react.useState)(false);
	const [typed, setTyped] = (0, import_react.useState)("");
	const [typedChecked, setTypedChecked] = (0, import_react.useState)(false);
	const [known, setKnown] = (0, import_react.useState)(0);
	const card = queue[index];
	const totalPlanned = Math.min(due.length, 12);
	const levelsWithVocab = levels.filter((lv) => pool.some((item) => item.level === lv.id));
	function start(mode) {
		const next = buildQueue(due, mode);
		if (next.length === 0) return;
		setQueue(next);
		setIndex(0);
		setFlipped(false);
		setTyped("");
		setTypedChecked(false);
		setKnown(0);
		setPhase("session");
	}
	function finishSession(knewCount) {
		touchStudy(4 + knewCount);
		setPhase("done");
		if (user) saveProgressSnapshot({ data: useProgress.getState().snapshot() }).catch(() => void 0);
	}
	function advance(knew, current) {
		gradeVocab(current.id, knew);
		const nextKnown = knew ? known + 1 : known;
		if (knew) setKnown(nextKnown);
		let nextQueue = queue;
		if (!knew && current.seen < 1) {
			nextQueue = [...queue, {
				...current,
				seen: current.seen + 1
			}];
			setQueue(nextQueue);
		}
		if (index >= nextQueue.length - 1) {
			finishSession(nextKnown);
			return;
		}
		setIndex((n) => n + 1);
		setFlipped(false);
		setTyped("");
		setTypedChecked(false);
	}
	(0, import_react.useEffect)(() => {
		if (phase !== "session" || !card || card.kind !== "flip" || flipped) return;
		speakPt(card.pt, .88, "eve");
	}, [
		phase,
		card?.id,
		card?.kind,
		flipped
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-medium tracking-tight",
			children: "Palavras"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "Words from lessons you finished. Due today come back. New ones join the pile. Flip, or type the Portuguese."
		}),
		pool.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 rounded-[var(--radius-lg)] bg-surface p-5 shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: "Nothing to review yet."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Finish a lesson on the path first."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/path",
						children: "Open the path"
					})
				})
			]
		}) : phase === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-medium",
					children: "Boa."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-muted",
					children: [known, " felt ready. Again waits until later today or tomorrow — then three days, a week, a month."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							children: "Today"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: () => setPhase("hub"),
						children: "Palavras"
					})]
				})
			]
		}) : phase === "session" && card ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionCard, {
			card,
			position: index + 1,
			remaining: queue.length,
			flipped,
			typed,
			typedChecked,
			onFlip: () => setFlipped((v) => !v),
			onTyped: setTyped,
			onCheck: () => setTypedChecked(true),
			onGrade: (knew) => advance(knew, card)
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs font-medium uppercase tracking-wider text-accent",
					children: ["Due today · ", dueAll.length]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: totalPlanned > 0 ? `A sip of ${Math.min(due.length, 12)} from this pile.` : "Caught up in this pile. Switch level, or come back tomorrow."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
						label: "Today",
						on: filter === "all",
						count: dueAll.length,
						onClick: () => setFilter("all")
					}), levelsWithVocab.map((lv) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
						label: lv.id,
						on: filter === lv.id,
						count: dueVocab(doneIds, cards, today, lv.id).length,
						onClick: () => setFilter(lv.id)
					}, lv.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2 sm:flex-row",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: due.length === 0,
							onClick: () => start("mix"),
							children: "Start · mix"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							disabled: due.length === 0,
							onClick: () => start("flip"),
							children: "Listen and flip"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							disabled: due.length === 0,
							onClick: () => start("type"),
							children: "Type Portuguese"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-subtle",
					children: "Mix plays Portuguese first, then asks you to type it. Honest taps schedule tomorrow, three days, a week."
				})
			]
		})
	] });
}
function FilterChip({ label, on, count, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("min-h-11 rounded-[var(--radius-md)] px-4 text-sm font-medium transition-colors duration-[var(--motion-quick)]", on ? "bg-accent text-accent-fg" : "bg-surface text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"),
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("ml-2 tabular-nums", on ? "text-accent-fg/70" : "text-subtle"),
			children: count
		})]
	});
}
function SessionCard({ card, position, remaining, flipped, typed, typedChecked, onFlip, onTyped, onCheck, onGrade }) {
	const typedOk = typedChecked && answersMatch(typed, acceptFor(card.pt));
	const revealed = card.kind === "flip" ? flipped : typedChecked;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs tabular-nums text-subtle",
				children: [
					position,
					" / ",
					remaining,
					" · ",
					card.level
				]
			}),
			card.kind === "flip" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onFlip,
				className: "mt-3 min-h-48 w-full rounded-[var(--radius-xl)] bg-surface p-6 text-left shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl font-medium",
						children: card.pt
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-subtle",
						children: card.hint
					}),
					flipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-lg text-fg",
								children: card.en
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: card.examplePt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-subtle",
								children: card.exampleEn
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-10 text-sm text-subtle",
						children: "Tap to flip"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 min-h-48 rounded-[var(--radius-xl)] bg-surface p-6 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wider text-accent",
						children: "Type the Portuguese"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-2xl font-medium",
						children: card.en
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-5",
						onSubmit: (e) => {
							e.preventDefault();
							if (typed.trim()) onCheck();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "sr-only",
								htmlFor: "palavras-type",
								children: "Portuguese"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "palavras-type",
								value: typed,
								onChange: (e) => onTyped(e.target.value),
								disabled: typedChecked,
								autoCapitalize: "off",
								autoCorrect: "off",
								spellCheck: false,
								placeholder: "Type in Portuguese…",
								className: "h-12 min-h-12 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 text-base text-fg outline-none ring-accent placeholder:text-subtle focus:ring-2"
							}),
							!typedChecked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "mt-3 w-full",
								disabled: !typed.trim(),
								children: "Check"
							})
						]
					}),
					typedChecked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("text-sm font-medium", typedOk ? "text-success" : "text-danger"),
								children: typedOk ? "That's it." : "Not quite."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-medium text-fg",
								children: card.pt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: card.examplePt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-subtle",
								children: card.exampleEn
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, { text: card.examplePt || card.pt }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: !revealed,
						onClick: () => onGrade(false),
						children: "Again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !revealed,
						onClick: () => onGrade(true),
						children: "I know this"
					})]
				})]
			})
		]
	});
}
//#endregion
//#region src/routes/speak.tsx
var Route$8 = createFileRoute("/speak")({ component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
//#endregion
//#region src/routes/grammar/index.tsx
var Route$7 = createFileRoute("/grammar/")({ component: GrammarIndex });
function GrammarIndex() {
	const completed = useProgress((s) => s.completed);
	const doneIds = new Set(Object.keys(completed));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-medium tracking-tight",
			children: "Gramática"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "Drills for each level. A short rule, three examples, then a quiz. Eight to ten minutes — then back to the path. Three on every level, A1 through C1."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 space-y-10",
			children: levels.map((lv) => {
				const drills = grammarDrills.filter((d) => d.level === lv.id);
				const done = drills.filter((d) => doneIds.has(d.id)).length;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-medium uppercase tracking-wider text-accent",
							children: [
								lv.id,
								" · ",
								done,
								"/",
								drills.length,
								" done"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-medium",
							children: lv.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: lv.blurb
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid min-w-0 gap-2",
					children: drills.map((drill) => {
						const score = completed[drill.id];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "min-w-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/grammar/$id",
								params: { id: drill.id },
								className: "flex min-w-0 w-full items-center gap-3 rounded-[var(--radius-lg)] bg-surface p-3 no-underline shadow-[var(--shadow-border)] transition-shadow duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]", score ? "bg-success text-success-fg" : "bg-soft text-accent"),
									children: score ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "size-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1 overflow-hidden",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block truncate font-medium text-fg",
										children: [drill.titlePt, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-2 hidden font-sans text-sm font-normal text-muted sm:inline",
											children: drill.title
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-0.5 block truncate text-xs text-subtle",
										children: [
											drill.minutes,
											" min · ",
											drill.focus,
											score ? ` · ${score.quizScore}/${score.quizTotal} on the quiz` : ""
										]
									})]
								})]
							})
						}, drill.id);
					})
				})] }, lv.id);
			})
		})
	] });
}
//#endregion
//#region src/components/quiz-block.tsx
function QuizBlock({ questions, onFinished, voice = "eve" }) {
	const [index, setIndex] = (0, import_react.useState)(0);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [typed, setTyped] = (0, import_react.useState)("");
	const [typedChecked, setTypedChecked] = (0, import_react.useState)(false);
	const correctRef = (0, import_react.useRef)(0);
	const question = questions[index];
	if (!question) return null;
	const revealed = question.kind === "type" ? typedChecked : picked !== null;
	const ok = question.kind === "type" ? answersMatch(typed, question.accept ?? []) : picked === question.answer;
	function lockChoice(i) {
		if (picked !== null || question.kind === "type") return;
		setPicked(i);
		if (i === question.answer) correctRef.current += 1;
	}
	function lockType() {
		if (typedChecked || !typed.trim()) return;
		const match = answersMatch(typed, question.accept ?? []);
		setTypedChecked(true);
		if (match) correctRef.current += 1;
	}
	function goNext() {
		if (!revealed) return;
		if (index >= questions.length - 1) {
			onFinished(correctRef.current);
			return;
		}
		setIndex((n) => n + 1);
		setPicked(null);
		setTyped("");
		setTypedChecked(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs font-medium uppercase tracking-wider text-accent",
			children: [
				"Quiz · ",
				index + 1,
				" / ",
				questions.length
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-2 font-display text-2xl font-medium",
			children: question.prompt
		}),
		(question.kind === "listen" || question.speak) && question.speak && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "outline",
			className: "mt-3",
			onClick: () => void speakPt(question.speak, .86, voice),
			children: "Play the line"
		}),
		question.kind === "type" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-5",
			onSubmit: (e) => {
				e.preventDefault();
				lockType();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "sr-only",
					htmlFor: "typed-answer",
					children: "Your answer"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "typed-answer",
					value: typed,
					onChange: (e) => setTyped(e.target.value),
					disabled: typedChecked,
					autoCapitalize: "off",
					autoCorrect: "off",
					spellCheck: false,
					placeholder: "Type in Portuguese…",
					className: "h-12 min-h-12 w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 text-base text-fg outline-none ring-accent placeholder:text-subtle focus:ring-2"
				}),
				!typedChecked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "mt-3 w-full",
					disabled: !typed.trim(),
					children: "Check"
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-5 space-y-2",
			children: (question.options ?? []).map((opt, i) => {
				const selected = picked === i;
				const isAnswer = i === question.answer;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => lockChoice(i),
					className: cn("flex min-h-12 w-full items-center rounded-[var(--radius-md)] px-4 py-3 text-left text-sm font-medium shadow-[var(--shadow-border)] transition-colors duration-[var(--motion-quick)]", !revealed && "bg-surface hover:bg-surface-2", revealed && isAnswer && "bg-success text-success-fg", revealed && selected && !isAnswer && "bg-danger text-danger-fg", revealed && !selected && !isAnswer && "bg-surface text-muted"),
					children: opt
				}) }, opt);
			})
		}),
		revealed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("text-sm font-medium", ok ? "text-success" : "text-danger"),
					children: ok ? "That's it." : "Not quite."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: question.explain
				}),
				question.kind === "type" && !ok && (question.accept?.[0] ?? "") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-fg",
					children: ["Expected: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: question.accept[0]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4 w-full",
					onClick: goNext,
					children: index === questions.length - 1 ? "See results" : "Next"
				})
			]
		})
	] });
}
//#endregion
//#region src/lib/record-progress.ts
async function persistCompletion(id, quizScore, quizTotal, signedIn) {
	const xp = 8 + quizScore * 2;
	useProgress.getState().completeLesson(id, {
		quizScore,
		quizTotal,
		xp
	});
	if (!signedIn) return xp;
	try {
		await saveLessonProgress({ data: {
			lessonId: id,
			quizScore,
			quizTotal,
			xp
		} });
		await saveProgressSnapshot({ data: useProgress.getState().snapshot() });
	} catch {}
	return xp;
}
//#endregion
//#region src/components/lesson-player.tsx
function LessonPlayer({ id }) {
	const lesson = getLesson(id);
	if (!lesson) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Lesson not found." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/path",
			className: "text-accent",
			children: "Back to path"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Player, { lesson }, lesson.id);
}
function Player({ lesson }) {
	const steps = (0, import_react.useMemo)(() => [...lesson.sections, { type: "quiz" }], [lesson]);
	const [step, setStep] = (0, import_react.useState)(0);
	const [correctCount, setCorrectCount] = (0, import_react.useState)(0);
	const [done, setDone] = (0, import_react.useState)(false);
	const user = useCurrentUser();
	const totalSteps = steps.length;
	const current = steps[step];
	const pct = done ? 100 : Math.round(step / totalSteps * 100);
	function goNext() {
		if (step < totalSteps - 1) setStep((s) => s + 1);
	}
	async function finishQuiz(finalCorrect) {
		setCorrectCount(finalCorrect);
		await persistCompletion(lesson.id, finalCorrect, lesson.quiz.length, Boolean(user));
		setDone(true);
	}
	const nxt = nextLesson(lesson.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b border-border/80 bg-bg/90 px-3 py-3 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-2xl items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "icon",
							"aria-label": "Close lesson",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/path",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-xs font-medium text-muted",
								children: [
									lesson.level,
									" · ",
									lesson.titlePt
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: pct,
								className: "mt-1"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs tabular-nums text-subtle",
							children: [lesson.minutes, " min"]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-5",
				children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DoneCard, {
					titlePt: lesson.titlePt,
					correct: correctCount,
					total: lesson.quiz.length,
					children: [nxt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/lesson/$id",
							params: { id: nxt.id },
							children: ["Next lesson", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/path",
							children: "Path"
						})
					})]
				}) : current?.type === "quiz" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizBlock, {
					questions: lesson.quiz,
					onFinished: (n) => void finishQuiz(n)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionView, { section: current })
			}),
			!done && current?.type !== "quiz" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sticky bottom-0 border-t border-border bg-bg/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-2xl gap-2",
					children: [step > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setStep((s) => s - 1),
						children: "Back"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "ml-auto min-w-32",
						onClick: goNext,
						children: ["Continue", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
					})]
				})
			})
		]
	});
}
function SectionView({ section }) {
	if (section.type === "intro") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium uppercase tracking-wider text-accent",
			children: section.kicker
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-2 font-display text-3xl font-medium tracking-tight",
			children: section.title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-muted",
			children: section.body
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 rounded-[var(--radius-xl)] bg-accent p-5 text-accent-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl font-medium",
					children: section.phrase.pt
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, {
					text: section.phrase.pt,
					className: "text-accent-fg hover:bg-tile"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-accent-fg/80",
				children: section.phrase.en
			})]
		})
	] });
	if (section.type === "vocab") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl font-medium",
			children: "Words that work"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Tap a card. Play the sound. Say it back."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-2",
			children: section.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "rounded-[var(--radius-lg)] bg-surface p-3 shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl font-medium",
								children: item.pt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: item.hint
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: item.en
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-fg",
									children: item.examplePt
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-subtle",
									children: item.exampleEn
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, { text: item.examplePt || item.pt })]
				})
			}, item.pt))
		})
	] });
	if (section.type === "grammar") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl font-medium",
			children: section.title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-muted",
			children: section.body
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-2",
			children: section.examples.map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-start gap-2 rounded-[var(--radius-md)] bg-surface p-3 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: ex.pt
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: ex.en
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, { text: ex.pt })]
			}, ex.pt))
		})
	] });
	if (section.type === "dialogue") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl font-medium",
			children: "A short scene"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: section.setting
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "mt-4 space-y-2",
			children: section.lines.map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: cn("rounded-[var(--radius-lg)] p-3", line.speaker === "You" || line.speaker.startsWith("You") ? "ml-4 bg-soft" : "mr-4 bg-surface shadow-[var(--shadow-border)]"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wider text-accent",
								children: line.speaker
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 font-medium",
								children: line.pt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: line.en
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, { text: line.pt })]
				})
			}, i))
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium uppercase tracking-wider text-accent",
			children: "Portugal"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-1 font-display text-2xl font-medium",
			children: section.title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-muted",
			children: section.body
		})
	] });
}
function DoneCard({ titlePt, correct, total, children }) {
	const pass = total > 0 && correct / total >= .6;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "flex flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid size-14 place-items-center rounded-full bg-success text-success-fg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 font-display text-3xl font-medium",
				children: pass ? "Boa." : "Keep the cup warm."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-muted",
				children: [
					titlePt,
					" · ",
					correct,
					"/",
					total,
					" on the quiz.",
					pass ? " That's a solid sip. Come back tomorrow." : " Redo whenever you like — it stays open."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-col gap-2 sm:flex-row",
				children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						children: "Today"
					})
				})]
			})
		]
	});
}
//#endregion
//#region src/routes/grammar/$id.tsx
var Route$6 = createFileRoute("/grammar/$id")({ component: GrammarPage });
function GrammarPage() {
	const { id } = Route$6.useParams();
	const drill = getGrammar(id);
	if (!drill) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Drill not found." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/grammar",
			className: "text-accent",
			children: "Back"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GrammarPlayer, { drill }, drill.id);
}
function GrammarPlayer({ drill }) {
	const user = useCurrentUser();
	const [phase, setPhase] = (0, import_react.useState)("intro");
	const [correct, setCorrect] = (0, import_react.useState)(0);
	const next = grammarDrills[grammarDrills.findIndex((d) => d.id === drill.id) + 1];
	async function finish(n) {
		setCorrect(n);
		await persistCompletion(drill.id, n, drill.quiz.length, Boolean(user));
		setPhase("done");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-20 border-b border-border/80 bg-bg/90 px-3 py-3 backdrop-blur-md",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-2xl items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "icon",
						"aria-label": "Back",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/grammar",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs font-medium text-muted",
							children: [drill.level, " · Gramática"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-display text-lg font-medium",
							children: drill.titlePt
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs tabular-nums text-subtle",
						children: [drill.minutes, " min"]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-5",
			children: phase === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DoneCard, {
				titlePt: drill.titlePt,
				correct,
				total: drill.quiz.length,
				children: [next && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/grammar/$id",
						params: { id: next.id },
						children: "Next drill"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/grammar",
						children: "Grammar"
					})
				})]
			}) : phase === "quiz" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizBlock, {
				questions: drill.quiz,
				onFinished: (n) => void finish(n)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs font-medium uppercase tracking-wider text-accent",
					children: [
						drill.level,
						" · ",
						drill.focus
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-3xl font-medium tracking-tight",
					children: drill.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-muted",
					children: drill.body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-6 space-y-2",
					children: drill.examples.map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-2 rounded-[var(--radius-md)] bg-surface p-3 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: ex.pt
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: ex.en
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, { text: ex.pt })]
					}, ex.pt))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-8 w-full",
					onClick: () => setPhase("quiz"),
					children: "Start the drill"
				})
			] })
		})]
	});
}
//#endregion
//#region src/routes/lesson/$id.tsx
var Route$5 = createFileRoute("/lesson/$id")({ component: LessonPage });
function LessonPage() {
	const { id } = Route$5.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LessonPlayer, { id });
}
//#endregion
//#region src/routes/listen/$id.tsx
var Route$4 = createFileRoute("/listen/$id")({ component: ListenPage });
function ListenPage() {
	const { id } = Route$4.useParams();
	const bulletin = getBulletin(id);
	if (!bulletin) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Bulletin not found." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/practice",
			className: "text-accent",
			children: "Back"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListenPlayer, { bulletin }, bulletin.id);
}
function ListenPlayer({ bulletin }) {
	const user = useCurrentUser();
	const [phase, setPhase] = (0, import_react.useState)("listen");
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [slow, setSlow] = (0, import_react.useState)(bulletin.level !== "C1");
	const [showScript, setShowScript] = (0, import_react.useState)(false);
	const [correct, setCorrect] = (0, import_react.useState)(0);
	const next = radioBulletins[radioBulletins.findIndex((b) => b.id === bulletin.id) + 1];
	async function play() {
		if (playing) {
			stopSpeaking();
			setPlaying(false);
			return;
		}
		setPlaying(true);
		await speakPt(bulletin.script, slow ? .78 : .96, "leo");
		setPlaying(false);
	}
	async function finish(n) {
		setCorrect(n);
		await persistCompletion(bulletin.id, n, bulletin.quiz.length, Boolean(user));
		setPhase("done");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-20 border-b border-border/80 bg-bg/90 px-3 py-3 backdrop-blur-md",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-2xl items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "icon",
						"aria-label": "Back",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/practice",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs font-medium text-muted",
							children: [
								bulletin.level,
								" · ",
								bulletin.station
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-display text-lg font-medium",
							children: bulletin.titlePt
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs tabular-nums text-subtle",
						children: [bulletin.minutes, " min"]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-5",
			children: phase === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DoneCard, {
				titlePt: bulletin.titlePt,
				correct,
				total: bulletin.quiz.length,
				children: [next && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/listen/$id",
						params: { id: next.id },
						children: "Next bulletin"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/practice",
						children: "Practice"
					})
				})]
			}) : phase === "quiz" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizBlock, {
				questions: bulletin.quiz,
				voice: "leo",
				onFinished: (n) => void finish(n)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: bulletin.image,
					alt: "",
					className: "scene h-40 w-full rounded-[var(--radius-lg)] object-cover"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 text-xs font-medium uppercase tracking-wider text-accent",
					children: bulletin.kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-3xl font-medium tracking-tight",
					children: bulletin.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "European Portuguese. Play once without the script. Then the quiz."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void play(),
						className: "grid size-20 place-items-center rounded-full bg-accent text-accent-fg shadow-[var(--shadow-border)]",
						"aria-label": playing ? "Stop" : "Play bulletin",
						children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-8" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-8 translate-x-0.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: slow ? "default" : "outline",
							size: "sm",
							onClick: () => setSlow(true),
							children: "Slow"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: !slow ? "default" : "outline",
							size: "sm",
							onClick: () => setSlow(false),
							children: "Natural"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => setShowScript((v) => !v),
						children: showScript ? "Hide transcript" : "Show transcript"
					}), showScript && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-[var(--radius-lg)] bg-surface p-4 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg leading-relaxed",
							children: bulletin.script
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: bulletin.translation
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-8 w-full",
					onClick: () => setPhase("quiz"),
					children: "Start the quiz"
				})
			] })
		})]
	});
}
//#endregion
//#region src/routes/read/$id.tsx
var Route$3 = createFileRoute("/read/$id")({ component: ReadPage });
function ReadPage() {
	const { id } = Route$3.useParams();
	const piece = getReading(id);
	if (!piece) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Page not found." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/practice",
			className: "text-accent",
			children: "Back"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadPlayer, { piece }, piece.id);
}
function ReadPlayer({ piece }) {
	const user = useCurrentUser();
	const [open, setOpen] = (0, import_react.useState)({});
	const [phase, setPhase] = (0, import_react.useState)("read");
	const [correct, setCorrect] = (0, import_react.useState)(0);
	const next = readingPieces[readingPieces.findIndex((p) => p.id === piece.id) + 1];
	async function finish(n) {
		setCorrect(n);
		await persistCompletion(piece.id, n, piece.quiz.length, Boolean(user));
		setPhase("done");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-20 border-b border-border/80 bg-bg/90 px-3 py-3 backdrop-blur-md",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-2xl items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "icon",
						"aria-label": "Back",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/practice",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs font-medium text-muted",
							children: [
								piece.level,
								" · ",
								piece.source
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-display text-lg font-medium",
							children: piece.titlePt
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs tabular-nums text-subtle",
						children: [piece.minutes, " min"]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-5",
			children: phase === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DoneCard, {
				titlePt: piece.titlePt,
				correct,
				total: piece.quiz.length,
				children: [next && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/read/$id",
						params: { id: next.id },
						children: "Next page"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/practice",
						children: "Practice"
					})
				})]
			}) : phase === "quiz" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizBlock, {
				questions: piece.quiz,
				voice: "luna",
				onFinished: (n) => void finish(n)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs font-medium uppercase tracking-wider text-accent",
					children: [piece.kind, " · tap a paragraph for English"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-3xl font-medium tracking-tight",
					children: piece.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 space-y-3",
					children: piece.paragraphs.map((p, i) => {
						const shown = Boolean(open[i]);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-[var(--radius-lg)] bg-surface p-4 shadow-[var(--shadow-border)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setOpen((s) => ({
										...s,
										[i]: !s[i]
									})),
									className: "min-w-0 flex-1 text-left",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-xl leading-relaxed",
										children: p.pt
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, {
									text: p.pt,
									voice: "luna",
									rate: .9
								})]
							}), shown && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: p.en
							})]
						}, p.pt);
					})
				}),
				piece.notes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xs font-medium uppercase tracking-wider text-accent",
						children: "Notes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 divide-y divide-border rounded-[var(--radius-md)] bg-surface shadow-[var(--shadow-border)]",
						children: piece.notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: n.pt
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: n.en
							})]
						}, n.pt))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-8 w-full",
					onClick: () => setPhase("quiz"),
					children: "Check what stuck"
				})
			] })
		})]
	});
}
//#endregion
//#region src/routes/speak/index.tsx
var Route$2 = createFileRoute("/speak/")({ component: SpeakIndex });
function SpeakIndex() {
	const { user, isPending } = useCurrentUserState();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-medium tracking-tight",
			children: "Speak"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "Short scenes with a native of Portugal — not Brazil. Stay in character. Make mistakes. Recasts come for free. Sign in first; the partner is live."
		}),
		!isPending && !user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 rounded-[var(--radius-md)] bg-soft px-3 py-2 text-sm text-accent",
			children: "Sign in to start a conversation — it uses a live tutor behind the scenes."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-6 grid gap-3",
			children: speakScenarios.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/speak/$id",
				params: { id: s.id },
				className: cn("block overflow-hidden rounded-[var(--radius-lg)] bg-surface no-underline shadow-[var(--shadow-border)] transition-shadow duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)]"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: s.image,
						alt: "",
						className: "scene hidden h-28 w-28 shrink-0 object-cover sm:block"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-medium uppercase tracking-wider text-accent",
								children: [
									s.level,
									" · ",
									s.minutes,
									" min"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 font-display text-xl font-medium",
								children: s.titlePt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: s.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 line-clamp-2 text-sm text-subtle",
								children: s.setting
							})
						]
					})]
				})
			}) }, s.id))
		})
	] });
}
//#endregion
//#region src/lib/chat-server.ts
var messageSchema = object({
	role: _enum(["user", "assistant"]),
	content: string().min(1).max(2e3)
});
var chatInput = object({
	scenarioId: string().min(1).max(40),
	messages: array(messageSchema).max(16)
});
var sendChat = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => chatInput.parse(input)).handler(async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "Practice chat is unavailable right now."
	};
	const scenario = speakScenarios.find((s) => s.id === data.scenarioId);
	if (!scenario) return {
		ok: false,
		error: "Unknown scene."
	};
	const system = [
		`You are ${scenario.partner}, a native speaker from Portugal (European Portuguese, never Brazilian).`,
		`Scene: ${scenario.setting}`,
		`CEFR level of the learner: ${scenario.level}. Keep your Portuguese at or just above that level.`,
		"Stay in character. Keep replies to 1–3 short sentences of Portuguese.",
		"After the Portuguese, on a new line, add a plain English gloss in parentheses.",
		"If the learner uses Brazilian Portuguese, recast once into European Portuguese without shaming.",
		"If they make a grammar or word error, recast the correct form naturally in your next line.",
		"Do not break character to lecture. Do not use markdown. Do not use emoji.",
		`Learner goals: ${scenario.goals.join("; ")}.`
	].join(" ");
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 280,
			temperature: .7,
			messages: [{
				role: "system",
				content: system
			}, ...data.messages.map((m) => ({
				role: m.role,
				content: m.content
			}))]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: "The conversation partner is busy. Try again."
	};
	const text = (await res.json()).choices?.[0]?.message?.content?.trim() ?? "";
	if (!text) return {
		ok: false,
		error: "Empty reply. Try a shorter line."
	};
	return {
		ok: true,
		text
	};
});
//#endregion
//#region src/lib/auth/gates.tsx
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* Auth is ON by default (including the sandbox live preview, which does real
* sign-in). Visitors are signed out until they authenticate. The shared dev
* user only appears when auth is explicitly disabled (`VITE_AUTH_ENABLED=false`).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
//#endregion
//#region src/routes/speak/$id.tsx
var Route$1 = createFileRoute("/speak/$id")({ component: SpeakScene });
function SpeakScene() {
	const { id } = Route$1.useParams();
	const scenario = (0, import_react.useMemo)(() => speakScenarios.find((s) => s.id === id), [id]);
	const { user, isPending } = useCurrentUserState();
	const [turns, setTurns] = (0, import_react.useState)(() => scenario ? [{
		role: "assistant",
		content: `${scenario.openerPt}\n(${scenario.openerEn})`
	}] : []);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		hideNav: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-[var(--radius-lg)] bg-surface-2" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (!scenario) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Scene not found." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/speak",
		children: "Back"
	})] });
	async function onSend() {
		const text = draft.trim();
		if (!text || busy || !scenario) return;
		const nextTurns = [...turns, {
			role: "user",
			content: text
		}];
		setTurns(nextTurns);
		setDraft("");
		setBusy(true);
		setError(null);
		try {
			const res = await sendChat({ data: {
				scenarioId: scenario.id,
				messages: nextTurns
			} });
			if (!res.ok) {
				setError(res.error);
				return;
			}
			setTurns((t) => [...t, {
				role: "assistant",
				content: res.text
			}]);
		} catch {
			setError("Could not send. Try again.");
		} finally {
			setBusy(false);
		}
	}
	const ptOf = (content) => content.split("\n")[0] ?? content;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		hideNav: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "icon",
					"aria-label": "Back",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/speak",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-medium uppercase tracking-wider text-accent",
						children: [
							scenario.level,
							" · ",
							scenario.partner
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "truncate font-display text-xl font-medium",
						children: scenario.titlePt
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-[var(--radius-md)] bg-soft px-3 py-2 text-sm text-fg",
				children: scenario.setting
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-wrap gap-2",
				children: scenario.goals.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-full bg-surface px-3 py-1 text-xs text-muted shadow-[var(--shadow-border)]",
					children: g
				}, g))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "mt-6 space-y-3",
				children: [turns.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: cn("max-w-[92%] rounded-[var(--radius-lg)] px-3 py-2 text-sm", t.role === "user" ? "ml-auto bg-accent text-accent-fg" : "bg-surface text-fg shadow-[var(--shadow-border)]"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "min-w-0 flex-1 whitespace-pre-wrap",
							children: t.content
						}), t.role === "assistant" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, {
							text: ptOf(t.content),
							className: "size-9"
						})]
					})
				}, i)), busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted",
					children: "A pensar…"
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-danger",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "sticky bottom-0 mt-6 flex gap-2 bg-bg py-3",
				onSubmit: (e) => {
					e.preventDefault();
					onSend();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "sr-only",
						htmlFor: "line",
						children: "Your line"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "line",
						value: draft,
						onChange: (e) => setDraft(e.target.value),
						placeholder: "Write in Portuguese…",
						maxLength: 500,
						className: "h-12 min-h-12 flex-1 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-base text-fg outline-none ring-accent placeholder:text-subtle focus:ring-2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "icon",
						disabled: busy || !draft.trim(),
						"aria-label": "Send",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {})
					})
				]
			})
		]
	});
}
//#endregion
//#region src/routes/api/auth/$.ts
var Route = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
//#endregion
//#region src/routeTree.gen.ts
var IndexRoute = Route$15.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$16
});
var GrammarRoute = Route$14.update({
	id: "/grammar",
	path: "/grammar",
	getParentRoute: () => Route$16
});
var LoginRoute = Route$13.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$16
});
var MeRoute = Route$12.update({
	id: "/me",
	path: "/me",
	getParentRoute: () => Route$16
});
var PathRoute = Route$11.update({
	id: "/path",
	path: "/path",
	getParentRoute: () => Route$16
});
var PracticeRoute = Route$10.update({
	id: "/practice",
	path: "/practice",
	getParentRoute: () => Route$16
});
var ReviewRoute = Route$9.update({
	id: "/review",
	path: "/review",
	getParentRoute: () => Route$16
});
var SpeakRoute = Route$8.update({
	id: "/speak",
	path: "/speak",
	getParentRoute: () => Route$16
});
var GrammarIndexRoute = Route$7.update({
	id: "/",
	path: "/",
	getParentRoute: () => GrammarRoute
});
var GrammarIdRoute = Route$6.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => GrammarRoute
});
var LessonIdRoute = Route$5.update({
	id: "/lesson/$id",
	path: "/lesson/$id",
	getParentRoute: () => Route$16
});
var ListenIdRoute = Route$4.update({
	id: "/listen/$id",
	path: "/listen/$id",
	getParentRoute: () => Route$16
});
var ReadIdRoute = Route$3.update({
	id: "/read/$id",
	path: "/read/$id",
	getParentRoute: () => Route$16
});
var SpeakIndexRoute = Route$2.update({
	id: "/",
	path: "/",
	getParentRoute: () => SpeakRoute
});
var SpeakIdRoute = Route$1.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => SpeakRoute
});
var ApiAuthSplatRoute = Route.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$16
});
var GrammarRouteChildren = {
	GrammarIdRoute,
	GrammarIndexRoute
};
var GrammarRouteWithChildren = GrammarRoute._addFileChildren(GrammarRouteChildren);
var SpeakRouteChildren = {
	SpeakIdRoute,
	SpeakIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	GrammarRoute: GrammarRouteWithChildren,
	LoginRoute,
	MeRoute,
	PathRoute,
	PracticeRoute,
	ReviewRoute,
	SpeakRoute: SpeakRoute._addFileChildren(SpeakRouteChildren),
	LessonIdRoute,
	ListenIdRoute,
	ReadIdRoute,
	ApiAuthSplatRoute
};
var routeTree = Route$16._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { getRouter };
