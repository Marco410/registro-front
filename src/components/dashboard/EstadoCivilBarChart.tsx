"use client";

import type { ApexOptions } from "apexcharts";
import { useQuery } from "@apollo/client";
import { useEffect, useRef } from "react";
import {
  ENCONTRADOS_ESTADO_C_QUERY,
  ESTADO_C_OPTIONS,
  type EncontradosEstadoCQueryResponse,
} from "registro/graphql/encontrados/queries";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";

const CHART_COLORS = [
  "#f97316", // orange-500
  "#ef4444", // red-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
  "#22c55e", // green-500
  "#eab308", // yellow-500
];

/** Azules para hombres (H) - Tailwind blue */
const CHART_COLORS_H = [
  "#3b82f6", // blue-500
  "#60a5fa", // blue-400
  "#2563eb", // blue-600
  "#93c5fd", // blue-300
  "#1d4ed8", // blue-700
  "#bfdbfe", // blue-200
];

/** Rosas para mujeres (M) - Tailwind pink */
const CHART_COLORS_M = [
  "#ec4899", // pink-500
  "#f472b6", // pink-400
  "#db2777", // pink-600
  "#f9a8d4", // pink-300
  "#be185d", // pink-700
  "#fbcfe8", // pink-200
];

const WHERE_CON_CHECKINS = { checkins: { id: { not: null } } };

function aggregateByEstadoC(
  encontrados: { estado_c: string }[],
): { name: string; value: number }[] {
  const counts = new Map<string, number>();
  const opts = new Set(ESTADO_C_OPTIONS);
  for (const e of encontrados) {
    const raw = e.estado_c?.trim() || "Sin especificar";
    const key = opts.has(raw as (typeof ESTADO_C_OPTIONS)[number])
      ? raw
      : "Otro";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));
}

const CHART_ID_BASE = "estado-civil-column-chart";

export interface EstadoCivilBarChartProps {
  /** Filtrar por sexo: "H" hombres, "M" mujeres. Sin definir = todos. */
  sex?: "H" | "M" | null;
}

export function EstadoCivilBarChart({ sex = null }: EstadoCivilBarChartProps) {
  const chartRef = useRef<{ destroy: () => void } | null>(null);
  const where = {
    ...WHERE_CON_CHECKINS,
    ...(sex ? { sexo: { equals: sex } } : {}),
  };
  const chartId = `${CHART_ID_BASE}-${sex ?? "all"}`;

  const { data, loading, error } = useQuery<EncontradosEstadoCQueryResponse>(
    ENCONTRADOS_ESTADO_C_QUERY,
    {
      variables: { where },
    },
  );

  const chartData =
    (data?.encontrados?.length ?? 0) > 0
      ? aggregateByEstadoC(data!.encontrados)
      : [];

  const total = chartData.reduce((s, d) => s + d.value, 0);
  const topTwo = chartData.slice(0, 2);

  useEffect(() => {
    if (loading || error || chartData.length === 0) return;

    const el = document.getElementById(chartId);
    if (!el) return;

    let mounted = true;

    import("apexcharts").then(({ default: ApexCharts }) => {
      if (!mounted || !el) return;

      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      const colors =
        sex === "H"
          ? CHART_COLORS_H
          : sex === "M"
            ? CHART_COLORS_M
            : CHART_COLORS;
      const categories = chartData.map((d) => d.name);
      const seriesData = chartData.map((d, i) => ({
        x: d.name,
        y: d.value,
        fillColor: colors[i % colors.length],
      }));

      const options: ApexOptions = {
        series: [
          {
            name: "",
            data: seriesData,
          },
        ],
        chart: {
          type: "bar",
          height: 320,
          width: "100%",
          fontFamily: "Inter, sans-serif",
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "70%",
            borderRadiusApplication: "end",
            borderRadius: 8,
          },
        },
        dataLabels: { enabled: false },
        stroke: {
          show: true,
          width: 0,
          colors: ["transparent"],
        },
        xaxis: {
          categories,
          labels: {
            show: true,
            style: {
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
            },
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          show: true,
          labels: {
            style: {
              fontFamily: "Inter, sans-serif",
            },
          },
        },
        grid: {
          show: true,
          strokeDashArray: 4,
          padding: { left: 2, right: 2, top: 0 },
        },
        legend: { show: false },
        tooltip: {
          enabled: true,
          y: {
            formatter(val: number) {
              return `${val} encontrados`;
            },
          },
        },
      };

      const chart = new ApexCharts(el, options);
      chartRef.current = chart;
      chart.render();
    });

    return () => {
      mounted = false;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [loading, error, chartData, chartId, sex]);

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-[#202124] md:p-6">
      <div className="flex justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex items-center">
          <div
            className={`me-3 flex h-12 w-12 items-center justify-center rounded-full border ${
              sex === "H"
                ? "border-blue-200 bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30"
                : sex === "M"
                  ? "border-pink-200 bg-pink-100 dark:border-pink-800 dark:bg-pink-900/30"
                  : "border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-800"
            }`}
          >
            <HugeiconsIcon
              icon={UserIcon}
              size={28}
              className={
                sex === "H"
                  ? "text-blue-600 dark:text-blue-400"
                  : sex === "M"
                    ? "text-pink-600 dark:text-pink-400"
                    : "text-app-text-secondary dark:text-gray-400"
              }
            />
          </div>
          <div>
            <h5
              className={`text-2xl font-semibold ${
                sex === "H"
                  ? "text-blue-600 dark:text-blue-400"
                  : sex === "M"
                    ? "text-pink-600 dark:text-pink-400"
                    : "text-app-text-primary dark:text-white"
              }`}
            >
              {loading ? "—" : total.toLocaleString("es")}
            </h5>
            <p className="text-sm text-app-text-secondary dark:text-gray-400">
              {sex === "H"
                ? "Estado civil de hombres con check-in"
                : sex === "M"
                  ? "Estado civil de mujeres con check-in"
                  : "Estado civil de encontrados con check-in"}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2">
        {loading && (
          <div className="flex h-[320px] items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-app-text-secondary dark:text-gray-400">
              Cargando…
            </p>
          </div>
        )}
        {error && (
          <div className="flex h-[320px] items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/10">
            <p className="text-sm text-red-600 dark:text-red-400">
              Error al cargar datos
            </p>
          </div>
        )}
        {!loading && !error && chartData.length === 0 && (
          <div className="flex h-[320px] items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-app-text-secondary dark:text-gray-400">
              No hay datos
            </p>
          </div>
        )}
        {!loading && !error && chartData.length > 0 && <div id={chartId} />}
      </div>
    </div>
  );
}
