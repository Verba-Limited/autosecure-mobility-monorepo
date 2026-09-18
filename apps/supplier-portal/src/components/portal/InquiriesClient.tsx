"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Clock,
  ExternalLink,
  Inbox,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Tag,
} from "lucide-react";
import { supplierPortalApi } from "@/lib/supplier-api";
import { getApiItems, getApiTotalItems } from "@/lib/supplier-listing-mappers";

export interface InquiryRecord {
  _id: string;
  listing?: {
    _id?: string;
    title?: string;
    brand?: string;
    model?: string;
    year?: number;
    pricing?: {
      retail?: number;
      promotional?: number;
      currency?: string;
    };
  };
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  message?: string;
  channel?: string;
  status?: string;
  createdAt?: string;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "Recent";
  try {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function InquiriesClient() {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadInquiries() {
    setIsLoading(true);
    setError(null);
    try {
      const payload: any = await supplierPortalApi.getInquiries(1, 50);
      const items = getApiItems(payload) as InquiryRecord[];
      const total = getApiTotalItems(payload) ?? items.length;
      setInquiries(items);
      setTotalCount(total);
    } catch (err: any) {
      setError(err?.message || "Failed to load inquiries.");
      setInquiries([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInquiries();
  }, []);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-portal-ink">
          Inquiries & Leads
        </h1>
        <p className="mt-1.5 text-sm font-medium text-slate-500">
          Customer messages, WhatsApp inquiries, and purchase leads received on your listings.
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-portal-border bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Leads Received
          </p>
          <p className="mt-2 text-2xl font-black text-portal-ink">
            {isLoading ? "..." : totalCount}
          </p>
        </div>

        {/* 
        NOTE: Unreplied chats metric is commented out until chat/reply tracking endpoint is available.
        <div className="rounded-xl border border-portal-border bg-white p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Unreplied Chats
          </p>
          <p className="mt-2 text-2xl font-black text-amber-600">
            0
          </p>
        </div> 
        */}
      </div>

      {/* Main Inquiries List */}
      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-portal-border bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-portal-blue-600" />
          <p className="mt-3 text-sm font-semibold text-slate-500">Loading customer inquiries...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="mt-2 font-bold text-red-800">{error}</p>
          <button
            onClick={loadInquiries}
            className="mt-4 rounded-lg bg-portal-ink px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-portal-border bg-white py-16 text-center">
          <Inbox className="h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-base font-bold text-portal-ink">No inquiries yet</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-400">
            When prospective buyers inquire about your vehicles or parts via WhatsApp or email, they will be tracked here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => {
            const customerName = inquiry.customerName || inquiry.customerEmail?.split("@")[0] || "Prospective Buyer";
            const itemTitle = inquiry.listing?.title || `${inquiry.listing?.brand || ""} ${inquiry.listing?.model || ""}`.trim() || "Listed Item";

            return (
              <article
                key={inquiry._id}
                className="overflow-hidden rounded-xl border border-portal-border bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-portal-blue-600/10 font-bold text-portal-blue-600">
                      {customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-portal-ink">{customerName}</h3>
                      <p className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(inquiry.createdAt)}
                      </p>
                    </div>
                  </div>

                  {inquiry.channel && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {inquiry.channel}
                    </span>
                  )}
                </div>

                {/* Inquired item */}
                <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-700">
                  <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                    Inquired Item
                  </p>
                  <p className="mt-1 font-bold text-portal-ink">{itemTitle}</p>
                  {inquiry.message && (
                    <p className="mt-2 text-sm italic text-slate-600">
                      &ldquo;{inquiry.message}&rdquo;
                    </p>
                  )}
                </div>

                {/* Contact Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  {inquiry.customerPhone && (
                    <a
                      href={`https://wa.me/${inquiry.customerPhone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#08D85F] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#06C654]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat on WhatsApp
                    </a>
                  )}

                  {inquiry.customerPhone && (
                    <a
                      href={`tel:${inquiry.customerPhone}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call {inquiry.customerPhone}
                    </a>
                  )}

                  {inquiry.customerEmail && (
                    <a
                      href={`mailto:${inquiry.customerEmail}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
