import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn } from "./utils-BjFYziMh.mjs";
import { o as useCurrentUserState } from "./progress-server-DUwDkjIi.mjs";
import { t as speakScenarios } from "./scenarios-CNp5Lfch.mjs";
import { t as AppShell } from "./app-shell-DNMOGDJa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/speak-CbBsg8Cv.js
var import_jsx_runtime = require_jsx_runtime();
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
export { SpeakIndex as component };
