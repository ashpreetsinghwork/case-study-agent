export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-12 text-center sm:px-6">
        <p className="text-sm font-semibold text-foreground">Case Study Agent</p>
        <p className="text-sm text-muted-foreground">
          Organizes, drafts and reviews portfolio case studies.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Case Study Agent.
        </p>
      </div>
    </footer>
  );
}
