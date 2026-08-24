/**
 * Single source of truth for platform head chrome (PWA, extensions.js, OG),
 * shared by the Vite plugin and Nitro middleware. Plain ESM so `node --test`
 * and the Nitro bundler can both consume it.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const DEFAULT_APP_NAME = "Grok App";
export const OG_SERVICE_URL_DEFAULT = "https://og.grok.me";
export const OG_SITE_REL_PATH = "src/lib/og/site.json";

const SHARE_META_KEYS = new Set([
  "og:title",
  "og:description",
  "og:image",
  "og:image:width",
  "og:image:height",
  "og:type",
  "og:url",
  "og:site_name",
  "twitter:card",
  "twitter:title",
  "twitter:image",
  "twitter:description",
  "x:game:image",
  "x:game:image:width",
  "x:game:image:height",
]);

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', """)
    .replaceAll("'", "&#39;");
}

function unescapeHtml(value) {
  return String(value)
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll(""", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&", "&");
}

function placeholderCardColor(site = {}) {
  const raw = String(site.color ?? "").trim();
  const hex = raw.startsWith("#") ? raw.slice(1) : raw;
  return /^[0-9a-fA-F]{6}$/.test(hex) ? hex : "";
}

export function appNameFromHost(hostHeader) {
  const host = String(hostHeader ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
  if (!host.endsWith(".grok.me")) {
    return DEFAULT_APP_NAME;
  }
  const slug = host.split(".")[0] ?? "";
  if (!slug || slug === "www" || !/^[a-z0-9-]{1,63}$/.test(slug)) {
    return DEFAULT_APP_NAME;
  }
  return (
    slug
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || DEFAULT_APP_NAME
  );
}

function isVercelSystemHost(host) {
  return (
    host.endsWith(".vercel.app") ||
    host.endsWith(".vercel.sh") ||
    host === "localhost" ||
    host.startsWith("127.")
  );
}

function publicAppHost(value) {
  const host = String(value ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
  if (!host || isVercelSystemHost(host)) return "";
  return host;
}

export function resolvePublicHost(hostHeader) {
  return (
    publicAppHost(process.env?.VITE_PUBLIC_HOSTNAME) || publicAppHost(hostHeader)
  );
}

export function isInstallQuery(url) {
  const query = String(url ?? "").split("?", 2)[1] ?? "";
  const params = new URLSearchParams(query);
  const install = params.get("install");
  const platform = (params.get("platform") ?? "").toLowerCase();
  return (install === "1" || install === "true") && platform === "ios";
}

export function isDocumentPath(pathname) {
  const path = String(pathname ?? "");
  return (
    !path.startsWith("/__grok/") &&
    !path.startsWith("/api/") &&
    !path.startsWith("/@") &&
    !path.startsWith("/node_modules") &&
    !/\.[a-z0-9]+$/i.test(path)
  );
}

export function acceptsHtml(accept) {
  const value = String(accept ?? "");
  return value === "" || value.includes("text/html") || value.includes("*/*");
}

export function stripInstallParams(url) {
  const [path = "/", query = ""] = String(url ?? "/").split("?", 2);
  const params = new URLSearchParams(query);
  params.delete("install");
  params.delete("platform");
  const rest = params.toString();
  return rest ? `${path}?${rest}` : path;
}

export function renderInstallPageHtml(template, { host, url } = {}) {
  return String(template)
    .replaceAll("{{APP_NAME}}", escapeHtml(appNameFromHost(host)))
    .replaceAll("{{APP_URL}}", escapeHtml(stripInstallParams(url)));
}

