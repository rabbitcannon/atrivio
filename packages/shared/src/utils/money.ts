/**
 * Integer-based money utilities
 *
 * All money values are stored as integers (cents) to avoid floating point issues.
 * Example: $10.99 is stored as 1099
 */

export type CentsAmount = number;

/**
 * Convert dollars to cents
 */
export function dollarsToCents(dollars: number): CentsAmount {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: CentsAmount): number {
  return cents / 100;
}

/**
 * Format cents as a currency string
 */
export function formatCurrency(cents: CentsAmount, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(centsToDollars(cents));
}

/**
 * Add two cent amounts
 */
export function addCents(a: CentsAmount, b: CentsAmount): CentsAmount {
  return a + b;
}

/**
 * Subtract two cent amounts
 */
export function subtractCents(a: CentsAmount, b: CentsAmount): CentsAmount {
  return a - b;
}

/**
 * Calculate percentage of a cent amount
 */
export function percentageOfCents(cents: CentsAmount, percentage: number): CentsAmount {
  return Math.round(cents * (percentage / 100));
}

/**
 * Calculate platform fee for a transaction
 */
export function calculatePlatformFee(amountCents: CentsAmount, feePercentage: number): CentsAmount {
  return percentageOfCents(amountCents, feePercentage);
}
