import type { Metadata } from "next";
import "registro/app/globals.css";
import { Providers } from "registro/app/providers";

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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
