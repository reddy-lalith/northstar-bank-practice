# Bug: Single-use virtual card can be used more than once

**Reported by:** Card Risk team
**Severity:** Critical (security feature not working)

## What we're seeing

Customers create single-use virtual cards for one-off purchases on sites they don't trust. After the first purchase the card should stop working. We have a report of a second charge going through on a single-use card, and the card still says "Active" in the app.

## Steps to reproduce

1. Sign in as `alex@northstar.dev` / `password123`
2. Go to Cards and open **Concert tickets (one-time)**
3. Under "Test a purchase", run Ticketmaster for $120.00 (approved, as expected)
4. Run the same purchase again

## Expected

- The first purchase is approved
- The card's status becomes **Used**
- Any later purchase is declined as inactive

## Actual

- Both purchases are approved
- The card still shows **Active**

## Done when

- Single-use cards stop after exactly one approved purchase
- A declined attempt does not use up a single-use card
- There's a test that would have caught this
