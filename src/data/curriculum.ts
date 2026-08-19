import { a1Lessons } from "./a1";
import { a2Lessons } from "./a2";
import { b1Lessons } from "./b1";
import { b2Lessons } from "./b2";
import { radioBulletins } from "./radio";
import { readingPieces } from "./reading";
import { speakScenarios } from "./scenarios";
import type { CefrLevel, Lesson, RadioBulletin, ReadingPiece, Unit } from "./types";

export const levels: { id: CefrLevel; title: string; blurb: string }[] = [
  {
    id: "A1",
    title: "Survive the counter",
    blurb: "Greet, order, count, and ask where you are. The first week in Portugal.",
  },
  {
    id: "A2",
    title: "Hold a small talk",
    blurb: "Weather, yesterday, plans, the chemist, the market — conversations that last two minutes.",
  },
  {
    id: "B1",
    title: "Follow the country",
    blurb: "Stories with two pasts, a news paragraph, the radio, a page of a book, a first subjunctive.",
  },
  {
    id: "B2",
    title: "Stay in the room",
    blurb: "Feeling, literature, disagreement, and the queue that turns into a chat.",
  },
];

export const units: Unit[] = [
  {
    id: "a1-first",
    level: "A1",
    title: "First words",
    titlePt: "Primeiras palavras",
    blurb: "Hello, names, numbers, people.",
    image: "/scenes/cafe.jpg",
  },
  {
    id: "a1-city",
    level: "A1",
    title: "In the city",
    titlePt: "Na cidade",
    blurb: "Coffee, streets, time, tickets, a table.",
    image: "/scenes/tram.jpg",
  },
  {
    id: "a2-talk",
    level: "A2",
    title: "Daily talk",
    titlePt: "Conversas do dia",
    blurb: "Weather, the past, opinions.",
    image: "/scenes/cafe.jpg",
  },
  {
    id: "a2-life",
    level: "A2",
    title: "Out in life",
    titlePt: "Ir à vida",
    blurb: "Plans, health, shopping.",
    image: "/scenes/tram.jpg",
  },
  {
    id: "b1-listen-read",
    level: "B1",
    title: "Listen & read",
    titlePt: "Ouvir e ler",
    blurb: "Stories, news, radio, books.",
    image: "/scenes/radio.jpg",
  },
  {
    id: "b1-nuance",
    level: "B1",
    title: "Nuance",
    titlePt: "Matizes",
    blurb: "Hope, doubt, the subjunctive.",
    image: "/scenes/books.jpg",
  },
  {
    id: "b2-fluent",
    level: "B2",
    title: "Fluency",
    titlePt: "Fluência",
    blurb: "Feeling, pages, argument, the street.",
    image: "/scenes/books.jpg",
  },
];

export const lessons: Lesson[] = [
  ...a1Lessons,
  ...a2Lessons,
  ...b1Lessons,
  ...b2Lessons,
];

export { speakScenarios, radioBulletins, readingPieces };

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function getBulletin(id: string): RadioBulletin | undefined {
  return radioBulletins.find((b) => b.id === id);
}

export function getReading(id: string): ReadingPiece | undefined {
  return readingPieces.find((p) => p.id === id);
}

export function lessonsForLevel(level: CefrLevel): Lesson[] {
  return lessons.filter((l) => l.level === level);
}

export function nextLesson(id: string): Lesson | undefined {
  const i = lessons.findIndex((l) => l.id === id);
  if (i < 0 || i === lessons.length - 1) return undefined;
  return lessons[i + 1];
}

export function firstIncomplete(completedIds: Set<string>): Lesson {
  return lessons.find((l) => !completedIds.has(l.id)) ?? lessons[lessons.length - 1]!;
}

export function firstIncompleteOf<T extends { id: string; level: CefrLevel }>(
  items: T[],
  completedIds: Set<string>,
  prefer?: CefrLevel,
): T {
  if (prefer) {
    const inLevel = items.find((i) => i.level === prefer && !completedIds.has(i.id));
    if (inLevel) return inLevel;
  }
  return items.find((i) => !completedIds.has(i.id)) ?? items[items.length - 1]!;
}

export function estimatedLevel(completedIds: Set<string>): CefrLevel {
  const found = [...levels].reverse().find((lv) => {
    const inLevel = lessons.filter((l) => l.level === lv.id);
    const done = inLevel.filter((l) => completedIds.has(l.id)).length;
    return done >= Math.ceil(inLevel.length * 0.5);
  });
  return found?.id ?? "A1";
}

export function vocabFromCompleted(completedIds: string[]) {
  return lessons
    .filter((l) => completedIds.includes(l.id))
    .flatMap((l) =>
      l.sections.flatMap((s) => (s.type === "vocab" ? s.items : [])),
    );
}

export const totalMinutes = lessons.reduce((n, l) => n + l.minutes, 0);
