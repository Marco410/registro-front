import type { Metadata } from "next";
import "registro/app/globals.css";
import { Providers } from "registro/app/providers";
import { FONT_SCALE_INIT_SCRIPT } from "registro/lib/font-scale";

export const metadata: Metadata = {
  title: "Registro - A&R Morelia",
  description: "Sistema de registro de encontrados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light" suppressHydrationWarning>
      <head>
        {/* Aplica el tamaño de texto guardado antes del primer pintado. */}
        <script
          id="font-scale-init"
          dangerouslySetInnerHTML={{ __html: FONT_SCALE_INIT_SCRIPT }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
