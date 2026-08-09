import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldWrapperProps {
  label: string;
  children: ReactNode;
}

function FieldWrapper({ label, children }: FieldWrapperProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-portal-ink">{label}</span>
      {children}
    </label>
  );
}

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-portal-ink placeholder:text-slate-400 focus:border-portal-blue-600 focus:outline-none focus:ring-2 focus:ring-portal-blue-600/20";

type TextFieldProps = { label: string } & InputHTMLAttributes<HTMLInputElement>;

export function TextField({ label, ...props }: TextFieldProps) {
  return (
    <FieldWrapper label={label}>
      <input className={inputClasses} {...props} />
    </FieldWrapper>
  );
}

type SelectFieldProps = {
  label: string;
  placeholder: string;
  options?: (string | { value: string; label: string })[];
} & SelectHTMLAttributes<HTMLSelectElement>;

export function SelectField({ label, placeholder, options = [], ...props }: SelectFieldProps) {
  return (
    <FieldWrapper label={label}>
      <select
        className={`${inputClasses} appearance-none text-slate-400 [&:has(option:checked:not([value='']))]:text-portal-ink`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => {
          const val = typeof option === "string" ? option : option.value;
          const lbl = typeof option === "string" ? option : option.label;
          return (
            <option key={val} value={val} className="text-portal-ink">
              {lbl}
            </option>
          );
        })}
      </select>
    </FieldWrapper>
  );
}

type TextAreaFieldProps = { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextAreaField({ label, rows = 4, ...props }: TextAreaFieldProps) {
  return (
    <FieldWrapper label={label}>
      <textarea rows={rows} className={`${inputClasses} resize-none`} {...props} />
    </FieldWrapper>
  );
}
