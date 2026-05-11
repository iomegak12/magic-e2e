# Plan: Cortex Mobile — React Native + Expo Chat App

**TL;DR:** Port the Cortex Interface web chat UI to React Native (Expo SDK 53 managed workflow, Android-first). Mirror the web's modular `src/` layout, identical `useReducer`+Context store and API client, all DESIGN.md tokens expressed as native `StyleSheet` objects. Expo Router v4 drawer for the session sidebar. Sessions persisted in AsyncStorage, markdown via `react-native-markdown-display`, icons via `lucide-react-native`.

---

## Phase 1 — Scaffold & Project Files *(10 files)*

1. `mobile/package.json` — expo 53, react-native, expo-router, `@react-navigation/drawer`, `react-native-gesture-handler`, `react-native-reanimated`, `@react-native-async-storage/async-storage`, `react-native-markdown-display`, `lucide-react-native`, `react-native-svg`, `expo-font`, `expo-status-bar`, `expo-splash-screen`, `expo-constants`
2. `mobile/app.json` — name "Cortex", slug "cortex", `android.package "com.cortex.mobile"`, scheme "cortex", sdkVersion "53.0.0"
3. `mobile/babel.config.js` — `babel-preset-expo` + `react-native-reanimated/plugin` last in plugins (required)
4. `mobile/.env.example` — `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:9098` *(Android emulator → host localhost)*
5. `mobile/.gitignore` — node_modules, .expo, dist, android/, ios/, .env, *.keystore
6. `mobile/LICENSE` — MIT, Ramkumar 2026
7. `mobile/README.md` — quickstart (`npx expo start --android`), env table, EAS build note
8. `mobile/CONTRIBUTING.md`
9. `mobile/TROUBLESHOOTING.md`
10. `mobile/CHANGELOG.md` — v0.1.0

---

## Phase 2 — Design Tokens & Theme *(2 files)*

11. `mobile/src/theme/tokens.js` — `lightColors` / `darkColors` objects with all DESIGN.md color tokens; `spacing`, `borderRadius`, `fontSize` constants
12. `mobile/src/theme/ThemeContext.jsx` — Context + Provider; reads `useColorScheme()` as default; manual toggle persisted to AsyncStorage under `cortex-theme`; exposes `{ theme, colors, toggleTheme }`

---

## Phase 3 — Core State & API *(4 files — ports from web)*

13. `mobile/src/store/chatStore.jsx` — identical `useReducer`+Context from web (pure JS, no DOM refs); same action types: `ADD_SESSION`, `SET_ACTIVE`, `LOAD_HISTORY`, `ADD_USER_MESSAGE`, `STREAM_START`, `STREAM_DELTA`, `STREAM_DONE`, `RESPONSE_RECEIVED`, `SET_AGENT_INFO`, `SET_ERROR`, `CLEAR_ERROR`, `TOGGLE_STREAMING`, `REMOVE_SESSION`
14. `mobile/src/api/client.js` — same contract as web; swap `import.meta.env.VITE_*` → `process.env.EXPO_PUBLIC_*`; default base `http://10.0.2.2:9098`; same `chatStream()` via `fetch`+`ReadableStream` (supported on Hermes / RN 0.76)
15. `mobile/src/hooks/useChat.js` — port 1:1 from web
16. `mobile/src/hooks/useSessions.js` — port from web; swap `localStorage` → `AsyncStorage` (`getItem` / `setItem`)

---

## Phase 4 — UI Components *(7 files)*

