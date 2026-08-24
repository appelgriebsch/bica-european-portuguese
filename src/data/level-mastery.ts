import type { CefrLevel } from "./types";

export type LevelMastery = {
  id: CefrLevel;
  kicker: string;
  headline: string;
  phrase: { pt: string; en: string };
  image: string;
  canNow: string[];
};

/** What finishing a CEFR band on the path actually means you can do. */
export const levelMastery: Record<CefrLevel, LevelMastery> = {
  A1: {
    id: "A1",
    kicker: "Nível concluído",
    headline: "Survive the counter",
    phrase: { pt: "Uma bica, para aqui.", en: "An espresso, for here." },
    image: "/scenes/pastelaria.jpg",
    canNow: [
      "Greet by time of day, say your name, and thank with obrigado / obrigada.",
      "Count to twenty, catch a price, and find a floor or a street.",
      "Order a bica or a table — then ask for the bill.",
      "Buy a ticket and ask if this is the right stop.",
    ],
  },
  A2: {
    id: "A2",
    kicker: "Nível concluído",
    headline: "Hold a small talk",
    phrase: { pt: "Que tal amanhã?", en: "How about tomorrow?" },
    image: "/scenes/market.jpg",
    canNow: [
      "Talk about the weather, and what you did yesterday.",
      "Say what you do, then make a plan with vamos or que tal.",
      "Ask at the farmácia, and shop by the kilo.",
      "Use está a… and the pretérito — European, not the Brazilian -ndo.",
    ],
  },
  B1: {
    id: "B1",
    kicker: "Nível concluído",
    headline: "Follow the country",
    phrase: { pt: "Espero que corra bem.", en: "I hope it goes well." },
    image: "/scenes/radio.jpg",
    canNow: [
      "Tell a sixty-second story with two pasts — the scene, then the cut.",
      "Follow a news paragraph and a short radio bulletin.",
      "Start a Portuguese page without drowning on line one.",
      "Wish and doubt with espero que and a first subjunctive.",
    ],
  },
  B2: {
    id: "B2",
    kicker: "Nível concluído",
    headline: "Stay in the room",
    phrase: { pt: "Por um lado… por outro…", en: "On the one hand… on the other…" },
    image: "/scenes/books.jpg",
    canNow: [
      "Talk about feeling without leaning on the postcard of saudade.",
      "Read a compact page of literature and keep unknown words in their sentences.",
      "Disagree, hedge, and leave the door open.",
      "Hold a three-minute chat in a queue, then exit cleanly.",
    ],
  },
  C1: {
    id: "C1",
    kicker: "Nível concluído",
    headline: "The country at speed",
    phrase: { pt: "Ainda que não concorde, fico.", en: "Even if I don't agree, I'm staying." },
    image: "/scenes/dinner.jpg",
    canNow: [
      "Catch a bulletin at kitchen-radio speed — three facts, no rewind as a habit.",
      "Read a column and feel the turn in the last paragraph.",
      "Stay in an argument with ainda que and há quem diga.",
      "Hear the register of the room you are in, and match it.",
    ],
  },
};

export function masteryFor(level: CefrLevel): LevelMastery {
  return levelMastery[level];
}
