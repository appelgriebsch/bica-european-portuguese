import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { g as ArrowLeft, o as Play, s as Pause } from "./_libs/lucide-react.mjs";
import { i as Route$4 } from "./_ssr/router-DRae0WSD.mjs";
import { i as getBulletin, u as radioBulletins } from "./_ssr/curriculum-B10PTO8w.mjs";
import { a as useCurrentUser } from "./_ssr/progress-server-DUwDkjIi.mjs";
import { t as Button } from "./_ssr/button-By_6vfry.mjs";
import { n as stopSpeaking, t as speakPt } from "./_ssr/tts-Berh59cG.mjs";
import { i as persistCompletion, r as QuizBlock, t as DoneCard } from "./_ssr/lesson-player-c2DMOpYw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-D3EaCDf2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ListenPage() {
	const { id } = Route$4.useParams();
	const bulletin = getBulletin(id);
	if (!bulletin) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Bulletin not found." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/practice",
			className: "text-accent",
			children: "Back"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListenPlayer, { bulletin });
}
function ListenPlayer({ bulletin }) {
	const user = useCurrentUser();
	const [phase, setPhase] = (0, import_react.useState)("listen");
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [slow, setSlow] = (0, import_react.useState)(true);
	const [showScript, setShowScript] = (0, import_react.useState)(false);
	const [correct, setCorrect] = (0, import_react.useState)(0);
	const next = radioBulletins[radioBulletins.findIndex((b) => b.id === bulletin.id) + 1];
	async function play() {
		if (playing) {
			stopSpeaking();
			setPlaying(false);
			return;
		}
		setPlaying(true);
		await speakPt(bulletin.script, slow ? .78 : .96, "leo");
		setPlaying(false);
	}
	async function finish(n) {
		setCorrect(n);
		await persistCompletion(bulletin.id, n, bulletin.quiz.length, Boolean(user));
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
								bulletin.level,
								" · ",
								bulletin.station
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-display text-lg font-medium",
							children: bulletin.titlePt
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs tabular-nums text-subtle",
						children: [bulletin.minutes, " min"]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-5",
			children: phase === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DoneCard, {
				titlePt: bulletin.titlePt,
				correct,
				total: bulletin.quiz.length,
				children: [next && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/listen/$id",
						params: { id: next.id },
						children: "Next bulletin"
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
				questions: bulletin.quiz,
				voice: "leo",
				onFinished: (n) => void finish(n)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: bulletin.image,
					alt: "",
					className: "scene h-40 w-full rounded-[var(--radius-lg)] object-cover"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 text-xs font-medium uppercase tracking-wider text-accent",
					children: bulletin.kicker
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-3xl font-medium tracking-tight",
					children: bulletin.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "European Portuguese. Play once without the script. Then the quiz."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void play(),
						className: "grid size-20 place-items-center rounded-full bg-accent text-accent-fg shadow-[var(--shadow-border)]",
						"aria-label": playing ? "Stop" : "Play bulletin",
						children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-8" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-8 translate-x-0.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: slow ? "default" : "outline",
							size: "sm",
							onClick: () => setSlow(true),
							children: "Slow"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: !slow ? "default" : "outline",
							size: "sm",
							onClick: () => setSlow(false),
							children: "Natural"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => setShowScript((v) => !v),
						children: showScript ? "Hide transcript" : "Show transcript"
					}), showScript && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-[var(--radius-lg)] bg-surface p-4 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-lg leading-relaxed",
							children: bulletin.script
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: bulletin.translation
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-8 w-full",
					onClick: () => setPhase("quiz"),
					children: "Start the quiz"
				})
			] })
		})]
	});
}
//#endregion
export { ListenPage as component };
