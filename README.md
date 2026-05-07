# Dear Diary

A daily reflection system to track Shray's progress toward his ideal Good Day, Good Week, and Good Month.

## What's in this folder

- **`diary.html`** — Open in any browser. Interactive form with checkboxes, time-allocation tracker, and auto-generated daily/weekly/monthly reports. Entries save in your browser.
- **`diary-log.md`** — Markdown journal where Claude records entries when you log conversationally. Persistent across sessions.
- **`README.md`** — This file.

## Two ways to log a day

**Option 1 — The HTML form (do it yourself)**
Open `diary.html`, fill in the morning plan in the morning, tick the practices and reflection in the evening, click "Save Today's Entry". Visit the Reports tab any time to see how the week or month is going.

**Option 2 — Tell Claude**
Open Claude, share your morning plan or evening reflection in chat, and ask Claude to "log today in my diary". Claude will append a structured entry to `diary-log.md`.

You can use both. They complement each other.

## Weekly & monthly reviews

Once a week (Sunday is a natural choice) and once a month, ask Claude:
- "Generate my weekly report"
- "Generate my monthly report"

Claude will analyze entries from the form and the markdown log, identify patterns, and offer gentle, specific advice on how to move closer to your ideal routine.

## Backup reminder

The HTML diary stores entries in your browser's local storage. Use the **Data → Export JSON Backup** button at least once a week to download a backup file you can keep safely (or import to another device).

## A note from Claude

The goal of this diary is not perfection. It is gentle awareness. The simple act of asking yourself each evening — "did I wake before sunrise? did I keep my temper? did I help someone?" — is itself the practice. Some days you'll tick most boxes; some days you won't. Both are part of the path.
