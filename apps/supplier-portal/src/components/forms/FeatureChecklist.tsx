"use client";

import { useState } from "react";

interface FeatureChecklistProps {
  features: string[];
  defaultChecked?: string[];
  selected?: string[];
  onToggle?: (feature: string) => void;
}

export function FeatureChecklist({
  features,
  defaultChecked = [],
  selected,
  onToggle,
}: FeatureChecklistProps) {
  const [internalChecked, setInternalChecked] = useState<Set<string>>(
    new Set(defaultChecked),
  );

  const isControlled = selected !== undefined && onToggle !== undefined;

  function toggle(feature: string) {
    if (isControlled) {
      onToggle(feature);
    } else {
      setInternalChecked((prev) => {
        const next = new Set(prev);
        if (next.has(feature)) {
          next.delete(feature);
        } else {
          next.add(feature);
        }
        return next;
      });
    }
  }

  function isChecked(feature: string) {
    if (isControlled) {
      return selected.includes(feature);
    }
    return internalChecked.has(feature);
  }

  return (
    <div>
      <span className="mb-3 block text-sm font-semibold text-portal-ink">
        Key Features
      </span>
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <label
            key={feature}
            className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600"
          >
            <input
              type="checkbox"
              checked={isChecked(feature)}
              onChange={() => toggle(feature)}
              className="h-4 w-4 rounded border-slate-300 text-portal-blue-600 focus:ring-portal-blue-600/30"
            />
            {feature}
          </label>
        ))}
      </div>
    </div>
  );
}
