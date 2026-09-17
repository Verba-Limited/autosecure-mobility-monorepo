/**
 * Vehicle Pricing Utilities
 *
 * Rules:
 * 1. The platform MUST NOT display the exact final price of a vehicle.
 * 2. Prices are ALWAYS presented as a range (e.g. "₦20 million – ₦25 million" or "$22,000 – $24,000").
 * 3. Exact final pricing is only determined when the customer progresses toward closing the transaction.
 */

export function formatVehiclePriceRange(
  item?: {
    price?: number;
    priceRangeMin?: number;
    priceRangeMax?: number;
    priceRange?: string;
    pricing?: {
      retail?: number;
      priceRangeMin?: number;
      priceRangeMax?: number;
      promotional?: number;
    };
  } | null,
  currency: string = "₦",
): string {
  if (!item) return "Pricing upon inquiry";

  // If a pre-formatted priceRange string already exists, use it
  if (item.priceRange && typeof item.priceRange === "string") {
    // If the priceRange contains digits without "million" and is in millions, beautify it
    return item.priceRange;
  }

  const min = item.priceRangeMin ?? item.pricing?.priceRangeMin;
  const max = item.priceRangeMax ?? item.pricing?.priceRangeMax;
  const basePrice =
    item.price ?? item.pricing?.retail ?? item.pricing?.promotional;

  let calculatedMin: number;
  let calculatedMax: number;

  if (typeof min === "number" && typeof max === "number" && min > 0 && max > 0) {
    calculatedMin = min;
    calculatedMax = max;
  } else if (typeof basePrice === "number" && basePrice > 0) {
    // Dynamically calculate realistic landing / duty bracket range (e.g. 95% to 110%)
    calculatedMin = Math.round((basePrice * 0.95) / 100_000) * 100_000;
    calculatedMax = Math.round((basePrice * 1.08) / 100_000) * 100_000;
  } else {
    return "Pricing upon inquiry";
  }

  // If in Millions of Naira (>= 1,000,000), format as e.g. "₦20 million – ₦25 million"
  if (calculatedMin >= 1_000_000) {
    const minM =
      calculatedMin % 1_000_000 === 0
        ? String(calculatedMin / 1_000_000)
        : (calculatedMin / 1_000_000).toFixed(1).replace(/\.0$/, "");

    const maxM =
      calculatedMax % 1_000_000 === 0
        ? String(calculatedMax / 1_000_000)
        : (calculatedMax / 1_000_000).toFixed(1).replace(/\.0$/, "");

    return `${currency}${minM} million – ${currency}${maxM} million`;
  }

  // Below 1M or non-naira
  return `${currency}${calculatedMin.toLocaleString("en-US")} – ${currency}${calculatedMax.toLocaleString("en-US")}`;
}
