import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn } from "./utils-Bw7vb_GY.mjs";
import { c as useProgress } from "./progress-store-OAIB_sDh.mjs";
import { m as Check, p as Clock3, s as PenLine } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-COpcDC2T.mjs";
import { c as grammarDrills, l as lessons, m as units, u as levels } from "./curriculum-iB0g1_qP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/path-CKHPBhZ6.js
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
export { PathPage as component };