export function renderWebManifest(hostHeader, options = {}) {
  const fromSite = String(options.title ?? "").trim();
  const fromHost = appNameFromHost(hostHeader);
  const name =
    fromSite ||
    (fromHost && fromHost !== DEFAULT_APP_NAME ? fromHost : "") ||
    DEFAULT_APP_NAME;
  const shortName = String(options.shortName ?? name).trim() || name;
  let themeColor = String(options.themeColor ?? "").trim();
  if (!themeColor) themeColor = "#000000";
  else if (!themeColor.startsWith("#")) themeColor = `#${themeColor}`;
  const backgroundColor = String(options.backgroundColor ?? themeColor).trim() || themeColor;
  return JSON.stringify(
    {
      name,
      short_name: shortName,
      id: "/",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: backgroundColor,
      theme_color: themeColor,
      icons: [
        {
          src: "/__grok/icon-180.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    null,
    2,
  );
}

export function grokPwaHeadTags(appName = DEFAULT_APP_NAME, themeColor = "#000000") {
  let color = String(themeColor ?? "#000000").trim() || "#000000";
  if (!color.startsWith("#")) color = `#${color}`;
  return [
    ["manifest", '<link rel="manifest" href="/__grok/manifest.webmanifest">'],
    ["apple-touch-icon", '<link rel="apple-touch-icon" href="/__grok/icon-180.png">'],
    [
      "apple-mobile-web-app-title",
      `<meta name="apple-mobile-web-app-title" content="${escapeHtml(appName)}">`,
    ],
    [
      "apple-mobile-web-app-status-bar-style",
      '<meta name="apple-mobile-web-app-status-bar-style" content="black">',
    ],
    ["theme-color", `<meta name="theme-color" content="${escapeHtml(color)}">`],
  ];
}

export function ogServiceUrl() {
  const fromEnv = String(process.env?.VITE_OG_SERVICE_URL ?? "").trim();
  return (fromEnv || OG_SERVICE_URL_DEFAULT).replace(/\/+$/, "");
}

export function titleFromDocument(html) {
  const match = String(html ?? "").match(/<title\b[^>]*>([^<]*)<\/title>/i);
  return match ? unescapeHtml(match[1]).trim() : "";
}

export function resolveOgTitle(
  site = {},
  appName = DEFAULT_APP_NAME,
  host = "",
  documentTitle = "",
) {
  const fromSite = String(site.title ?? "").trim();
  if (fromSite) return fromSite;
  const fromDoc = String(documentTitle ?? "").trim();
  if (fromDoc) return fromDoc;
  const fromHost = appNameFromHost(host);
  if (fromHost && fromHost !== DEFAULT_APP_NAME) return fromHost;
  const fromArg = String(appName ?? "").trim();
  return fromArg || DEFAULT_APP_NAME;
}

export function siteHasCustomCard(site = {}) {
  return String(site.card ?? "").toLowerCase() === "custom";
}

function ogCardPublicPath(cwd = process.cwd()) {
  for (const name of ["og.jpg", "og.png"]) {
    const abs = join(cwd, "public", name);
    if (existsSync(abs)) return `/${name}`;
  }
  return "";
}

function detectCustomOgCard(cwd, site) {
  return Boolean(ogCardPublicPath(cwd) || siteHasCustomCard(site));
}

export function resolveOgCardAsset(site = {}, cwd = process.cwd()) {
  return ogCardPublicPath(cwd) || (detectCustomOgCard(cwd, site) ? String(site.image ?? "").trim() || "/og.jpg" : "");
}

function applyCustomCardFromFs(site, cwd) {
  const disk = ogCardPublicPath(cwd);
  if (!disk) return site;
  return { ...site, card: "custom", image: disk };
}

export function grokOgHeadTags({
  host = "",
  appName = DEFAULT_APP_NAME,
  site = {},
  documentTitle = "",
  cwd = process.cwd(),
} = {}) {
  const title = resolveOgTitle(site, appName, host, documentTitle);
  const publicHost = resolvePublicHost(host);
  const tags = [
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
  ];
  const description = String(site.description ?? "").trim();
  if (description) {
    tags.push(`<meta property="og:description" content="${escapeHtml(description)}">`);
    tags.push(`<meta name="twitter:description" content="${escapeHtml(description)}">`);
  }
  const cardAsset = resolveOgCardAsset(site, cwd);
  if (cardAsset && publicHost) {
    const abs = cardAsset.startsWith("http") ? cardAsset : `https://${publicHost}${cardAsset}`;
    tags.push(`<meta property="og:image" content="${escapeHtml(abs)}">`);
    tags.push(`<meta name="twitter:image" content="${escapeHtml(abs)}">`);
  } else if (publicHost) {
    const color = placeholderCardColor(site);
    const qs = new URLSearchParams({ host: publicHost, title });
    if (color) qs.set("color", color);
    const placeholder = `${ogServiceUrl()}/v1/card.png?${qs}`;
    tags.push(`<meta property="og:image" content="${escapeHtml(placeholder)}">`);
    tags.push(`<meta name="twitter:image" content="${escapeHtml(placeholder)}">`);
  }
  tags.push(`<meta name="twitter:title" content="${escapeHtml(title)}">`);
  return tags;
}

export function snapshotOgIdentity(cwd = process.cwd()) {
  const sitePath = join(cwd, OG_SITE_REL_PATH);
  let site = {};
  if (existsSync(sitePath)) {
    try {
      site = JSON.parse(readFileSync(sitePath, "utf8"));
    } catch {
      site = {};
    }
  }
  return { site: applyCustomCardFromFs(site, cwd) };
}

function readGrokProjectId() {
  return String(process.env?.VITE_PROJECT_ID ?? "").trim();
}

function readXCreator() {
  return String(process.env?.VITE_X_CREATOR ?? "").trim();
}

function readXCreatorId() {
  return String(process.env?.VITE_X_CREATOR_ID ?? "").trim();
}

function stripShareMetaTags(html) {
  return String(html).replace(
    /<meta\b[^>]*(?:property|name)=["'](?:og:|twitter:|x:game:)[^"']*["'][^>]*>\s*/gi,
    "",
  );
}

function insertAfterHeadOpen(html, snippet) {
  return String(html).replace(/<head\b[^>]*>/i, (m) => `${m}\n${snippet}`);
}

export function normalizeHeadContext(ctx = {}) {
  const cwd = ctx.cwd ?? process.cwd();
  const site = applyCustomCardFromFs(
    ctx.site !== undefined ? ctx.site : snapshotOgIdentity(cwd).site,
    cwd,
  );
  const appName = resolveOgTitle(site, ctx.appName ?? DEFAULT_APP_NAME, ctx.host ?? "");
  return {
    appName,
    projectId: ctx.projectId ?? readGrokProjectId(),
    creator: ctx.creator ?? readXCreator(),
    creatorId: ctx.creatorId ?? readXCreatorId(),
    host: ctx.host ?? "",
    cwd,
    site,
  };
}

export function injectGrokPwaHead(html, ctx = {}) {
  if (typeof html !== "string") return html;
  const { site, projectId, creator, creatorId, host, cwd } = normalizeHeadContext(ctx);
  const documentTitle = titleFromDocument(html);
  const appName = resolveOgTitle(
    site,
    ctx.appName ?? DEFAULT_APP_NAME,
    host,
    documentTitle,
  );
  let next = stripShareMetaTags(html);

  const themeColor = String(site.color ?? "").trim() || "#000000";
  const missing = grokPwaHeadTags(appName, themeColor)
    .filter(([key]) => {
      if (key === "manifest") return !next.includes('href="/__grok/manifest.webmanifest"');
      if (key === "apple-touch-icon") return !next.includes('href="/__grok/icon-180.png"');
      return !next.includes(
        key === "apple-mobile-web-app-title"
          ? 'name="apple-mobile-web-app-title"'
          : key === "theme-color"
            ? 'name="theme-color"'
            : key,
      );
    })
    .map(([, tag]) => tag);

  const ogTags = grokOgHeadTags({ host, appName, site, documentTitle, cwd });
  const snippet = [...missing, ...ogTags].join("\n");
  if (!snippet) return next;
  return insertAfterHeadOpen(next, snippet);
}

export function createHeadInjector(ctx = {}) {
  let buffer = "";
  let done = false;
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  return {
    push(chunk) {
      if (done) return [chunk];
      buffer += decoder.decode(chunk, { stream: true });
      if (!/<\/head>/i.test(buffer) && buffer.length < 512_000) return [];
      done = true;
      const html = injectGrokPwaHead(buffer, ctx);
      buffer = "";
      return [encoder.encode(html)];
    },
    flush() {
      if (!buffer) return [];
      done = true;
      const html = injectGrokPwaHead(buffer, ctx);
      buffer = "";
      return [encoder.encode(html)];
    },
  };
}
