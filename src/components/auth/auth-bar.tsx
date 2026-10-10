import { createClient } from "@/lib/supabase/server";
import { getUserQuota } from "@/lib/quota";
import { SignOutButton } from "@/components/auth/sign-out-button";

// Minimal "who am I / how much do I have left" strip for the two
// authenticated pages (/new and /projects/[id]) — middleware already
// guarantees a session exists by the time either page renders.
export async function AuthBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const quota = await getUserQuota(supabase, user.id);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
      <span className="truncate">{user.email}</span>
      <span className="flex items-center gap-3">
        {quota && (
          <span>
            {quota.usedAttempts} of {quota.maxAttempts} case studies used
          </span>
        )}
        <SignOutButton />
      </span>
    </div>
  );
}
