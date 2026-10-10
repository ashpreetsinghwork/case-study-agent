"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Folders, List, SignOut, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/auth/avatar";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "#pipeline", label: "How it works" },
  { href: "#outputs", label: "What you get" },
  { href: "#review", label: "Review panel" },
];

export function Nav() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // "/" is the one public page, so unlike the app pages (AuthBar), this
  // nav has to work for both signed-in and signed-out visitors — hence
  // checking the session client-side instead of assuming one exists.
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await createClient().auth.signOut();
    setOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Case Study Agent
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center lg:flex">
          {email ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Account menu"
                  className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Avatar email={email} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/projects">
                    <Folders size={14} />
                    My case studies
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleSignOut}>
                  <SignOut size={14} />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="h-9 px-4">
              <Link href="/new">Start your case study</Link>
            </Button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-foreground lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-4 pb-6 lg:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          {email ? (
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              <span className="flex min-w-0 items-center gap-2 px-1 pb-1">
                <Avatar email={email} />
                <span className="truncate text-sm text-foreground">{email}</span>
              </span>
              <Button asChild variant="outline" className="h-9 w-full justify-start">
                <Link href="/projects" onClick={() => setOpen(false)}>
                  <Folders size={14} />
                  My case studies
                </Link>
              </Button>
              <Button variant="ghost" className="h-9 w-full justify-start" onClick={handleSignOut}>
                <SignOut size={14} />
                Logout
              </Button>
            </div>
          ) : (
            <Button asChild className="mt-4 h-9 w-full">
              <Link href="/new">Start your case study</Link>
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
