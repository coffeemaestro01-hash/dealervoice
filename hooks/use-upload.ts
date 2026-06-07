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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", options.purpose);

      const res = await fetch("/api/upload/file", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = "Failed to upload file";
        try {
          const error = await res.json();
          message = error.error || message;
        } catch {
          /* non-JSON error body */
        }
        throw new Error(message);
      }

      const { publicUrl } = await res.json();
      if (!publicUrl) throw new Error("Upload succeeded but no URL returned");

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
