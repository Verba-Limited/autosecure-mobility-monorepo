"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";

interface InquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    customerPhone: string;
    customerEmail: string;
  }) => Promise<void>;
  itemName: string;
  isSubmitting: boolean;
}

export function InquireModal({
  isOpen,
  onClose,
  onSubmit,
  itemName,
  isSubmitting,
}: InquireModalProps) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  // Focus phone field when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setTimeout(() => phoneRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!phone.trim()) {
      setError("Phone number is required.");
      phoneRef.current?.focus();
      return;
    }
    try {
      await onSubmit({ customerPhone: phone.trim(), customerEmail: email.trim() });
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    /* Overlay */
    <div
      className="inquire-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquire-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Panel */}
      <div className="inquire-modal-panel">
        {/* Header */}
        <div className="inquire-modal-header">
          <div className="inquire-modal-icon">
            <MessageCircle className="h-5 w-5" fill="currentColor" />
          </div>
          <div className="inquire-modal-title-group">
            <h2 id="inquire-modal-title" className="inquire-modal-title">
              Get WhatsApp Link
            </h2>
            <p className="inquire-modal-subtitle">
              Enter your contact details and we&apos;ll connect you with the
              seller on WhatsApp.
            </p>
          </div>
          <button
            type="button"
            id="inquire-modal-close"
            aria-label="Close modal"
            className="inquire-modal-close"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Item chip */}
        <div className="inquire-modal-chip">
          <span className="inquire-modal-chip-dot" />
          <span className="inquire-modal-chip-text">{itemName}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="inquire-modal-form">
          <div className="inquire-modal-field">
            <label htmlFor="inquire-phone" className="inquire-modal-label">
              Phone Number
              <span className="inquire-modal-required" aria-hidden="true">
                {" "}
                *
              </span>
            </label>
            <input
              ref={phoneRef}
              id="inquire-phone"
              type="tel"
              placeholder="+234 800 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
              className="inquire-modal-input"
              autoComplete="tel"
            />
          </div>

          <div className="inquire-modal-field">
            <label htmlFor="inquire-email" className="inquire-modal-label">
              Email Address
              <span className="inquire-modal-optional"> (optional)</span>
            </label>
            <input
              id="inquire-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="inquire-modal-input"
              autoComplete="email"
            />
          </div>

          {error && <p className="inquire-modal-error">{error}</p>}

          {/* Actions */}
          <div className="inquire-modal-actions">
            <button
              type="button"
              id="inquire-modal-cancel"
              className="inquire-modal-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="inquire-modal-submit"
              className="inquire-modal-btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="inquire-spinner" aria-hidden="true" />
                  Connecting…
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4" fill="currentColor" />
                  Get WhatsApp Link
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .inquire-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: rgba(7, 18, 37, 0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          animation: inquire-fade-in 0.18s ease;
        }

        .inquire-modal-panel {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: #ffffff;
          border: 1px solid #DDE6F2;
          border-radius: 20px;
          box-shadow:
            0 24px 64px rgba(7, 18, 37, 0.16),
            0 4px 16px rgba(7, 18, 37, 0.08);
          overflow: hidden;
          animation: inquire-slide-up 0.22s cubic-bezier(0.34, 1.36, 0.64, 1);
        }

        .inquire-modal-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 20px 20px 0;
        }

        .inquire-modal-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #25D366;
          color: #ffffff;
          margin-top: 2px;
        }

        .inquire-modal-title-group {
          flex: 1;
          min-width: 0;
        }

        .inquire-modal-title {
          font-size: 17px;
          font-weight: 900;
          color: #071225;
          line-height: 1.2;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .inquire-modal-subtitle {
          margin: 4px 0 0;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.5;
          color: #8CA0C0;
        }

        .inquire-modal-close {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #DDE6F2;
          background: #F8FAFD;
          color: #8CA0C0;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          margin-top: 2px;
        }

        .inquire-modal-close:hover {
          background: #EEF3FF;
          color: #2454D6;
        }

        .inquire-modal-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 14px 20px 0;
          padding: 8px 12px;
          background: #F2F6FF;
          border: 1px solid #DDE6F2;
          border-radius: 10px;
        }

        .inquire-modal-chip-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2454D6;
          flex-shrink: 0;
        }

        .inquire-modal-chip-text {
          font-size: 12px;
          font-weight: 700;
          color: #2454D6;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .inquire-modal-form {
          padding: 16px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .inquire-modal-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .inquire-modal-label {
          font-size: 12px;
          font-weight: 700;
          color: #3D526A;
          letter-spacing: 0.01em;
        }

        .inquire-modal-required {
          color: #EF3D48;
        }

        .inquire-modal-optional {
          font-weight: 500;
          color: #8CA0C0;
        }

        .inquire-modal-input {
          height: 44px;
          padding: 0 14px;
          border: 1.5px solid #DDE6F2;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #071225;
          background: #FAFBFD;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: inherit;
          width: 100%;
          box-sizing: border-box;
        }

        .inquire-modal-input::placeholder {
          color: #B0BDD0;
        }

        .inquire-modal-input:focus {
          border-color: #2454D6;
          box-shadow: 0 0 0 3px rgba(36, 84, 214, 0.12);
          background: #fff;
        }

        .inquire-modal-input:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .inquire-modal-error {
          margin: 0;
          padding: 10px 12px;
          border-radius: 9px;
          background: #FFF2F3;
          border: 1px solid #FFC9CC;
          font-size: 12px;
          font-weight: 600;
          color: #C8222C;
        }

        .inquire-modal-actions {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 10px;
          margin-top: 4px;
        }

        .inquire-modal-btn-cancel {
          height: 44px;
          border-radius: 10px;
          border: 1.5px solid #DDE6F2;
          background: #F8FAFD;
          font-size: 13px;
          font-weight: 800;
          color: #5A7090;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          font-family: inherit;
        }

        .inquire-modal-btn-cancel:hover:not(:disabled) {
          background: #EEF3FF;
          border-color: #C8D7F0;
        }

        .inquire-modal-btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .inquire-modal-btn-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          height: 44px;
          border-radius: 10px;
          border: none;
          background: #25D366;
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          cursor: pointer;
          transition: background 0.15s, opacity 0.15s;
          font-family: inherit;
        }

        .inquire-modal-btn-submit:hover:not(:disabled) {
          background: #20BD5A;
        }

        .inquire-modal-btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .inquire-spinner {
          display: inline-block;
          width: 15px;
          height: 15px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: inquire-spin 0.65s linear infinite;
          flex-shrink: 0;
        }

        @keyframes inquire-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes inquire-slide-up {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes inquire-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
