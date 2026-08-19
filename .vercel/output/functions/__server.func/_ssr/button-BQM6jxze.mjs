import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as Slot } from "../_libs/@radix-ui/react-primitive+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./utils-Bw7vb_GY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-BQM6jxze.js
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-[color,background-color,box-shadow,transform,opacity] duration-[var(--motion-quick)] ease-[var(--ease-out)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:bg-tile",
			secondary: "bg-surface-2 text-fg hover:bg-border",
			outline: "bg-surface text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			ghost: "text-fg hover:bg-surface-2",
			success: "bg-success text-success-fg hover:opacity-90",
			danger: "bg-danger text-danger-fg hover:opacity-90"
		},
		size: {
			default: "h-11 min-h-11 px-4",
			sm: "h-9 min-h-9 px-3 text-sm",
			lg: "h-12 min-h-12 px-5 text-base",
			icon: "size-11 min-h-11 min-w-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
export { Button as t };
