# Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository and create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes, keeping commits focused and descriptive
3. Ensure the dev server starts without errors: `npm run dev`
4. Build passes cleanly: `npm run build`
5. Open a Pull Request describing your changes

## Code Style

- JavaScript (no TypeScript) — JSDoc on exported functions
- Tailwind utility classes only; no inline `style` props
- Component files: PascalCase; hooks: camelCase prefixed with `use`
