# Jatek Food Delivery Platform

Jatek is a full-stack food delivery application serving Oujda, Morocco, connecting customers, drivers, and restaurants.

## Run & Operate

### Workflows (Replit)
- **"Start application"** — Backend dashboard (Vite) on port 5000 (`PORT=5000 BASE_PATH=/ pnpm --filter @workspace/backend-dashboard run dev`)
- **"artifacts/api-server: API Server"** — Express API on port 8080 (`pnpm --filter @workspace/api-server run dev`)

### CLI
- `pnpm install`: Install all workspace dependencies.
- `pnpm --filter @workspace/db run push`: Push DB schema changes (development only).
- `pnpm --filter @workspace/api-server run dev:push`: Run API server with DB schema push.
- `pnpm --filter @workspace/api-spec run codegen`: Regenerate API hooks and Zod schemas from OpenAPI spec.
- `pnpm run typecheck`: Full typecheck across all packages.
- `pnpm run build`: Typecheck and build all packages.
- `psql $DATABASE_URL`: Direct DB access via SQL.

### Secrets required
- `SESSION_SECRET` — JWT signing secret (also used as cookie secret)
- `VAPID_PRIVATE_KEY` — Web push notification private key
- Optional: `TWILIO_*`, `INFOBIP_*`, `RESEND_*`, `EXPO_TOKEN`, `GOOGLE_MAPS_KEY` for SMS/email/mobile features

### Env vars (non-secret)
- `DATABASE_URL` — Runtime-managed by Replit (PostgreSQL auto-provisioned)
- `VAPID_PUBLIC_KEY` — Web push public key (set in shared env)
- `EXPO_PUBLIC_DOMAIN` — Public domain for mobile API calls (set in shared env)

## Stack

- **Monorepo**: pnpm workspaces
- **Runtime**: Node.js 24
- **Language**: TypeScript 5.9
- **API**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, drizzle-zod
- **API Codegen**: Orval
- **Build**: esbuild

## Where things live

- `artifacts/api-server`: Express.js REST API.
- `artifacts/food-delivery`: React + Vite customer frontend.
- `artifacts/jatek-mobile`: Expo (React Native) customer mobile app.
- `artifacts/jatek-driver`: Expo (React Native) driver mobile app.
- `artifacts/backend-dashboard`: React + Vite admin dashboard.
- `lib/api-spec/openapi.yaml`: OpenAPI specification (source of truth for API contracts).
- `lib/db/schema.ts`: Drizzle ORM database schema definition.
- `artifacts/food-delivery/src/index.css`: Tailwind CSS configuration and web theme tokens.
- `artifacts/jatek-mobile/constants/colors.ts`: Mobile app brand color palette.
- `artifacts/food-delivery/src/locales/{en,fr,ar}.json`: i18n translation files.

## Architecture decisions

- **Monorepo Structure**: Uses pnpm workspaces for managing multiple related packages, enabling shared dependencies and streamlined development across frontend, backend, and mobile applications.
- **API-first Design**: OpenAPI specification (`openapi.yaml`) is the single source of truth for all API contracts, driving code generation for client-side hooks and Zod schemas to ensure consistency.
- **Multi-Client Support**: Separate frontend applications for customer web, customer mobile, driver mobile, and an admin dashboard, all consuming the same core API but tailored for their respective user experiences.
- **Production Hardening**: API server includes security (helmet, CORS), performance (gzip compression), rate limiting, and robust error handling for stability in production environments.
- **Mobile Build Process**: Utilizes EAS for mobile app builds, with a custom shell script to manage profiles and platforms, explicitly bypassing Replit's auto-inclusion of build workflows.

## Product

- **Customer App (Web & Mobile)**: Browse restaurants, view menus, place orders, track live deliveries, manage profiles, addresses, payment methods, and favorites.
- **Driver App**: Manage availability, receive and accept orders, navigate to pickup/delivery locations, update order status, and view earnings.
- **Restaurant Owner Dashboard**: Manage menus, orders, and review customer feedback.
- **Admin Dashboard**: Comprehensive platform management for super admins, admins, managers, including user management, order oversight, promotions, categories, and analytics.
- **Content Management**: Features for managing categories, promotional ads, and short-form video content.
- **Internationalization**: Supports English, French, and Arabic (RTL) across the customer web application.

## User preferences

_Populate as you build_

## Gotchas

- Always run `pnpm --filter @workspace/db run push` after schema changes in development.
- For iOS builds, initial interactive credential setup is required via `eas credentials`.
- Mobile build buttons are intentionally absent; use `bash scripts/eas-build.sh` for EAS builds.
- Demo/test data is never seeded in production; only core accounts are ensured.
- The `jatek-driver` EAS project ID is initially a placeholder and will be auto-populated on the first build.

## Pointers

- **pnpm workspaces**: [https://pnpm.io/workspaces](https://pnpm.io/workspaces)
- **Drizzle ORM**: [https://orm.drizzle.team/](https://orm.drizzle.team/)
- **Orval**: [https://orval.dev/](https://orval.dev/)
- **Zod**: [https://zod.dev/](https://zod.dev/)
- **Expo Application Services (EAS)**: [https://docs.expo.dev/build/introduction/](https://docs.expo.dev/build/introduction/)
- **i18next**: [https://www.i18next.com/](https://www.i18next.com/)
- **Tailwind CSS**: [https://tailwindcss.com/](https://tailwindcss.com/)
- **shadcn/ui**: [https://ui.shadcn.com/](https://ui.shadcn.com/)