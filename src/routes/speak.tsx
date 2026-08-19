import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/speak")({
  component: () => <Outlet />,
});
