"use client";

import { X, Film, Image as ImageIcon } from "lucide-react";
import { useEffect, useMemo } from "react";

interface MediaUploadProps {
  emoji?: string;
  maxPhotos?: number;
  hint?: string;
  files?: File[];
  onFilesChange?: (files: File[]) => void;
}

export function MediaUpload({
  emoji = "📸",
  maxPhotos = 10,
  hint = "Recommended resolution: 1920x1080. (JPG, PNG, MP4)",
  files = [],
  onFilesChange,
}: MediaUploadProps) {
  const previews = useMemo(() => {
    return files.map((file) => URL.createObjectURL(file));
  }, [files]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    const selectedFiles = Array.from(event.target.files);
    const updated = [...files, ...selectedFiles].slice(0, maxPhotos);
    onFilesChange?.(updated);
  }

  function handleRemove(index: number) {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange?.(updated);
  }

  return (
    <div>
      <span className="mb-3 block text-sm font-semibold text-portal-ink">
        Media Upload ({files.length}/{maxPhotos})
      </span>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center transition-colors hover:border-portal-blue-600/50">
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <span className="mb-3 text-3xl" aria-hidden>
          {emoji}
        </span>
        <span className="text-sm font-semibold text-portal-ink">
          Drag and drop images or videos here, or click to browse
        </span>
        <span className="mt-1.5 text-xs text-slate-400">
          Upload up to {maxPhotos} high-quality files. {hint}
        </span>
      </label>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {files.map((file, index) => {
            const isVideo = file.type.startsWith("video/");
            const previewUrl = previews[index];

            return (
              <div
                key={`${file.name}-${index}`}
                className="group relative flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
              >
                {isVideo ? (
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <Film className="h-8 w-8 mb-1 text-portal-blue-600" />
                    <span className="px-1 text-center text-[10px] font-medium truncate max-w-full">
                      {file.name}
                    </span>
                  </div>
                ) : previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-slate-400" />
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-600"
                  aria-label="Remove media"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
