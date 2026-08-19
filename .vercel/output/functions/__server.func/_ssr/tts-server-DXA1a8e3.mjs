import { i as createServerFn } from "./ssr.mjs";
import { D as _enum, F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tts-server-DXA1a8e3.js
var inputSchema = object({
	text: string().trim().min(1).max(1500),
	speed: number().min(.7).max(1.5).optional(),
	voice: _enum([
		"eve",
		"leo",
		"luna"
	]).optional()
});
var memory = /* @__PURE__ */ new Map();
var MAX_CACHE = 400;
function keyOf(text, voice, speed) {
	return `${voice}|${speed.toFixed(2)}|${text}`;
}
var synthesizePt_createServerFn_handler = createServerRpc({
	id: "72e18736868655d6a43e46be71c05c1fe57cc9692bdece56a54c23f6c56512ea",
	name: "synthesizePt",
	filename: "src/lib/tts-server.ts"
}, (opts) => synthesizePt.__executeServer(opts));
var synthesizePt = createServerFn({ method: "POST" }).validator((input) => inputSchema.parse(input)).handler(synthesizePt_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "unavailable"
	};
	const voice = data.voice ?? "eve";
	const speed = data.speed ?? .92;
	const key = keyOf(data.text, voice, speed);
	const cached = memory.get(key);
	if (cached) return {
		ok: true,
		audio: cached
	};
	const res = await fetch("https://api.x.ai/v1/tts", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			text: data.text,
			voice_id: voice,
			language: "pt-PT",
			speed,
			text_normalization: true,
			output_format: {
				codec: "mp3",
				sample_rate: 24e3,
				bit_rate: 64e3
			}
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `tts ${res.status}`
	};
	const buf = Buffer.from(await res.arrayBuffer());
	if (buf.byteLength < 80 || buf.byteLength > 9e5) return {
		ok: false,
		error: "bad audio"
	};
	const audio = buf.toString("base64");
	if (memory.size >= MAX_CACHE) {
		const first = memory.keys().next().value;
		if (first) memory.delete(first);
	}
	memory.set(key, audio);
	return {
		ok: true,
		audio
	};
});
//#endregion
export { synthesizePt_createServerFn_handler };
