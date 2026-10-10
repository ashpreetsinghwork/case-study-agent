// Changes an existing user's case study quota — e.g. to grant more
// attempts, remove the cap entirely, or reset used_attempts back to 0.
// Run: npx tsx --env-file=.env scripts/set-user-quota.ts <email> <maxAttempts|unlimited> [resetUsed]
//   npx tsx --env-file=.env scripts/set-user-quota.ts a@b.com 10
//   npx tsx --env-file=.env scripts/set-user-quota.ts a@b.com 10 reset
//   npx tsx --env-file=.env scripts/set-user-quota.ts a@b.com unlimited
import { getDb } from "../src/lib/db";

const email = process.argv[2];
const rawLimit = process.argv[3];
const unlimited = rawLimit === "unlimited";
const maxAttempts = unlimited ? null : Number(rawLimit);
const resetUsed = process.argv[4] === "reset";

if (!email || (!unlimited && Number.isNaN(maxAttempts))) {
  console.error("Usage: set-user-quota.ts <email> <maxAttempts|unlimited> [reset]");
  process.exit(1);
}

async function main() {
  const db = getDb();

  const { data: userList, error: lookupError } = await db.auth.admin.listUsers();
  if (lookupError) {
    console.error("Could not look up users:", lookupError.message);
    process.exit(1);
  }
  const user = userList.users.find((u) => u.email === email);
  if (!user) {
    console.error(`No invited user found with email ${email}. Invite them first with invite-user.ts.`);
    process.exit(1);
  }

  const update: { max_attempts: number | null; used_attempts?: number } = { max_attempts: maxAttempts };
  if (resetUsed) update.used_attempts = 0;

  const { error } = await db.from("user_quota").upsert({ user_id: user.id, ...update });
  if (error) {
    console.error(`Could not update quota for ${email}:`, error.message);
    process.exit(1);
  }

  const limitLabel = unlimited ? "unlimited case study attempts" : `a limit of ${maxAttempts} case study attempts`;
  console.log(`${email} now has ${limitLabel}${resetUsed ? " (usage reset to 0)" : ""}.`);
}

main();
