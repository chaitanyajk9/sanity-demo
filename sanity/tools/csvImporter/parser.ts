import Papa, { type ParseError, type ParseMeta } from "papaparse";
import type { CsvImporterTarget, CsvParseResult, CsvRowRecord, CsvValidationMessage } from "./types";

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

function normalizeCell(value: unknown): string {
  return String(value ?? "").trim();
}

function rowSignature(row: CsvRowRecord, columns: string[]): string {
  return columns.map((column) => normalizeCell(row[column])).join("::");
}

function isMeaningfulRow(row: CsvRowRecord): boolean {
  return Object.values(row).some((value) => value.length > 0);
}

export function parseCsvFile(file: File, target: CsvImporterTarget): Promise<CsvParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRowRecord>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: normalizeHeader,
      transform: normalizeCell,
      complete: (result) => {
        try {
          resolve(buildParseResult(result.data, result.meta, result.errors, target));
        } catch (error) {
          reject(error);
        }
      },
      error: reject,
    });
  });
}

function buildParseResult(
  rawRows: CsvRowRecord[],
  meta: ParseMeta,
  parseErrors: ParseError[],
  target: CsvImporterTarget,
): CsvParseResult {
  const headers = (meta.fields ?? []).map(normalizeHeader).filter(Boolean);
  const messages: CsvValidationMessage[] = [];
  const missingColumns = target.requiredColumns.filter((column) => !headers.includes(column));

  if (missingColumns.length > 0) {
    messages.push({
      id: `missing:${missingColumns.join(",")}`,
      level: "error",
      message: `Missing required columns: ${missingColumns.join(", ")}.`,
    });
  }

  for (const error of parseErrors) {
    const rowNumber = typeof error.row === "number" ? error.row + 1 : "unknown";
    messages.push({
      id: `parse:${error.code}:${error.row}:${error.message}`,
      level: "error",
      message: `CSV parse error on row ${rowNumber}: ${error.message}`,
    });
  }

  const requiredColumnSet = new Set(target.requiredColumns);
  const duplicateMap = new Map<string, number[]>();
  const rows = rawRows
    .map((row, index) => {
      const normalizedValues = Object.fromEntries(
        Object.entries(row).map(([key, value]) => [normalizeHeader(key), normalizeCell(value)]),
      );

      return {
        rowNumber: index + 2,
        values: normalizedValues,
      };
    })
    .filter((row) => isMeaningfulRow(row.values));

  for (const row of rows) {
    const signature = rowSignature(row.values, target.requiredColumns);
    if (!signature || target.requiredColumns.every((column) => row.values[column] === "")) {
      continue;
    }

    const list = duplicateMap.get(signature) ?? [];
    list.push(row.rowNumber);
    duplicateMap.set(signature, list);

    const emptyRequiredColumns = [...requiredColumnSet].filter((column) => row.values[column] === "");
    if (emptyRequiredColumns.length > 0) {
      messages.push({
        id: `empty-required:${row.rowNumber}`,
        level: "error",
        message: `Row ${row.rowNumber} is missing values for: ${emptyRequiredColumns.join(", ")}.`,
      });
    }
  }

  for (const [signature, rowNumbers] of duplicateMap.entries()) {
    if (signature && rowNumbers.length > 1) {
      messages.push({
        id: `duplicate:${signature}`,
        level: "warning",
        message: `Duplicate row values found at rows ${rowNumbers.join(", ")}.`,
      });
    }
  }

  return {
    rows,
    rowCount: rows.length,
    ignoredRowCount: rawRows.length - rows.length,
    messages,
    headers,
  };
}
