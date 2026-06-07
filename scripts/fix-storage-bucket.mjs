/**
 * Allow PDF + HEIC on the dealer-assets Supabase bucket.
 * Run: node --env-file=.env.local scripts/fix-storage-bucket.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.S3_BUCKET || "dealer-assets";

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const { data: before } = await supabase.storage.getBucket(BUCKET);
console.log("Before:", before?.allowed_mime_types);

const { data, error } = await supabase.storage.updateBucket(BUCKET, {
  public: true,
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/gif",
    "image/svg+xml",
    "application/pdf",
  ],
  fileSizeLimit: 20 * 1024 * 1024,
});

if (error) {
  console.error("Failed:", error.message);
  process.exit(1);
}

console.log("Updated:", data);
const { data: after } = await supabase.storage.getBucket(BUCKET);
console.log("After:", after?.allowed_mime_types);
