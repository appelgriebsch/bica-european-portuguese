import { Loader2, Volume2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { speakPt, type SpeakVoice } from "@/lib/tts";
import { cn } from "@/lib/utils";

export function SpeakButton({
  text,
  rate = 0.88,
  voice = "eve",
  label = "Play pronunciation",
  className,
}: {
  text: string;
  rate?: number;
  voice?: SpeakVoice;
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      disabled={busy}
      className={cn("text-accent hover:bg-soft", className)}
      onClick={(e) => {
        e.stopPropagation();
        setBusy(true);
        void speakPt(text, rate, voice).finally(() => setBusy(false));
      }}
    >
      {busy ? <Loader2 className="animate-spin" /> : <Volume2 />}
    </Button>
  );
}
