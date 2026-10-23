# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Frontend for the A&R Morelia retreat registration system (ICARM). Staff use it to register attendees ("encontrados"), check them in, assign seats by team ("aforo"), print badges ("gafetes") and baptism certificates, and view statistics. Stack: Next.js 15 (App Router), React 18, Apollo Client, Tailwind, Zod. The backend is a separate Keystone GraphQL API (port 3001 locally). UI copy, code comments and domain names are in Spanish, so keep new code consistent with that.

## Commands

Package manager is pnpm (`packageManager: pnpm@9.15.9`).

- `pnpm dev`: dev server on :3000. It needs the backend running at `NEXT_PUBLIC_API_URL`.
- `pnpm build` / `pnpm start`
- `pnpm exec tsc --noEmit`: type-check.
- `pnpm lint`: `next lint` with `next/core-web-vitals` (`.eslintrc.json`). Once a config exists, `next build` also runs lint and fails on errors.
- There is no test framework installed, even though the Cursor rule mentions Playwright.

Env: copy `env.template` to `.env`. `src/hooks/apollo-client.ts` picks the GraphQL URL when the module loads. On host `registroayr.kadesh.mx` (the Cloudflare tunnel, see `README-TUNNEL-CLOUDFLARE.md`) it uses `NEXT_PUBLIC_TUNNEL_API_URL`; on any other host it uses `NEXT_PUBLIC_API_URL`.

## Conventions (from `.cursor/rules/basic.mdc` and existing code)

- Import alias is `registro/*` → `src/*` (not `@/`).
- Icons always come from `@hugeicons/react` (`<HugeiconsIcon icon={...} />`) with icons from `@hugeicons/core-free-icons`.
- Validate with Zod and style with Tailwind. Use the custom `app-*` palette in `tailwind.config.ts` (`app-primary`, `app-surface`, `app-text-primary`, …) with `dark:` variants.
- Size text in rem, never px (`text-[0.6875rem]`, not `text-[11px]`). The header's text-size control (`components/dashboard/font-size-control.tsx`, `src/lib/font-scale.ts`) scales the root font size through `--font-scale` on `<html>`, applied before first paint by a script in `app/layout.tsx`, so anything sized in px stays the same size. The control itself is the exception: it uses px on purpose so it doesn't move under the cursor.
- Use toasts from `sonner` for user feedback. Mutation hooks show success and error toasts themselves.
- Add JSDoc on non-trivial functions and hooks, written in Spanish like the existing ones.

## Architecture

### Client-side app
Auth, data fetching and app state all live in the browser (localStorage, sessionStorage, Apollo). Interactive dashboard pages are `"use client"`. `src/app/providers.tsx` nests `ApolloProvider → AuthProvider → ActiveEventProvider`.

