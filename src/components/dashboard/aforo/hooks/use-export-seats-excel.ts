"use client";

import XLSX from "xlsx-js-style";
import type { Seat } from "registro/graphql/aforo/queries";

const TABLE_COLS = 6;
const RIGHT_START = 7;
const TOTAL_COLS = 13;
const META_ROWS = 5;
const SPACER_ROW_INDEX = 5;
const HEADER_ROW_INDEX = 6;

interface ExportParams {
  filteredSeats: Seat[];
  teamLabel: string;
  sex: "H" | "M";
  getEncontradoNombre: (seat: Seat) => string;
  teamNumber?: number;
  captain?: string;
  aux1?: string;
  aux2?: string;
  aux3?: string;
}

type CellStyle = Record<string, unknown>;

function thinBorder(color = "FFD1D5DB"): CellStyle {
  const side = { style: "thin", color: { rgb: color } };
  return { top: side, bottom: side, left: side, right: side };
}

const STYLES = {
  title: {
    font: { bold: true, sz: 14, color: { rgb: "FF1E3A5F" } },
    alignment: { horizontal: "center", vertical: "center" },
  } satisfies CellStyle,
  metaLabel: {
    font: { bold: true, sz: 10, color: { rgb: "FF374151" } },
    fill: { patternType: "solid", fgColor: { rgb: "FFE5E7EB" } },
    border: thinBorder(),
    alignment: { horizontal: "left", vertical: "center" },
  } satisfies CellStyle,
  metaValue: {
    font: { sz: 10, color: { rgb: "FF111827" } },
    fill: { patternType: "solid", fgColor: { rgb: "FFF9FAFB" } },
    border: thinBorder(),
    alignment: { horizontal: "left", vertical: "center" },
  } satisfies CellStyle,
  header: {
    font: { bold: true, sz: 9, color: { rgb: "FFFFFFFF" } },
    fill: { patternType: "solid", fgColor: { rgb: "FF374151" } },
    border: thinBorder("FF1F2937"),
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
  } satisfies CellStyle,
  dataText: {
    font: { sz: 9, color: { rgb: "FF111827" } },
    border: thinBorder(),
    alignment: { horizontal: "left", vertical: "center" },
  } satisfies CellStyle,
  dataTextAlt: {
    font: { sz: 9, color: { rgb: "FF111827" } },
    fill: { patternType: "solid", fgColor: { rgb: "FFF3F4F6" } },
    border: thinBorder(),
    alignment: { horizontal: "left", vertical: "center" },
  } satisfies CellStyle,
  dataCenter: {
    font: { sz: 9, color: { rgb: "FF111827" } },
    border: thinBorder(),
    alignment: { horizontal: "center", vertical: "center" },
  } satisfies CellStyle,
  dataCenterAlt: {
    font: { sz: 9, color: { rgb: "FF111827" } },
    fill: { patternType: "solid", fgColor: { rgb: "FFF3F4F6" } },
    border: thinBorder(),
    alignment: { horizontal: "center", vertical: "center" },
  } satisfies CellStyle,
};

function padRow(row: (string | null)[], len = TABLE_COLS): string[] {
  const padded = row.slice(0, len).map((v) => (v ?? "").toString());
  while (padded.length < len) padded.push("");
  return padded;
}

function buildTableRows({
  filteredSeats,
  teamLabel,
  sex,
  getEncontradoNombre,
  teamNumber,
  captain,
  aux1,
  aux2,
  aux3,
}: ExportParams): string[][] {
  const empty = "";
  const metaRows: (string | null)[][] = [
    ["Equipo", `${teamLabel ?? ""}  ${sex === "H" ? "Hombres" : "Mujeres"}`],
    ["Capitán", captain ?? ""],
    ["Auxiliar 1", aux1 ?? ""],
    ["Auxiliar 2", aux2 ?? ""],
    ["Auxiliar 3", aux3 ?? ""],
    [empty, empty],
  ];

  const header = [
    "Clave",
    "Encontrado",
    "Celular",
    "Medi",
    "Bautizo",
    "Clave Antigua",
  ];

  const dataRows = filteredSeats.map((seat) => {
    const tieneEncontrado = Boolean(seat.encontrado);
    const encontradoNombre = tieneEncontrado ? getEncontradoNombre(seat) : "";
    const clave = `${seat.encontrado?.sexo ?? ""}${teamNumber ?? ""}${seat.letter}`;
    const celular = seat.encontrado?.celular ? "Si" : "No";
    const medicamento = seat.encontrado?.medicamento ? "Si" : "No";
    const claveOld = seat.encontrado?.checkins?.claveOld ?? "";

    return [clave, encontradoNombre, celular, medicamento, empty, claveOld];
  });

  return [
    ...metaRows.map((row) => padRow(row)),
    padRow(header),
    ...dataRows.map((row) => padRow(row)),
  ];
}

function duplicateRowSideBySide(leftRow: string[]): string[] {
  const row = new Array(TOTAL_COLS).fill("");
  for (let c = 0; c < TABLE_COLS; c++) {
    row[c] = leftRow[c] ?? "";
    row[RIGHT_START + c] = leftRow[c] ?? "";
  }
  return row;
}

