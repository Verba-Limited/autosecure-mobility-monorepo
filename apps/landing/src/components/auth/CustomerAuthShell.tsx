import Image from "next/image";
import type { ReactNode } from "react";
import supplierAuthIllustration from "../../../../supplier-portal/public/nav-icons/Business Discussion.svg";

export function CustomerAuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-12 md:px-16 lg:grid-cols-[minmax(360px,520px)_minmax(420px,1fr)] lg:px-20">
        <div className="w-full max-w-[420px] justify-self-center lg:justify-self-start">
          <div className="mb-10">
            <h1 className="text-[34px] font-bold leading-tight tracking-tight text-white md:text-[38px]">
              {title}
            </h1>
            <p className="mt-4 text-lg font-medium leading-8 text-white/50">
              {description}
            </p>
          </div>
          {children}
        </div>
        <aside className="hidden justify-self-center text-center lg:block">
          <div className="relative mx-auto h-[320px] w-[500px]">
            <Image
              src={supplierAuthIllustration}
              alt=""
              fill
              sizes="500px"
              className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
              priority
            />
          </div>
          <h2 className="text-[28px] font-bold tracking-wide text-white">
            Connect with Confidence
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[20px] font-normal leading-[1.45] text-white/50">
            Sign in to contact verified suppliers, compare listings, and manage your inquiries securely.
          </p>
        </aside>
      </section>
    </main>
  );
}
