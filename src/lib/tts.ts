let voicesReady = false;

function pickPtVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "pt-PT") ??
    voices.find((v) => v.lang.toLowerCase().startsWith("pt-pt")) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("pt")) ??
    null
  );
}

export function warmVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const mark = () => {
    voicesReady = true;
  };
  window.speechSynthesis.addEventListener("voiceschanged", mark, { once: true });
  void window.speechSynthesis.getVoices();
}

export function speakPt(text: string, rate = 0.88) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "pt-PT";
  utter.rate = rate;
  const voice = pickPtVoice();
  if (voice) utter.voice = voice;
  if (!voicesReady) void window.speechSynthesis.getVoices();
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
