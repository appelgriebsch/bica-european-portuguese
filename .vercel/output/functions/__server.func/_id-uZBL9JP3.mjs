import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { o as useCurrentUser } from "./_ssr/progress-store-OAIB_sDh.mjs";
import { _ as ArrowLeft } from "./_libs/lucide-react.mjs";
import { o as Route$6 } from "./_ssr/router-o4MRfPxQ.mjs";
import { t as Button } from "./_ssr/button-BQM6jxze.mjs";
import { t as SpeakButton } from "./_ssr/speak-button-sNcNN32U.mjs";
import { a as getGrammar, c as grammarDrills } from "./_ssr/curriculum-iB0g1_qP.mjs";
import { i as persistCompletion, r as QuizBlock, t as DoneCard } from "./_ssr/lesson-player-Cw9HT5q-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-uZBL9JP3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
export { GrammarPage as component };
