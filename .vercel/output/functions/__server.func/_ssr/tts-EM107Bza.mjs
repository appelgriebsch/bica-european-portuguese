import { J as _enum, at as string, nt as object, tt as number } from "../_libs/@better-auth/core+[...].mjs";
import { i as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./progress-store-OAIB_sDh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tts-EM107Bza.js
var inputSchema = object({
	text: string().trim().min(1).max(1500),
	speed: number().min(.7).max(1.5).optional(),
	voice: _enum([
		"eve",
		"leo",
		"luna"
	]).optional()
});
var synthesizePt = createServerFn({ method: "POST" }).validator((input) => inputSchema.parse(input)).handler(createSsrRpc("72e18736868655d6a43e46be71c05c1fe57cc9692bdece56a54c23f6c56512ea"));
var voicesReady = false;
var currentAudio = null;
var currentResolve = null;
var urlCache = /* @__PURE__ */ new Map();
function pickPtVoice() {
	if (typeof window === "undefined" || !window.speechSynthesis) return null;
	const voices = window.speechSynthesis.getVoices();
	return voices.find((v) => v.lang === "pt-PT") ?? voices.find((v) => v.lang.toLowerCase().startsWith("pt-pt")) ?? voices.find((v) => v.lang.toLowerCase().startsWith("pt")) ?? null;
}
function warmVoices() {
	if (typeof window === "undefined" || !window.speechSynthesis) return;
	const mark = () => {
		voicesReady = true;
	};
	window.speechSynthesis.addEventListener("voiceschanged", mark, { once: true });
	window.speechSynthesis.getVoices();
}
function speakBrowser(text, rate) {
	if (typeof window === "undefined" || !window.speechSynthesis) return;
	window.speechSynthesis.cancel();
	const utter = new SpeechSynthesisUtterance(text);
	utter.lang = "pt-PT";
	utter.rate = rate;
	const voice = pickPtVoice();
	if (voice) utter.voice = voice;
	if (!voicesReady) window.speechSynthesis.getVoices();
	window.speechSynthesis.speak(utter);
}
function playDataUrl(url) {
	stopSpeaking();
	return new Promise((resolve) => {
		const audio = new Audio(url);
		currentAudio = audio;
		currentResolve = resolve;
		const done = () => {
			if (currentAudio === audio) currentAudio = null;
			if (currentResolve === resolve) currentResolve = null;
			resolve();
		};
		audio.addEventListener("ended", done, { once: true });
		audio.addEventListener("error", done, { once: true });
		audio.play().catch(() => done());
	});
}
async function speakPt(text, rate = .88, voice = "eve") {
	const trimmed = text.trim();
	if (!trimmed || typeof window === "undefined") return;
	const speed = Math.min(1.5, Math.max(.7, rate));
	const cacheKey = `${voice}|${speed}|${trimmed}`;
	const hit = urlCache.get(cacheKey);
	if (hit) {
		await playDataUrl(hit);
		return;
	}
	try {
		const res = await synthesizePt({ data: {
			text: trimmed.slice(0, 1500),
			speed,
			voice
		} });
		if (res.ok) {
			const url = `data:audio/mpeg;base64,${res.audio}`;
			if (urlCache.size > 200) {
				const first = urlCache.keys().next().value;
				if (first) urlCache.delete(first);
			}
			urlCache.set(cacheKey, url);
			await playDataUrl(url);
			return;
		}
	} catch {}
	speakBrowser(trimmed, rate);
}
function stopSpeaking() {
	if (typeof window === "undefined") return;
	if (window.speechSynthesis) window.speechSynthesis.cancel();
	if (currentAudio) {
		currentAudio.pause();
		currentAudio.src = "";
		currentAudio = null;
	}
	if (currentResolve) {
		const r = currentResolve;
		currentResolve = null;
		r();
	}
}
//#endregion
export { stopSpeaking as n, warmVoices as r, speakPt as t };
