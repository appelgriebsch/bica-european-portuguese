import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  text: z.string().trim().min(1).max(1500),
  speed: z.number().min(0.7).max(1.5).optional(),
  voice: z.enum(["eve", "leo", "luna"]).optional(),
});

const memory = new Map<string, string>();
const MAX_CACHE = 400;

function keyOf(text: string, voice: string, speed: number) {
  return `${voice}|${speed.toFixed(2)}|${text}`;
}

export const synthesizePt = createServerFn({ method: "POST" })
  .validator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "unavailable" };
    }

    const voice = data.voice ?? "eve";
    const speed = data.speed ?? 0.92;
    const key = keyOf(data.text, voice, speed);
    const cached = memory.get(key);
    if (cached) {
      return { ok: true as const, audio: cached };
    }

    const res = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text: data.text,
        voice_id: voice,
        language: "pt-PT",
        speed,
        text_normalization: true,
        output_format: {
          codec: "mp3",
          sample_rate: 24000,
          bit_rate: 64000,
        },
      }),
    });

    if (!res.ok) {
      return { ok: false as const, error: `tts ${res.status}` };
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 80 || buf.byteLength > 900_000) {
      return { ok: false as const, error: "bad audio" };
    }
    const audio = buf.toString("base64");
    if (memory.size >= MAX_CACHE) {
      const first = memory.keys().next().value;
      if (first) memory.delete(first);
    }
    memory.set(key, audio);
    return { ok: true as const, audio };
  });
