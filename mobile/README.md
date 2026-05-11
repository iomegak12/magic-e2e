# Cortex Mobile

React Native (Expo SDK 53) chat app for the **Consolidated MAF Agent** — Android-targeted.

## Features

- Streaming (SSE) and non-streaming chat with toggle
- Session drawer with history loaded from backend
- Dark / light theme with system preference detection and AsyncStorage persistence
- Markdown rendering for assistant responses (GFM via react-native-markdown-display)
- Lavender design system aligned with DESIGN.md tokens

## Requirements

- Node.js 20+
- Expo CLI: `npm install -g expo-cli` (or use `npx expo`)
- Android emulator (Android Studio) **or** physical device with Expo Go
- Consolidated MAF Agent backend running (see `backend/`)

## Quick Start

```bash
cp .env.example .env          # adjust EXPO_PUBLIC_API_BASE_URL if needed
npm install
npx expo start --android      # opens on Android emulator
```

For a physical Android device, install **Expo Go** from Google Play, set
`EXPO_PUBLIC_API_BASE_URL` to your machine's LAN IP, then scan the QR code.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | `http://10.0.2.2:9098` | Backend base URL (`10.0.2.2` = Android emulator host) |

## EAS Build (Production APK)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

See [EAS Build docs](https://docs.expo.dev/build/introduction/) for full setup.

## License

MIT — see [LICENSE](LICENSE).
