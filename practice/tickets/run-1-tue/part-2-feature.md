# Feature: Freeze and unfreeze a card

**Product:** Card controls
**Why:** Customers who misplace a card want to stop new purchases right away without closing it. Closing is permanent and a physical card would need to be reissued.

## Requirements

1. A customer can **freeze** any of their cards that is currently active, and **unfreeze** it later.
2. While frozen, every purchase on that card is **declined** with reason `CARD_FROZEN`.
3. Unfreezing makes the card work again exactly as before (merchant lock, spend limit, etc. still apply).
4. Used or closed cards cannot be frozen or unfrozen. Return a 422 with a clear message.
5. Freezing and unfreezing are recorded in the audit log.
6. **API:** `PATCH /api/cards/:id/freeze` with body `{ "frozen": true | false }`. Responds with the updated card.
7. **UI:**
   - Card detail page has a "Freeze card" / "Unfreeze card" button (not shown for used or closed cards)
   - Frozen cards show a "Frozen" status badge on the Cards page and the card detail page
   - Testing a purchase on a frozen card shows a human-readable decline message

## Out of scope

- Notifications to the customer
- Freezing a whole account

## Done when

- Works end to end in the running app
- Tests cover freeze, decline while frozen, unfreeze, and the closed-card case
