"use client";

import { ToastContainer } from "react-toastify";

export function AdminToastContainer() {
  return (
    <ToastContainer
      position="top-right"
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      limit={3}
      theme="light"
      aria-label="Admin notifications"
    />
  );
}
