import { i as createServerFn } from "./ssr.mjs";
import { D as _enum, F as object, R as string, k as array } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-B4v1SFzM.mjs";
import { t as speakScenarios } from "./scenarios-D_b7IgKz.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chat-server-DooPDjYn.js
var messageSchema = object({
	role: _enum(["user", "assistant"]),
	content: string().min(1).max(2e3)
});
var chatInput = object({
	scenarioId: string().min(1).max(40),
	messages: array(messageSchema).max(16)
});
var sendChat_createServerFn_handler = createServerRpc({
	id: "a6c1db121df31c780863651ffdf226f842441dec27cf2216ec61f708eb327331",
	name: "sendChat",
	filename: "src/lib/chat-server.ts"
}, (opts) => sendChat.__executeServer(opts));
var sendChat = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => chatInput.parse(input)).handler(sendChat_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "Practice chat is unavailable right now."
	};
	const scenario = speakScenarios.find((s) => s.id === data.scenarioId);
	if (!scenario) return {
		ok: false,
		error: "Unknown scene."
	};
	const system = [
		`You are ${scenario.partner}, a native speaker from Portugal (European Portuguese, never Brazilian).`,
		`Scene: ${scenario.setting}`,
		`CEFR level of the learner: ${scenario.level}. Keep your Portuguese at or just above that level.`,
		"Stay in character. Keep replies to 1–3 short sentences of Portuguese.",
		"After the Portuguese, on a new line, add a plain English gloss in parentheses.",
		"If the learner uses Brazilian Portuguese, recast once into European Portuguese without shaming.",
		"If they make a grammar or word error, recast the correct form naturally in your next line.",
		"Do not break character to lecture. Do not use markdown. Do not use emoji.",
		`Learner goals: ${scenario.goals.join("; ")}.`
	].join(" ");
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 280,
			temperature: .7,
			messages: [{
				role: "system",
				content: system
			}, ...data.messages.map((m) => ({
				role: m.role,
				content: m.content
			}))]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: "The conversation partner is busy. Try again."
	};
	const text = (await res.json()).choices?.[0]?.message?.content?.trim() ?? "";
	if (!text) return {
		ok: false,
		error: "Empty reply. Try a shorter line."
	};
	return {
		ok: true,
		text
	};
});
//#endregion
export { sendChat_createServerFn_handler };
