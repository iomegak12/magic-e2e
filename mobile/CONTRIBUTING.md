# Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository and create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes, keeping commits focused and descriptive
3. Ensure the app starts without errors: `npx expo start --android`
4. Open a Pull Request describing your changes

## Code Style

- JavaScript (no TypeScript) — JSDoc on exported functions
- StyleSheet.create for all styles; no inline style objects except for dynamic values
- Component files: PascalCase; hooks: camelCase prefixed with `use`
