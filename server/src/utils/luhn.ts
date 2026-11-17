import type { CardNetwork } from '../models/types';

export function luhnCheckDigit(body: string): number {
  let sum = 0;
  let double = true;
  for (let i = body.length - 1; i >= 0; i--) {
    let n = Number(body[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return (10 - (sum % 10)) % 10;
}

export function isLuhnValid(cardNumber: string): boolean {
  if (!/^\d{12,19}$/.test(cardNumber)) return false;
  const body = cardNumber.slice(0, -1);
  return luhnCheckDigit(body) === Number(cardNumber.at(-1));
}

const NETWORK_PREFIX: Record<CardNetwork, string> = {
  VISA: '4',
  MASTERCARD: '5',
};

/** 16-digit, Luhn-valid number. Pass `random` for deterministic output. */
export function generateCardNumber(network: CardNetwork, random: () => number = Math.random): string {
  let body = NETWORK_PREFIX[network];
  while (body.length < 15) {
    body += Math.floor(random() * 10).toString();
  }
  return body + luhnCheckDigit(body).toString();
}

export function maskCardNumber(cardNumber: string): string {
  return `•••• ${cardNumber.slice(-4)}`;
}
