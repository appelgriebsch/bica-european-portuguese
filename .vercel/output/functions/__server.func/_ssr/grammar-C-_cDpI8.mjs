import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn } from "./utils-Bw7vb_GY.mjs";
import { c as useProgress } from "./progress-store-OAIB_sDh.mjs";
import { m as Check, s as PenLine } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-COpcDC2T.mjs";
import { c as grammarDrills, u as levels } from "./curriculum-iB0g1_qP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/grammar-C-_cDpI8.js
var import_jsx_runtime = require_jsx_runtime();
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
export { GrammarIndex as component };
