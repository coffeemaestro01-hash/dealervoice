"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileIcon, Loader2, ShieldCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  reviewId?: string; // when attaching post-submit
  onUploaded?: (url: string) => void;
  // For inline form use: controlled
  value?: string | null;
  onChange?: (url: string | null) => void;
}

async function uploadVerificationDoc(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", "verification");

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error ?? "Upload failed");
  }
  const j = await res.json();
  return j.url as string;
}

export function VerificationUpload({ reviewId, onUploaded, value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // In controlled mode (form use), use `value`/`onChange`; otherwise local state
  const fileUrl = value ?? null;

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      setError(null);
      setUploading(true);
      try {
        const url = await uploadVerificationDoc(file);

        if (onChange) {
          onChange(url);
        } else if (reviewId) {
          // Post-submit attach
          const res = await fetch(`/api/reviews/${reviewId}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, filename: file.name, mimeType: file.type, size: file.size }),
          });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j.error ?? "Failed to submit verification");
          }
          setSubmitted(true);
          onUploaded?.(url);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [reviewId, onChange, onUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxSize: 8 * 1024 * 1024,
    multiple: false,
    disabled: uploading || submitted,
  });

  if (submitted) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-muted p-3.5">
        <ShieldCheck size={18} className="text-primary shrink-0" />
        <div>
          <p className="text-sm font-semibold text-primary">Verification document submitted</p>
          <p className="text-xs text-primary mt-0.5">Our team will review it for the Verified Buyer badge.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Guidance banner */}
      <div className="flex items-start gap-2 rounded-xl bg-primary/10 border border-primary/30 p-3">
        <Info size={15} className="text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-primary">Attach proof for Verified Buyer badge</p>
          <p className="text-xs text-primary mt-0.5">
            Upload your invoice, purchase receipt, or service job card (optional). Accepted: JPG, PNG, PDF up to 8MB.
          </p>
        </div>
      </div>

      {fileUrl ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted p-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileIcon size={16} className="text-muted-foreground shrink-0" />
            <span className="text-xs text-foreground truncate">{fileUrl.split("/").pop()}</span>
          </div>
          {onChange && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove file"
            >
              <X size={15} />
            </button>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-5 transition-all cursor-pointer flex flex-col items-center text-center",
            isDragActive
              ? "border-primary/30 bg-primary/10"
              : "border-border hover:border-primary/30 hover:bg-muted",
            uploading && "opacity-60 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <>
              <Loader2 size={22} className="text-primary animate-spin mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Uploading…</p>
            </>
          ) : (
            <>
              <div className="p-2.5 bg-muted rounded-full mb-2">
                <Upload size={18} className="text-muted-foreground" />
              </div>
              <p className="text-xs font-semibold text-foreground">Click or drag to attach document</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Invoice, receipt or PDF · max 8 MB</p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  );
}
