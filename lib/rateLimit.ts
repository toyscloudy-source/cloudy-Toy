// Small in-memory limiter (per server instance) to slow down discount-code guessing.
const hits = new Map<string, number[]>();
export function tooMany(key: string, max = 15, windowMs = 60_000) {
  const now = Date.now(); const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now); hits.set(key, recent); if (hits.size > 5000) hits.clear();
  return recent.length > max;
}
export const clientKey = (req: Request) => (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
