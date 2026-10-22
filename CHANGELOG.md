# Changelog

Registro de cambios del front, agrupado por módulo. Cada módulo explica las decisiones que se tomaron, qué cambió, qué archivos toca y cómo comprobarlo. Los cambios del backend están en `registro-back/CHANGELOG.md`.

## [Sin publicar] — 2026-10-22

### Eventos: evento activo

**Decisiones**

- El evento activo sale del backend: es el evento con `active: true`. El backend ya garantiza que solo haya uno (`registro-back/models/Event/Event.hooks.ts`), así que todas las estaciones ven el mismo.
- Se dejó de guardar en localStorage. Antes solo lo escribía el navegador del admin que guardaba el evento. Las demás estaciones no se enteraban y usaban el formulario de retiro aunque el evento fuera de niños.
- La consulta se repite cada 60 s para que una estación ya abierta se entere del cambio sin recargar. Es una consulta de un solo registro.
- La consulta no se hace mientras no hay sesión, porque el backend ya no devuelve datos sin sesión.

**Cambios**

- Nueva `ACTIVE_EVENT_QUERY`.
- `ActiveEventProvider` lee el evento de esa query. El contexto ya no expone `setActiveEvent`, `clearActiveEvent` ni `clearIfMatches`. `useActiveEvent` y `useIsNinosEvent` no cambian para los componentes que solo leen: el header y los formularios de registro.
- Crear, editar y borrar un evento ahora hace refetch de `ACTIVE_EVENT_QUERY` además de `EVENTS_QUERY`.

**Archivos**

- `src/graphql/events/queries.ts`
- `src/contexts/active-event-context.tsx`
- `src/components/dashboard/events/event-form-modal.tsx`
- `src/components/dashboard/events/delete-event-confirm.tsx`

**Acción requerida**

Ninguna. Las claves viejas `registro_active_event_*` se quedan en el localStorage de cada navegador, pero ya no se leen.

**Cómo verificar**

1. Como admin, marca un evento de niños como activo en `/dashboard/eventos`. El header lo muestra.
2. En otro navegador o en una ventana de incógnito, con un usuario que no sea admin, el header muestra el mismo evento y el formulario de registro pide la dirección.

### Auth y permisos: Eventos y Usuarios

**Decisiones**

- El backend exige sesión en todo, pero no distingue roles (decisión del equipo, ver `registro-back/CHANGELOG.md`, entrada 1). Por eso la restricción de admin del front es **solo de interfaz**: un usuario sin rol admin todavía puede llamar directamente al API de eventos o de usuarios.
- `/dashboard/eventos` y `/dashboard/usuarios` redirigen a `/dashboard` cuando el usuario no es admin. Antes solo se ocultaban los links del menú, y la página abría si se escribía la URL.
- La regla "es admin" vive en un solo lugar, `isAdmin` en `src/lib/auth.ts`, para que el menú y la protección de las páginas no se desfasen.

**Cambios**

- Nuevo `isAdmin(user)`, que ahora también usa el sidebar.
- Nuevo componente `RequireAdmin`, con el mismo patrón que `RequireAuth`.
- Nuevos layouts de `eventos` y `usuarios` que envuelven la página en `RequireAdmin`.

**Archivos**

- `src/lib/auth.ts`
- `src/components/auth/require-admin.tsx` (nuevo)
- `src/components/auth/index.ts`
- `src/app/dashboard/eventos/layout.tsx` (nuevo)
- `src/app/dashboard/usuarios/layout.tsx` (nuevo)
- `src/components/dashboard/sidebar.tsx`

**Cómo verificar**

Con un usuario sin rol admin, abre directamente `/dashboard/eventos` y `/dashboard/usuarios`. Las dos redirigen a `/dashboard`.

### Check-in

**Decisiones**

- Los atajos de teclado de la tarjeta leen los valores actuales por medio de refs, igual que los atajos que ya funcionaban. Así no se vuelve a registrar el listener en cada cambio.

**Cambios**

- **Bug corregido:** con un encontrado seleccionado, si se elegía otro desde el buscador, Ctrl+E abría la edición del primero. La tarjeta no se desmonta al cambiar de selección, y el atajo seguía usando el id del primer render.
- Tras hacer check-in, la lista "Mis check-ins" se refresca con `CHECKINS_QUERY` en lugar del nombre `"Checkins"`. Guardar celular y medicamento usa `ENCONTRADOS_QUERY` (ver "Datos (GraphQL)").

**Archivos**

- `src/components/dashboard/checkin/CardBeforeCheckin.tsx`
- `src/components/dashboard/checkin/hooks/use-perform-checkin.ts`
- `src/components/dashboard/checkin/hooks/use-update-checkin-options.ts`

**Cómo verificar**

1. Selecciona al encontrado A y luego al B desde el buscador.
2. Presiona Ctrl+E. Se abre la edición de B.

### Registro

**Cambios**

- **Bug corregido:** en el modal de confirmación, Ctrl+P (guardar e imprimir gafete) ejecutaba el handler del primer render, con el formulario vacío. La validación fallaba y no pasaba nada. Ahora el ref se actualiza en cada render.
- Ctrl+S y Escape del mismo modal ahora también leen el handler por ref. Ya funcionaban, porque el listener se registraba al abrir el modal, pero se unificó para que no pueda repetirse el mismo bug.
- Crear y editar un encontrado refrescan la lista con `ENCONTRADOS_QUERY`.
- El campo de mes (`MonthAutocomplete`) declara `role="combobox"`. Es un ajuste de accesibilidad: el input ya tenía listbox y `aria-expanded`.

