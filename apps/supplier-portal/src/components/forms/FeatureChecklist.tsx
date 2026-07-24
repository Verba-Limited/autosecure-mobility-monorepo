"use client";

import { useState } from "react";

export function FeatureChecklist({
  features,
  defaultChecked = [],
}: {
  features: string[];
  defaultChecked?: string[];
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set(defaultChecked));

  function toggle(feature: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(feature)) {
        next.delete(feature);
      } else {
        next.add(feature);
      }
      return next;
    });
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
              checked={checked.has(feature)}
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
