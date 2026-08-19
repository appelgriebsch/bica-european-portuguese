import { create } from "zustand";
import { persist } from "zustand/middleware";
import { todayKey, yesterdayKey } from "@/lib/utils";

export type LessonResult = {
  quizScore: number;
  quizTotal: number;
  xp: number;
  completedAt: string;
};

export type ProgressState = {
  completed: Record<string, LessonResult>;
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  hydrated: boolean;
  markHydrated: () => void;
  completeLesson: (lessonId: string, result: Omit<LessonResult, "completedAt">) => void;
  mergeRemote: (remote: {
    completed: Record<string, LessonResult>;
    xp: number;
    streak: number;
    lastStudyDate: string | null;
  }) => void;
  snapshot: () => {
    completed: Record<string, LessonResult>;
    xp: number;
    streak: number;
    lastStudyDate: string | null;
  };
};

function nextStreak(last: string | null, today: string): number {
  if (last === today) return -1;
  if (last === yesterdayKey()) return 1;
  return 0;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      completed: {},
      xp: 0,
      streak: 0,
      lastStudyDate: null,
      hydrated: false,
      markHydrated: () => set({ hydrated: true }),
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
        const streakBump = nextStreak(prev.lastStudyDate, today);
        const streak =
          streakBump === -1
            ? prev.streak
            : streakBump === 1
              ? prev.streak + 1
              : 1;
        set({
          completed: { ...prev.completed, [lessonId]: better },
          xp: prev.xp + deltaXp,
          streak,
          lastStudyDate: today,
        });
      },
      mergeRemote: (remote) => {
        const local = get();
        const completed = { ...remote.completed };
        for (const [id, row] of Object.entries(local.completed)) {
          const other = completed[id];
          if (!other || row.quizScore > other.quizScore) completed[id] = row;
        }
        const xp = Math.max(local.xp, remote.xp);
        const streak = Math.max(local.streak, remote.streak);
        const lastStudyDate =
          (local.lastStudyDate ?? "") > (remote.lastStudyDate ?? "")
            ? local.lastStudyDate
            : remote.lastStudyDate;
        set({ completed, xp, streak, lastStudyDate });
      },
      snapshot: () => {
        const s = get();
        return {
          completed: s.completed,
          xp: s.xp,
          streak: s.streak,
          lastStudyDate: s.lastStudyDate,
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
      }),
      onRehydrateStorage: () => () => {
        useProgress.getState().markHydrated();
      },
    },
  ),
);
