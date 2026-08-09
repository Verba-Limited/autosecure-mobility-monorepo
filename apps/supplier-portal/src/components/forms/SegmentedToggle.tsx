"use client";

import { useState } from "react";

interface SegmentedToggleProps {
  label: string;
  options: string[];
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
}

export function SegmentedToggle({
  label,
  options,
  defaultValue,
  value,
  onChange,
}: SegmentedToggleProps) {
  const [internalSelected, setInternalSelected] = useState(
    defaultValue ?? options[0],
  );

  const isControlled = value !== undefined && onChange !== undefined;
  const currentSelected = isControlled ? value : internalSelected;

  function handleSelect(option: string) {
    if (isControlled) {
      onChange(option);
    } else {
      setInternalSelected(option);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-portal-ink">{label}</span>
      <div className="flex rounded-lg border border-slate-300 bg-white p-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleSelect(option)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              currentSelected === option
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
