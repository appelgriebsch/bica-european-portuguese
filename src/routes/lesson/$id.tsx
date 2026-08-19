import { createFileRoute } from "@tanstack/react-router";
import { LessonPlayer } from "@/components/lesson-player";

export const Route = createFileRoute("/lesson/$id")({
  component: LessonPage,
});

function LessonPage() {
  const { id } = Route.useParams();
  return <LessonPlayer id={id} />;
}
