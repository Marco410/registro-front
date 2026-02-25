# Túnel Cloudflare — Instrucciones

Este documento describe cómo exponer la app en local (localhost) a internet mediante un túnel de Cloudflare, para que puedas acceder por un subdominio (ej. `registroayr.kadesh.mx`) apuntando directo a tu máquina.

---

## PASO 1 — Tu dominio debe estar en Cloudflare

1. Entra a [Cloudflare](https://dash.cloudflare.com).
2. **Add a site** e ingresa tu dominio.
3. Cambia los **nameservers** en tu proveedor de dominio por los que te indique Cloudflare.
4. Espera a que el estado del sitio diga **Active**.

> Si ya hiciste esto, puedes saltar al siguiente paso.

---

## PASO 2 — Login en tu máquina

En tu Mac (o Linux), instala `cloudflared` si no lo tienes y luego inicia sesión:

```bash
cloudflared login
```

Se abrirá el navegador para autorizar el acceso.

---

## PASO 3 — Crear el túnel permanente

Crea un túnel con un nombre fijo (ej. `registro-ayr`):

```bash
cloudflared tunnel create registro-ayr
```

Guarda el **UUID** que te muestre; lo usarás en el archivo de configuración.

**Si aparece "tunnel with name already exists"** es que ese túnel ya existe. Puedes:

- **Usarlo tal cual:** sigue en el PASO 4 y usa el túnel `registro-ayr` (el UUID está en `~/.cloudflared/` en un archivo `.json`).
- **Eliminarlo y crear uno nuevo:** borra el túnel y luego créalo otra vez:

```bash
# Listar túneles para ver nombre y UUID
cloudflared tunnel list

# Eliminar el túnel por nombre (te pedirá confirmación)
cloudflared tunnel delete registro-ayr

# Opcional: crear de nuevo
cloudflared tunnel create registro-ayr
```

Tras eliminar, si creas uno nuevo guarda el nuevo UUID para el `config.yml`.

---

## PASO 4 — Crear subdominio apuntando al túnel

Asocia cada hostname (subdominio) a ese túnel. Ejemplo con front y back:

```bash
cloudflared tunnel route dns registro-ayr registroayr.kadesh.mx
cloudflared tunnel route dns registro-ayr backayr.kadesh.mx
```

Sustituye los hostnames por los que quieras usar; cada uno apuntará al mismo túnel (luego en el config indicas el puerto local de cada uno).

---

## PASO 5 — Crear archivo de configuración

Crea el archivo de config de `cloudflared`:

**Ruta:** `~/.cloudflared/config.yml`

**Contenido (ajusta según tu caso):**

```yaml
tunnel: UUID-QUE-TE-DIO
credentials-file: /Users/TU_USUARIO/.cloudflared/UUID.json

ingress:
  - hostname: registroayr.kadesh.mx
    service: http://localhost:3000
  - hostname: backayr.kadesh.mx
    service: http://localhost:3001
  - service: http_status:404
```

Reemplaza:

- `UUID-QUE-TE-DIO` → el UUID del túnel (Paso 3).
- `TU_USUARIO` → tu usuario de macOS (ej. `marcocastaneda`).
- `UUID.json` → el nombre del archivo de credenciales en `~/.cloudflared/` (suele ser `UUID-TUNNEL.json`).
- `registroayr.kadesh.mx` → hostname del front (Next.js).
- `backayr.kadesh.mx` → hostname del back (API/Keystone).
- `http://localhost:3000` → puerto del front; `http://localhost:3001` → puerto del back.

El último bloque `service: http_status:404` hace que cualquier otra petición no coincidente devuelva 404.

---

## PASO 6 — Levantar el túnel

Ejecuta:

```bash
cloudflared tunnel run registro-ayr
```

El nombre `registro-ayr` debe coincidir con el que usaste en el Paso 3.

---

## Error: "Rule #2 is matching the hostname ''"

Si al ejecutar `cloudflared tunnel run` ves:

```text
Rule #2 is matching the hostname '', but this will match every hostname, meaning the rules which follow it will never be triggered.
```

**Qué significa:** Una regla de `ingress` tiene el hostname vacío (o sin definir). Esa regla hace de “catch-all” y coincide con todo, por eso las reglas que vengan **después** nunca se usan.

**Qué hacer:**

1. Abre `~/.cloudflared/config.yml`.
2. Revisa el orden de las reglas en `ingress`:
   - **Primero:** todas las reglas con `hostname` concreto (ej. `registroayr.kadesh.mx`, `backayr.kadesh.mx`).
   - **Al final:** una sola regla de catch-all **sin** `hostname`, solo `service: http_status:404`.

3. **Ejemplo correcto con un solo hostname:**

```yaml
ingress:
  - hostname: registroayr.kadesh.mx
    service: http://localhost:3000
  - service: http_status:404
```

4. **Ejemplo correcto con dos hostnames:**

```yaml
ingress:
  - hostname: registroayr.kadesh.mx
    service: http://localhost:3000
  - hostname: backayr.kadesh.mx
    service: http://localhost:3001
  - service: http_status:404
```

No pongas `hostname:` vacío en ninguna regla y no pongas la regla `service: http_status:404` en medio; siempre debe ser la **última**.

---

## Resumen

Cuando el túnel está corriendo:

- `https://registroayr.kadesh.mx` → **localhost:3000** (front).
- `https://backayr.kadesh.mx` → **localhost:3001** (back).
- No necesitas abrir puertos en el router ni IP pública; Cloudflare se encarga del tráfico.

Para que siga funcionando, mantén la terminal abierta con `cloudflared tunnel run registro-ayr` o configura el túnel como servicio (systemd/launchd) para que se inicie automáticamente.
