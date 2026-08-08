"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import {
  DELIVERY_OPTIONS,
  PART_CATEGORIES,
  type PartCategory,
  type PartProduct,
} from "@/data/parts";
import { PartProductCard } from "@/components/parts/PartProductCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { fetchParts } from "@/lib/catalog-api";

type ActiveCategory = (typeof PART_CATEGORIES)[number];

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#DDE6F2] bg-white overflow-hidden">
      <div className="h-44 bg-slate-100" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/2 rounded bg-slate-100" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-5 w-1/3 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export function PartsExplorer({
  products: initialProducts,
}: {
  products: PartProduct[];
}) {
  const [products, setProducts] = useState<PartProduct[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] =
    useState<ActiveCategory>("All Parts");
  const [query, setQuery] = useState("");

  // Fetch real PART inventory from browser
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const mapped = await fetchParts();
        if (!cancelled && mapped.length > 0) {
          setProducts(mapped);
        }
      } catch {
        // Keep server-provided fallback
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All Parts" ||
        product.category === (activeCategory as PartCategory);
      const matchesQuery =
        !q ||
        `${product.name} ${product.category} ${product.description}`
          .toLowerCase()
          .includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, products, query]);

  return (
    <div>
      <ScrollReveal
        className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start"
        variant="fade-up"
      >
        <div>
          <div className="grid max-w-[690px] gap-3 sm:grid-cols-3">
            {DELIVERY_OPTIONS.map((option) => (
              <div
                key={option.title}
                className="flex items-center gap-3 rounded-[10px] border border-[#DDE6F2] bg-white px-4 py-3"
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${option.colorClassName}`}
                />
                <span>
                  <span className="block text-[12px] font-black leading-tight text-[#071225]">
                    {option.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-semibold leading-tight text-[#8CA0C0]">
                    {option.description}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <label className="relative mt-0 lg:mt-[-68px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#071225]" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search parts, brand, model..."
            className="h-12 w-full rounded-[12px] border border-[#DDE6F2] bg-white pl-12 pr-4 text-sm font-semibold text-[#071225] placeholder:text-[#8CA0C0] focus:border-[#F59E0B]/50 focus:outline-none"
          />
        </label>
      </ScrollReveal>

      <ScrollReveal className="mt-5 flex w-full flex-wrap items-center gap-2" delay={80}>
        {PART_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`h-8 rounded-full px-5 text-[12px] font-medium transition-colors ${
              activeCategory === category
                ? "bg-[#E48700] text-white shadow-[0_8px_16px_rgba(228,135,0,0.22)]"
                : "border border-[#DDE6F2] bg-white text-[#0A0F1E] hover:bg-[#F6F8FC]"
            }`}
          >
            {category}
          </button>
        ))}
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F59E0B] text-white shadow-[0_10px_16px_rgba(245,158,11,0.28)]"
          aria-label="Next categories"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </ScrollReveal>

      {isLoading ? (
        <div className="mt-16 grid gap-x-7 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="mt-16 grid gap-x-7 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
          {filtered.map((product, index) => (
            <ScrollReveal key={product.id} delay={(index % 4) * 80}>
              <PartProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <ScrollReveal className="mt-16 rounded-2xl border border-dashed border-[#DDE6F2] py-16 text-center">
          <p className="text-base font-black text-[#071225]">No matching parts</p>
          <p className="mt-1 text-sm font-semibold text-[#8CA0C0]">
            Try another category or search term.
          </p>
        </ScrollReveal>
      )}
    </div>
  );
}
