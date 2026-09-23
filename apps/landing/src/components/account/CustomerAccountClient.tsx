"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Bell,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  Heart,
  KeyRound,
  Loader2,
  Lock,
  Package,
  Plus,
  Scale,
  Send,
  ShieldCheck,
  Trash2,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import { clearCustomerSession, getCustomerEmail } from "@/lib/auth-api";
import {
  fetchCustomerOrders,
  fetchCustomerOrderTrack,
  type CustomerTrackedOrder,
} from "@/lib/orders-api";
import {
  createPartQuote,
  fetchCustomerQuotes,
  acceptPartQuote,
  declinePartQuote,
  type CustomerQuote,
} from "@/lib/quotes-api";
import {
  fetchUserProfile,
  updateUserProfile,
  uploadUserAvatar,
  fetchUserFavorites,
  type UserProfile,
} from "@/lib/user-api";
import {
  getSavedFavorites,
  removeFavorite,
  subscribeToFavorites,
  type SavedVehicle,
} from "@/lib/favorites";
import { buildWhatsappUrl } from "@/lib/catalog-api";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

function formatNaira(value?: number) {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return "N/A";
  }
  return `₦${Number(value).toLocaleString("en-NG")}`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function CustomerAccountClient() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<
    "orders" | "requests" | "favorites" | "profile"
  >("orders");

  // Data States
  const [orders, setOrders] = useState<CustomerTrackedOrder[]>([]);
  const [requests, setRequests] = useState<CustomerQuote[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Loading & Error states
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Expanded Order ID for full timeline/logs
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [trackingDetails, setTrackingDetails] = useState<
    Record<string, CustomerTrackedOrder>
  >({});
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);

  // New Request Modal state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [productType, setProductType] = useState<string>("PART");
  const [partName, setPartName] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [modelSlug, setModelSlug] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vin, setVin] = useState("");
  const [oemNumber, setOemNumber] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [requestNotes, setRequestNotes] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Profile edit state
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Avatar upload state
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({});
  const [isSavingNotif, setIsSavingNotif] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Check login and load live data
  useEffect(() => {
    const email = getCustomerEmail();
    if (!email) {
      setIsLoggedIn(false);
      return;
    }
    setIsLoggedIn(true);

    async function loadData() {
      // 1. Profile
      try {
        const userProf = await fetchUserProfile();
        setProfile(userProf);
        setEditFirstName(userProf.firstName || "");
        setEditLastName(userProf.lastName || "");
        setEditPhone(userProf.phone || "");
        if (userProf.notificationPreferences) {
          setNotifPrefs(userProf.notificationPreferences);
        } else {
          setNotifPrefs({ email: true, sms: false, push: false });
        }
      } catch (err) {
        console.warn("Could not load user profile:", err);
        setNotifPrefs({ email: true, sms: false, push: false });
      } finally {
        setIsLoadingProfile(false);
      }

      // 2. Orders
      try {
        const ordersData = await fetchCustomerOrders();
        setOrders(ordersData.items || []);
      } catch (err) {
        console.warn("Could not load orders:", err);
        setOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }

      // 3. Requests / Quotes
      try {
        const quotesData = await fetchCustomerQuotes();
        setRequests(quotesData.items || []);
      } catch (err) {
        console.warn("Could not load quotes:", err);
        setRequests([]);
      } finally {
        setIsLoadingRequests(false);
      }

      // 4. Favorites (Local storage + server sync)
      try {
        const localFavs = getSavedFavorites();
        const serverFavs = await fetchUserFavorites().catch(() => []);
        const mergedMap = new Map<string, any>();
        localFavs.forEach((f) => mergedMap.set(String(f.id), f));
        serverFavs.forEach((f: any) => {
          const id = String(f._id || f.id);
          if (!mergedMap.has(id)) mergedMap.set(id, f);
        });
        setFavorites(Array.from(mergedMap.values()));
      } catch {
        setFavorites(getSavedFavorites());
      }
    }

    loadData();

    const unsubscribe = subscribeToFavorites(() => {
      setFavorites(getSavedFavorites());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  async function handleToggleTrackOrder(id: string) {
    if (expandedOrderId === id) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(id);
    if (!trackingDetails[id]) {
      setLoadingTrackId(id);
      try {
        const detailed = await fetchCustomerOrderTrack(id);
        if (detailed) {
          setTrackingDetails((prev) => ({ ...prev, [id]: detailed }));
        }
      } catch (err) {
        console.warn("Failed to load tracking details:", err);
      } finally {
        setLoadingTrackId(null);
      }
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);
    try {
      const updated = await updateUserProfile({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        phone: editPhone.trim(),
      });
      setProfile(updated);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err: any) {
      setProfileError(err?.message || "Failed to save profile changes.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setIsUploadingAvatar(true);
    try {
      const updated = await uploadUserAvatar(file);
      setProfile(updated);
    } catch (err: any) {
      setAvatarError(
        err?.message || "Failed to upload photo. Try a smaller image.",
      );
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function handleSaveNotifications() {
    setIsSavingNotif(true);
    try {
      const updated = await updateUserProfile({
        notificationPreferences: notifPrefs,
      });
      setProfile(updated);
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 3000);
    } catch {
      // Silent – non-critical
    } finally {
      setIsSavingNotif(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    setIsChangingPassword(true);
    try {
      // POST /auth/change-password
      const apiBase = (
        process.env.NEXT_PUBLIC_AUTOSECURE_PUBLIC_API_URL ?? ""
      ).replace(/\/+$/, "");
      const token = localStorage.getItem("autosecure_customer_access_token");
      const res = await fetch(`${apiBase}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || `HTTP ${res.status}`);
      }
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
      setTimeout(() => setPasswordSaved(false), 4000);
    } catch (err: any) {
      setPasswordError(
        err?.message || "Failed to change password. Please try again.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleCreateRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!partName.trim()) return;

    setIsSubmittingRequest(true);
    setRequestError(null);

    try {
      const newQuote = await createPartQuote({
        productType,
        partName: partName.trim(),
        oemNumber: oemNumber.trim() || undefined,
        quantity: Number(quantity) || 1,
        notes: requestNotes.trim() || undefined,
        vehicle: {
          brandSlug: brandSlug.trim().toLowerCase() || undefined,
          modelSlug: modelSlug.trim().toLowerCase() || undefined,
          year: vehicleYear ? parseInt(vehicleYear) : undefined,
          vin: vin.trim() || undefined,
        },
      });

      setRequests((prev) => [newQuote, ...prev]);
      setRequestModalOpen(false);
      setPartName("");
      setBrandSlug("");
      setModelSlug("");
      setVehicleYear("");
      setVin("");
      setOemNumber("");
      setQuantity(1);
      setRequestNotes("");
    } catch (err: any) {
      setRequestError(
        err?.message || "Failed to submit request. Please try again.",
      );
    } finally {
      setIsSubmittingRequest(false);
    }
  }

  async function handleAcceptQuote(quoteId: string, responseId: string) {
    try {
      const updated = await acceptPartQuote(quoteId, responseId);
      setRequests((prev) =>
        prev.map((q) => (q._id === quoteId || q.id === quoteId ? updated : q)),
      );
    } catch (err: any) {
      alert(err?.message || "Failed to accept quotation.");
    }
  }

  async function handleDeclineQuote(quoteId: string) {
    const reason = window.prompt(
      "Please provide a reason for declining this quotation:",
    );
    if (!reason) return;
    try {
      const updated = await declinePartQuote(quoteId, reason);
      setRequests((prev) =>
        prev.map((q) => (q._id === quoteId || q.id === quoteId ? updated : q)),
      );
    } catch (err: any) {
      alert(err?.message || "Failed to decline quotation.");
    }
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
            Please log in or create an account to access order tracking, submit
            vehicle requests, view your order history, and unlock customer
            pricing.
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
              Verified Customer Account
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Welcome, {profile?.firstName || "Customer"}
          </h1>
          <p className="mt-1 text-sm text-white/50">{profile?.email}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/compare"
            className="flex h-10 items-center gap-1.5 rounded-lg border border-white/12 bg-white/5 px-4 text-xs font-bold text-white hover:bg-white/10 transition-all"
          >
            <Scale className="h-3.5 w-3.5 text-[#C9943A]" />
            Compare Vehicles
          </Link>
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
          <p className="mt-3 text-3xl font-black text-white">
            {isLoadingOrders ? "..." : orders.length}
          </p>
          <p className="mt-1 text-xs text-emerald-400 font-semibold">
            {orders.some((o) => o.status === "ACTIVE")
              ? "● Active in progress"
              : "All orders up to date"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/40">
              Custom Requests
            </span>
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-white">
            {isLoadingRequests ? "..." : requests.length}
          </p>
          <p className="mt-1 text-xs text-white/40 font-semibold">
            Quotes &amp; Inquiries
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
              Saved Vehicles
            </span>
            <Heart className="h-5 w-5 text-[#C9943A]" />
          </div>
          <p className="mt-3 text-3xl font-black text-white">
            {favorites.length}
          </p>
          <p className="mt-1 text-xs text-white/40 font-semibold">
            In your wishlist
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
          onClick={() => setActiveTab("favorites")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === "favorites"
              ? "bg-[#C9943A] text-black shadow-md"
              : "border border-white/8 bg-white/4 text-white/60 hover:text-white"
          }`}
        >
          <Heart className="h-4 w-4" />
          Saved Favorites ({favorites.length})
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
          Profile Settings
        </button>
      </div>

      {/* TAB 1: Track Vehicle Orders */}
      {activeTab === "orders" && (
        <div className="mt-6 space-y-6">
          {isLoadingOrders ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-white/8 bg-[#0d0d0d]">
              <Loader2 className="h-8 w-8 animate-spin text-[#C9943A]" />
              <p className="mt-3 text-sm text-white/50">
                Loading your vehicle orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0d0d0d] py-16 text-center">
              <Truck className="h-12 w-12 text-white/20" />
              <h3 className="mt-4 text-base font-bold text-white">
                No vehicle orders tracked yet
              </h3>
              <p className="mt-1.5 max-w-md text-sm text-white/45">
                Once you progress with a vehicle purchase on AutoSecure, your
                tracking timeline, progress history logs, and shipment
                milestones will appear here in real-time.
              </p>
              <Link
                href="/new-cars"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#C9943A] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#E0AE5A]"
              >
                Browse Available Vehicles
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const isExpanded =
                expandedOrderId === order._id || expandedOrderId === order.id;
              const detail =
                trackingDetails[order._id || order.id || ""] || order;
              const isLoadingThis = loadingTrackId === (order._id || order.id);

              return (
                <div
                  key={order._id || order.id || order.reference}
                  className="overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 lg:p-7 shadow-lg"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between border-b border-white/6 pb-6">
                    <div className="flex gap-5">
                      <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-[#141414] border border-white/8">
                        {order.vehicle?.image ? (
                          <Image
                            src={order.vehicle.image}
                            alt={order.vehicle.title || "Vehicle"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/30">
                            <Truck className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9943A]">
                          Order #{order.reference}
                        </span>
                        <h2 className="mt-1 text-xl font-black text-white">
                          {order.vehicle?.title ||
                            `${order.vehicle?.brand || ""} ${order.vehicle?.model || ""}`}
                        </h2>
                        <p className="mt-1 text-xs text-white/50">
                          Placed on {formatDate(order.createdAt)}
                          {order.vehicle?.vin && ` · VIN: ${order.vehicle.vin}`}
                          {order.vehicle?.colour &&
                            ` · Colour: ${order.vehicle.colour}`}
                        </p>
                        {order.deliveryAddress && (
                          <p className="mt-1 text-xs text-white/50">
                            Destination: {order.deliveryAddress}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="lg:text-right">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-black uppercase ${
                          order.status === "DELIVERED" ||
                          order.currentStage?.key === "DELIVERED"
                            ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                            : order.status === "CANCELLED"
                              ? "border border-red-500/25 bg-red-500/10 text-red-400"
                              : "border border-[#C9943A]/30 bg-[#C9943A]/10 text-[#C9943A]"
                        }`}
                      >
                        {order.currentStage?.label || order.status}
                      </span>
                      <p className="mt-2 text-2xl font-black text-white">
                        {formatNaira(order.agreedPrice?.amount)}
                      </p>
                      {order.estimatedDeliveryDate && (
                        <p className="text-xs text-white/40">
                          Est. Arrival:{" "}
                          {formatDate(order.estimatedDeliveryDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Toggle Tracking Details Button */}
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                      Tracking Milestones &amp; History
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleTrackOrder(order._id || order.id || "")
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C9943A] hover:underline"
                    >
                      {isExpanded ? (
                        <>
                          Hide Timeline <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          View Detailed Timeline{" "}
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expanded 9-stage shipment tracking timeline */}
                  {isExpanded && (
                    <div className="mt-6 border-t border-white/6 pt-6 space-y-6 animate-in fade-in duration-200">
                      {isLoadingThis ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-[#C9943A]" />
                        </div>
                      ) : (
                        <>
                          {detail.timeline && detail.timeline.length > 0 && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
                                Stage Progression
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                                {detail.timeline.map((step) => {
                                  const isDone = step.state === "completed";
                                  const isCurr = step.state === "current";
                                  return (
                                    <div
                                      key={step.key}
                                      className={`rounded-xl border p-3 ${
                                        isCurr
                                          ? "border-[#C9943A] bg-[#C9943A]/10 text-white shadow-[0_0_12px_rgba(201,148,58,0.2)]"
                                          : isDone
                                            ? "border-emerald-500/30 bg-emerald-500/5 text-white/80"
                                            : "border-white/6 bg-white/2 text-white/30"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {isDone ? (
                                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                                        ) : isCurr ? (
                                          <Clock className="h-4 w-4 shrink-0 text-[#C9943A] animate-pulse" />
                                        ) : (
                                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/20 text-[9px]">
                                            {step.order / 10}
                                          </span>
                                        )}
                                        <p className="text-xs font-bold truncate">
                                          {step.label}
                                        </p>
                                      </div>
                                      {step.at && (
                                        <p className="mt-1 text-[10px] text-white/40">
                                          {formatDate(step.at)}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Progress Logs (Section 35) */}
                          {detail.history && detail.history.length > 0 && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
                                Progress History Logs
                              </p>
                              <div className="space-y-2 rounded-xl bg-white/[0.02] border border-white/6 p-4">
                                {detail.history.map((log, lIdx) => (
                                  <div
                                    key={lIdx}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-1.5 border-b border-white/4 last:border-0 gap-1"
                                  >
                                    <span className="font-bold text-white flex items-center gap-2">
                                      <span className="h-1.5 w-1.5 rounded-full bg-[#C9943A]" />
                                      {log.stageLabel}
                                      {log.note && (
                                        <span className="font-normal italic text-white/60">
                                          &ldquo;{log.note}&rdquo;
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-white/40 font-mono text-[11px]">
                                      {formatDate(log.at)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Requests & Quotes */}
      {activeTab === "requests" && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/8 bg-[#0d0d0d] p-6">
            <div>
              <h2 className="text-lg font-black text-white">
                Submit New Sourcing Request
              </h2>
              <p className="mt-1 text-xs text-white/50">
                Request a quotation for replacement parts, performance upgrades,
                accessories, or custom vehicle orders.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRequestModalOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#C9943A] px-6 text-xs font-black text-black hover:bg-[#E0AE5A] shadow-[0_4px_16px_rgba(201,148,58,0.25)] transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              Request Quotation
            </button>
          </div>

          {isLoadingRequests ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-white/8 bg-[#0d0d0d]">
              <Loader2 className="h-8 w-8 animate-spin text-[#C9943A]" />
              <p className="mt-3 text-sm text-white/50">
                Loading your quotation requests...
              </p>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0d0d0d] py-16 text-center">
              <FileText className="h-12 w-12 text-white/20" />
              <h3 className="mt-4 text-base font-bold text-white">
                No requests submitted yet
              </h3>
              <p className="mt-1.5 max-w-md text-sm text-white/45">
                Need a specific vehicle trim, tyre set, battery, or hard-to-find
                auto part? Click the button above to request a direct quotation
                through AutoSecure.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req._id || req.id || req.reference}
                  className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-white/6 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-[#C9943A]/25 bg-[#C9943A]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#C9943A]">
                          {req.productType || "PART"}
                        </span>
                        <span className="text-xs text-white/40 font-mono">
                          Ref: {req.reference}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-white">
                        {req.partName}{" "}
                        {req.quantity > 1 ? `(Qty: ${req.quantity})` : ""}
                      </h3>
                      {req.vehicle && (
                        <p className="mt-1 text-xs text-white/50">
                          Vehicle:{" "}
                          {req.vehicle.brandName || req.vehicle.brandSlug || ""}{" "}
                          {req.vehicle.modelName || req.vehicle.modelSlug || ""}{" "}
                          {req.vehicle.year ? `(${req.vehicle.year})` : ""}
                        </p>
                      )}
                      {req.notes && (
                        <p className="mt-2 text-xs text-white/60 leading-relaxed italic">
                          &ldquo;{req.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="sm:text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                          req.status === "ACCEPTED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : req.status === "DECLINED" ||
                                req.status === "CANCELLED"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : req.status === "QUOTED"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {req.status}
                      </span>
                      <p className="mt-1.5 text-xs text-white/40">
                        Submitted: {formatDate(req.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* AutoSecure Responses */}
                  {req.responses && req.responses.length > 0 && (
                    <div className="mt-4 pt-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">
                        AutoSecure Official Quotation
                      </p>
                      <div className="space-y-3">
                        {req.responses.map((resp) => (
                          <div
                            key={resp.id}
                            className="rounded-xl bg-white/[0.03] border border-white/8 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div>
                              <p className="text-xl font-black text-[#C9943A]">
                                {formatNaira(resp.price?.amount)}
                              </p>
                              <p className="text-xs text-white/60 mt-1">
                                Availability:{" "}
                                <strong>{resp.availability}</strong>
                                {resp.leadTimeDays
                                  ? ` · Delivery in ${resp.leadTimeDays} days`
                                  : ""}
                              </p>
                              {resp.message && (
                                <p className="text-xs text-white/50 italic mt-1">
                                  &ldquo;{resp.message}&rdquo;
                                </p>
                              )}
                            </div>

                            {req.status === "QUOTED" ||
                            req.status === "OPEN" ? (
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAcceptQuote(
                                      req._id || req.id || "",
                                      resp.id,
                                    )
                                  }
                                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                                >
                                  Accept Quote
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeclineQuote(req._id || req.id || "")
                                  }
                                  className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5"
                                >
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-white/40 uppercase">
                                {req.status === "ACCEPTED"
                                  ? "Quote Accepted ✓"
                                  : "Quote Closed"}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Saved Favorites */}
      {activeTab === "favorites" && (
        <div className="mt-6 space-y-6">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0d0d0d] py-16 text-center">
              <Heart className="h-12 w-12 text-white/20" />
              <h3 className="mt-4 text-base font-bold text-white">
                No saved favorites
              </h3>
              <p className="mt-1.5 max-w-md text-sm text-white/45">
                Browse our new and used vehicle listings and click the heart
                icon to save vehicles for quick comparison later.
              </p>
              <Link
                href="/new-cars"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#C9943A] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#E0AE5A]"
              >
                Explore Vehicles
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((fav: any) => {
                const favId = String(fav.id || fav._id);
                const favImg = fav.image || fav.images?.[0];
                const favTitle =
                  fav.title ||
                  `${fav.brand || ""} ${fav.model || ""}`.trim() ||
                  "Saved Vehicle";
                const isUsed =
                  fav.type === "USED_CAR" || fav.category === "Used";
                const detailLink = isUsed
                  ? `/used-cars/${favId}`
                  : `/new-cars/${favId}`;
                const priceDisplay =
                  fav.priceRange ||
                  (fav.price
                    ? formatNaira(fav.price)
                    : fav.pricing?.priceRange?.display ||
                      formatNaira(fav.pricing?.retail));

                return (
                  <div
                    key={favId}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/8 bg-[#0d0d0d] p-5 transition-all duration-300 hover:border-[#C9943A]/30 hover:shadow-[0_12px_28px_rgba(0,0,0,0.6)]"
                  >
                    <div>
                      <div className="relative h-44 w-full rounded-xl overflow-hidden bg-black/40 mb-3.5">
                        {favImg ? (
                          <Image
                            src={favImg}
                            alt={favTitle}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white/20">
                            <Truck className="h-8 w-8" />
                          </div>
                        )}
                        <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/70 px-2.5 py-0.5 text-[10px] font-bold text-white/70 backdrop-blur-md">
                          {isUsed ? "Used Car" : "Brand New"}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFavorite(favId)}
                          aria-label="Remove from favorites"
                          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 border border-white/10 text-white/60 hover:text-rose-400 hover:bg-black/90 transition-all backdrop-blur-md"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {fav.brand && (
                            <p className="text-[11px] font-black uppercase tracking-wider text-white/40">
                              {fav.brand} {fav.year ? `· ${fav.year}` : ""}
                            </p>
                          )}
                          <h3 className="font-bold text-white text-base mt-0.5 leading-snug">
                            {favTitle}
                          </h3>
                        </div>
                      </div>

                      {priceDisplay && (
                        <p className="text-sm font-extrabold text-[#C9943A] mt-2">
                          {priceDisplay}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/6 pt-4">
                      <Link
                        href={detailLink}
                        className="flex h-9 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition-all text-center"
                      >
                        View Details
                      </Link>
                      <a
                        href={buildWhatsappUrl(
                          `Hi, I'm inquiring about the saved vehicle ${favTitle} on autoSecure Mobility.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] text-xs font-bold text-black hover:bg-[#20BD5A] transition-all"
                      >
                        <WhatsAppIcon className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Profile Settings */}
      {activeTab === "profile" && (
        <div className="mt-6 max-w-2xl space-y-6">
          {/* ── Avatar Card ──────────────────────────────────────── */}
          <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 lg:p-8">
            <h2 className="text-base font-black text-white mb-1">
              Profile Photo
            </h2>
            <p className="text-xs text-white/50 mb-5">
              Upload a profile photo. Accepted formats: JPG, PNG, WEBP (max 5
              MB).
            </p>
            <div className="flex items-center gap-5">
              <div className="relative h-20 w-20 shrink-0">
                {profile?.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt="Avatar"
                    fill
                    className="rounded-2xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/30">
                    <User className="h-9 w-9" />
                  </div>
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60">
                    <Loader2 className="h-5 w-5 animate-spin text-[#C9943A]" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-50 transition-all"
                >
                  <Camera className="h-4 w-4 text-[#C9943A]" />
                  {isUploadingAvatar ? "Uploading…" : "Change Photo"}
                </button>
                {avatarError && (
                  <p className="text-xs text-red-400 font-semibold">
                    {avatarError}
                  </p>
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* ── Contact Information Form ────────────────────────── */}
          <form
            onSubmit={handleSaveProfile}
            className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 lg:p-8 space-y-6"
          >
            <div>
              <h2 className="text-base font-black text-white">
                Contact Information
              </h2>
              <p className="mt-1 text-xs text-white/50">
                Update your contact details for vehicle order updates, delivery
                paperwork, and quote notifications.
              </p>
            </div>

            {profileSaved && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3.5 text-xs font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Profile information updated
                successfully.
              </div>
            )}

            {passwordSaved && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3.5 text-xs font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Password changed
                successfully.
              </div>
            )}

            {profileError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-3.5 text-xs font-bold text-red-400">
                {profileError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-[#C9943A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-[#C9943A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                Email Address (Verified)
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || ""}
                className="w-full rounded-xl border border-white/8 bg-white/2 px-4 py-3 text-sm font-semibold text-white/40 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                Phone Number (WhatsApp Contact)
              </label>
              <input
                type="tel"
                placeholder="+234 800 000 0000"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-[#C9943A]"
              />
            </div>

            <div className="pt-4 border-t border-white/8 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-2 rounded-xl bg-[#C9943A] px-8 py-3 text-xs font-black text-black hover:bg-[#E0AE5A] disabled:opacity-50 transition-all"
              >
                {isSavingProfile && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Save Changes
              </button>
            </div>
          </form>

          {/* ── Notification Preferences ────────────────────────── */}
          <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 lg:p-8 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#C9943A]" />
                  Notification Preferences
                </h2>
                <p className="mt-1 text-xs text-white/50">
                  Choose how you receive order updates, quote alerts, and
                  delivery notifications.
                </p>
              </div>
              {notifSaved && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                </span>
              )}
            </div>

            <div className="space-y-3">
              {[
                {
                  key: "email",
                  label: "Email Notifications",
                  desc: "Order confirmations, quote updates, delivery alerts",
                },
                {
                  key: "sms",
                  label: "SMS / WhatsApp Alerts",
                  desc: "Real-time dispatch and tracking updates",
                },
                {
                  key: "push",
                  label: "In-App Notifications",
                  desc: "Price drops, new listings matching your requests",
                },
              ].map(({ key, label, desc }) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-5 py-4 hover:border-white/15 transition-all"
                >
                  <div>
                    <p className="text-sm font-bold text-white">{label}</p>
                    <p className="mt-0.5 text-xs text-white/45">{desc}</p>
                  </div>
                  <div
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                      notifPrefs[key] ? "bg-[#C9943A]" : "bg-white/10"
                    }`}
                    onClick={() =>
                      setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
                    }
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        notifPrefs[key] ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveNotifications}
                disabled={isSavingNotif}
                className="inline-flex items-center gap-2 rounded-xl border border-[#C9943A]/40 bg-[#C9943A]/10 px-6 py-2.5 text-xs font-bold text-[#C9943A] hover:bg-[#C9943A]/20 disabled:opacity-50 transition-all"
              >
                {isSavingNotif && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                Save Preferences
              </button>
            </div>
          </div>

          {/* ── Change Password ─────────────────────────────────── */}
          <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-[#C9943A]" />
                  Change Password
                </h2>
                <p className="mt-1 text-xs text-white/50">
                  Update your account password. Use a strong password of at
                  least 8 characters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowChangePassword((v) => !v);
                  setPasswordError(null);
                }}
                className="text-xs font-bold text-[#C9943A] hover:underline"
              >
                {showChangePassword ? "Cancel" : "Update Password"}
              </button>
            </div>

            {showChangePassword && (
              <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
                {passwordError && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-3.5 text-xs font-bold text-red-400">
                    {passwordError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Your current password"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-[#C9943A]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-[#C9943A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-[#C9943A]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#C9943A] px-8 py-3 text-xs font-black text-black hover:bg-[#E0AE5A] disabled:opacity-50 transition-all"
                  >
                    {isChangingPassword && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* New Sourcing Request Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#111] p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div>
                <h3 className="font-bold text-white text-lg">
                  Request Quotation
                </h3>
                <p className="text-xs text-white/50">
                  Direct enquiry to AutoSecure network
                </p>
              </div>
              <button
                onClick={() => setRequestModalOpen(false)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="mt-4 space-y-4">
              {requestError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/25 p-3 text-xs font-bold text-red-400">
                  {requestError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                    Request Type
                  </label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#1c1c1c] px-3 py-2 text-xs font-bold text-white outline-none focus:border-[#C9943A]"
                  >
                    <option value="PART">Auto Part</option>
                    <option value="TYRE">Tyres</option>
                    <option value="BATTERY">Battery</option>
                    <option value="ACCESSORY">Accessory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white outline-none focus:border-[#C9943A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Item / Part Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Front Ceramic Brake Pads"
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-[#C9943A]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
                    Vehicle Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Toyota"
                    value={brandSlug}
                    onChange={(e) => setBrandSlug(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-[#C9943A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Camry"
                    value={modelSlug}
                    onChange={(e) => setModelSlug(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-[#C9943A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2023"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-[#C9943A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
                    OEM / Part # (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 04465-33471"
                    value={oemNumber}
                    onChange={(e) => setOemNumber(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-[#C9943A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1">
                    VIN (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="17-character VIN"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-[#C9943A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Specific Requirements or Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Specify genuine OEM preference, trim requirements, etc."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-[#C9943A]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-white/8">
                <button
                  type="button"
                  onClick={() => setRequestModalOpen(false)}
                  className="rounded-lg border border-white/15 px-4 py-2 text-xs font-bold text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#C9943A] px-5 py-2 text-xs font-black text-black hover:bg-[#E0AE5A] disabled:opacity-50"
                >
                  {isSubmittingRequest && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  Submit Sourcing Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
