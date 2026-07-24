import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

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

interface SelectFieldProps {
  label: string;
  placeholder: string;
  options?: string[];
}

export function SelectField({ label, placeholder, options = [] }: SelectFieldProps) {
  return (
    <FieldWrapper label={label}>
      <select
        defaultValue=""
        className={`${inputClasses} appearance-none text-slate-400 [&:has(option:checked:not([value='']))]:text-portal-ink`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option} className="text-portal-ink">
            {option}
          </option>
        ))}
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
