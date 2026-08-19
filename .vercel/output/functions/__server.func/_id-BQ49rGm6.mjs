import { o as __toESM } from "./_runtime.mjs";
import { a as nextLesson, n as getLesson } from "./_ssr/curriculum-CXAz-73p.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { d as ArrowRight, f as ArrowLeft, l as Check } from "./_libs/lucide-react.mjs";
import { r as Route$3 } from "./_ssr/router-xN1BWd5e.mjs";
import { t as cn } from "./_ssr/utils-BALn9PVX.mjs";
import { a as useCurrentUser, i as saveProgressSnapshot, r as saveLessonProgress, s as useProgress } from "./_ssr/progress-server-CXm9882L.mjs";
import { t as Button } from "./_ssr/button-B5QzUQWf.mjs";
import { t as Progress } from "./_ssr/progress-CSnUGQMG.mjs";
import { t as speakPt } from "./_ssr/tts-DkBR4ZMU.mjs";
import { t as SpeakButton } from "./_ssr/speak-button-CTSrkM9P.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-BQ49rGm6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LessonPlayer({ id }) {
	const lesson = getLesson(id);
	if (!lesson) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Lesson not found." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/path",
			className: "text-accent",
			children: "Back to path"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Player, { lesson });
}
function Player({ lesson }) {
	const steps = (0, import_react.useMemo)(() => [...lesson.sections, { type: "quiz" }], [lesson]);
	const [step, setStep] = (0, import_react.useState)(0);
	const [quizIndex, setQuizIndex] = (0, import_react.useState)(0);
	const [picked, setPicked] = (0, import_react.useState)(null);
	const [correctCount, setCorrectCount] = (0, import_react.useState)(0);
	const correctRef = (0, import_react.useRef)(0);
	const [done, setDone] = (0, import_react.useState)(false);
	const completeLesson = useProgress((s) => s.completeLesson);
	const user = useCurrentUser();
	const totalSteps = steps.length;
	const current = steps[step];
	const pct = done ? 100 : Math.round((step + (current?.type === "quiz" ? quizIndex / Math.max(1, lesson.quiz.length) : 0)) / totalSteps * 100);
	function goNext() {
		if (step < totalSteps - 1) setStep((s) => s + 1);
	}
	async function finishQuiz(finalCorrect) {
		const xp = 8 + finalCorrect * 2;
		setCorrectCount(finalCorrect);
		completeLesson(lesson.id, {
			quizScore: finalCorrect,
			quizTotal: lesson.quiz.length,
			xp
		});
		setDone(true);
		if (user) try {
			await saveLessonProgress({ data: {
				lessonId: lesson.id,
				quizScore: finalCorrect,
				quizTotal: lesson.quiz.length,
				xp
			} });
			await saveProgressSnapshot({ data: useProgress.getState().snapshot() });
		} catch {}
	}
	function onPick(q, index) {
		if (picked !== null) return;
		setPicked(index);
		if (index === q.answer) {
			correctRef.current += 1;
			setCorrectCount(correctRef.current);
		}
	}
	function onQuizContinue() {
		if (picked === null) return;
		if (quizIndex >= lesson.quiz.length - 1) {
			finishQuiz(correctRef.current);
			return;
		}
		setQuizIndex((i) => i + 1);
		setPicked(null);
	}
	const nxt = nextLesson(lesson.id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b border-border/80 bg-bg/90 px-3 py-3 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-2xl items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "icon",
							"aria-label": "Close lesson",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/path",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-xs font-medium text-muted",
								children: [
									lesson.level,
									" · ",
									lesson.titlePt
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: pct,
								className: "mt-1"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs tabular-nums text-subtle",
							children: [lesson.minutes, " min"]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-5",
				children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoneCard, {
					lesson,
					correct: correctCount,
					total: lesson.quiz.length,
					nextId: nxt?.id
				}) : current?.type === "quiz" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizStep, {
					question: lesson.quiz[quizIndex],
					index: quizIndex,
					total: lesson.quiz.length,
					picked,
					onPick,
					onContinue: onQuizContinue
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionView, { section: current })
			}),
			!done && current?.type !== "quiz" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sticky bottom-0 border-t border-border bg-bg/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-2xl gap-2",
					children: [step > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => setStep((s) => s - 1),
						children: "Back"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "ml-auto min-w-32",
						onClick: goNext,
						children: ["Continue", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
					})]
				})
			})
		]
	});
}
function SectionView({ section }) {
	if (section.type === "intro") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium uppercase tracking-wider text-accent",
			children: section.kicker
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-2 font-display text-3xl font-medium tracking-tight",
			children: section.title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-muted",
			children: section.body
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 rounded-[var(--radius-xl)] bg-accent p-5 text-accent-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl font-medium",
					children: section.phrase.pt
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, {
					text: section.phrase.pt,
					className: "text-accent-fg hover:bg-tile"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-accent-fg/80",
				children: section.phrase.en
			})]
		})
	] });
	if (section.type === "vocab") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl font-medium",
			children: "Words that work"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Tap a card. Play the sound. Say it back."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-2",
			children: section.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "rounded-[var(--radius-lg)] bg-surface p-3 shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl font-medium",
								children: item.pt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-subtle",
								children: item.hint
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: item.en
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-fg",
									children: item.examplePt
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-subtle",
									children: item.exampleEn
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, { text: item.pt })]
				})
			}, item.pt))
		})
	] });
	if (section.type === "grammar") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl font-medium",
			children: section.title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-muted",
			children: section.body
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-2",
			children: section.examples.map((ex) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
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
		})
	] });
	if (section.type === "dialogue") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-display text-2xl font-medium",
			children: "A short scene"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: section.setting
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "mt-4 space-y-2",
			children: section.lines.map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: cn("rounded-[var(--radius-lg)] p-3", line.speaker === "You" || line.speaker.startsWith("You") ? "ml-4 bg-soft" : "mr-4 bg-surface shadow-[var(--shadow-border)]"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wider text-accent",
								children: line.speaker
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 font-medium",
								children: line.pt
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: line.en
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpeakButton, { text: line.pt })]
				})
			}, i))
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-medium uppercase tracking-wider text-accent",
			children: "Portugal"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-1 font-display text-2xl font-medium",
			children: section.title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-muted",
			children: section.body
		})
	] });
}
function QuizStep({ question, index, total, picked, onPick, onContinue }) {
	const revealed = picked !== null;
	const ok = picked === question.answer;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs font-medium uppercase tracking-wider text-accent",
			children: [
				"Quiz · ",
				index + 1,
				" / ",
				total
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-2 font-display text-2xl font-medium",
			children: question.prompt
		}),
		question.kind === "listen" && question.speak && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "outline",
			className: "mt-3",
			onClick: () => speakPt(question.speak),
			children: "Play the line"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-5 space-y-2",
			children: question.options.map((opt, i) => {
				const selected = picked === i;
				const isAnswer = i === question.answer;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onPick(question, i),
					className: cn("flex min-h-12 w-full items-center rounded-[var(--radius-md)] px-4 py-3 text-left text-sm font-medium shadow-[var(--shadow-border)] transition-colors duration-[var(--motion-quick)]", !revealed && "bg-surface hover:bg-surface-2", revealed && isAnswer && "bg-success text-success-fg", revealed && selected && !isAnswer && "bg-danger text-danger-fg", revealed && !selected && !isAnswer && "bg-surface text-muted"),
					children: opt
				}) }, opt);
			})
		}),
		revealed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("text-sm font-medium", ok ? "text-success" : "text-danger"),
					children: ok ? "That's it." : "Not quite."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: question.explain
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4 w-full",
					onClick: onContinue,
					children: index === total - 1 ? "See results" : "Next"
				})
			]
		})
	] });
}
function DoneCard({ lesson, correct, total, nextId }) {
	const pass = correct / total >= .6;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "flex flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid size-14 place-items-center rounded-full bg-success text-success-fg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 font-display text-3xl font-medium",
				children: pass ? "Boa." : "Keep the cup warm."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-muted",
				children: [
					lesson.titlePt,
					" · ",
					correct,
					"/",
					total,
					" on the quiz.",
					pass ? " That's a solid sip. Come back tomorrow." : " Redo the quiz whenever you like — the lesson stays open."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-col gap-2 sm:flex-row",
				children: [
					nextId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/lesson/$id",
							params: { id: nextId },
							children: ["Next lesson", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/path",
							children: "Path"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							children: "Today"
						})
					})
				]
			})
		]
	});
}
function LessonPage() {
	const { id } = Route$3.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LessonPlayer, { id });
}
//#endregion
export { LessonPage as component };
