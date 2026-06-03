import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

async function test() {
  console.log("Starting Supabase Upload Audit Test...");
  
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const BUCKET = process.env.S3_BUCKET || "dealer-assets";

  console.log("Project URL:", SUPABASE_URL);
  console.log("Bucket:", BUCKET);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("FAILURE: Missing Supabase credentials in environment");
    return;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const key = `audit/test-${crypto.randomBytes(4).toString("hex")}.png`;
    console.log(`Target Key: ${key}`);

    console.log("1. Generating signed upload URL...");
    const { data, error } = await supabase
      .storage
      .from(BUCKET)
      .createSignedUploadUrl(key);

    if (error) throw error;
    if (!data?.signedUrl) throw new Error("No signed URL returned");

    console.log("SUCCESS: Signed URL generated.");

    console.log("2. Attempting PUT upload to signed URL...");
    const uploadRes = await fetch(data.signedUrl, {
      method: "PUT",
      body: Buffer.from("fake-image-content"),
      headers: { "Content-Type": "image/png" }
    });

    console.log("Upload Status:", uploadRes.status);
    if (uploadRes.status !== 200) {
      const text = await uploadRes.text();
      console.error("Upload failed body:", text);
      throw new Error(`Upload failed with status ${uploadRes.status}`);
    }

    console.log("3. Verifying public accessibility...");
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${key}`;
    console.log("Public URL:", publicUrl);

    const verifyRes = await fetch(publicUrl);
    console.log("Public Access Status:", verifyRes.status);
    
    if (verifyRes.status === 200) {
      console.log("ALL TESTS PASSED: Supabase Storage is functional.");
    } else {
      console.log("WARNING: Upload succeeded but public access failed (check bucket permissions).");
    }

  } catch (error: any) {
    console.error("FAILURE in Supabase flow:", error.message);
  }
}

test();
