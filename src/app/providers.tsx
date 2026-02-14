"use client";

import { ApolloProvider } from "@apollo/client";
import { Toaster } from "registro/components/shared/sonner";
import { AuthProvider } from "registro/contexts/auth-context";
import client from "registro/hooks/apollo-client";

/**
 * Root providers component that wraps the application with necessary context providers.
 *
 * Provides the following contexts in order:
 * - ApolloProvider: GraphQL client for data fetching
 * - AuthProvider: Authentication state management
 * - FontSizeProvider: Font scaling preferences
 * - Toaster: Toast notifications
 *
 * Note: ThemeProvider is moved to [locale]/layout.tsx to avoid script injection issues
 *
 * @param children - The application content to wrap with providers
 *
 * @example
 * ```tsx
 * <Providers>
 *   <App />
 * </Providers>
 * ```
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        {children}
        <Toaster position="top-center" />
      </AuthProvider>
    </ApolloProvider>
  );
}
