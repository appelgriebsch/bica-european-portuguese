import { synthesizePt } from "@/lib/tts-server";

let voicesReady = false;
let currentAudio: HTMLAudioElement | null = null;
let currentResolve: (() => void) | null = null;
const urlCache = new Map<string, string>();

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

function speakBrowser(text: string, rate: number) {
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

function playDataUrl(url: string): Promise<void> {
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
    void audio.play().catch(() => done());
  });
}

export type SpeakVoice = "eve" | "leo" | "luna";

export async function speakPt(
  text: string,
  rate = 0.88,
  voice: SpeakVoice = "eve",
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed || typeof window === "undefined") return;

  const speed = Math.min(1.5, Math.max(0.7, rate));
  const cacheKey = `${voice}|${speed}|${trimmed}`;
  const hit = urlCache.get(cacheKey);
  if (hit) {
    await playDataUrl(hit);
    return;
  }

  try {
    const res = await synthesizePt({
      data: { text: trimmed.slice(0, 1500), speed, voice },
    });
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
  } catch {
    /* fall through to the browser voice */
  }

  speakBrowser(trimmed, rate);
}

export function stopSpeaking() {
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

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
