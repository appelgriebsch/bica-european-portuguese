//#region node_modules/.nitro/vite/services/ssr/assets/tts-DkBR4ZMU.js
var voicesReady = false;
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
function speakPt(text, rate = .88) {
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
//#endregion
export { warmVoices as n, speakPt as t };
