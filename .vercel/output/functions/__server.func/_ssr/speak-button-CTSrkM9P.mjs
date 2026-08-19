import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as Volume2 } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-BALn9PVX.mjs";
import { t as Button } from "./button-B5QzUQWf.mjs";
import { t as speakPt } from "./tts-DkBR4ZMU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/speak-button-CTSrkM9P.js
var import_jsx_runtime = require_jsx_runtime();
function SpeakButton({ text, rate = .88, label = "Play pronunciation", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		type: "button",
		variant: "ghost",
		size: "icon",
		"aria-label": label,
		className: cn("text-accent hover:bg-soft", className),
		onClick: (e) => {
			e.stopPropagation();
			speakPt(text, rate);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {})
	});
}
//#endregion
export { SpeakButton as t };
