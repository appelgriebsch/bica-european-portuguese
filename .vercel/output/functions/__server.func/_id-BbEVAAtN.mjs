import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { g as ArrowLeft } from "./_libs/lucide-react.mjs";
import { r as Route$3 } from "./_ssr/router-DRae0WSD.mjs";
import { d as readingPieces, o as getReading } from "./_ssr/curriculum-B10PTO8w.mjs";
import { a as useCurrentUser } from "./_ssr/progress-server-DUwDkjIi.mjs";
import { t as Button } from "./_ssr/button-By_6vfry.mjs";
import { t as SpeakButton } from "./_ssr/speak-button-BvFsEs5z.mjs";
import { i as persistCompletion, r as QuizBlock, t as DoneCard } from "./_ssr/lesson-player-c2DMOpYw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-BbEVAAtN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReadPlayer, { piece });
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
export { ReadPage as component };
