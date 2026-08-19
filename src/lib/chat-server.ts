import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { speakScenarios } from "@/data/curriculum";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const chatInput = z.object({
  scenarioId: z.string().min(1).max(40),
  messages: z.array(messageSchema).max(16),
});

export const sendChat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => chatInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "Practice chat is unavailable right now." };
    }
    const scenario = speakScenarios.find((s) => s.id === data.scenarioId);
    if (!scenario) {
      return { ok: false as const, error: "Unknown scene." };
    }

    const system = [
      `You are ${scenario.partner}, a native speaker from Portugal (European Portuguese, never Brazilian).`,
      `Scene: ${scenario.setting}`,
      `CEFR level of the learner: ${scenario.level}. Keep your Portuguese at or just above that level.`,
      "Stay in character. Keep replies to 1–3 short sentences of Portuguese.",
      "After the Portuguese, on a new line, add a plain English gloss in parentheses.",
      "If the learner uses Brazilian Portuguese, recast once into European Portuguese without shaming.",
      "If they make a grammar or word error, recast the correct form naturally in your next line.",
      "Do not break character to lecture. Do not use markdown. Do not use emoji.",
      `Learner goals: ${scenario.goals.join("; ")}.`,
    ].join(" ");

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 280,
        temperature: 0.7,
        messages: [
          { role: "system", content: system },
          ...data.messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false as const, error: "The conversation partner is busy. Try again." };
    }
    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return { ok: false as const, error: "Empty reply. Try a shorter line." };
    }
    return { ok: true as const, text };
  });
