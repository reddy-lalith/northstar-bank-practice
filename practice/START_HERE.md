# Agentic round practice: Northstar Bank (Codespaces)

## First time in this Codespace (~3 min)

The Codespace installs Node packages and Claude Code by itself. Wait for the setup log in the terminal to finish.

1. Open a terminal (Ctrl+`) and run `claude`. Sign in with your Claude account when it asks. Then type `/exit`.
2. Open a **second** terminal and run `npm run dev`.
3. The web app opens in a preview tab. If it doesn't: open the **Ports** tab, find port 5173, and click the globe icon.
4. Log in with `alex@northstar.dev` / `password123`.
5. Optional: run `npm test` once to see the baseline passing.

Keep one terminal for Claude, one for `npm run dev`, and open a third for tests when you need it.

## The drill (one run = 50 min)

| Block | Time | What |
| --- | --- | --- |
| Part 1 | 20 min | Open `practice/tickets/run-N/part-1-bug.md`. Fix it. |
| Talk | 5 min | Discussion questions, out loud |
| Reset | 1 min | `git reset --hard && git clean -fd`, then restart `npm run dev` and Claude (`/clear`) |
| Part 2 | 20 min | Open `practice/tickets/run-N/part-2-feature.md`. Build it. |
| Talk | 5 min | Discussion questions again |

Reset again at the end of each run, so the next day starts clean.

## Schedule

| Day | Run |
| --- | --- |
| Tue | Run 1: pagination bug + card freeze feature |
| Wed | Run 2: cents bug + daily transfer limit feature |
| Thu | Run 3: single-use card bug (20 min only). Feature is optional. |

## Rules that match the real thing

- Start a timer. Stop at 20:00 even if you're not done, and say what's left.
- Talk out loud the whole time.
- Don't read the codebase by hand first. Read the ticket, have Claude map the code, reproduce the bug in the running app.
- Open the answer key (kept outside this repo) only after a run.

## Discussion questions

- What was the root cause, and how did you confirm it?
- Why that fix? What else could it break?
- Where did you trust Claude, and where did you check it?
- How did you verify it works?
- What would you do with more time?

## Stopping the Codespace

Codespaces bill by the hour beyond your free monthly quota. When you're done for the day: Command Palette (Ctrl+Shift+P) → "Codespaces: Stop Current Codespace".
