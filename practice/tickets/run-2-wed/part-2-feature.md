# Feature: Daily transfer limit

**Product:** Risk / Payments
**Why:** Fraud team wants to cap how much can leave a deposit account by internal transfer in one day.

## Requirements

1. Each checking or savings account can send at most **$2,500.00 per calendar day** (server local time) in transfers.
2. **Credit card payments are exempt.** Paying the Northstar Rewards Card neither counts toward the limit nor is blocked by it.
3. A transfer that would go over the limit is rejected with **422**, error code `TRANSFER_LIMIT_EXCEEDED`, a message that says how much is left today, and `details.remainingCents`.
4. Nothing is recorded or moved when a transfer is rejected.
5. **API:** `GET /api/accounts/:id/transfer-limit` returns:
   ```json
   { "limit": { "limitCents": 250000, "usedTodayCents": 0, "remainingCents": 250000 } }
   ```
6. **UI:** The Transfer page shows "Remaining today: $X" for the selected From account and updates after each transfer.
7. The limit amount lives in config, not hard-coded in the service.

## Examples

| Today so far | New transfer | Result |
| --- | --- | --- |
| $0 | $2,500.00 to savings | Allowed |
| $2,000.00 | $600.00 to savings | Rejected, $500.00 remaining |
| $2,500.00 | $100.00 payment to credit card | Allowed |

## Done when

- Works end to end in the running app
- Tests cover the three examples
