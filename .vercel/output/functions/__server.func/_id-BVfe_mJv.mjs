import { n as require_jsx_runtime } from "./_libs/radix-ui__react-context+react.mjs";
import { a as Route$5 } from "./_ssr/router-DbDlD8tM.mjs";
import { n as LessonPlayer } from "./_ssr/lesson-player-BCZA5rDy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-BVfe_mJv.js
var import_jsx_runtime = require_jsx_runtime();
function LessonPage() {
	const { id } = Route$5.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LessonPlayer, { id });
}
//#endregion
export { LessonPage as component };