### Auth (Keystone sessions)
- `src/contexts/auth-context.tsx` logs in with `authenticateUserWithPassword`. The session token is saved to localStorage (`keystonejs-session-token`) and to a `keystonejs-session` cookie (`src/lib/auth.ts`). The Apollo `authLink` sends it as `Bearer`. On mount, the provider resolves the current user through `authenticatedItem`.
- The session lasts until an admin closes it from Usuarios (`revokeUserSessions`; the backend's `auth/session.ts` rejects tokens issued before `User.sessionsRevokedAt`). The front only logs someone out when `authenticatedItem` comes back `null` from a successful response. A network error or a slow server never sends anyone to login: `RequireAuth` shows a retry screen instead. The last confirmed user is kept in localStorage (`registro-session-user`), so a reload opens the dashboard right away and verifies in the background. `AuthProvider` re-checks every 60 s, when the tab becomes visible, when the browser comes back online, and when an Apollo error link sees "No autorizado" or "Access denied" (`SESSION_CHECK_EVENT`).
- `app/dashboard/layout.tsx` wraps everything in `RequireAuth`, and the login page uses `RedirectIfAuthenticated`. Use `useAuth` from `registro/hooks/use-auth`.
- The backend (`registro-back`) requires a session for every list and custom mutation. Without one, queries come back empty or `null` and mutations fail. The only exception is `Role`, which is readable so that the login response can include `roles`.
- Admin means `isAdmin(user)` from `src/lib/auth.ts` (a role named `admin`). `sidebar.tsx` uses it to show the Eventos, Usuarios, Auditoría and Base de datos links, and `RequireAdmin` (applied in the `layout.tsx` of `app/dashboard/eventos`, `usuarios`, `auditoria` and `base-de-datos`) redirects non-admins to `/dashboard`. This gate is UI-only for Eventos and Usuarios: the backend does not distinguish roles there. The exceptions are the backend's `AuditLog` list, which only admins can query, and the maintenance mutations used by Base de datos (`generateTeams`, `cleanDatabase`, `seedAgeGroups`) and by "Gestionar equipos" in Aforo (`reorderTeams`, `deleteEmptyTeam`), which check for admin on the server.

### Auditoría (activity log)
`/dashboard/auditoria` lists every action users take (sessions, registros, edits with before/after values, check-ins, aforo, events, users). The log is written by the backend (`AuditLog` list and `registro-back/utils/audit/`), so the front never records anything; it only reads `AUDIT_LOGS_QUERY` (`src/graphql/auditoria/queries.ts`, filters built by `buildAuditWhere`). Action and field labels live in `components/dashboard/auditoria/constants.ts` and must match the action values in `registro-back/models/AuditLog/constants.ts`. Browser-only actions (printing, Excel exports, searches, navigation) are intentionally not logged. Usuarios links to the log filtered by user with `routes.dashboardAuditoria(userId)`.

### Active event (`retiro` vs `ninos`)
`src/contexts/active-event-context.tsx` reads the active event from the backend with `ACTIVE_EVENT_QUERY` (the event with `active: true`; the backend keeps only one). It skips the query while there is no session and polls every 60 s so that stations already open pick up a change. To change the active event, edit it in `/dashboard/eventos`; the event mutations refetch `ACTIVE_EVENT_QUERY`. The client never sends the event id to the API. The context's main effect is `isNinosEvent`, which switches the registro form fields and the Zod schema (`getEncontradoSchema` in `src/lib/validations/encontrado.ts`). With no active event, the form falls back to retiro behavior.

### Routing and the registro → check-in handoff
- `/dashboard` renders Registro and Check-in as tabs (`?tab=registro|checkin`) by importing `app/dashboard/registro/page.tsx` and `app/dashboard/checkin/page.tsx` as components. Those routes also work on their own. Build URLs with the `routes` helpers in `src/constants/routes.ts`.
- Registering a person runs `createEncontradoTransactional`, then `performCheckin`. The check-in result is saved in sessionStorage under `PENDING_CHECKIN_RESULT_KEY`, and the app navigates to the check-in tab, which reads the entry and deletes it. The selected sexo is shared between tabs through localStorage (`REGISTRO_SEXO_KEY`).

### GraphQL
- Operations live in `src/graphql/<domain>/{queries,mutations}.ts` as `gql` documents, with hand-written TS response and variable interfaces beside them (no codegen). One exception: the create-encontrado mutation is in `src/components/dashboard/registro/mutations.ts`.
- Most operations are Keystone CRUD (`where` / `data` inputs, `connect`). Custom resolvers include `performCheckin` and `createEncontradoTransactional`.
- Fresh data comes from `refetchQueries` after each mutation. Pass the query document, either `[ENCONTRADOS_QUERY]` (refetches every active query using it, with its current variables) or `{ query: SEATS_QUERY }`, rather than an operation-name string, which breaks silently if the operation is renamed. The default `watchQuery` fetch policy is `cache-and-network`.

### Feature folders
`src/components/dashboard/<feature>/` holds that feature's components. It also has a `hooks/` folder, usually one hook per mutation or action wrapping `useMutation` plus toasts, and an `index.ts` barrel that pages import from. Shared UI such as `GlassModal`, count cards and `SexoSelector` lives in `src/components/shared`. Aforo seat updates go through `SeatUpdateProvider` (`aforo/seat-update-context.tsx`), which refetches `SEATS_QUERY`.

### Printing and exports
- Badges and certificates are printed from the browser. `checkin/hooks/use-printer-gafete.ts` and `aforo/hooks/use-printer-certificate.ts` build a complete HTML document on a background image from `public/images/`, write it into a hidden iframe and call `print()`. Badges are sized for Brother QL-800 labels (62×100 mm). `processName` holds the name-shortening rules. The backend has no printing endpoint.
- Excel exports (`aforo/hooks/use-export-*.ts`) use `xlsx-js-style` for styled cells.
- Statistics (`estadisticas/`) come from one query (`ESTADISTICAS_QUERY`), aggregated client-side in `src/lib/helpers/estadisticas.ts`. Charts are plain HTML/Tailwind (bar tables, age pyramid, meters, hourly columns) with series colors in `estadisticas/chart-ui.tsx`, validated for color-vision deficiency and contrast in light and dark mode. `apexcharts` is still in `package.json` but no longer used.
