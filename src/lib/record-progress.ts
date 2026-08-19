import { saveLessonProgress, saveProgressSnapshot } from "@/lib/progress-server";
import { useProgress } from "@/lib/progress-store";

export async function persistCompletion(
  id: string,
  quizScore: number,
  quizTotal: number,
  signedIn: boolean,
) {
  const xp = 8 + quizScore * 2;
  useProgress.getState().completeLesson(id, { quizScore, quizTotal, xp });
  if (!signedIn) return xp;
  try {
    await saveLessonProgress({
      data: { lessonId: id, quizScore, quizTotal, xp },
    });
    await saveProgressSnapshot({ data: useProgress.getState().snapshot() });
  } catch {
    /* local copy still saved */
  }
  return xp;
}
