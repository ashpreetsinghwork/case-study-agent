// Deletes an invited user entirely — their auth account, quota row, and
// "my case studies" list entries (the latter two cascade automatically
// via the foreign keys in supabase/migrations/0001 and 0003). Does NOT
// delete their case study files in Storage — those stay around under
// each project id if you want to inspect them later; delete manually if
// you want the content gone too.
// Run: npx tsx --env-file=.env scripts/delete-user.ts <email>
import { getDb } from "../src/lib/db";

const email = process.argv[2];
if (!email) {
  console.error("Usage: delete-user.ts <email>");
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
    console.error(`No user found with email ${email}.`);
    process.exit(1);
  }

  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) {
    console.error(`Could not delete ${email}:`, error.message);
    process.exit(1);
  }

  console.log(`Deleted ${email} — quota and case-study list cleared too. You can invite them again any time.`);
}

main();
