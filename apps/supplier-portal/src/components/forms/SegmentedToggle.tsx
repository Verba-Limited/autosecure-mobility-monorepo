"use client";

import { useState } from "react";

export function SegmentedToggle({
  label,
  options,
  defaultValue,
}: {
  label: string;
  options: string[];
  defaultValue?: string;
}) {
  const [selected, setSelected] = useState(defaultValue ?? options[0]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-portal-ink">{label}</span>
      <div className="flex rounded-lg border border-slate-300 bg-white p-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSelected(option)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              selected === option
                ? "bg-slate-100 text-portal-blue-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
