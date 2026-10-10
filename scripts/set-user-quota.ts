// Changes an existing user's case study quota — e.g. to grant more
// attempts, or reset used_attempts back to 0.
// Run: node --env-file=.env scripts/set-user-quota.ts <email> <maxAttempts> [resetUsed]
//   node --env-file=.env scripts/set-user-quota.ts a@b.com 10
//   node --env-file=.env scripts/set-user-quota.ts a@b.com 10 reset
import { getDb } from "../src/lib/db";

const email = process.argv[2];
const maxAttempts = Number(process.argv[3]);
const resetUsed = process.argv[4] === "reset";

if (!email || Number.isNaN(maxAttempts)) {
  console.error("Usage: set-user-quota.ts <email> <maxAttempts> [reset]");
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

  const update: { max_attempts: number; used_attempts?: number } = { max_attempts: maxAttempts };
  if (resetUsed) update.used_attempts = 0;

  const { error } = await db.from("user_quota").update(update).eq("user_id", user.id);
  if (error) {
    console.error(`Could not update quota for ${email}:`, error.message);
    process.exit(1);
  }

  console.log(`${email} now has a limit of ${maxAttempts} case study attempts${resetUsed ? " (usage reset to 0)" : ""}.`);
}

main();
