"use client";

import "./globals.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import ApolloProviderWrapper from "../providers/ApolloProviderWrapper";
import { ThemeProvider } from "../providers/ThemeProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Registro</title>
      </head>
      <body className="font-sans bg-[#ffffff] dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] transition-colors duration-200">
        <ThemeProvider>
          <ApolloProviderWrapper>
            {children}
            <SpeedInsights />
            <Analytics />
          </ApolloProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
