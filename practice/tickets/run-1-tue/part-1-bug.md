# Bug: Account activity is missing my newest transactions

**Reported by:** customer support (3 tickets this week)
**Severity:** High

## What the customer says

> I bought a coffee this morning with my debit card. It shows up under "Recent activity" on the dashboard, but when I click into Everyday Checking it's not there. The list starts weeks ago. Also, if I keep clicking "Older" the last page is just empty.

## Steps to reproduce

1. Sign in as `alex@northstar.dev` / `password123`
2. On the dashboard, note the newest transaction for Everyday Checking under Recent activity
3. Click the Everyday Checking tile
4. Look at page 1 of Activity, then click "Older" until the last page

## Expected

- Page 1 shows the newest transactions for the account, starting with the one on the dashboard
- Every page has transactions; the last page has the remainder
- Paging works the same with a type filter applied

## Actual

- Page 1 starts with older transactions; the newest 10 never appear
- The last page is empty

## Done when

- The behavior above is fixed for every account and filter
- There's a test that would have caught this
