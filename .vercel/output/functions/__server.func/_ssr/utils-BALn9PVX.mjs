import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-BALn9PVX.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function greetingForHour(hour) {
	if (hour < 12) return {
		pt: "Bom dia",
		en: "Good morning"
	};
	if (hour < 20) return {
		pt: "Boa tarde",
		en: "Good afternoon"
	};
	return {
		pt: "Boa noite",
		en: "Good evening"
	};
}
function todayKey(d = /* @__PURE__ */ new Date()) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function yesterdayKey(d = /* @__PURE__ */ new Date()) {
	const y = new Date(d);
	y.setDate(y.getDate() - 1);
	return todayKey(y);
}
//#endregion
export { yesterdayKey as i, greetingForHour as n, todayKey as r, cn as t };
