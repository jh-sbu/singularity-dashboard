export function formatRP(rp: number): string {
  if (rp >= 1_000_000_000) return `${(rp / 1_000_000_000).toFixed(2)}G`;
  if (rp >= 1_000_000)     return `${(rp / 1_000_000).toFixed(2)}M`;
  if (rp >= 1_000)         return `${(rp / 1_000).toFixed(2)}K`;
  return rp.toFixed(0);
}

export function formatRate(rate: number): string {
  if (rate >= 1_000) return `${(rate / 1_000).toFixed(2)}K RP/s`;
  return `${rate.toFixed(2)} RP/s`;
}

export function formatElapsed(seconds: number): string {
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
