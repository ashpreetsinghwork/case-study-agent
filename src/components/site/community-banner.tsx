"use client";

import { Button } from "@/components/ui/button";
import { getAnonId } from "@/lib/anon-id";

const WHATSAPP_URL = "https://chat.whatsapp.com/Khyvbu8QxHY4GgzKhZ2Csj";

const AVATARS = [
  { letter: "R", gradient: "from-primary/80 to-primary" },
  { letter: "A", gradient: "from-amber-400/80 to-amber-600" },
  { letter: "S", gradient: "from-emerald-400/80 to-emerald-600" },
  { letter: "M", gradient: "from-sky-400/80 to-sky-600" },
  { letter: "P", gradient: "from-fuchsia-400/80 to-fuchsia-600" },
  { letter: "J", gradient: "from-rose-400/80 to-rose-600" },
] as const;

function FloatingAvatars({ large }: { large: boolean }) {
  return (
    <div className="flex -space-x-3" aria-hidden>
      {AVATARS.map(({ letter, gradient }, i) => (
        <span
          key={letter}
          style={{ animationDelay: `${i * 0.3}s` }}
          className={`animate-avatar-float flex items-center justify-center rounded-full border-2 border-background bg-gradient-to-br font-semibold text-white shadow-sm ${gradient} ${
            large ? "size-12 text-sm" : "size-9 text-xs"
          }`}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}

function openWhatsApp() {
  window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
}

function logClick(source: "homepage" | "score", cta: "join" | "already_in") {
  fetch("/api/community/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, cta, sessionId: getAnonId() }),
    keepalive: true,
  }).catch(() => {});
}

export function CommunityBanner({
  size = "compact",
  source,
  onContinue,
}: {
  size?: "compact" | "full";
  source: "homepage" | "score";
  onContinue?: () => void;
}) {
  const large = size === "full";

  function handleJoin() {
    logClick(source, "join");
    openWhatsApp();
    onContinue?.();
  }

  function handleAlreadyIn() {
    logClick(source, "already_in");
    onContinue?.();
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-border bg-card text-center shadow-[0_24px_60px_-20px_rgba(0,0,0,0.15)] ${
        large ? "mx-auto max-w-4xl px-8 py-14 sm:px-16" : "px-6 py-10 sm:px-10"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent"
      />
      <div className="flex justify-center">
        <FloatingAvatars large={large} />
      </div>
      <h2
        className={`mt-5 font-semibold text-balance text-foreground ${
          large ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"
        }`}
      >
        Join The Convergence community on WhatsApp
      </h2>
      <p
        className={`mx-auto mt-3 max-w-[46ch] text-pretty text-muted-foreground ${
          large ? "text-base" : "text-sm"
        }`}
      >
        Get guidance on designing for a post-AI world and find fellow
        designers working on their portfolios right alongside you &mdash;
        it&apos;s free.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          size={large ? "lg" : "default"}
          className={large ? "h-11 px-6 text-base" : ""}
          onClick={handleJoin}
        >
          Join community
        </Button>
        <Button
          variant="outline"
          size={large ? "lg" : "default"}
          className={large ? "h-11 px-6 text-base" : ""}
          onClick={handleAlreadyIn}
        >
          I&apos;m already in
        </Button>
      </div>
    </div>
  );
}
