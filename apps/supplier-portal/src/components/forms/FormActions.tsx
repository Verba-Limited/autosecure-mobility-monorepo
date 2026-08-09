"use client";

import { Loader2 } from "lucide-react";

interface FormActionsProps {
  isSubmitting?: boolean;
  submitLabel?: string;
  onSaveDraft?: () => void;
  onCancel?: () => void;
}

export function FormActions({
  isSubmitting = false,
  submitLabel = "Publish Listing",
  onSaveDraft,
  onCancel,
}: FormActionsProps) {
  return (
    <div className="flex flex-col-reverse justify-end gap-3 border-t border-portal-border pt-6 sm:flex-row">
      {onCancel && (
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
      )}

      {onSaveDraft && (
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSaveDraft}
          className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save as Draft"}
        </button>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-portal-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-portal-blue-700 disabled:opacity-50"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "Processing..." : submitLabel}
      </button>
    </div>
  );
}
