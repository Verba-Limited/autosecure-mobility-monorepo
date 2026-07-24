export function MediaUpload({
  emoji,
  maxPhotos,
  hint,
}: {
  emoji: string;
  maxPhotos: number;
  hint: string;
}) {
  return (
    <div>
      <span className="mb-3 block text-sm font-semibold text-portal-ink">
        Media Upload
      </span>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center transition-colors hover:border-portal-blue-600/50">
        <input type="file" multiple accept="image/*" className="hidden" />
        <span className="mb-3 text-3xl" aria-hidden>
          {emoji}
        </span>
        <span className="text-sm font-semibold text-portal-ink">
          Drag and drop images here or click to browse
        </span>
        <span className="mt-1.5 text-xs text-slate-400">
          Upload up to {maxPhotos} high-quality photos. {hint}
        </span>
      </label>
    </div>
  );
}
