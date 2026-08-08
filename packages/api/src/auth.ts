import type {
  AuthTokens,
  LoginPayload,
  RegisterCustomerPayload,
  RegisterSupplierPayload,
  ResendOtpPayload,
  VerifyEmailPayload,
} from "./types";
import type { ApiClient } from "./client";

export function createAuthApi(client: ApiClient) {
  return {
    register(payload: RegisterCustomerPayload | RegisterSupplierPayload) {
      return client.request("/auth/register", {
        method: "POST",
        body: payload,
      });
    },

    verifyEmail(payload: VerifyEmailPayload, token?: string) {
      const query = token ? `?token=${encodeURIComponent(token)}` : "";
      return client.request(`/auth/verify-email${query}`, {
        method: "POST",
        body: payload,
      });
    },

    resendOtp(payload: ResendOtpPayload) {
      return client.request("/auth/resend-otp", {
        method: "POST",
        body: payload,
      });
    },

    login(payload: LoginPayload) {
      return client.request<AuthTokens>("/auth/login", {
        method: "POST",
        body: payload,
      });
    },

    refresh(refreshToken: string) {
      return client.request<AuthTokens>("/auth/refresh", {
        method: "POST",
        body: { refreshToken },
      });
    },

    forgotPassword(email: string) {
      return client.request("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
    },

    resetPassword(email: string, otp: string, newPassword: string) {
      return client.request("/auth/reset-password", {
        method: "POST",
        body: { email, otp, newPassword },
      });
    },
  };
}
