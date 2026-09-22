"use client";

import { toast, type ToastOptions } from "react-toastify";

const defaults: ToastOptions = {
  closeButton: true,
  pauseOnHover: true,
  role: "status",
};

export function notifySuccess(message: string) {
  toast.success(message, { ...defaults, autoClose: 3500 });
}

export function notifyError(message: string) {
  toast.error(message, { ...defaults, autoClose: 6000, role: "alert" });
}

export function notifyWarning(message: string) {
  toast.warning(message, { ...defaults, autoClose: 5000 });
}
