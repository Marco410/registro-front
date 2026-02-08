# registro Landing Page

Landing page para registro, un santuario digital para animales, construido con Next.js 14+, Mantine UI y Apollo Client.

## Tecnologías

- Next.js 14+ (app/ directory)
- Mantine UI (@mantine/core, @mantine/hooks)
- Apollo Client (GraphQL)
- Framer Motion (animaciones suaves)
- Tipografía: Poppins, Inter

## Estructura

- Componentes en `src/components/`
- Página principal en `src/app/page.tsx`
- Estilos globales en `src/app/globals.css`

## Configuración

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Crea un archivo `.env.local` en la raíz del proyecto con:
   ```env
   NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://tu-endpoint-keystonejs.com/api/graphql
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Personalización

- Cambia el endpoint GraphQL en `.env.local` según tu KeystoneJS.
- El botón de donaciones es un placeholder para Stripe Checkout.

## Secciones

- Hero emocional
- ¿Qué es registro?
- Problema y solución
- ¿Cómo funciona?
- Tienda en línea
- Testimonios
- Únete como aliado
- Donaciones
- Footer con redes y contacto

---

Hecho con ❤️ para los animales.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
