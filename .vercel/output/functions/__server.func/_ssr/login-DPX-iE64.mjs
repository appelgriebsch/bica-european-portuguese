import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as GROK_PROVIDERS } from "./server-DdNaffjW.mjs";
import { r as signIn } from "./client-sGid3STf.mjs";
import { t as Button } from "./button-By_6vfry.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-DPX-iE64.js
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-dvh bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "azulejo-band h-2 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid min-h-[calc(100dvh-8px)] max-w-md content-center px-6 py-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mb-8 font-display text-2xl font-medium text-fg no-underline",
					children: "Bica"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight",
					children: "Keep your streak."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-muted",
					children: "Sign in to save progress, sync across devices, and practise speaking with a Lisbon conversation partner."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 space-y-3",
					children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						className: "h-12 w-full",
						onClick: () => signIn(p.providerId, { callbackURL: "/" }),
						children: ["Continue with ", p.label]
					}, p.providerId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm text-subtle",
					children: "Lessons work without an account. Progress stays on this device until you sign in."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-4 inline-block text-sm font-medium text-accent no-underline hover:underline",
					children: "Continue as guest"
				})
			]
		})]
	});
}
//#endregion
export { Login as component };
