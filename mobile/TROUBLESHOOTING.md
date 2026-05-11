# Troubleshooting

## App shows blank screen on emulator

- Confirm `.env` file exists with correct `EXPO_PUBLIC_API_BASE_URL`
- Run `npx expo start --clear` to clear Metro cache
- Check Metro bundler output for JS errors

## "Network request failed" when sending a message

- `10.0.2.2:9098` maps to **host machine localhost** on the Android emulator
- If using a physical device, replace with your machine's LAN IP (e.g. `192.168.1.10:9098`)
- Verify backend is healthy: `curl http://localhost:9098/api/v1/health`

## Drawer does not open / gesture not working

- Ensure `react-native-gesture-handler` is installed and `GestureHandlerRootView` wraps the root
- Expo Router's root `_layout.jsx` wraps with `GestureHandlerRootView` automatically in SDK 53

## Reanimated warnings on startup

- Confirm `react-native-reanimated/plugin` is the **last** plugin in `babel.config.js`
- Run `npx expo start --clear` after any babel config change

## Fonts not loading / Inter missing

- `expo-font` loads Inter on app start via `useFonts` in `app/_layout.jsx`
- If the splash screen never hides, check that `SplashScreen.hideAsync()` is called after fonts load

## Dark mode not toggling

- The toggle button is in the drawer footer (Moon/Sun icon)
- Preference is persisted in AsyncStorage under `cortex-theme`
- Clear AsyncStorage in dev: run `AsyncStorage.clear()` from a dev console or reinstall the app
