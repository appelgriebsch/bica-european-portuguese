import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as cn } from "./utils-Bw7vb_GY.mjs";
import { c as useProgress } from "./progress-store-OAIB_sDh.mjs";
import { u as levels } from "./curriculum-iB0g1_qP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/start-level-jC_gpGbd.js
var import_jsx_runtime = require_jsx_runtime();
function StartLevelPicker({ label = "Start from" }) {
	const floor = useProgress((s) => s.floor);
	const setFloor = useProgress((s) => s.setFloor);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs font-medium uppercase tracking-wider text-muted",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-2 flex flex-wrap gap-2",
		children: levels.map((lv) => {
			const on = floor === lv.id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setFloor(lv.id),
				className: cn("min-h-11 rounded-[var(--radius-md)] px-4 text-sm font-medium transition-colors duration-[var(--motion-quick)]", on ? "bg-accent text-accent-fg" : "bg-surface text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"),
				children: lv.id
			}, lv.id);
		})
	})] });
}
//#endregion
export { StartLevelPicker as t };
