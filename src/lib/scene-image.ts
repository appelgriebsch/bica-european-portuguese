/**
 * Map a dialogue / scenario setting string (or free-form place description)
 * to a local scene illustration under /scenes/*.
 * Prefer the lightweight branded SVGs; fall back to the photo JPGs when useful.
 */
export function sceneImageFor(setting: string): string {
  const s = setting.toLowerCase();

  // Food & drink counters
  if (
    s.includes("pastelaria") ||
    (s.includes("bar") && (s.includes("rain") || s.includes("bica"))) ||
    (s.includes("counter") && s.includes("pastel"))
  ) {
    return "/scenes/pastelaria.svg";
  }
  if (s.includes("padaria") || s.includes("bakery")) {
    return "/scenes/padaria.svg";
  }
  if (s.includes("tasca")) {
    return "/scenes/tasca.svg";
  }
  if (
    s.includes("dinner") ||
    s.includes("jantar") ||
    s.includes("arroios") ||
    (s.includes("table") &&
      (s.includes("vinho") || s.includes("housing") || s.includes("lisbon is")))
  ) {
    return "/scenes/dinner.svg";
  }
  if (
    (s.includes("table") && s.includes("outside")) ||
    s.includes("terrace") ||
    (s.includes("glasses") && s.includes("vinho"))
  ) {
    return "/scenes/terrace.svg";
  }

  // Shops & services
  if (
    s.includes("farmácia") ||
    s.includes("farmacia") ||
    s.includes("pharmacist") ||
    s.includes("chemist")
  ) {
    return "/scenes/farmacia.svg";
  }
  if (
    s.includes("mercado") ||
    s.includes("stall") ||
    s.includes("olives") ||
    s.includes("ribeira")
  ) {
    return "/scenes/market.svg";
  }
  if (
    s.includes("ticket") ||
    s.includes("museum") ||
    s.includes("bilhete") ||
    s.includes("desk")
  ) {
    return "/scenes/ticket.svg";
  }
  if (
    s.includes("book") ||
    s.includes("novel") ||
    s.includes("page") ||
    s.includes("bookshop")
  ) {
    return "/scenes/books.jpg";
  }

  // Home / building (before street so "Alfama building" / stairwell wins)
  if (
    s.includes("stairwell") ||
    s.includes("neighbour") ||
    s.includes("next door")
  ) {
    return "/scenes/stairwell.svg";
  }
  if (
    s.includes("doorway") ||
    s.includes("lift") ||
    s.includes("viewing") ||
    s.includes("santos")
  ) {
    return "/scenes/doorway.svg";
  }
  if (s.includes("balcony")) {
    return "/scenes/balcony.svg";
  }

  // Streets, transport, viewpoints
  if (
    s.includes("eléctrico") ||
    s.includes("eletrico") ||
    s.includes("tram") ||
    s.includes("28") ||
    s.includes("shelter") ||
    s.includes("castelo") ||
    s.includes("castle")
  ) {
    return "/scenes/tram.jpg";
  }
  if (s.includes("miradouro") || (s.includes("bench") && s.includes("chat"))) {
    return "/scenes/miradouro.svg";
  }
  if (s.includes("street") || s.includes("steep") || s.includes("alfama")) {
    return "/scenes/street.svg";
  }

  // Work & media
  if (
    s.includes("office") ||
    s.includes("kitchenette") ||
    s.includes("colleague") ||
    (s.includes("lunch") && s.includes("colleague"))
  ) {
    return "/scenes/office.svg";
  }
  if (
    s.includes("phone") ||
    s.includes("voice note") ||
    s.includes("texting") ||
    s.includes("interview") ||
    s.includes("saudade")
  ) {
    return "/scenes/phone.svg";
  }
  if (
    s.includes("radio") ||
    s.includes("bulletin") ||
    s.includes("kitchen radio") ||
    s.includes("news")
  ) {
    return "/scenes/kitchen-radio.svg";
  }
  if (s.includes("café") || s.includes("cafe") || s.includes("column")) {
    return "/scenes/cafe.jpg";
  }

  // Generic fallback — a Lisbon street feels neutral for mixed settings
  return "/scenes/street.svg";
}
