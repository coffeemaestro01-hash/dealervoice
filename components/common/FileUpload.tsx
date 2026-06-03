"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileIcon, Loader2 } from "lucide-react";
import { useUpload } from "@/hooks/use-upload";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  purpose: "review" | "dealership" | "verification" | "avatar";
  accept?: Record<string, string[]>;
  maxSize?: number;
  label?: string;
  className?: string;
}

export function FileUpload({
  value,
  onChange,
  onRemove,
  purpose,
  accept = { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
  maxSize = 5 * 1024 * 1024, // 5MB default
  label,
  className,
}: FileUploadProps) {
  const { uploadFile, isUploading } = useUpload();
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setError(null);
      try {
        const url = await uploadFile(file, { purpose });
        onChange(url);
      } catch (err: any) {
        setError(err.message || "Failed to upload file");
      }
    },
    [uploadFile, onChange, purpose]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div className={cn("space-y-2 w-full", className)}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video md:aspect-auto md:h-40">
          {value.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
            <Image
              src={value}
              alt="Uploaded file"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full gap-2 text-gray-500">
              <FileIcon size={24} />
              <span className="text-xs truncate max-w-[200px]">{value.split("/").pop()}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="h-8 w-8 p-0 rounded-full"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center",
            isDragActive ? "border-gold-500 bg-gold-50" : "border-gray-200 hover:border-gold-400 hover:bg-gray-50",
            isUploading && "opacity-50 cursor-not-allowed",
            error && "border-red-300 bg-red-50"
          )}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 text-gold-600 animate-spin mb-2" />
              <p className="text-sm text-gray-600 font-medium">Uploading...</p>
            </>
          ) : (
            <>
              <div className="p-3 bg-gray-100 rounded-full mb-3 text-gray-500">
                <Upload size={24} />
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG or WebP (max. {Math.round(maxSize / 1024 / 1024)}MB)
              </p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
