export type CefrLevel = "A1" | "A2" | "B1" | "B2";

export type Skill = "speak" | "listen" | "read" | "mix";

export type VocabItem = {
  pt: string;
  hint: string;
  en: string;
  examplePt: string;
  exampleEn: string;
};

export type QuizQuestion = {
  id: string;
  kind: "choice" | "truefalse" | "listen";
  prompt: string;
  speak?: string;
  options: string[];
  answer: number;
  explain: string;
};

export type LessonSection =
  | {
      type: "intro";
      kicker: string;
      title: string;
      body: string;
      phrase: { pt: string; en: string };
    }
  | { type: "vocab"; items: VocabItem[] }
  | {
      type: "grammar";
      title: string;
      body: string;
      examples: { pt: string; en: string }[];
    }
  | {
      type: "dialogue";
      setting: string;
      lines: { speaker: string; pt: string; en: string }[];
    }
  | { type: "culture"; title: string; body: string };

export type Lesson = {
  id: string;
  level: CefrLevel;
  unitId: string;
  unit: string;
  order: number;
  minutes: number;
  title: string;
  titlePt: string;
  skill: Skill;
  summary: string;
  goals: string[];
  image: string;
  sections: LessonSection[];
  quiz: QuizQuestion[];
};

export type Unit = {
  id: string;
  level: CefrLevel;
  title: string;
  titlePt: string;
  blurb: string;
  image: string;
};

export type SpeakScenario = {
  id: string;
  level: CefrLevel;
  minutes: number;
  title: string;
  titlePt: string;
  setting: string;
  partner: string;
  openerPt: string;
  openerEn: string;
  goals: string[];
  image: string;
};
