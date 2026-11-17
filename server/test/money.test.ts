import { describe, expect, it } from 'vitest';
import { applyRateBps, formatCents, hasAtMostTwoDecimals, toCents } from '../src/utils/money';
import { generateCardNumber, isLuhnValid } from '../src/utils/luhn';

describe('money utils', () => {
  it('formats cents as dollars', () => {
    expect(formatCents(123_456)).toBe('$1,234.56');
    expect(formatCents(-50)).toBe('-$0.50');
    expect(formatCents(0)).toBe('$0.00');
  });

  it('converts whole and half dollar amounts to cents', () => {
    expect(toCents(250)).toBe(25_000);
    expect(toCents(12.5)).toBe(1_250);
    expect(toCents(0.5)).toBe(50);
  });

  it('applies basis-point rates with rounding', () => {
    expect(applyRateBps(10_000, 300)).toBe(300);
    expect(applyRateBps(1_549, 100)).toBe(15);
  });

  it('accepts at most two decimals', () => {
    expect(hasAtMostTwoDecimals(10.25)).toBe(true);
    expect(hasAtMostTwoDecimals(10.255)).toBe(false);
  });
});

describe('luhn', () => {
  it('generates valid numbers for each network', () => {
    expect(generateCardNumber('VISA')).toMatch(/^4\d{15}$/);
    expect(isLuhnValid(generateCardNumber('MASTERCARD'))).toBe(true);
    expect(isLuhnValid('4111111111111111')).toBe(true);
    expect(isLuhnValid('4111111111111112')).toBe(false);
  });
});
