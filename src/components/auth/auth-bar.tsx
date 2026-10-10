import { createClient } from "@/lib/supabase/server";
import { getUserQuota } from "@/lib/quota";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Avatar } from "@/components/auth/avatar";

// Minimal navbar for the two authenticated pages (/new and
// /projects/[id]) — middleware already guarantees a session exists by the
// time either page renders.
export async function AuthBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const quota = await getUserQuota(supabase, user.id);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-xs text-muted-foreground">
      <span className="flex min-w-0 items-center gap-2">
        <Avatar email={user.email ?? "?"} />
        <span className="truncate">{user.email}</span>
      </span>
      <span className="flex items-center gap-3">
        {quota && (
          <span className="hidden sm:inline">
            {quota.maxAttempts === null
              ? `${quota.usedAttempts} case studies started · unlimited`
              : `${quota.usedAttempts} of ${quota.maxAttempts} case studies used`}
          </span>
        )}
        <SignOutButton />
      </span>
    </div>
  );
}
