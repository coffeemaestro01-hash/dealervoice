import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function ratingToStars(rating: number): number[] {
  return Array.from({ length: 5 }, (_, i) => i + 1);
}

export function ratingColor(rating: number): string {
  if (rating >= 4.5) return "text-green-600";
  if (rating >= 3.5) return "text-lime-600";
  if (rating >= 2.5) return "text-yellow-600";
  if (rating >= 1.5) return "text-orange-600";
  return "text-red-600";
}

export function ratingBadgeColor(rating: number): string {
  if (rating >= 4.5) return "bg-green-500";
  if (rating >= 3.5) return "bg-lime-500";
  if (rating >= 2.5) return "bg-yellow-500";
  if (rating >= 1.5) return "bg-orange-500";
  return "bg-red-500";
}

export function reputationColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-lime-600";
  if (score >= 40) return "text-yellow-600";
  if (score >= 20) return "text-orange-600";
  return "text-red-600";
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount / 100);
}

export function buildDealerUrl(dealer: { slug: string; countryCode?: string; country?: { code: string }; cityName?: string; city?: { name: string } }): string {
  const country = (dealer.countryCode || dealer.country?.code || "intl").toLowerCase();
  const city = (dealer.cityName || dealer.city?.name || "all").toLowerCase();
  return `/dealers/${country}/${city}/${dealer.slug}`;
}

export function buildCountryUrl(countryCode: string): string {
  return `/dealers/${countryCode.toLowerCase()}`;
}

export function buildCityUrl(countryCode: string, citySlug: string): string {
  return `/dealers/${countryCode.toLowerCase()}/${citySlug}`;
}

export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://dealervoice.com";
  return `${base}${path}`;
}

export function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function generateUniqueSlug(name: string, id: string): string {
  return `${slugify(name)}-${id.slice(-6)}`;
}

export function parseJsonSafe<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
