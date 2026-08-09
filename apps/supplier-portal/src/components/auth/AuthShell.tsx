import Image from "next/image";
import type { ReactNode } from "react";

const AUTH_ILLUSTRATION_SRC = "/nav-icons/Business Discussion.svg";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-12 md:px-16 lg:grid-cols-[minmax(360px,520px)_minmax(420px,1fr)] lg:px-20">
        <div className="w-full max-w-[420px] justify-self-center lg:justify-self-start">
          <div className="mb-10">
            <h1 className="text-[34px]  font-semibold leading-tight tracking-tight text-portal-ink md:text-[38px]">
              {title}
            </h1>
            <p className="mt-4 max-w-[410px] font-[inter] text-lg font-medium leading-8 text-[#63738F]">
              {description}
            </p>
          </div>
          {children}
        </div>

        <aside className="hidden justify-self-center text-center lg:block ">
          <div className="relative mx-auto mb-0 h-[320px] w-[500px]">
            <Image
              src={AUTH_ILLUSTRATION_SRC}
              alt=""
              fill
              sizes="500px"
              className="object-contain"
              priority
            />
          </div>
          <div className="">
            <h2 className="text-[28px] font-semibold tracking-wide text-[#303940]">
              Partner with Confidence
            </h2>
            <p className="mx-auto mt-4 max-w-[520px] text-[27.63px] font-normal leading-[1.45] tracking-[0.04em] text-[#303940]">
              Sign in to collaborate with AutoSecure, track purchase orders,
              submit invoices, monitor deliveries, and manage your supplier
              account securely.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
