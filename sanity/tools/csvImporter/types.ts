export type CsvRowRecord = Record<string, string>;

export type CsvImporterRow = {
  rowNumber: number;
  values: CsvRowRecord;
};

export type CsvValidationMessage = {
  id: string;
  level: "error" | "warning";
  message: string;
};

export type CsvParseResult = {
  rows: CsvImporterRow[];
  rowCount: number;
  ignoredRowCount: number;
  messages: CsvValidationMessage[];
  headers: string[];
};

export type CsvImporterTarget<TItem extends Record<string, unknown> = Record<string, unknown>> = {
  id: string;
  title: string;
  description: string;
  documentType: string;
  arrayField: string;
  itemType: string;
  requiredColumns: string[];
  optionalColumns?: string[];
  previewColumns?: string[];
  createItem: (row: CsvImporterRow) => TItem;
};

export type CsvImporterDocumentOption = {
  id: string;
  editId: string;
  title: string;
  subtitle: string;
  type: string;
  hasDraft: boolean;
};
