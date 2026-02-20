"use client";

import { useMemo, useState } from "react";

const MES_OPTIONS: { value: string; label: string }[] = [
  { value: "01", label: "Ene - 01" },
  { value: "02", label: "Feb - 02" },
  { value: "03", label: "Mar - 03" },
  { value: "04", label: "Abr - 04" },
  { value: "05", label: "May - 05" },
  { value: "06", label: "Jun - 06" },
  { value: "07", label: "Jul - 07" },
  { value: "08", label: "Ago - 08" },
  { value: "09", label: "Sep - 09" },
  { value: "10", label: "Oct - 10" },
  { value: "11", label: "Nov - 11" },
  { value: "12", label: "Dic - 12" },
];

function getMesLabel(value: string): string {
  if (!value) return "";
  const opt = MES_OPTIONS.find((o) => o.value === value);
  return opt?.label ?? value;
}

function filterMesOptions(query: string): { value: string; label: string }[] {
  const q = query.trim().toLowerCase();
  if (!q) return MES_OPTIONS;
  return MES_OPTIONS.filter(
    (o) =>
      o.value === q ||
      o.value === q.padStart(2, "0") ||
      o.label.toLowerCase().includes(q)
  );
}

export interface MonthAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectNext?: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

/**
 * Autocomplete de mes: muestra opciones tipo "Ene - 01", "Feb - 02", etc.
 * Guarda y recibe valor numérico "01".."12". El usuario puede escribir "ene" o "01" para filtrar.
 */
export function MonthAutocomplete({
  value,
  onChange,
  onSelectNext,
  inputRef,
  className,
  id = "fecha_mes",
  "aria-label": ariaLabel = "Mes",
}: MonthAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => filterMesOptions(filter), [filter]);
  const displayValue = open || filter ? filter : getMesLabel(value);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setFilter("");
    setOpen(false);
    onSelectNext?.();
  };

  return (
    <div className="relative min-w-0 flex-[1.5]">
      <input
        ref={inputRef}
        id={id}
        type="text"
        autoComplete="off"
        placeholder="Mes (ej. Ene o 01)"
        value={displayValue}
        onChange={(e) => {
          const v = e.target.value;
          setFilter(v);
          setOpen(true);
          if (v === "") {
            onChange("");
            return;
          }
          const matches = filterMesOptions(v);
          if (matches.length === 1) {
            handleSelect(matches[0].value);
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(() => {
            setOpen(false);
            setFilter("");
          }, 150);
        }}
        className={`w-full text-center tabular-nums ${className ?? ""}`}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${id}_list`}
        aria-activedescendant={
          open && filtered[0] ? `${id}_opt_${filtered[0].value}` : undefined
        }
      />
      {open && (
        <ul
          id={`${id}_list`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-[#202124]"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-center text-sm text-app-text-secondary dark:text-gray-400">
              Sin coincidencias
            </li>
          ) : (
            filtered.map((opt) => (
              <li
                key={opt.value}
                id={`${id}_opt_${opt.value}`}
                role="option"
                aria-selected={value === opt.value}
                className="cursor-pointer px-3 py-2 text-sm text-app-text-primary hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt.value);
                }}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
