/**
 * Map a dialogue / scenario setting string to a local scene image under /scenes/*.
 * Only the four photo JPGs are currently served on production; the branded SVGs
 * exist in the repo but have not been deployed yet. Prefer the photos so the
 * illustration is always visible.
 */
export function sceneImageFor(setting: string): string {
  const s = setting.toLowerCase();

  // Transport & streets
  if (
    s.includes("eléctrico") ||
    s.includes("eletrico") ||
    s.includes("tram") ||
    s.includes("28") ||
    s.includes("shelter") ||
    s.includes("castelo") ||
    s.includes("castle") ||
    s.includes("street") ||
    s.includes("steep") ||
    s.includes("alfama") ||
    s.includes("miradouro") ||
    s.includes("ticket") ||
    s.includes("museum") ||
    s.includes("bilhete") ||
    s.includes("desk")
  ) {
    return "/scenes/tram.jpg";
  }

  // Books / reading
  if (
    s.includes("book") ||
    s.includes("novel") ||
    s.includes("page") ||
    s.includes("bookshop") ||
    s.includes("column") ||
    s.includes("article")
  ) {
    return "/scenes/books.jpg";
  }

  // Radio / news
  if (
    s.includes("radio") ||
    s.includes("bulletin") ||
    s.includes("kitchen radio") ||
    s.includes("news")
  ) {
    return "/scenes/radio.jpg";
  }

  // Default: café / counter / home / work / phone / dinner — the warm café photo
  return "/scenes/cafe.jpg";
}
