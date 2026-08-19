import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { p as vocabFromCompleted, s as lessons, t as estimatedLevel } from "./curriculum-B10PTO8w.mjs";
import { i as signOut } from "./client-sGid3STf.mjs";
import { o as useCurrentUserState, s as useProgress } from "./progress-server-DUwDkjIi.mjs";
import { t as Button } from "./button-By_6vfry.mjs";
import { t as SpeakButton } from "./speak-button-BvFsEs5z.mjs";
import { t as AppShell } from "./app-shell-DNMOGDJa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/me-BBNjqn6C.js
var import_jsx_runtime = require_jsx_runtime();
function MePage() {
	const { user, isPending } = useCurrentUserState();
	const completed = useProgress((s) => s.completed);
	const xp = useProgress((s) => s.xp);
	const streak = useProgress((s) => s.streak);
	const doneIds = Object.keys(completed);
	const doneSet = new Set(doneIds);
	const lessonDone = lessons.filter((l) => doneSet.has(l.id)).length;
	const vocab = vocabFromCompleted(doneIds).slice(0, 24);
	const estimated = estimatedLevel(doneSet);
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
						children: "Review"
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
				}, item.pt + item.en))
			})]
		})
	] });
}
//#endregion
export { MePage as component };
