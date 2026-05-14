# Dear Diary — iPhone App

A React Native (Expo) app for tracking daily progress toward your ideal routine.
All features from the web app — available on your iPhone without opening a laptop.

## Features

| Tab | What it does |
|-----|-------------|
| **Today** | Fill in your daily entry — mood, sleep, 17 practices, time allocation, weekly/monthly tasks, evening reflection |
| **History** | Browse all past entries with scores; tap any entry to open and edit it |
| **Reports** | Day / Week / Month / Year score breakdowns with progress bars |
| **Goals** | Read-only view of your ideal routine vision |
| **Scoring** | Customise the weight of every practice |
| **Data** | Export a JSON backup, import from a backup, or erase all data |

## Quick Start (test on your iPhone in 5 minutes)

### Step 1 — Install Node.js
Download and install **Node.js LTS** from https://nodejs.org

### Step 2 — Install Expo CLI
```
npm install -g expo-cli
```

### Step 3 — Install dependencies
Open a terminal in the `Iphone-App` folder and run:
```
npm install
```

### Step 4 — Start the app
```
npx expo start
```
This shows a **QR code** in your terminal.

### Step 5 — Run on your iPhone
1. Download **Expo Go** from the App Store on your iPhone (free)
2. Open Expo Go → tap **"Scan QR Code"**
3. Scan the QR code from your terminal
4. The app opens on your iPhone instantly

> **Your phone and PC must be on the same Wi-Fi network.**

---

## Building a Standalone .ipa (no Expo Go needed)

To install the app directly on your iPhone (without Expo Go), use **EAS Build** — Expo's free cloud build service.

```bash
npm install -g eas-cli
eas login          # create a free account at expo.dev
eas build --platform ios --profile preview
```

This builds in the cloud (no Mac required). You get a download link for the `.ipa` file.

To install it on your iPhone without the App Store, use **AltStore** or **Sideloadly**.

---

## Data & Storage

All data is stored locally on-device using AsyncStorage (encrypted by iOS).
No server, no account, no internet required.

**To back up:** go to the **Data** tab → Export JSON Backup → share via AirDrop, iCloud, or email.

**To restore:** Data tab → Import JSON Backup → select the `.json` file.

---

## Transferring from the Web App

If you have existing data in the web app (`diary.html`):
1. In the web app → **Data tab** → Export backup
2. Send the JSON file to your iPhone (email, AirDrop, iCloud)
3. In the iPhone app → **Data tab** → Import JSON Backup
4. Select the file — entries will be merged in
