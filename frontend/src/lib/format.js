export const cn = (...parts) => parts.filter(Boolean).join(" ");

export const inr = (n) =>
  n == null || Number.isNaN(n)
    ? "—"
    : `₹${Math.round(n).toLocaleString("en-IN")}`;

// Parse "YYYY-MM-DD" as a local date (new Date("2026-10-01") would be UTC).
export const parseISO = (s) => new Date(`${s}T00:00:00`);

export function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function nightsBetween(a, b) {
  if (!a || !b) return null;
  return Math.round((parseISO(b) - parseISO(a)) / 86400000);
}

// Small deterministic hash + PRNG so each destination always gets the same artwork.
export function hashString(str = "") {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
