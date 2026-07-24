export function FormActions() {
  return (
    <div className="flex justify-end gap-3 border-t border-portal-border pt-6">
      <button
        type="button"
        className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="rounded-lg bg-portal-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-portal-blue-700"
      >
        Publish Listing
      </button>
    </div>
  );
}
