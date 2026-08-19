import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as cn } from "./utils-BALn9PVX.mjs";
import { n as Root, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/progress-CSnUGQMG.js
var import_jsx_runtime = require_jsx_runtime();
function Progress({ value = 0, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		value,
		className: cn("relative h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
			className: "h-full bg-accent transition-transform duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)]",
			style: { transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)` }
		})
	});
}
//#endregion
export { Progress as t };
