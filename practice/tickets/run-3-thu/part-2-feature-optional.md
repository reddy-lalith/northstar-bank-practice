# Feature (optional, if you have time): Monthly spending by category

**Product:** Insights
**Why:** Customers want to see where their money went this month.

## Requirements

1. **API:** `GET /api/insights/spending?month=YYYY-MM` (defaults to the current month). Returns:
   ```json
   {
     "spending": {
       "month": "2026-11",
       "totalCents": 54365,
       "categories": [
         { "category": "DINING", "totalCents": 13313, "transactionCount": 12, "percent": 24.5 }
       ]
     }
   }
   ```
2. Counts **purchases and bill payments** across all of the customer's accounts (checking and credit card).
3. **Refunds** subtract from their category. Transfers, card payments, deposits, interest and cashback are not spending.
4. Categories sorted by total, highest first. Drop any category whose net total is $0 or less.
5. `percent` is the share of `totalCents`, rounded to one decimal.
6. An invalid `month` returns 400.
7. **UI:** A "Spending this month" panel on the dashboard showing the top 5 categories with amount and percent.

## Done when

- Works end to end in the running app
- Tests cover refunds netting out and transfers being excluded
