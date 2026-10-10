import Link from "next/link";
import { UploadSimple } from "@phosphor-icons/react/dist/ssr";

export function UploadStart() {
  return (
    <Link
      href="/new"
      className="group mx-auto flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-8 py-12 text-center transition-colors hover:border-primary"
    >
      <UploadSimple size={28} className="text-primary" />
      <p className="text-base font-medium text-foreground">
        Drop your notes, decks or screenshots
      </p>
      <p className="text-sm text-muted-foreground">
        or click to start with a blank project
      </p>
    </Link>
  );
}
