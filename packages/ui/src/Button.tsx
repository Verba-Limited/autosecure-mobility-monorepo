import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base = "px-4 py-2 rounded-md font-medium transition-colors";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    secondary: "bg-brand-light text-brand hover:bg-brand/10",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
