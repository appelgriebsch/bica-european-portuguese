import { cn } from "@/lib/utils";

/** Lisbon tile mark — same artwork as `/favicon.svg`. */
export function AzulejoMark({
  className,
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <img
      src="/favicon.svg"
      alt={title ?? ""}
      width={32}
      height={32}
      draggable={false}
      className={cn("size-8 shrink-0", className)}
    />
  );
}
