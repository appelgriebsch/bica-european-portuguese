import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { p as vocabFromCompleted } from "./curriculum-B10PTO8w.mjs";
import { s as useProgress } from "./progress-server-DUwDkjIi.mjs";
import { t as Button } from "./button-By_6vfry.mjs";
import { t as SpeakButton } from "./speak-button-BvFsEs5z.mjs";
import { t as AppShell } from "./app-shell-DNMOGDJa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/review-CSf4S8Hf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function shuffle(items) {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}
function ReviewPage() {
	const completed = useProgress((s) => s.completed);
	const pool = (0, import_react.useMemo)(() => {
		const items = vocabFromCompleted(Object.keys(completed));
		const unique = /* @__PURE__ */ new Map();
		for (const item of items) unique.set(item.pt, item);
		return shuffle([...unique.values()]).slice(0, 12);
	}, [completed]);
	const [index, setIndex] = (0, import_react.useState)(0);
	const [flipped, setFlipped] = (0, import_react.useState)(false);
	const [known, setKnown] = (0, import_react.useState)(0);
	const [done, setDone] = (0, import_react.useState)(false);
	const card = pool[index];
	const total = pool.length;
	function mark(yes) {
		if (yes) setKnown((n) => n + 1);
		if (index >= total - 1) {
			setDone(true);
			return;
		}
		setIndex((n) => n + 1);
		setFlipped(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-medium tracking-tight",
			children: "Palavras"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "Front in Portuguese. Flip. Be honest. Three minutes, then back to the day."
		}),
		total === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 rounded-[var(--radius-lg)] bg-surface p-5 shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: "Nothing to review yet."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Finish a lesson on the path first."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/path",
						children: "Open the path"
					})
				})
			]
		}) : done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-medium",
					children: "Boa."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-muted",
					children: [
						known,
						"/",
						total,
						" felt ready. The rest will wait until tomorrow."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							children: "Today"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/practice",
							children: "Practice"
						})
					})]
				})
			]
		}) : card && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs tabular-nums text-subtle",
					children: [
						index + 1,
						" / ",
						total
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setFlipped((v) => !v),
					className: "mt-3 min-h-48 w-full rounded-[var(--radius-xl)] bg-surface p-6 text-left shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-3xl font-medium",
							children: card.pt
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-subtle",
							children: card.hint
						}),
						flipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-lg text-fg",
									children: card.en
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-muted",
									children: card.examplePt
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-subtle",
									children: card.exampleEn
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-10 text-sm text-subtle",
							children: "Tap to flip"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, { text: card.examplePt || card.pt }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => mark(false),
							children: "Again"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => mark(true),
							children: "I know this"
						})]
					})]
				})
			]
		})
	] });
}
//#endregion
export { ReviewPage as component };
