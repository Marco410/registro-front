"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import {
  AuditoriaFilters,
  AuditoriaTable,
  useAuditLogs,
} from "registro/components/dashboard/auditoria";
import {
  EMPTY_AUDIT_FILTERS,
  type AuditLogFilters,
} from "registro/graphql/auditoria/queries";
import {
  USER_OPTIONS_QUERY,
  type UserOptionsQueryResponse,
} from "registro/graphql/users/queries";
import { AnimatedMount } from "registro/components/shared";

export default function DashboardAuditoriaPage() {
  const searchParams = useSearchParams();
  const userParam = searchParams.get("user") ?? "";

  const [filters, setFilters] = useState<AuditLogFilters>({
    ...EMPTY_AUDIT_FILTERS,
    userId: userParam,
  });
  const [page, setPage] = useState(1);

  // Al llegar desde "Ver actividad" de Usuarios con la página ya abierta
  useEffect(() => {
    setFilters((prev) =>
      prev.userId === userParam ? prev : { ...prev, userId: userParam },
    );
    setPage(1);
  }, [userParam]);

  const updateFilters = useCallback((patch: Partial<AuditLogFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const { data: usersData } = useQuery<UserOptionsQueryResponse>(USER_OPTIONS_QUERY);
  const { logs, total, take, skip, loading, error, refetch } = useAuditLogs(
    filters,
    page,
  );

  return (
    <div className="w-full max-w-7xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="border-l-4 border-app-primary pl-4">
          <h1 className="text-2xl font-semibold tracking-tight text-app-text-primary dark:text-white sm:text-3xl">
            Auditoría
          </h1>
          <p className="mt-1 text-sm text-app-text-secondary dark:text-gray-400">
            Todo lo que hacen los usuarios en la plataforma: sesiones, registros,
            ediciones, check-ins, aforo, eventos y usuarios.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-app-text-primary transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <HugeiconsIcon icon={RefreshIcon} size={16} />
          Actualizar
        </button>
      </div>

      <AnimatedMount show={true} animationKey="auditoria-list">
        <div className="mt-8 space-y-4">
          <AuditoriaFilters
            filters={filters}
            onChange={updateFilters}
            users={usersData?.users ?? []}
          />

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              Error al cargar la bitácora
            </p>
          ) : (
            <AuditoriaTable
              logs={logs}
              total={total}
              page={page}
              take={take}
              skip={skip}
              loading={loading}
              onPageChange={setPage}
            />
          )}
        </div>
      </AnimatedMount>
    </div>
  );
}
