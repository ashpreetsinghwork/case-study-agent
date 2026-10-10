// One-off check that Supabase storage is reachable and the bucket exists.
// Run: node --env-file=.env scripts/test-storage.ts
import { getDb } from "../src/lib/db";

async function main() {
  const db = getDb();
  const { data: buckets, error } = await db.storage.listBuckets();
  if (error) {
    console.error("Could not list buckets:", error.message);
    process.exit(1);
  }
  console.log(
    "Buckets:",
    buckets.map((b) => b.name)
  );

  const bucket = buckets.find((b) => b.name === "case-study-projects");
  if (!bucket) {
    console.log('Bucket "case-study-projects" does not exist yet. Creating it...');
    const { error: createError } = await db.storage.createBucket("case-study-projects", {
      public: false,
    });
    if (createError) {
      console.error("Could not create bucket:", createError.message);
      process.exit(1);
    }
    console.log("Bucket created.");
  } else {
    console.log('Bucket "case-study-projects" already exists.');
  }

  const { error: uploadError } = await db.storage
    .from("case-study-projects")
    .upload("smoke-test/hello.txt", "hello from the pipeline", { upsert: true });
  if (uploadError) {
    console.error("Upload failed:", uploadError.message);
    process.exit(1);
  }
  console.log("Upload succeeded.");

  const { data: downloadData, error: downloadError } = await db.storage
    .from("case-study-projects")
    .download("smoke-test/hello.txt");
  if (downloadError || !downloadData) {
    console.error("Download failed:", downloadError?.message);
    process.exit(1);
  }
  console.log("Download succeeded, contents:", await downloadData.text());
}

main();
