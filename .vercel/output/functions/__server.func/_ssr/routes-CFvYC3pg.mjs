import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as todayKey, r as greetingForHour } from "./utils-Bw7vb_GY.mjs";
import { c as useProgress } from "./progress-store-OAIB_sDh.mjs";
import { a as RotateCcw, f as Headphones, g as ArrowRight, h as BookOpen, l as MessageCircle, p as Clock3, s as PenLine } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BQM6jxze.mjs";
import { r as warmVoices } from "./tts-EM107Bza.mjs";
import { t as AppShell } from "./app-shell-COpcDC2T.mjs";
import { c as grammarDrills, f as radioBulletins, g as workingLevel, l as lessons, n as firstIncomplete, p as readingPieces, r as firstIncompleteOf, t as dueVocab, u as levels } from "./curriculum-iB0g1_qP.mjs";
import { t as Progress } from "./progress-PJxE1Nrz.mjs";
import { t as StartLevelPicker } from "./start-level-jC_gpGbd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CFvYC3pg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const completed = useProgress((s) => s.completed);
	const xp = useProgress((s) => s.xp);
	const streak = useProgress((s) => s.streak);
	const floor = useProgress((s) => s.floor);
	const cards = useProgress((s) => s.cards);
	const [hour, setHour] = (0, import_react.useState)(9);
	(0, import_react.useEffect)(() => {
		setHour((/* @__PURE__ */ new Date()).getHours());
		warmVoices();
	}, []);
	const greet = greetingForHour(hour);
	const doneIds = (0, import_react.useMemo)(() => new Set(Object.keys(completed)), [completed]);
	const next = firstIncomplete(doneIds, floor);
	const level = workingLevel(doneIds, floor);
	const nextRadio = firstIncompleteOf(radioBulletins, doneIds, level);
	const nextRead = firstIncompleteOf(readingPieces, doneIds, level);
	const nextGram = firstIncompleteOf(grammarDrills, doneIds, level);
	const dueCount = dueVocab(Object.keys(completed), cards, todayKey()).length;
	const doneCount = lessons.filter((l) => doneIds.has(l.id)).length;
	const pct = Math.round(doneCount / lessons.length * 100);
	const todayDone = Object.values(completed).some((r) => {
		const d = new Date(r.completedAt);
		const now = /* @__PURE__ */ new Date();
		return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium tracking-wide text-accent",
			children: greet.pt
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 font-display text-3xl font-medium tracking-tight",
			children: "Portuguese in sips."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-prose text-muted",
			children: "European Portuguese, under twenty minutes. Built for the gap between meetings — then the café, the book, the radio."
		}),
		doneCount === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartLevelPicker, { label: "I am starting at" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-subtle",
				children: "Jump the early units if you already greet and order. The path stays open."
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 overflow-hidden rounded-[var(--radius-xl)] bg-surface shadow-[var(--shadow-border)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: next.image,
				alt: "",
				className: "scene h-44 w-full object-cover"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-medium uppercase tracking-wider text-muted",
						children: [
							todayDone ? "Done for today — or one more" : "Continue",
							" · ",
							next.level,
							" ·",
							" ",
							next.minutes,
							" min"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-2xl font-medium",
						children: next.titlePt
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-muted",
						children: next.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: next.summary
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "mt-4 w-full sm:w-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/lesson/$id",
							params: { id: next.id },
							children: [doneIds.has(next.id) ? "Revise" : "Start lesson", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
						})
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-5 grid grid-cols-3 gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Streak",
					value: `${streak}`,
					hint: "days"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Lessons",
					value: `${doneCount}`,
					hint: `of ${lessons.length}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "XP",
					value: `${xp}`,
					hint: "quiet points"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1.5 flex justify-between text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Path" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "tabular-nums",
					children: [pct, "%"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: pct })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/review",
			className: "mt-5 flex items-start gap-3 rounded-[var(--radius-lg)] bg-surface p-4 no-underline shadow-[var(--shadow-border)] transition-shadow duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "mt-0.5 size-5 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block text-xs font-medium uppercase tracking-wider text-accent",
						children: ["Palavras", dueCount > 0 ? ` · ${dueCount} due` : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block font-medium text-fg",
						children: dueCount > 0 ? "Words waiting" : "Caught up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm text-muted",
						children: dueCount > 0 ? "Flip, listen, type. Three minutes, then back to the path." : "Finish a lesson and new words join the pile."
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8 grid gap-3 sm:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/listen/$id",
					params: { id: nextRadio.id },
					className: "flex items-start gap-3 rounded-[var(--radius-lg)] bg-accent p-4 text-accent-fg no-underline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headphones, { className: "mt-0.5 size-5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium",
						children: "Listen"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-1 block text-sm text-accent-fg/80",
						children: [
							nextRadio.station,
							" · ",
							nextRadio.titlePt
						]
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/read/$id",
					params: { id: nextRead.id },
					className: "flex items-start gap-3 rounded-[var(--radius-lg)] bg-surface p-4 no-underline shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "mt-0.5 size-5 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium text-fg",
						children: "Read"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm text-muted",
						children: nextRead.titlePt
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/speak",
					className: "flex items-start gap-3 rounded-[var(--radius-lg)] bg-surface p-4 no-underline shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "mt-0.5 size-5 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium text-fg",
						children: "Speak"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm text-muted",
						children: "A short scene"
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/grammar",
					className: "flex items-start gap-3 rounded-[var(--radius-lg)] bg-surface p-4 no-underline shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "mt-0.5 size-5 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium text-fg",
						children: "Grammar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-1 block text-sm text-muted",
						children: [
							nextGram.level,
							" · ",
							nextGram.titlePt
						]
					})] })]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl font-medium",
				children: "Levels"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-3",
				children: levels.map((lv) => {
					const inLevel = lessons.filter((l) => l.level === lv.id);
					const done = inLevel.filter((l) => doneIds.has(l.id)).length;
					const grams = grammarDrills.filter((d) => d.level === lv.id);
					const gDone = grams.filter((d) => doneIds.has(d.id)).length;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/path",
						className: "flex items-start gap-4 rounded-[var(--radius-lg)] bg-surface p-4 no-underline shadow-[var(--shadow-border)] transition-shadow duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-soft font-display text-sm font-semibold text-accent",
							children: lv.id
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-medium text-fg",
									children: lv.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block text-sm text-muted",
									children: lv.blurb
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-2 block text-xs tabular-nums text-subtle",
									children: [
										done,
										"/",
										inLevel.length,
										" lessons · ",
										gDone,
										"/",
										grams.length,
										" ",
										"grammar"
									]
								})
							]
						})]
					}) }, lv.id);
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-8 flex items-center gap-2 text-sm text-subtle",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-4" }),
				lessons.length,
				" lessons · ",
				grammarDrills.length,
				" grammar drills · none over 18 minutes"
			]
		})
	] });
}
function Stat({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-[var(--radius-lg)] bg-surface px-3 py-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wider text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-display text-2xl font-medium tabular-nums leading-none",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-subtle",
				children: hint
			})
		]
	});
}
//#endregion
export { Home as component };
