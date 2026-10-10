export function StickyNote({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-sm text-foreground">
      <p>{text}</p>
    </div>
  );
}
