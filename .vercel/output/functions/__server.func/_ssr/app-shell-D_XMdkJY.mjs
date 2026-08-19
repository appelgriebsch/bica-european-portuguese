import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as UserRound, o as MessageCircle, s as House, u as BookOpen } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-BALn9PVX.mjs";
import { i as saveProgressSnapshot, n as fetchProgress, o as useCurrentUserState, s as useProgress } from "./progress-server-CXm9882L.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-D_XMdkJY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
				const snap = useProgress.getState().snapshot();
				await saveProgressSnapshot({ data: snap });
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
var nav = [
	{
		to: "/",
		label: "Today",
		icon: House
	},
	{
		to: "/path",
		label: "Path",
		icon: BookOpen
	},
	{
		to: "/speak",
		label: "Speak",
		icon: MessageCircle
	},
	{
		to: "/me",
		label: "You",
		icon: UserRound
	}
];
function AppShell({ children, hideNav = false }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const streak = useProgress((s) => s.streak);
	const { user, isPending } = useCurrentUserState();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-8 place-items-center rounded-[var(--radius-sm)] bg-accent font-display text-sm font-semibold text-accent-fg",
								children: "B"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-lg font-medium tracking-tight",
								children: "Bica"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden items-center gap-1 md:flex",
							children: nav.map((item) => {
								const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
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
						const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-medium no-underline", active ? "text-accent" : "text-muted"),
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
export { AppShell as t };
