export function formatFlops(flops: number): string {
  if (flops === 0) return "0 FLOPs";
  const units: [number, string][] = [
    [1e24, "YFLOPs"],
    [1e21, "ZFLOPs"],
    [1e18, "EFLOPs"],
    [1e15, "PFLOPs"],
    [1e12, "TFLOPs"],
  ];
  for (const [threshold, label] of units) {
    if (flops >= threshold) {
      return `${(flops / threshold).toFixed(2)} ${label}`;
    }
  }
  return `${flops.toExponential(2)} FLOPs`;
}

export function formatScientific(n: number, digits = 2): string {
  return n.toExponential(digits).replace("e+", " x 10^");
}

export function formatDays(days: number): string {
  if (days < 1) return `${(days * 24).toFixed(1)} hours`;
  return `${days.toFixed(1)} days`;
}

export function formatEnergy(kWh: number): string {
  if (kWh >= 1000) return `${(kWh / 1000).toFixed(2)} MWh`;
  return `${kWh.toFixed(1)} kWh`;
}

export function formatUsd(usd: number): string {
  if (usd >= 1_000_000) {
    return `$${(usd / 1_000_000).toFixed(2)}M`;
  }
  if (usd >= 1_000) {
    return `$${(usd / 1_000).toFixed(1)}K`;
  }
  return `$${usd.toFixed(2)}`;
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

export function formatPercent(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`;
}
