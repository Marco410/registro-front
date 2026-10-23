"use client";

import { RequireAdmin } from "registro/components/auth";

export default function BaseDeDatosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAdmin>{children}</RequireAdmin>;
}
