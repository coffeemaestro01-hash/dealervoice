export function pct(n: number, total: number) {
  if (total <= 0) return "0%";
  return `${Math.round((n / total) * 1000) / 10}%`;
}
