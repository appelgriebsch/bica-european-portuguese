import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as todayKey, n as cn, t as answersMatch } from "./utils-Bw7vb_GY.mjs";
import { a as saveProgressSnapshot, c as useProgress, o as useCurrentUser } from "./progress-store-OAIB_sDh.mjs";
import { t as Button } from "./button-BQM6jxze.mjs";
import { t as speakPt } from "./tts-EM107Bza.mjs";
import { t as SpeakButton } from "./speak-button-sNcNN32U.mjs";
import { t as AppShell } from "./app-shell-COpcDC2T.mjs";
import { h as vocabFromCompleted, t as dueVocab, u as levels } from "./curriculum-iB0g1_qP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/review-DVyjO7pj.js
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
function acceptFor(pt) {
	const list = [pt];
	const stripped = pt.replace(/^(o|a|os|as|um|uma)\s+/i, "");
	if (stripped !== pt) list.push(stripped);
	return list;
}
function buildQueue(items, mode) {
	return shuffle(items).slice(0, 12).map((item, i) => ({
		...item,
		kind: mode === "type" ? "type" : mode === "flip" ? "flip" : i % 2 === 0 ? "flip" : "type",
		seen: 0
	}));
}
function ReviewPage() {
	const user = useCurrentUser();
	const completed = useProgress((s) => s.completed);
	const cards = useProgress((s) => s.cards);
	const gradeVocab = useProgress((s) => s.gradeVocab);
	const touchStudy = useProgress((s) => s.touchStudy);
	const today = todayKey();
	const doneIds = (0, import_react.useMemo)(() => Object.keys(completed), [completed]);
	const pool = (0, import_react.useMemo)(() => vocabFromCompleted(doneIds), [doneIds]);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const due = (0, import_react.useMemo)(() => dueVocab(doneIds, cards, today, filter === "all" ? void 0 : filter), [
		doneIds,
		cards,
		today,
		filter
	]);
	const dueAll = (0, import_react.useMemo)(() => dueVocab(doneIds, cards, today), [
		doneIds,
		cards,
		today
	]);
	const [phase, setPhase] = (0, import_react.useState)("hub");
	const [queue, setQueue] = (0, import_react.useState)([]);
	const [index, setIndex] = (0, import_react.useState)(0);
	const [flipped, setFlipped] = (0, import_react.useState)(false);
	const [typed, setTyped] = (0, import_react.useState)("");
	const [typedChecked, setTypedChecked] = (0, import_react.useState)(false);
	const [known, setKnown] = (0, import_react.useState)(0);
	const card = queue[index];
	const totalPlanned = Math.min(due.length, 12);
	const levelsWithVocab = levels.filter((lv) => pool.some((item) => item.level === lv.id));
	function start(mode) {
		const next = buildQueue(due, mode);
		if (next.length === 0) return;
		setQueue(next);
		setIndex(0);
		setFlipped(false);
		setTyped("");
		setTypedChecked(false);
		setKnown(0);
		setPhase("session");
	}
	function finishSession(knewCount) {
		touchStudy(4 + knewCount);
		setPhase("done");
		if (user) saveProgressSnapshot({ data: useProgress.getState().snapshot() }).catch(() => void 0);
	}
	function advance(knew, current) {
		gradeVocab(current.id, knew);
		const nextKnown = knew ? known + 1 : known;
		if (knew) setKnown(nextKnown);
		let nextQueue = queue;
		if (!knew && current.seen < 1) {
			nextQueue = [...queue, {
				...current,
				seen: current.seen + 1
			}];
			setQueue(nextQueue);
		}
		if (index >= nextQueue.length - 1) {
			finishSession(nextKnown);
			return;
		}
		setIndex((n) => n + 1);
		setFlipped(false);
		setTyped("");
		setTypedChecked(false);
	}
	(0, import_react.useEffect)(() => {
		if (phase !== "session" || !card || card.kind !== "flip" || flipped) return;
		speakPt(card.pt, .88, "eve");
	}, [
		phase,
		card?.id,
		card?.kind,
		flipped
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl font-medium tracking-tight",
			children: "Palavras"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted",
			children: "Words from lessons you finished. Due today come back. New ones join the pile. Flip, or type the Portuguese."
		}),
		pool.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
		}) : phase === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-medium",
					children: "Boa."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-muted",
					children: [known, " felt ready. Again waits until later today or tomorrow — then three days, a week, a month."]
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
						type: "button",
						variant: "outline",
						onClick: () => setPhase("hub"),
						children: "Palavras"
					})]
				})
			]
		}) : phase === "session" && card ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionCard, {
			card,
			position: index + 1,
			remaining: queue.length,
			flipped,
			typed,
			typedChecked,
			onFlip: () => setFlipped((v) => !v),
			onTyped: setTyped,
			onCheck: () => setTypedChecked(true),
			onGrade: (knew) => advance(knew, card)
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs font-medium uppercase tracking-wider text-accent",
					children: ["Due today · ", dueAll.length]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: totalPlanned > 0 ? `A sip of ${Math.min(due.length, 12)} from this pile.` : "Caught up in this pile. Switch level, or come back tomorrow."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
						label: "Today",
						on: filter === "all",
						count: dueAll.length,
						onClick: () => setFilter("all")
					}), levelsWithVocab.map((lv) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
						label: lv.id,
						on: filter === lv.id,
						count: dueVocab(doneIds, cards, today, lv.id).length,
						onClick: () => setFilter(lv.id)
					}, lv.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-col gap-2 sm:flex-row",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: due.length === 0,
							onClick: () => start("mix"),
							children: "Start · mix"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							disabled: due.length === 0,
							onClick: () => start("flip"),
							children: "Listen and flip"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							disabled: due.length === 0,
							onClick: () => start("type"),
							children: "Type Portuguese"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-subtle",
					children: "Mix plays Portuguese first, then asks you to type it. Honest taps schedule tomorrow, three days, a week."
				})
			]
		})
	] });
}
function FilterChip({ label, on, count, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: cn("min-h-11 rounded-[var(--radius-md)] px-4 text-sm font-medium transition-colors duration-[var(--motion-quick)]", on ? "bg-accent text-accent-fg" : "bg-surface text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"),
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("ml-2 tabular-nums", on ? "text-accent-fg/70" : "text-subtle"),
			children: count
		})]
	});
}
function SessionCard({ card, position, remaining, flipped, typed, typedChecked, onFlip, onTyped, onCheck, onGrade }) {
	const typedOk = typedChecked && answersMatch(typed, acceptFor(card.pt));
	const revealed = card.kind === "flip" ? flipped : typedChecked;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs tabular-nums text-subtle",
				children: [
					position,
					" / ",
					remaining,
					" · ",
					card.level
				]
			}),
			card.kind === "flip" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onFlip,
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
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 min-h-48 rounded-[var(--radius-xl)] bg-surface p-6 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wider text-accent",
						children: "Type the Portuguese"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-2xl font-medium",
						children: card.en
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-5",
						onSubmit: (e) => {
							e.preventDefault();
							if (typed.trim()) onCheck();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "sr-only",
								htmlFor: "palavras-type",
								children: "Portuguese"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "palavras-type",
								value: typed,
								onChange: (e) => onTyped(e.target.value),
								disabled: typedChecked,
								autoCapitalize: "off",
								autoCorrect: "off",
								spellCheck: false,
								placeholder: "Type in Portuguese…",
								className: "h-12 min-h-12 w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 text-base text-fg outline-none ring-accent placeholder:text-subtle focus:ring-2"
							}),
							!typedChecked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "mt-3 w-full",
								disabled: !typed.trim(),
								children: "Check"
							})
						]
					}),
					typedChecked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("text-sm font-medium", typedOk ? "text-success" : "text-danger"),
								children: typedOk ? "That's it." : "Not quite."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-medium text-fg",
								children: card.pt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: card.examplePt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-subtle",
								children: card.exampleEn
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, { text: card.examplePt || card.pt }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						disabled: !revealed,
						onClick: () => onGrade(false),
						children: "Again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !revealed,
						onClick: () => onGrade(true),
						children: "I know this"
					})]
				})]
			})
		]
	});
}
//#endregion
export { ReviewPage as component };
