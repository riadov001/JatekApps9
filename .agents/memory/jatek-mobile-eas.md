---
name: Jatek mobile EAS build setup
description: EAS build quirks for the jatek-mobile pnpm monorepo workspace — config format, pnpm version, CLI path.
---

## Rules

1. **Use `app.config.js`, not `app.config.ts`** — EAS CLI reads the config via its own transpiler, which fails on TypeScript with `Cannot read properties of undefined (reading 'CommonJS')`. The plain JS version works reliably.

2. **Set `PNPM_VERSION: "10.0.0"` in every EAS build profile env** — EAS Cloud defaults to an older pnpm that doesn't understand `catalog:` specifiers used in the workspace's `pnpm-workspace.yaml`. Without this, installs fail.

3. **EAS CLI is local to jatek-mobile** — run as `node_modules/.bin/eas` from `artifacts/jatek-mobile/`. Not globally installed. Command: `EXPO_TOKEN=$EXPO_TOKEN node_modules/.bin/eas build --profile <profile> --platform android --non-interactive --no-wait`.

4. **OTA update command** — `EXPO_TOKEN=$EXPO_TOKEN node_modules/.bin/eas update --channel production --message "..." --non-interactive` — bundles both iOS and Android, uploads to EAS.

5. **Remove `--go` from `expo start`** — the app uses `expo-dev-client`, `react-native-keyboard-controller`, `react-native-worklets`, and `expo-notifications`, all of which are custom native modules incompatible with standard Expo Go. `--go` forces Expo Go mode and breaks the dev server. Use `expo start --tunnel` instead; the CLI will show "Using development build" mode.

**Why:** Learned during a debugging session where EAS builds failed due to TypeScript config, pnpm catalog syntax errors, and the dev server showed connection errors from the `--go` flag forcing incompatible runtime.

**How to apply:** Any time you touch `app.config.*`, `eas.json`, or the `dev` script in `artifacts/jatek-mobile/package.json`.
