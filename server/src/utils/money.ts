/** Convert a dollar amount from the API into integer cents. */
export function toCents(dollars: number): number {
  return Math.floor(dollars * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const dollars = Math.abs(cents) / 100;
  return `${sign}$${dollars.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Apply a rate in basis points (1% = 100 bps) and round to the nearest cent. */
export function applyRateBps(cents: number, rateBps: number): number {
  return Math.round((cents * rateBps) / 10_000);
}

export function hasAtMostTwoDecimals(value: number): boolean {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;
}

export function sumCents(values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}
