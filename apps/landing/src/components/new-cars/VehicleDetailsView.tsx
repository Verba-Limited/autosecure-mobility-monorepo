"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronRight, CircleAlert, MessageCircle, Search } from "lucide-react";
import type { Car } from "@/data/cars";

type CheckoutStep = 1 | 2 | 3 | 4;

const galleryImages = [
  "/images/cars/vichicle2.jpg",
  "/images/cars/featured-car.jpg",
  "/images/cars/vichcle4.jpg",
  "/images/cars/vichcle3.jpg",
  "/images/cars/vehicle1.svg",
];

const stepLabels = [
  "Customer Details",
  "Delivery Options",
  "Payment",
  "Review",
];

function formatNaira(value?: number) {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return "N/A";
  }
  return `\u20A6${Number(value).toLocaleString("en-NG")}`;
}

function CheckoutProgress({ currentStep }: { currentStep: CheckoutStep }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr_auto] items-start gap-x-4">
      {stepLabels.map((label, index) => {
        const step = (index + 1) as CheckoutStep;
        const isDone = step < currentStep;
        const isActive = step === currentStep;
        const dotClassName =
          isDone || (isActive && currentStep === 4)
            ? "bg-[#009C78] text-white shadow-[0_6px_14px_rgba(0,156,120,0.25)]"
            : isActive
              ? "bg-[#1787FF] text-white shadow-[0_6px_14px_rgba(23,135,255,0.25)]"
              : "bg-[#94A0B3] text-white";

        return (
          <div
            key={label}
            className={index === 0 ? "contents" : "contents"}
          >
            {index > 0 && (
              <div className="mt-[18px] h-2 rounded-full bg-[#A7BDF0]" />
            )}
            <div className="flex min-w-[104px] flex-col items-center gap-3 text-center">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${dotClassName}`}
              >
                {step}
              </span>
              <span
                className={`text-[15px] font-black leading-tight ${step <= currentStep ? "text-[#071225]" : "text-[#94A0B3]"}`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TextField({
  label,
  placeholder,
  wide,
}: {
  label: string;
  placeholder: string;
  wide?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-2 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-[13px] font-black text-[#4F5E76]">{label}</span>
      <span className="flex h-12 items-center gap-3 rounded-[9px] border border-[#DDE6F2] px-3.5 text-[#94A0B3]">
        <CircleAlert className="h-5 w-5 shrink-0" />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#A8B6CB]"
          placeholder={placeholder}
        />
      </span>
    </label>
  );
}

function OptionRow({
  letter,
  title,
  description,
  amount,
}: {
  letter: string;
  title: string;
  description: string;
  amount?: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-4 rounded-[13px] border border-[#E5EAF2] px-5 py-5 text-left transition-colors hover:border-[#2454D6]/35 hover:bg-[#F8FAFF]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EEF0FF] text-lg font-black text-[#2454D6]">
        {letter}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-black text-[#071225]">
          {title}
        </span>
        <span className="mt-1 block text-[13px] font-semibold text-[#94A0B3]">
          {description}
        </span>
      </span>
      {amount && (
        <span className="text-[12px] font-black text-[#071225]">{amount}</span>
      )}
      <ChevronRight className="h-5 w-5 shrink-0 text-[#94A0B3]" />
    </button>
  );
}

function CheckoutBody({
  step,
  car,
}: {
  step: CheckoutStep;
  car: Car;
}) {
  if (step === 1) {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField label="First Name" placeholder="Enter your full Name" />
        <TextField label="Last Name" placeholder="Enter your full Name" />
        <TextField label="Email Address" placeholder="Enter your email" />
        <TextField label="Phone Number" placeholder="Enter your Phone Number" />
        <TextField label="Delivery State" placeholder="Lagos" wide />
        <TextField label="Delivery Address" placeholder="Lagos" wide />
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <OptionRow letter="P" title="Pick Up" description="Pickup at our showroom" amount="Free" />
        <OptionRow letter="H" title="Home Delivery" description="We Deliver to your address" amount={formatNaira(car.price)} />
        <OptionRow letter="E" title="Express Delivery" description="Next day Delivery" amount={formatNaira(car.price)} />
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-7">
        <OptionRow letter="B" title="Bank Transfer" description="Make Payment at our official Bank" />
        <OptionRow letter="D" title="Debit/ Credit Card" description="Pay securely with your card" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-7 text-2xl font-black text-[#071225]">
        Order Summary
      </h2>
      <div className="mb-8 flex items-center gap-5">
        <div className="relative h-[70px] w-[120px] overflow-hidden rounded-[8px] bg-[#EEF3F8]">
          <Image src={galleryImages[1]} alt="" fill className="object-cover" />
        </div>
        <div>
          <h3 className="text-[17px] font-black text-[#071225]">
            {car.model}
          </h3>
          <p className="mt-2 text-xs font-black text-[#94A0B3]">
            Outright Purchase
          </p>
        </div>
      </div>
      {[
        ["Price", formatNaira(car.price)],
        ["Delivery Fee", formatNaira(car.price)],
        ["Process Fee", "Free"],
      ].map(([label, value]) => (
        <div key={label} className="flex items-center justify-between py-4">
          <span className="text-xs font-black text-[#94A0B3]">{label}</span>
          <span className="text-sm font-black text-[#071225]">{value}</span>
        </div>
      ))}
      <div className="flex items-center justify-between py-5">
        <span className="text-base font-black text-[#071225]">Total</span>
        <span className="text-base font-black text-[#071225]">
          {formatNaira(car.price * 2)}
        </span>
      </div>
    </div>
  );
}

function CheckoutModal({
  car,
  step,
  onStepChange,
  onClose,
}: {
  car: Car;
  step: CheckoutStep;
  onStepChange: (step: CheckoutStep | null) => void;
  onClose: () => void;
}) {
  const title =
    step === 1
      ? "Checkout - Customer Details"
      : step === 2
        ? "Checkout - Delivery"
        : step === 3
          ? "Checkout - Payment"
          : "Checkout - Review";

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/35 px-4 py-10 backdrop-blur-[1px]">
      <button
        type="button"
        className="fixed inset-0 cursor-default"
        aria-label="Close checkout"
        onClick={onClose}
      />
      <section className="relative mx-auto flex min-h-[760px] w-full max-w-[760px] flex-col rounded-[32px] border border-[#DDE6F2] bg-white px-8 py-16 shadow-[0_16px_48px_rgba(7,18,37,0.16)] sm:px-11">
        <h2 className="text-center text-3xl font-black tracking-[-0.04em] text-[#071225] sm:text-[38px]">
          {title}
        </h2>

        <div className="mt-14 overflow-x-auto pb-2">
          <CheckoutProgress currentStep={step} />
        </div>

        <div className="mt-11">
          <CheckoutBody step={step} car={car} />
        </div>

        <button
          type="button"
          onClick={() =>
            step < 4 ? onStepChange((step + 1) as CheckoutStep) : onClose()
          }
          className="mt-auto flex h-13 items-center justify-center rounded-[10px] bg-[#2446C6] text-[15px] font-black text-white transition-colors hover:bg-[#1F3EAF]"
        >
          {step === 4 ? "Place Order" : "Continue"}
        </button>
      </section>
    </div>
  );
}

export function VehicleDetailsView({ car }: { car: Car }) {
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep | null>(null);

  return (
    <>
      <div className="mt-16 grid gap-14 lg:grid-cols-[440px_1fr] lg:items-start">
        <section className="min-w-0">
          <div className="relative aspect-[2.05/1] overflow-hidden rounded-[15px] bg-[#EEF3F8]">
            <Image
              src={car.image}
              alt={car.imageLabel}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 440px, 100vw"
              priority
            />
          </div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {galleryImages.map((image) => (
              <div
                key={image}
                className="relative aspect-[1.65/1] overflow-hidden rounded-[6px] bg-[#EEF3F8]"
              >
                <Image src={image} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>

          <section className="mt-11">
            <h2 className="text-[18px] font-black text-[#071225]">
              Description
            </h2>
            <p className="mt-6 max-w-[470px] text-[13px] font-bold leading-5 text-[#A1AEC3]">
              Experience the perfect blend of style, comfort, and performance
              with this well-maintained vehicle. Designed for both city driving
              and long-distance travel, it offers a smooth ride, excellent fuel
              efficiency, and advanced safety features. The spacious interior,
              modern technology, and premium finish ensure a comfortable driving
              experience for both the driver and passengers. Whether you&apos;re
              looking for a reliable daily car or a family-friendly vehicle,
              this car delivers exceptional value and dependable performance.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-[18px] font-black text-[#071225]">Features</h2>
            <div className="mt-6 grid max-w-[430px] grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <span
                  key={index}
                  className="rounded-[5px] bg-[#EEF1F6] px-3 py-1 text-center text-[11px] font-black text-[#6D7890]"
                >
                  leather Seat
                </span>
              ))}
            </div>
          </section>

          <section className="mt-20">
            <h2 className="text-[18px] font-black text-[#071225]">
              Vehicle Walkaround
            </h2>
            <div className="relative mt-6 aspect-[2.05/1] overflow-hidden rounded-[15px] bg-[#EEF3F8]">
              <Image
                src="/images/cars/featured-car.jpg"
                alt="Vehicle walkaround preview"
                fill
                className="object-cover"
              />
            </div>
          </section>
        </section>

        <aside className="min-w-0 pt-2">
          <h1 className="text-4xl font-black tracking-[-0.05em] text-[#071225]">
            {car.model}
          </h1>
          <p className="mt-7 text-[13px] font-black text-[#071225]">
            4.9{" "}
            <span className="text-[#9AA6BA]">(20 reviews)</span>
          </p>
          <div className="mt-8 flex items-end gap-3">
            <p className="text-[36px] font-black leading-none tracking-[-0.045em] text-[#071225]">
              {formatNaira(car.price)}
            </p>
            <p className="pb-1 text-[13px] font-bold text-[#7E8EA8]">
              full price
            </p>
          </div>

          <div className="mt-9 grid max-w-[420px] grid-cols-3 border-y border-[#E6EDF6] py-4 text-center">
            {car.specs.map((spec, index) => (
              <div
                key={spec.label}
                className={index > 0 ? "border-l border-[#E6EDF6]" : undefined}
              >
                <p className="text-[15px] font-black leading-tight text-[#071225]">
                  {spec.value}
                </p>
                <p className="mt-1 text-[11px] font-semibold leading-tight text-[#A0AEC7]">
                  {spec.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid max-w-[360px] grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCheckoutStep(1)}
              className="flex h-11 items-center justify-center rounded-[8px] bg-[#EEF3FF] text-[13px] font-black text-[#2454D6] transition-colors hover:bg-[#E0E9FF]"
            >
              Buy Now
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hi, I'm interested in the ${car.brand} ${car.model} listed on autoSecure Mobility.`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-center gap-1.5 rounded-[8px] bg-[#25D366] text-[13px] font-black text-white transition-colors hover:bg-[#20BD5A]"
            >
              <MessageCircle className="h-3.5 w-3.5" fill="currentColor" />
              WhatsApp
            </a>
          </div>
        </aside>
      </div>

      <label className="absolute right-6 top-[214px] hidden w-[280px] xl:block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#071225]" />
        <input
          type="text"
          placeholder="Search make, model..."
          className="h-12 w-full rounded-[12px] border border-[#DDE6F2] bg-white pl-12 pr-4 text-sm font-semibold text-[#071225] placeholder:text-[#8CA0C0] focus:border-[#2454D6]/40 focus:outline-none"
        />
      </label>

      {checkoutStep && (
        <CheckoutModal
          car={car}
          step={checkoutStep}
          onStepChange={setCheckoutStep}
          onClose={() => setCheckoutStep(null)}
        />
      )}
    </>
  );
}
