import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link, y as Navigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { i as createServerFn } from "./_ssr/ssr.mjs";
import { D as _enum, F as object, R as string, k as array } from "./_libs/@better-auth/core+[...].mjs";
import { g as ArrowLeft, i as Send } from "./_libs/lucide-react.mjs";
import { n as Route$1 } from "./_ssr/router-DRae0WSD.mjs";
import { t as authMiddleware } from "./_ssr/middleware-B4v1SFzM.mjs";
import { n as cn } from "./_ssr/utils-BjFYziMh.mjs";
import { o as useCurrentUserState, t as createSsrRpc } from "./_ssr/progress-server-DUwDkjIi.mjs";
import { t as Button } from "./_ssr/button-By_6vfry.mjs";
import { t as SpeakButton } from "./_ssr/speak-button-BvFsEs5z.mjs";
import { t as speakScenarios } from "./_ssr/scenarios-CNp5Lfch.mjs";
import { t as AppShell } from "./_ssr/app-shell-DNMOGDJa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-C71oTSYw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var messageSchema = object({
	role: _enum(["user", "assistant"]),
	content: string().min(1).max(2e3)
});
var chatInput = object({
	scenarioId: string().min(1).max(40),
	messages: array(messageSchema).max(16)
});
var sendChat = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => chatInput.parse(input)).handler(createSsrRpc("a6c1db121df31c780863651ffdf226f842441dec27cf2216ec61f708eb327331"));
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
export { SpeakScene as component };
