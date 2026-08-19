import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { f as Clock3, p as Check } from "../_libs/lucide-react.mjs";
import { f as units, s as lessons } from "./curriculum-B10PTO8w.mjs";
import { n as cn } from "./utils-BjFYziMh.mjs";
import { s as useProgress } from "./progress-server-DUwDkjIi.mjs";
import { t as AppShell } from "./app-shell-DNMOGDJa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/path-7bPg0kX-.js
var import_jsx_runtime = require_jsx_runtime();
function PathPage() {
	const completed = useProgress((s) => s.completed);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-medium tracking-tight",
			children: "The path"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "A1 through B2, in European Portuguese. Jump in anywhere — adults skip what they already know. After B2 the work is the radio, the book, and the queue."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 space-y-10",
			children: units.map((unit) => {
				const unitLessons = lessons.filter((l) => l.unitId === unit.id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 flex items-end justify-between gap-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-medium uppercase tracking-wider text-accent",
							children: [
								unit.level,
								" · ",
								unit.titlePt
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-medium",
							children: unit.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: unit.blurb
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-2",
					children: unitLessons.map((lesson) => {
						const done = Boolean(completed[lesson.id]);
						const score = completed[lesson.id];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/lesson/$id",
							params: { id: lesson.id },
							className: cn("flex items-center gap-3 rounded-[var(--radius-lg)] bg-surface p-3 no-underline shadow-[var(--shadow-border)] transition-shadow duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)]"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)]", done ? "bg-success text-success-fg" : "bg-soft text-accent"),
								children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block truncate font-medium text-fg",
									children: [lesson.titlePt, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-2 font-sans text-sm font-normal text-muted",
										children: lesson.title.split("—")[0]?.trim()
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
			})
		})
	] });
}
//#endregion
export { PathPage as component };
