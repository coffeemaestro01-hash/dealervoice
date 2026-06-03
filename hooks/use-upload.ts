"use client";

import { useState } from "react";

interface UploadOptions {
  purpose: "review" | "dealership" | "verification" | "avatar";
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File, options: UploadOptions): Promise<string> => {
    setIsUploading(true);
    setProgress(0);

    try {
      // 1. Get presigned URL
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
          purpose: options.purpose,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to get upload URL");
      }

      const { uploadUrl, publicUrl } = await res.json();

      // 2. Upload to S3/R2/Supabase
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file to storage");
      }

      setIsUploading(false);
      setProgress(100);
      return publicUrl;
    } catch (error) {
      setIsUploading(false);
      throw error;
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
  };
}