17. `mobile/src/components/ui/Button.jsx` — primary / secondary / ghost variants; `TouchableOpacity`; borderRadius 12; lavender primary (`#8127cf`) with white text
18. `mobile/src/components/ui/IconButton.jsx` — circular `TouchableOpacity`; sm/md/lg sizes; ghost/primary variants
19. `mobile/src/components/ui/Badge.jsx` — pill `View`+`Text`; same color variants as web (default, primary, success, warning, error)
20. `mobile/src/components/chat/MessageBubble.jsx` — user: right-aligned lavender bubble (plain `Text`); assistant: left-aligned surface-container bubble + Bot icon; assistant content rendered via `react-native-markdown-display` with token-driven style rules
21. `mobile/src/components/chat/TypingIndicator.jsx` — 3 dots, staggered `Animated.loop` opacity pulses (pure RN Animated API, no extra library)
22. `mobile/src/components/chat/ChatThread.jsx` — `FlatList` (not ScrollView); `scrollToEnd` on new messages; empty state (Bot icon + prompt text)
23. `mobile/src/components/chat/PromptBar.jsx` — `KeyboardAvoidingView` wrapper; multiline `TextInput` (capped maxHeight); Send / Stop `IconButton`; streaming toggle (Zap icon from lucide-react-native)

---

## Phase 5 — Drawer & Screens *(4 files)*

24. `mobile/app/_layout.jsx` — root layout: wraps tree in `ThemeContext.Provider` + `ChatStoreProvider`; loads Inter via `expo-font`; `SplashScreen.preventAutoHideAsync()` + hide after fonts loaded; `StatusBar` style from theme
25. `mobile/app/(drawer)/_layout.jsx` — `<Drawer>` from `expo-router/drawer`; `drawerContent` prop → `DrawerContent` component; `drawerStyle` width 280; background color from theme tokens
26. `mobile/src/components/layout/DrawerContent.jsx` — session `FlatList`, "New Chat" button, theme toggle (Sun/Moon icon), agent info footer (tool count, version); active session highlighted in `primary-container` color; all RN primitives (`TouchableOpacity`, `Text`, `View`)
27. `mobile/app/(drawer)/index.jsx` — chat screen: `SafeAreaView` + `ChatThread` + `PromptBar`; header configured via `expo-router` `<Stack.Screen>` options with `DrawerToggleButton`; inline error banner (dismissible)

---

## Phase 6 — Validate

28. `get_errors` across all `mobile/src/` and `mobile/app/` files; fix any issues
29. `npx expo start --android` smoke-test checklist:
    - App loads, splash screen hides cleanly
    - Auto-creates first session on mount
    - Send a message → response renders as markdown
    - Toggle dark/light → all screens update
    - Open drawer → switch sessions → history loads

---

## Reference Files (from web implementation)

| Web file | Mobile action |
|---|---|
| `frontend/src/api/client.js` | Port — swap env var prefix |
| `frontend/src/store/chatStore.jsx` | Port 1:1 (pure JS) |
| `frontend/src/hooks/useChat.js` | Port 1:1 |
| `frontend/src/hooks/useSessions.js` | Port — swap localStorage → AsyncStorage |
| `frontend/docs/DESIGN.md` | All color / spacing / radius / typography tokens |

---

## Key Decisions

- **No Tailwind** — not available in React Native; all styling via `StyleSheet.create` with imported design tokens from `tokens.js`
- **Android emulator URL** `http://10.0.2.2:9098` maps to host machine `localhost`; physical device needs the machine's LAN IP
- **lucide-react-native** (not lucide-react) + `react-native-svg` peer dep — same 2px-stroke rounded icon style as DESIGN.md
- **SSE streaming** via `fetch` + `ReadableStream` — available in Hermes (RN 0.76 / SDK 53); same `AbortController` cancel pattern as web
- **`react-native-reanimated/plugin` must be last** in `babel.config.js` plugins array
- **Expo Router `app/(drawer)/`** group — single chat screen in v0.1.0, easily extended later
- **No TypeScript** — consistent with web repo

---

## Excluded (v0.1.0)

- iOS support (Android-only per requirement)
- EAS `eas.json` build configuration (steps documented in README)
- Push notifications, file upload, authentication
- Syntax highlighting inside code blocks (plain monospace only)
