import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakPt } from "@/lib/tts";
import { cn } from "@/lib/utils";

export function SpeakButton({
  text,
  rate = 0.88,
  label = "Play pronunciation",
  className,
}: {
  text: string;
  rate?: number;
  label?: string;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      className={cn("text-accent hover:bg-soft", className)}
      onClick={(e) => {
        e.stopPropagation();
        speakPt(text, rate);
      }}
    >
      <Volume2 />
    </Button>
  );
}