**Archivos**

- `src/components/dashboard/registro/ConfirmRegistroModal.tsx`
- `src/components/dashboard/registro/hooks/use-create-encontrado.ts`
- `src/components/dashboard/registro/hooks/use-update-encontrado.ts`
- `src/components/dashboard/registro/forms/MonthAutocomplete.tsx`

**Cómo verificar**

1. Llena el formulario de registro y abre el modal de confirmación.
2. Presiona Ctrl+P. El encontrado se guarda y se abre la impresión del gafete.

### Estadísticas

**Cambios**

- **Bug corregido:** las gráficas de religión y de estado civil se destruían y se volvían a crear en cada render, y por eso se reanimaban. Los datos agregados eran un arreglo nuevo en cada render y estaban en las dependencias del efecto. Ahora se calculan con `useMemo` sobre la respuesta de la query.

**Archivos**

- `src/components/dashboard/estadisticas/ReligionBarChart.tsx`
- `src/components/dashboard/estadisticas/EstadoCivilBarChart.tsx`

**Cómo verificar**

Las gráficas se animan solo cuando cargan o cuando cambian los datos.

### Aforo y Usuarios

**Cambios**

- La lista de asientos (`SeatsByTeam`) y la de usuarios se memorizan con `useMemo`, para que el agrupado y el ordenamiento no se recalculen en cada render. No hay cambio visible.

**Archivos**

- `src/components/dashboard/aforo/SeatsByTeam.tsx`
- `src/app/dashboard/usuarios/page.tsx`

### Datos (GraphQL)

**Decisiones**

- `refetchQueries` recibe el documento de la query (`[ENCONTRADOS_QUERY]`), no el nombre de la operación (`["Encontrados"]`). Con el nombre, renombrar la operación rompía el refetch sin aviso. Con Apollo 3.11, el documento refresca todas las queries activas que lo usan, con sus variables actuales, igual que el nombre.
- Se borró el código sin uso:
  - `src/graphql/printGafete/mutations.ts`: `makePrintGafete` no existe en el backend, y los gafetes se imprimen desde el navegador.
  - `src/graphql/dashboard/queries.ts`: no se importaba, y repetía el nombre de operación `DashboardCounts` de `AFORO_QUERY`.

**Archivos**

- Los hooks listados en Check-in y Registro.
- `src/graphql/printGafete/mutations.ts` (borrado)
- `src/graphql/dashboard/queries.ts` (borrado)

### Herramientas y limpieza

**Decisiones**

- ESLint usa la config estándar de Next (`next/core-web-vitals`). Desde que existe la config, `next build` también corre lint: falla con errores, no con warnings.
- `tsconfig.tsbuildinfo` sale de git, porque `tsc` y `next build` lo reescriben y ensuciaban el árbol en cada build.

**Cambios**

- Nuevo `.eslintrc.json`. Antes `pnpm lint` abría el asistente de configuración. Se corrigieron los 9 warnings que aparecieron, y hoy da 0.
- El logo usa `next/image` en el login y en el sidebar, por un warning de lint.
- `*.tsbuildinfo` se agregó a `.gitignore`, y `tsconfig.tsbuildinfo` se quitó del índice.
- Se borró `src/hooks/auth.ts` (`tokenStorage`, clave `auth_token`). No se usaba: la sesión la maneja `src/lib/auth.ts`.
- `CLAUDE.md` se actualizó con todo lo anterior.

**Archivos**

- `.eslintrc.json` (nuevo)
- `.gitignore`
- `tsconfig.tsbuildinfo` (fuera de git)
- `src/hooks/auth.ts` (borrado)
- `src/app/auth/login/page.tsx`
- `src/components/dashboard/sidebar.tsx`
- `CLAUDE.md`

## Cómo se verificó

- `pnpm exec tsc --noEmit`: sin errores.
- `pnpm lint`: sin warnings ni errores.
- `next build`: exitoso. Se compiló en una copia del repo, porque había un `next dev` corriendo sobre `.next`.
- `ACTIVE_EVENT_QUERY` contra el API local sin sesión devuelve `{"events":[]}`: la query es válida y el backend la bloquea sin sesión.
- Con `next dev`, `/auth/login`, `/dashboard`, `/dashboard/eventos`, `/dashboard/usuarios` y `/dashboard/estadisticas` responden 200.
- **Falta probar en el navegador:** los pasos de "Cómo verificar" de cada módulo, que requieren iniciar sesión.

## Pendientes fuera de alcance (anotados, sin cambios)

- `src/hooks/apollo-client.ts` pasa `credentials` al constructor de `ApolloClient`. Apollo lo marca como deprecado (aparece un aviso en el build): debería ir solo en el link.
- En `src/app/dashboard/registro/page.tsx`, `handleConfirmAndPrint` imprime en consola los datos personales del formulario con `console.log`.
- El backend ignora el argumento `userId` de `performCheckin` y usa el usuario de la sesión (está marcado `@deprecated`). El front lo sigue mandando.
- Al cerrar sesión no se limpia la caché de Apollo. Si otra persona inicia sesión en el mismo navegador sin recargar, las queries con `cache-and-network` muestran primero lo que quedó en caché.
