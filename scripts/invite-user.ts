// Invites a user (invite-only signup: this is the only way a new user is
// ever created) and sets their initial quota.
// Run: npx tsx --env-file=.env scripts/invite-user.ts <email> [maxAttempts]
import { getDb } from "../src/lib/db";

const email = process.argv[2];
const maxAttempts = Number(process.argv[3] ?? 3);

if (!email) {
  console.error("Usage: invite-user.ts <email> [maxAttempts=3]");
  process.exit(1);
}

async function main() {
  const db = getDb();

  const { data, error } = await db.auth.admin.inviteUserByEmail(email);
  if (error || !data.user) {
    console.error(`Could not invite ${email}:`, error?.message);
    process.exit(1);
  }

  const { error: quotaError } = await db
    .from("user_quota")
    .upsert({ user_id: data.user.id, max_attempts: maxAttempts, used_attempts: 0 });
  if (quotaError) {
    console.error(`Invited ${email}, but could not set quota:`, quotaError.message);
    process.exit(1);
  }

  console.log(`Invited ${email} with ${maxAttempts} case study attempts. Invite email sent.`);
}

main();
