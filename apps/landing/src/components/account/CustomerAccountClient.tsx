"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  Package,
  Plus,
  Scale,
  Send,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";
import {
  addCustomerRequest,
  clearCustomerSession,
  getCustomerEmail,
  getCustomerOrders,
  getCustomerProfile,
  getCustomerRequests,
  saveCustomerProfile,
  type CustomerOrder,
  type CustomerProfile,
  type CustomerRequest,
} from "@/lib/auth-api";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

function formatNaira(value?: number) {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return "N/A";
  }
  return `₦${Number(value).toLocaleString("en-NG")}`;
}

const ORDER_STEPS = [
  "Order Confirmed",
  "Vehicle Allocated",
  "Port Clearance",
  "Delivered",
];

export function CustomerAccountClient() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "requests" | "profile">("orders");
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [profile, setProfile] = useState<CustomerProfile>({
    firstName: "",
    lastName: "",
    email: "",
  });

  // New Request Modal state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<CustomerRequest["requestType"]>(
    "Custom Vehicle Import",
  );
  const [requestItem, setRequestItem] = useState("");
  const [requestBudget, setRequestBudget] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Profile edit state
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    const email = getCustomerEmail();
    if (!email) {
      setIsLoggedIn(false);
      return;
    }
    setIsLoggedIn(true);
    setOrders(getCustomerOrders());
    setRequests(getCustomerRequests());
    setProfile(getCustomerProfile());
  }, []);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    saveCustomerProfile(profile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  }

  function handleCreateRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!requestItem.trim()) return;

    const newReq = addCustomerRequest({
      requestType,
      vehicleOrItem: requestItem.trim(),
      budgetRange: requestBudget.trim() || undefined,
      notes: requestNotes.trim() || undefined,
    });

    setRequests([newReq, ...requests]);
    setRequestSuccess(true);
    setTimeout(() => {
      setRequestSuccess(false);
      setRequestModalOpen(false);
      setRequestItem("");
      setRequestBudget("");
      setRequestNotes("");
    }, 1500);
  }

  function handleSignOut() {
    clearCustomerSession();
    window.location.href = "/";
  }

  if (isLoggedIn === null) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#C9943A] border-t-transparent" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="py-12">
        <ScrollReveal
          className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-[#C9943A]/25 bg-gradient-to-b from-[#14120a] to-[#0c0c0c] p-8 sm:p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
          variant="fade-up"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#C9943A]/30 bg-[#C9943A]/10 text-[#C9943A]">
            <Lock className="h-9 w-9" />
          </div>
          <h1 className="text-3xl font-black text-white sm:text-4xl">
            Customer Portal Access
          </h1>
          <p className="mt-3 text-base text-white/60 leading-relaxed">
            Please log in or create an account to access order tracking, submit vehicle requests, view your order history, and unlock customer pricing.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/login?next=/account"
              className="flex h-12 items-center justify-center rounded-xl bg-[#C9943A] px-8 text-sm font-black text-black hover:bg-[#E0AE5A] shadow-[0_4px_16px_rgba(201,148,58,0.3)] transition-all"
            >
              Sign In to Your Account
            </Link>
            <Link
              href="/register?next=/account"
              className="flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-8 text-sm font-bold text-white hover:bg-white/10 transition-all"
            >
              Create Customer Account
            </Link>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Top Customer Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/8 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Buyer Account
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Welcome, {profile.firstName || "Customer"}
          </h1>
          <p className="mt-1 text-sm text-white/50">{profile.email}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/compare"
            className="flex h-10 items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-4 text-xs font-bold text-white hover:bg-white/10 transition-all"
          >
            <Scale className="h-3.5 w-3.5 text-[#C9943A]" />
            Compare Vehicles
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex h-10 items-center rounded-lg border border-white/10 bg-white/4 px-4 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/8 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/40">
              Orders Tracked
            </span>
            <Package className="h-5 w-5 text-[#C9943A]" />
          </div>
          <p className="mt-3 text-3xl font-black text-white">{orders.length}</p>
          <p className="mt-1 text-xs text-emerald-400 font-semibold">
            ● 1 Active In Transit
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/40">
              Custom Requests
            </span>
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-white">{requests.length}</p>
          <p className="mt-1 text-xs text-white/40 font-semibold">
            Inquiries &amp; Quotes
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/40">
              Pricing Status
            </span>
            <Lock className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 text-xl font-black text-emerald-400">UNLOCKED</p>
          <p className="mt-1 text-xs text-white/40 font-semibold">
            Full access to price ranges &amp; specs
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/40">
              Comparison Tool
            </span>
            <Scale className="h-5 w-5 text-[#C9943A]" />
          </div>
          <Link
            href="/compare"
            className="mt-3 inline-block text-xl font-black text-[#C9943A] hover:underline"
          >
            Launch Matrix →
          </Link>
          <p className="mt-1 text-xs text-white/40 font-semibold">
            Compare specs side-by-side
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-white/8 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === "orders"
              ? "bg-[#C9943A] text-black shadow-md"
              : "border border-white/8 bg-white/4 text-white/60 hover:text-white"
          }`}
        >
          <Truck className="h-4 w-4" />
          Track Vehicle Orders ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === "requests"
              ? "bg-[#C9943A] text-black shadow-md"
              : "border border-white/8 bg-white/4 text-white/60 hover:text-white"
          }`}
        >
          <Send className="h-4 w-4" />
          Requests &amp; Quotes ({requests.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === "profile"
              ? "bg-[#C9943A] text-black shadow-md"
              : "border border-white/8 bg-white/4 text-white/60 hover:text-white"
          }`}
        >
          <User className="h-4 w-4" />
          Customer Information
        </button>
      </div>

      {/* TAB 1: Track Vehicle Orders */}
      {activeTab === "orders" && (
        <div className="mt-6 space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 lg:p-7 shadow-lg"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between border-b border-white/6 pb-6">
                <div className="flex gap-5">
                  <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-[#141414] border border-white/8">
                    <Image
                      src={order.image}
                      alt={order.vehicleName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9943A]">
                      Order #{order.orderNumber}
                    </span>
                    <h2 className="mt-1 text-xl font-black text-white">
                      {order.vehicleName}
                    </h2>
                    <p className="mt-1 text-xs text-white/50">
                      Placed on {order.orderDate} · VIN:{" "}
                      <span className="font-mono text-white/80">{order.vin}</span>
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      Destination: {order.deliveryPortOrCity}
                    </p>
                  </div>
                </div>

                <div className="lg:text-right">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-black uppercase ${
                      order.status === "Delivered"
                        ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                        : "border border-[#C9943A]/30 bg-[#C9943A]/10 text-[#C9943A]"
                    }`}
                  >
                    {order.status}
                  </span>
                  <p className="mt-2 text-2xl font-black text-white">
                    {formatNaira(order.totalPrice)}
                  </p>
                  <p className="text-xs text-white/40">
                    Est. Arrival: {order.estimatedDelivery}
                  </p>
                </div>
              </div>

              {/* Progress Milestones Bar */}
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">
                  Shipment Milestones
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {ORDER_STEPS.map((step, idx) => {
                    const isPassed = idx + 1 <= order.progressStep;
                    const isCurrent = idx + 1 === order.progressStep;
                    return (
                      <div
                        key={step}
                        className={`rounded-xl border p-3.5 transition-all ${
                          isCurrent
                            ? "border-[#C9943A] bg-[#C9943A]/10 text-white shadow-[0_0_15px_rgba(201,148,58,0.15)]"
                            : isPassed
                              ? "border-emerald-500/30 bg-emerald-500/5 text-white/80"
                              : "border-white/6 bg-white/2 text-white/30"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isPassed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/20 text-[10px]">
                              {idx + 1}
                            </span>
                          )}
                          <span className="text-xs font-bold">{step}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Requests & Inquiries */}
      {activeTab === "requests" && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/8 bg-[#0d0d0d] p-6">
            <div>
              <h2 className="text-lg font-black text-white">Submit New Request</h2>
              <p className="mt-1 text-xs text-white/50">
                Request a custom vehicle import, price quote, pre-purchase inspection, or part sourcing directly from our verified suppliers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRequestModalOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#C9943A] px-6 text-xs font-black text-black hover:bg-[#E0AE5A] shadow-[0_4px_16px_rgba(201,148,58,0.25)] transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              Submit Request
            </button>
          </div>

          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-[#C9943A]/25 bg-[#C9943A]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#C9943A]">
                        {req.requestType}
                      </span>
                      <span className="text-xs text-white/40 font-mono">
                        Ref: {req.referenceId}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-white">
                      {req.vehicleOrItem}
                    </h3>
                    {req.notes && (
                      <p className="mt-2 text-xs text-white/60 leading-relaxed">
                        “{req.notes}”
                      </p>
                    )}
                    {req.budgetRange && (
                      <p className="mt-2 text-xs text-[#C9943A] font-semibold">
                        Target Budget: {req.budgetRange}
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                      <Clock className="h-3 w-3" />
                      {req.status}
                    </span>
                    <p className="mt-1.5 text-xs text-white/40">Submitted: {req.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Customer Profile Information */}
      {activeTab === "profile" && (
        <div className="mt-6 max-w-2xl rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 sm:p-8">
          <h2 className="text-xl font-black text-white">Customer Information</h2>
          <p className="mt-1 text-xs text-white/50">
            Keep your contact details up to date for order allocations and delivery notifications.
          </p>

          {profileSaved && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400">
              <Check className="h-4 w-4" />
              Customer profile updated successfully!
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white/70">First Name</span>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="h-11 rounded-xl border border-white/10 bg-[#141414] px-4 text-sm font-semibold text-white focus:border-[#C9943A] focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white/70">Last Name</span>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="h-11 rounded-xl border border-white/10 bg-[#141414] px-4 text-sm font-semibold text-white focus:border-[#C9943A] focus:outline-none"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-white/70">Email Address (Account ID)</span>
              <input
                type="email"
                disabled
                value={profile.email}
                className="h-11 rounded-xl border border-white/5 bg-white/2 px-4 text-sm font-semibold text-white/40 cursor-not-allowed"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white/70">Phone Number</span>
                <input
                  type="tel"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="h-11 rounded-xl border border-white/10 bg-[#141414] px-4 text-sm font-semibold text-white focus:border-[#C9943A] focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white/70">Delivery City</span>
                <input
                  type="text"
                  value={profile.city || ""}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="h-11 rounded-xl border border-white/10 bg-[#141414] px-4 text-sm font-semibold text-white focus:border-[#C9943A] focus:outline-none"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-2 h-11 rounded-xl bg-[#C9943A] px-8 text-xs font-black text-black hover:bg-[#E0AE5A] transition-all shadow-[0_4px_16px_rgba(201,148,58,0.25)]"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Modal: Submit New Request */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0e0e0e] p-7 shadow-2xl">
            <h2 className="text-xl font-black text-white">Submit Vehicle / Part Request</h2>
            <p className="mt-1 text-xs text-white/50">
              Our sourcing team will contact suppliers and prepare a verified quote.
            </p>

            {requestSuccess ? (
              <div className="my-8 flex flex-col items-center justify-center py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <Check className="h-7 w-7" />
                </div>
                <p className="mt-3 text-base font-bold text-white">
                  Request Submitted Successfully!
                </p>
                <p className="mt-1 text-xs text-white/40">
                  Tracking reference generated. Adding to your requests...
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateRequest} className="mt-5 space-y-4">
                <label className="block text-xs font-bold text-white/70">
                  Request Type
                  <select
                    value={requestType}
                    onChange={(e) =>
                      setRequestType(e.target.value as CustomerRequest["requestType"])
                    }
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-2.5 text-xs font-bold text-white focus:border-[#C9943A] focus:outline-none"
                  >
                    <option value="Custom Vehicle Import">Custom Vehicle Import</option>
                    <option value="Price Quote & Inspection">
                      Price Quote &amp; Pre-purchase Inspection
                    </option>
                    <option value="Auto Part Sourcing">Auto Part Sourcing</option>
                    <option value="Financing Assistance">Financing Assistance</option>
                  </select>
                </label>

                <label className="block text-xs font-bold text-white/70">
                  Vehicle or Item Description *
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2025 Mercedes-Benz G63 AMG or OEM Land Cruiser Radiator"
                    value={requestItem}
                    onChange={(e) => setRequestItem(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#C9943A] focus:outline-none"
                  />
                </label>

                <label className="block text-xs font-bold text-white/70">
                  Target Budget (Optional)
                  <input
                    type="text"
                    placeholder="e.g. ₦80,000,000"
                    value={requestBudget}
                    onChange={(e) => setRequestBudget(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#C9943A] focus:outline-none"
                  />
                </label>

                <label className="block text-xs font-bold text-white/70">
                  Additional Notes / Trim / Color
                  <textarea
                    rows={3}
                    placeholder="Any specific trim, interior color, package or delivery port preference..."
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#C9943A] focus:outline-none"
                  />
                </label>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => setRequestModalOpen(false)}
                    className="h-10 rounded-xl border border-white/10 px-5 text-xs font-bold text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-xl bg-[#C9943A] px-6 text-xs font-black text-black hover:bg-[#E0AE5A] transition-all shadow-[0_4px_16px_rgba(201,148,58,0.25)]"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
