"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import {
  EMPTY_AUDIT_FILTERS,
  type AuditLogFilters,
} from "registro/graphql/auditoria/queries";
import type { UserOption } from "registro/graphql/users/queries";
import {
  AUDIT_ACTIONS,
  AUDIT_CATEGORIAS,
  actionsOfCategoria,
  type AuditCategoria,
} from "./constants";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-app-text-primary shadow-sm outline-none transition-colors focus:border-app-primary focus:ring-2 focus:ring-app-primary/40 dark:border-gray-700 dark:bg-[#202124] dark:text-gray-100 dark:focus:border-app-primary-muted";

const labelClass =
  "mb-1 block text-[11px] font-medium uppercase tracking-wide text-app-text-secondary dark:text-gray-400";

const CATEGORIA_PREFIX = "cat:";

/** Valor del select de acción: "" (todas), "cat:<categoria>" o el valor de una acción. */
function actionSelectValue(actions: string[]): string {
  if (actions.length === 0) return "";
  if (actions.length === 1) return actions[0];
  const categoria = (Object.keys(AUDIT_CATEGORIAS) as AuditCategoria[]).find(
    (c) => actionsOfCategoria(c).join() === actions.join(),
  );
  return categoria ? `${CATEGORIA_PREFIX}${categoria}` : "";
}

function actionsFromSelect(value: string): string[] {
  if (!value) return [];
  if (value.startsWith(CATEGORIA_PREFIX)) {
    return actionsOfCategoria(value.slice(CATEGORIA_PREFIX.length) as AuditCategoria);
  }
  return [value];
}

function userOptionLabel(u: UserOption): string {
  const name = [u.name, u.lastName].filter(Boolean).join(" ").trim();
  return name ? `${name} (${u.username})` : u.username;
}

export interface AuditoriaFiltersProps {
  filters: AuditLogFilters;
  onChange: (patch: Partial<AuditLogFilters>) => void;
  users: UserOption[];
}

/**
 * Filtros de la bitácora: usuario, acción (o categoría completa), rango de fechas, estado
 * y búsqueda por texto (con debounce de 200 ms).
 */
export function AuditoriaFilters({ filters, onChange, users }: AuditoriaFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const t = setTimeout(() => {
      const search = searchInput.trim();
      if (search !== filters.search) onChange({ search });
    }, 200);
    return () => clearTimeout(t);
  }, [searchInput, filters.search, onChange]);

  const hasFilters =
    filters.userId !== "" ||
    filters.actions.length > 0 ||
    filters.desde !== "" ||
    filters.hasta !== "" ||
    filters.status !== "" ||
    filters.search !== "";

  const clear = () => {
    setSearchInput("");
    onChange(EMPTY_AUDIT_FILTERS);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label htmlFor="audit-user" className={labelClass}>
            Usuario
          </label>
          <select
            id="audit-user"
            value={filters.userId}
            onChange={(e) => onChange({ userId: e.target.value })}
            className={inputClass}
          >
            <option value="">Todos</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {userOptionLabel(u)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="audit-action" className={labelClass}>
            Acción
          </label>
          <select
            id="audit-action"
            value={actionSelectValue(filters.actions)}
            onChange={(e) => onChange({ actions: actionsFromSelect(e.target.value) })}
            className={inputClass}
          >
            <option value="">Todas</option>
            {(Object.keys(AUDIT_CATEGORIAS) as AuditCategoria[]).map((categoria) => (
              <optgroup key={categoria} label={AUDIT_CATEGORIAS[categoria].label}>
                <option value={`${CATEGORIA_PREFIX}${categoria}`}>
                  Todo {AUDIT_CATEGORIAS[categoria].label.toLowerCase()}
                </option>
                {Object.entries(AUDIT_ACTIONS)
                  .filter(([, a]) => a.categoria === categoria)
                  .map(([value, a]) => (
                    <option key={value} value={value}>
                      {a.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="audit-desde" className={labelClass}>
            Desde
          </label>
          <input
            id="audit-desde"
            type="date"
            value={filters.desde}
            max={filters.hasta || undefined}
            onChange={(e) => onChange({ desde: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="audit-hasta" className={labelClass}>
            Hasta
          </label>
          <input
            id="audit-hasta"
            type="date"
            value={filters.hasta}
            min={filters.desde || undefined}
            onChange={(e) => onChange({ hasta: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="audit-status" className={labelClass}>
            Resultado
          </label>
          <select
            id="audit-status"
            value={filters.status}
            onChange={(e) =>
              onChange({ status: e.target.value as AuditLogFilters["status"] })
            }
            className={inputClass}
          >
            <option value="">Todos</option>
            <option value="exito">Éxito</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-text-secondary dark:text-gray-400"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por encontrado, asiento, evento o usuario…"
            className={`${inputClass} pl-9`}
            aria-label="Buscar en la bitácora"
          />
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-app-text-primary transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
