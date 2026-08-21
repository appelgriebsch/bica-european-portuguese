import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CefrLevel } from "@/data/types";
import { gradeCard, type SrsCard } from "@/lib/srs";
import { todayKey, yesterdayKey } from "@/lib/utils";

export type LessonResult = {
  quizScore: number;
  quizTotal: number;
  xp: number;
  completedAt: string;
};

export type ProgressSnapshot = {
  completed: Record<string, LessonResult>;
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  cards: Record<string, SrsCard>;
};

export type ProgressState = {
  completed: Record<string, LessonResult>;
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  floor: CefrLevel;
  cards: Record<string, SrsCard>;
  hydrated: boolean;
  lastSyncedAt: string | null;
  markHydrated: () => void;
  markSynced: () => void;
  setFloor: (level: CefrLevel) => void;
  completeLesson: (lessonId: string, result: Omit<LessonResult, "completedAt">) => void;
  gradeVocab: (cardId: string, knew: boolean) => void;
  touchStudy: (xp?: number) => void;
  mergeRemote: (remote: ProgressSnapshot) => void;
  snapshot: () => ProgressSnapshot;
};

function nextStreak(last: string | null, today: string): number {
  if (last === today) return -1;
  if (last === yesterdayKey()) return 1;
  return 0;
}

function applyStreak(
  lastStudyDate: string | null,
  streak: number,
  today: string,
): { streak: number; lastStudyDate: string } {
  const bump = nextStreak(lastStudyDate, today);
  return {
    lastStudyDate: today,
    streak: bump === -1 ? streak : bump === 1 ? streak + 1 : 1,
  };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      completed: {},
      xp: 0,
      streak: 0,
      lastStudyDate: null,
      floor: "A1",
      cards: {},
      hydrated: false,
      lastSyncedAt: null,
      markHydrated: () => set({ hydrated: true }),
      markSynced: () => set({ lastSyncedAt: new Date().toISOString() }),
      setFloor: (level) => set({ floor: level }),
      completeLesson: (lessonId, result) => {
        const today = todayKey();
        const prev = get();
        const existing = prev.completed[lessonId];
        const better =
          !existing || result.quizScore >= existing.quizScore
            ? {
                ...result,
                completedAt: new Date().toISOString(),
              }
            : existing;
        const deltaXp = existing ? Math.max(0, better.xp - existing.xp) : result.xp;
        const { streak, lastStudyDate } = applyStreak(
          prev.lastStudyDate,
          prev.streak,
          today,
        );
        set({
          completed: { ...prev.completed, [lessonId]: better },
          xp: prev.xp + deltaXp,
          streak,
          lastStudyDate,
        });
      },
      gradeVocab: (cardId, knew) => {
        const today = todayKey();
        const prev = get();
        set({
          cards: {
            ...prev.cards,
            [cardId]: gradeCard(prev.cards[cardId], knew, today),
          },
        });
      },
      touchStudy: (xp = 0) => {
        const today = todayKey();
        const prev = get();
        const { streak, lastStudyDate } = applyStreak(
          prev.lastStudyDate,
          prev.streak,
          today,
        );
        set({
          xp: prev.xp + xp,
          streak,
          lastStudyDate,
        });
      },
      mergeRemote: (remote) => {
        const local = get();
        const completed = { ...remote.completed };
        for (const [id, row] of Object.entries(local.completed)) {
          const other = completed[id];
          if (!other || row.quizScore > other.quizScore) completed[id] = row;
        }
        const cards = { ...(remote.cards ?? {}) };
        for (const [id, row] of Object.entries(local.cards)) {
          const other = cards[id];
          if (!other || row.reps > other.reps || (row.reps === other.reps && row.due > other.due)) {
            cards[id] = row;
          }
        }
        const xp = Math.max(local.xp, remote.xp);
        const streak = Math.max(local.streak, remote.streak);
        const lastStudyDate =
          (local.lastStudyDate ?? "") > (remote.lastStudyDate ?? "")
            ? local.lastStudyDate
            : remote.lastStudyDate;
        set({ completed, cards, xp, streak, lastStudyDate });
      },
      snapshot: () => {
        const s = get();
        return {
          completed: s.completed,
          xp: s.xp,
          streak: s.streak,
          lastStudyDate: s.lastStudyDate,
          cards: s.cards,
        };
      },
    }),
    {
      name: "bica.progress.v1",
      partialize: (s) => ({
        completed: s.completed,
        xp: s.xp,
        streak: s.streak,
        lastStudyDate: s.lastStudyDate,
        floor: s.floor,
        cards: s.cards,
      }),
      onRehydrateStorage: () => () => {
        useProgress.getState().markHydrated();
      },
    },
  ),
);
