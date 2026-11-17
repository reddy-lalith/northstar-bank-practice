# Bug: Some transfers and payments are a cent short

**Reported by:** customer, escalated by the payments team
**Severity:** High (money)

## What the customer says

> I moved $19.99 from checking to savings to cover a subscription. My transaction history says $19.98. I tried $4.35 and got $4.34. $20.00 works fine. Where is my penny going?

## Steps to reproduce

1. Sign in as `alex@northstar.dev` / `password123`
2. Go to Transfer
3. Move **$19.99** from Everyday Checking to High-Yield Savings
4. Check the success message and both accounts' activity

## Expected

The exact amount entered moves: $19.99 out of checking, $19.99 into savings.

## Actual

$19.98 moves. It happens for some amounts and not others.

## Notes from the payments team

We've also seen a bill pay and a card purchase come through one cent low. Might be related.

## Done when

- Every amount the API accepts is recorded to the exact cent, everywhere money comes in through the API
- A test covers the amounts above