function setStyledCell(
  ws: XLSX.WorkSheet,
  r: number,
  c: number,
  value: string,
  style: CellStyle,
) {
  const addr = XLSX.utils.encode_cell({ r, c });
  ws[addr] = { v: value, t: "s", s: style };
}

function applyMetaRowStyles(
  ws: XLSX.WorkSheet,
  wsRow: number,
  rowData: string[],
  startCol: number,
) {
  setStyledCell(ws, wsRow, startCol, rowData[0], STYLES.metaLabel);
  setStyledCell(ws, wsRow, startCol + 1, rowData[1], STYLES.metaValue);
  for (let c = 2; c < TABLE_COLS; c++) {
    setStyledCell(ws, wsRow, startCol + c, rowData[c] ?? "", STYLES.metaValue);
  }
}

function applyHeaderRowStyles(
  ws: XLSX.WorkSheet,
  wsRow: number,
  rowData: string[],
  startCol: number,
) {
  for (let c = 0; c < TABLE_COLS; c++) {
    setStyledCell(ws, wsRow, startCol + c, rowData[c], STYLES.header);
  }
}

function applyDataRowStyles(
  ws: XLSX.WorkSheet,
  wsRow: number,
  rowData: string[],
  startCol: number,
  alt: boolean,
) {
  const styles = alt
    ? [STYLES.dataCenterAlt, STYLES.dataTextAlt, STYLES.dataCenterAlt, STYLES.dataCenterAlt, STYLES.dataCenterAlt, STYLES.dataCenterAlt]
    : [STYLES.dataCenter, STYLES.dataText, STYLES.dataCenter, STYLES.dataCenter, STYLES.dataCenter, STYLES.dataCenter];

  for (let c = 0; c < TABLE_COLS; c++) {
    setStyledCell(ws, wsRow, startCol + c, rowData[c], styles[c]);
  }
}

function applyWorksheetStyles(
  ws: XLSX.WorkSheet,
  tableRows: string[][],
  title: string,
) {
  setStyledCell(ws, 0, 0, title, STYLES.title);

  for (let tRow = 0; tRow < tableRows.length; tRow++) {
    const wsRow = 1 + tRow;
    const rowData = tableRows[tRow];
    const isSpacer = tRow === SPACER_ROW_INDEX;
    const isMeta = tRow < META_ROWS;
    const isHeader = tRow === HEADER_ROW_INDEX;
    const isData = tRow > HEADER_ROW_INDEX;

    if (isSpacer) continue;

    for (const startCol of [0, RIGHT_START]) {
      if (isMeta) {
        applyMetaRowStyles(ws, wsRow, rowData, startCol);
      } else if (isHeader) {
        applyHeaderRowStyles(ws, wsRow, rowData, startCol);
      } else if (isData) {
        const alt = (tRow - HEADER_ROW_INDEX - 1) % 2 === 1;
        applyDataRowStyles(ws, wsRow, rowData, startCol, alt);
      }
    }
  }
}

function buildSideBySideWorksheet(
  tableRows: string[][],
  title: string,
): XLSX.WorkSheet {
  const wsData: string[][] = [
    (() => {
      const titleRow = new Array(TOTAL_COLS).fill("");
      titleRow[0] = title;
      return titleRow;
    })(),
    ...tableRows.map(duplicateRowSideBySide),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  applyWorksheetStyles(ws, tableRows, title);

  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: TOTAL_COLS - 1 } }];

  ws["!cols"] = [
    { wch: 7 },
    { wch: 28 },
    { wch: 7 },
    { wch: 5 },
    { wch: 7 },
    { wch: 11 },
    { wch: 2 },
    { wch: 7 },
    { wch: 28 },
    { wch: 7 },
    { wch: 5 },
    { wch: 7 },
    { wch: 11 },
  ];

  ws["!rows"] = wsData.map((_, index) => ({
    hpt: index === 0 ? 28 : index === HEADER_ROW_INDEX + 1 ? 20 : 16,
  }));

  ws["!pageSetup"] = {
    paperSize: 1,
    orientation: "landscape",
    fitToWidth: 1,
    fitToHeight: 0,
  };

  ws["!margins"] = {
    left: 0.25,
    right: 0.25,
    top: 0.35,
    bottom: 0.35,
    header: 0.2,
    footer: 0.2,
  };

  return ws;
}

export function useExportSeatsExcel() {
  const exportSeatsToExcel = (params: ExportParams) => {
    const { filteredSeats, teamNumber, sex } = params;
    if (!filteredSeats || filteredSeats.length === 0) return;

    const tableRows = buildTableRows(params);
    const sexoLabel = sex === "H" ? "H" : "M";
    const title = `Equipo-${teamNumber ?? ""}-${sexoLabel}`;

    const ws = buildSideBySideWorksheet(tableRows, title);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Equipo");

    XLSX.writeFile(wb, `${title}.xlsx`);
  };

  return { exportSeatsToExcel };
}
