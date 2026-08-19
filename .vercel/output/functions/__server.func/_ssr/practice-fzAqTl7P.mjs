import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as RotateCcw, c as MessageCircle, d as Headphones, m as BookOpen, p as Check } from "../_libs/lucide-react.mjs";
import { d as readingPieces, r as firstIncompleteOf, t as estimatedLevel, u as radioBulletins } from "./curriculum-B10PTO8w.mjs";
import { n as cn } from "./utils-BjFYziMh.mjs";
import { s as useProgress } from "./progress-server-DUwDkjIi.mjs";
import { t as speakScenarios } from "./scenarios-CNp5Lfch.mjs";
import { t as AppShell } from "./app-shell-DNMOGDJa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/practice-fzAqTl7P.js
var import_jsx_runtime = require_jsx_runtime();
function PracticePage() {
	const completed = useProgress((s) => s.completed);
	const doneIds = new Set(Object.keys(completed));
	const level = estimatedLevel(doneIds);
	const nextRadio = firstIncompleteOf(radioBulletins, doneIds, level);
	const nextRead = firstIncompleteOf(readingPieces, doneIds, level);
	const radioDone = radioBulletins.filter((b) => doneIds.has(b.id)).length;
	const readDone = readingPieces.filter((p) => doneIds.has(p.id)).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-medium tracking-tight",
			children: "Practice"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "The path teaches. This page is the country: a bulletin, a page, a café counter, the words you already met."
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs font-medium uppercase tracking-wider text-accent",
							children: "Review"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block font-display text-xl font-medium text-fg",
							children: "Palavras"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-sm text-muted",
							children: "A three-minute pass through words from lessons you have finished."
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
		})
	] });
}
//#endregion
export { PracticePage as component };
