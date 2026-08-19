/**
 * Deployed-app (Nitro) handler for `GET /auth/popup`.
 *
 * Dev / live preview already serves this path via the Vite `authPopupPlugin`.
 * Published apps on a custom domain can still be framed (Grok chrome), and a
 * React route at this path would paint the full app in the popup — so this
 * middleware is the production twin of the Vite plugin: 302 to the broker, then
 * a tiny completion page that posts the session bearer back.
 */
import { handleAuthPopupRequest } from "../../src/lib/auth/popup.server";

interface AuthPopupEvent {
  url: URL;
  req: Request;
}

function publicRequest(event: AuthPopupEvent): Request {
  const forwardedHost = event.req.headers.get("x-forwarded-host");
  const host =
    (forwardedHost ?? event.req.headers.get("host") ?? event.url.host)
      .split(",")[0]
      ?.trim() || event.url.host;
  const proto = (
    event.req.headers.get("x-forwarded-proto") ??
    event.url.protocol.replace(/:$/, "") ??
    "https"
  )
    .split(",")[0]
    ?.trim() || "https";
  const url = `${proto}://${host}${event.url.pathname}${event.url.search}`;
  return new Request(url, {
    method: "GET",
    headers: event.req.headers,
  });
}

export default async function authPopupMiddleware(
  event: AuthPopupEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  if (event.url.pathname !== "/auth/popup") return next();
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return handleAuthPopupRequest(publicRequest(event));
}
