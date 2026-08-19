import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { l as LoaderCircle, t as Volume2 } from "../_libs/lucide-react.mjs";
import { n as cn } from "./utils-BjFYziMh.mjs";
import { t as Button } from "./button-By_6vfry.mjs";
import { t as speakPt } from "./tts-G8pdOrK6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/speak-button-BaLMxQAM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SpeakButton({ text, rate = .88, voice = "eve", label = "Play pronunciation", className }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "ghost",
		size: "icon",
		"aria-label": label,
		disabled: busy,
		className: cn("text-accent hover:bg-soft", className),
		onClick: (e) => {
			e.stopPropagation();
			setBusy(true);
			speakPt(text, rate, voice).finally(() => setBusy(false));
		},
		children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {})
	});
}
//#endregion
export { SpeakButton as t };
