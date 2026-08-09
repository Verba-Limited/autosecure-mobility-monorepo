export type AuthValidationErrors = Record<string, string>;

export function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRequired(
  errors: AuthValidationErrors,
  key: string,
  value: string,
  label: string,
) {
  if (!value) {
    errors[key] = `${label} is required.`;
  }
}

export function validateEmail(errors: AuthValidationErrors, email: string) {
  if (!email) {
    errors.email = "Email address is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }
}

export function validatePassword(
  errors: AuthValidationErrors,
  password: string,
  key = "password",
) {
  if (!password) {
    errors[key] = "Password is required.";
  } else if (password.length < 8) {
    errors[key] = "Password must be at least 8 characters.";
  }
}

export function validateOtp(errors: AuthValidationErrors, otp: string) {
  if (!otp) {
    errors.otp = "OTP code is required.";
  } else if (!/^\d{6}$/.test(otp)) {
    errors.otp = "OTP must be 6 digits.";
  }
}
