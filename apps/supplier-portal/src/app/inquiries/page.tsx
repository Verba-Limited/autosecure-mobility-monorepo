import { Mail, MapPin, MessageCircle } from "lucide-react";
import { PortalShell } from "@/components/portal/PortalShell";

const inquiries = [
  {
    initials: "AJ",
    name: "Adekola Johnson",
    location: "Lagos, Nigeria",
    item: "BMW 5 Series 530i 2025",
    message:
      '"Hi, I saw your BMW 5 Series listing on AutoSecure. I\'d like to schedule a physical inspection. What is the best price?"',
    channel: "WHATSAPP LEAD",
    time: "Today, 10:42 AM",
    avatarClassName: "bg-emerald-100 text-emerald-700",
    action: "Chat on WhatsApp",
    actionClassName: "bg-[#08D85F] text-white hover:bg-[#06C654]",
    highlighted: true,
  },
  {
    initials: "CO",
    name: "Chinedu Okafor",
    location: "Abuja, Nigeria",
    item: "Mercedes C300 2022",
    message:
      '"Hello, has this Mercedes C300 had any body repairs? Can you share the customs papers before inspection?"',
    channel: "WEB FORM",
    time: "Yesterday, 4:15 PM",
    avatarClassName: "bg-sky-100 text-sky-700",
    action: "Email Customer",
    actionClassName:
      "border border-portal-blue-600 text-portal-blue-600 hover:bg-portal-blue-600/5",
    highlighted: true,
  },
  {
    initials: "FB",
    name: "Fatima Bello",
    location: "Kano, Nigeria",
    item: '18" Alloy Wheel Set',
    message:
      '"Good day, do these rims fit a 2018 Toyota Camry? Let me know if you can ship to Kano."',
    channel: "WHATSAPP LEAD",
    time: "2 days ago",
    avatarClassName: "bg-amber-100 text-amber-700",
    action: "Chat Again",
    actionClassName: "bg-emerald-300 text-white",
    replied: true,
  },
];

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-portal-border bg-white p-6 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">
        {label}
      </p>
      <p className="mt-2 text-[14px] font-black text-portal-ink">{value}</p>
    </div>
  );
}

export default function InquiriesPage() {
  return (
    <PortalShell>
      <div className="mb-7">
        <h1 className="text-3xl font-black tracking-tight text-portal-ink">
          Inquiries & Leads
        </h1>
        <p className="mt-1.5 text-sm font-medium text-[#64748B]">
          Manage customer messages, leads, and WhatsApp chats here.
        </p>
      </div>

      <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-3">
        <SummaryCard label="Total Leads Received" value="34" />
        <SummaryCard label="Unreplied Chats" value="3" />
        <SummaryCard
          label="Top Interested Listing"
          value="BMW 5 Series 530i 2025"
        />
      </div>

      <div className="mb-7 inline-flex rounded-lg bg-slate-200 p-1 text-sm font-semibold text-[#64748B]">
        <button className="rounded-md bg-white px-4 py-2 text-portal-ink shadow-sm">
          All Inquiries
        </button>
        <button className="px-4 py-2">WhatsApp Leads (2)</button>
        <button className="px-4 py-2">Web Submissions (1)</button>
      </div>

      <div className="space-y-6">
        {inquiries.map((inquiry) => (
          <article
            key={inquiry.name}
            className={`rounded-xl border border-slate-300 bg-white p-6 shadow-sm ${inquiry.highlighted ? "border-l-4 border-l-portal-blue-600" : ""}`}
          >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-black ${inquiry.avatarClassName}`}
                >
                  {inquiry.initials}
                </span>
                <div>
                  <h2 className="font-bold text-portal-ink">{inquiry.name}</h2>
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#64748B]">
                    <MapPin className="h-3.5 w-3.5" />
                    {inquiry.location}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600">
                  {inquiry.channel}
                </span>
                <p className="mt-2 text-xs font-medium text-[#64748B]">
                  {inquiry.time}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-portal-border bg-slate-50 px-4 py-4">
              <p className="mb-2 text-xs font-black text-[#64748B]">
                Inquired Item:{" "}
                <span className="text-portal-blue-600">{inquiry.item}</span>
              </p>
              <p className="text-sm font-medium leading-6 text-portal-ink">
                {inquiry.message}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-black text-portal-ink hover:bg-slate-50">
                {inquiry.replied ? "Replied" : "Mark as Replied"}
              </button>
              <button
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-black ${inquiry.actionClassName}`}
              >
                {inquiry.action.includes("Email") ? (
                  <Mail className="h-4 w-4" />
                ) : (
                  <MessageCircle className="h-4 w-4" />
                )}
                {inquiry.action}
              </button>
            </div>
          </article>
        ))}
      </div>
    </PortalShell>
  );
}
