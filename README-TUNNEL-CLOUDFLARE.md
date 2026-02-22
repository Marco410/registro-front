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

---

## PASO 4 — Crear subdominio apuntando al túnel

Asocia un hostname (subdominio) a ese túnel. Ejemplo para `registroayr.kadesh.mx`:

```bash
cloudflared tunnel route dns registro-ayr registroayr.kadesh.mx
```

Sustituye `registroayr.kadesh.mx` por el subdominio que quieras usar.

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
  - service: http_status:404
```

Reemplaza:

- `UUID-QUE-TE-DIO` → el UUID del túnel (Paso 3).
- `TU_USUARIO` → tu usuario de macOS (ej. `marcocastaneda`).
- `UUID.json` → el nombre del archivo de credenciales en `~/.cloudflared/` (suele ser `UUID-TUNNEL.json`).
- `registroayr.kadesh.mx` → el hostname que configuraste en el Paso 4.
- `http://localhost:3000` → el puerto donde corre tu app (Next.js por defecto es 3000).

El último bloque `service: http_status:404` hace que cualquier otra petición no coincidente devuelva 404.

---

## PASO 6 — Levantar el túnel

Ejecuta:

```bash
cloudflared tunnel run registro-ayr
```

El nombre `registro-ayr` debe coincidir con el que usaste en el Paso 3.

---

## Resumen

Cuando el túnel está corriendo:

- Las peticiones a `https://registroayr.kadesh.mx` (o el hostname que configuraste) llegan a tu **localhost:3000**.
- No necesitas abrir puertos en el router ni IP pública; Cloudflare se encarga del tráfico.

Para que siga funcionando, mantén la terminal abierta con `cloudflared tunnel run registro-ayr` o configura el túnel como servicio (systemd/launchd) para que se inicie automáticamente.
