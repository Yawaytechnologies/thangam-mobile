# thangam-mobile

React Native mobile app for **Sri Thangam Housing** field agents and directors — team management, booking tracking, commissions, and real-time notifications.

## Tech Stack

- **Framework:** Expo SDK 54 + React Native 0.81
- **Navigation:** React Navigation v7 (native stack + bottom tabs)
- **State / Data:** TanStack Query v5 + Zustand v5
- **Auth Storage:** Expo SecureStore
- **HTTP:** Axios
- **Realtime:** Socket.IO client
- **Icons:** @expo/vector-icons

## Prerequisites

- Node.js 20+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- For iOS: macOS + Xcode
- For Android: Android Studio + emulator or physical device
- Backend API running (see `thangam-backend`)

## Quick Start

```bash
npm install
cp .env.example .env      # set API_URL
npx expo start            # opens Expo dev tools
```

Then press:
- `a` — Android emulator
- `i` — iOS simulator
- `w` — Web browser
- Scan QR code with Expo Go app on a physical device

## Environment Variables

| Variable | Description |
|---|---|
| `API_URL` | Backend API base URL (e.g. `http://localhost:3001`) |

## Commands

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run android` | Start on Android |
| `npm run ios` | Start on iOS |
| `npm run web` | Start on web |

## Notes

- Refresh tokens are stored securely using `expo-secure-store` (never in AsyncStorage)
- Always read [Expo v54 docs](https://docs.expo.dev/versions/v54.0.0/) before modifying native config
