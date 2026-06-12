import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Code,
  Container,
  Flex,
  Grid,
  Heading,
  Inline,
  Select,
  Spinner,
  Stack,
  Text,
  TextInput,
  Tooltip,
  useToast,
} from "@sanity/ui";
import { CheckmarkCircleIcon, DocumentIcon, ErrorOutlineIcon, UploadIcon, WarningOutlineIcon } from "@sanity/icons";
import { useClient, type Tool } from "sanity";
import { csvImporterTargets } from "./config";
import { fetchDocumentsForTarget, replaceArrayField } from "./helpers";
import { parseCsvFile } from "./parser";
import type { CsvImporterDocumentOption, CsvParseResult, CsvValidationMessage, CsvImporterTarget } from "./types";

const DEFAULT_TARGET = csvImporterTargets[0];

export function CsvImporterTool(props: { tool: Tool }) {
  const client = useClient({ apiVersion: "2024-11-01" });
  const toast = useToast();
  const [targetId, setTargetId] = useState(DEFAULT_TARGET.id);
  const [documents, setDocuments] = useState<CsvImporterDocumentOption[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [parsing, setParsing] = useState(false);

  const target = useMemo(
    () => csvImporterTargets.find((candidate) => candidate.id === targetId) ?? DEFAULT_TARGET,
    [targetId],
  );

  useEffect(() => {
    let disposed = false;

    async function loadDocuments(activeTarget: CsvImporterTarget) {
      setDocumentsLoading(true);
      setSelectedDocumentId("");

      try {
        const nextDocuments = await fetchDocumentsForTarget(client, activeTarget);
        if (disposed) {
          return;
        }

        setDocuments(nextDocuments);
        setSelectedDocumentId(nextDocuments[0]?.editId ?? "");
      } catch (error) {
        if (!disposed) {
          setDocuments([]);
          toast.push({
            status: "error",
            title: "Could not load documents",
            description: error instanceof Error ? error.message : "Unknown document loading error.",
          });
        }
      } finally {
        if (!disposed) {
          setDocumentsLoading(false);
        }
      }
    }

    void loadDocuments(target);

    return () => {
      disposed = true;
    };
  }, [client, target, toast]);

  const validationErrors = parseResult?.messages.filter((message) => message.level === "error") ?? [];
  const validationWarnings = parseResult?.messages.filter((message) => message.level === "warning") ?? [];
  const canImport =
    Boolean(selectedDocumentId) &&
    parseResult !== null &&
    parseResult.rowCount > 0 &&
    validationErrors.length === 0 &&
    !parsing &&
    !importing;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    setSelectedFileName(file.name);
    setParsing(true);
    setParseResult(null);

    try {
      const nextParseResult = await parseCsvFile(file, target);
      setParseResult(nextParseResult);

      const hasErrors = nextParseResult.messages.some((message) => message.level === "error");
      toast.push({
        status: hasErrors ? "warning" : "success",
        title: hasErrors ? "CSV parsed with validation errors" : "CSV parsed successfully",
        description: `${nextParseResult.rowCount} rows ready for preview.`,
      });
    } catch (error) {
      setParseResult(null);
      toast.push({
        status: "error",
        title: "Could not parse CSV",
        description: error instanceof Error ? error.message : "Unknown parsing error.",
      });
    } finally {
      setParsing(false);
      input.value = "";
    }
  }

  async function handleImport() {
    if (!selectedDocumentId || !parseResult) {
      return;
    }

    setImporting(true);

    try {
      const importedCount = await replaceArrayField(client, {
        documentId: selectedDocumentId,
        target,
        rows: parseResult.rows,
      });

      toast.push({
        status: "success",
        title: "Import completed",
        description: `Replaced ${target.arrayField} with ${importedCount} items.`,
      });
    } catch (error) {
      toast.push({
        status: "error",
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unknown import error.",
      });
    } finally {
      setImporting(false);
    }
  }

  return (
    <Container width={6} padding={4}>
      <Stack space={5}>
        <Box>
          <Heading size={2}>{props.tool.title}</Heading>
          <Text muted size={2}>
            Upload CSV data, validate it, preview the rows, and replace a document array field in one action.
          </Text>
        </Box>

        <Grid columns={[1, 1, 2]} gap={4}>
          <Card padding={4} radius={3} border>
            <Stack space={4}>
              <FieldLabel title="Import target" />
              <Select value={target.id} onChange={(event) => setTargetId(event.currentTarget.value)}>
                {csvImporterTargets.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.title}
                  </option>
                ))}
              </Select>
              <Text size={1} muted>
                {target.description}
              </Text>
              <Inline space={2}>
                <Badge tone="primary">{target.documentType}</Badge>
                <Badge tone="primary">{target.arrayField}</Badge>
                <Badge tone="primary">{target.itemType}</Badge>
              </Inline>
            </Stack>
          </Card>

          <Card padding={4} radius={3} border>
            <Stack space={4}>
              <FieldLabel title="Target document" />
              {documentsLoading ? (
                <Flex align="center" gap={3}>
                  <Spinner muted />
                  <Text size={1}>Loading {target.documentType} documents...</Text>
                </Flex>
              ) : documents.length > 0 ? (
                <Select value={selectedDocumentId} onChange={(event) => setSelectedDocumentId(event.currentTarget.value)}>
                  {documents.map((document) => (
                    <option key={document.id} value={document.editId}>
                      {document.title} ({document.subtitle}){document.hasDraft ? " [draft]" : ""}
                    </option>
                  ))}
                </Select>
              ) : (
                <Card tone="caution" padding={3} radius={2}>
                  <Text size={1}>No `{target.documentType}` documents found. Create one before importing.</Text>
                </Card>
              )}
            </Stack>
          </Card>
        </Grid>

        <Card padding={4} radius={3} border>
          <Stack space={4}>
            <FieldLabel title="CSV upload" />
            <Card as="label" padding={5} radius={3} border tone="primary" style={{ cursor: "pointer" }}>
              <Stack space={3}>
                <Flex align="center" gap={3}>
                  <UploadIcon />
                  <Text weight="medium">Choose a CSV file</Text>
                </Flex>
                <Text size={1} muted>
                  Required columns: {target.requiredColumns.join(", ")}
                </Text>
                <input accept=".csv,text/csv" hidden type="file" onChange={handleFileChange} />
              </Stack>
            </Card>

            <TextInput readOnly value={selectedFileName} placeholder="No file selected yet" />
          </Stack>
        </Card>

        <Grid columns={[1, 1, 2]} gap={4}>
          <SummaryCard
            title="Rows"
            value={parseResult ? String(parseResult.rowCount) : "0"}
            subtitle={
              parseResult
                ? `${parseResult.ignoredRowCount} empty row${parseResult.ignoredRowCount === 1 ? "" : "s"} ignored`
                : "Upload a CSV to start."
            }
          />
          <SummaryCard
            title="Validation"
            value={`${validationErrors.length} error${validationErrors.length === 1 ? "" : "s"}`}
            subtitle={`${validationWarnings.length} warning${validationWarnings.length === 1 ? "" : "s"}`}
          />
        </Grid>

        <Card padding={4} radius={3} border>
          <Stack space={4}>
            <FieldLabel title="Validation messages" />
            {parseResult ? (
              parseResult.messages.length > 0 ? (
                <Stack space={3}>
                  {parseResult.messages.map((message) => (
                    <ValidationMessageCard key={message.id} message={message} />
                  ))}
                </Stack>
              ) : (
                <Card tone="positive" padding={3} radius={2}>
                  <Flex align="center" gap={3}>
                    <CheckmarkCircleIcon />
                    <Text size={1}>No validation issues found.</Text>
                  </Flex>
                </Card>
              )
            ) : (
              <Text size={1} muted>
                Validation feedback appears after CSV parsing.
              </Text>
            )}
          </Stack>
        </Card>

        <Card padding={4} radius={3} border>
          <Stack space={4}>
            <Flex align="center" justify="space-between">
              <FieldLabel title="Preview" />
              {parseResult?.headers.length ? (
                <Tooltip
                  content={<Box padding={2}><Code size={1}>{parseResult.headers.join(", ")}</Code></Box>}
                  placement="top"
                >
                  <Badge tone="default">Headers</Badge>
                </Tooltip>
              ) : null}
            </Flex>

            {parsing ? (
              <Flex align="center" gap={3}>
                <Spinner muted />
                <Text size={1}>Parsing CSV...</Text>
              </Flex>
            ) : parseResult && parseResult.rowCount > 0 ? (
              <Card radius={2} border style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>
                        <Text size={1} weight="semibold">
                          Row
                        </Text>
                      </th>
                      {(target.previewColumns ?? target.requiredColumns).map((column) => (
                        <th key={column} style={tableHeaderStyle}>
                          <Text size={1} weight="semibold">
                            {column}
                          </Text>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parseResult.rows.map((row) => (
                      <tr key={row.rowNumber}>
                        <td style={tableCellStyle}>
                          <Text size={1}>{row.rowNumber}</Text>
                        </td>
                        {(target.previewColumns ?? target.requiredColumns).map((column) => (
                          <td key={`${row.rowNumber}:${column}`} style={tableCellStyle}>
                            <Text size={1}>{row.values[column] || "-"}</Text>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            ) : (
              <Text size={1} muted>
                No preview rows yet.
              </Text>
            )}
          </Stack>
        </Card>

        <Flex justify="flex-end">
          <Button
            text={importing ? "Importing..." : `Import into ${target.arrayField}`}
            icon={DocumentIcon}
            tone="primary"
            disabled={!canImport}
            loading={importing}
            onClick={handleImport}
          />
        </Flex>
      </Stack>
    </Container>
  );
}

function FieldLabel(props: { title: string }) {
  return (
    <Text size={1} weight="semibold">
      {props.title}
    </Text>
  );
}

function SummaryCard(props: { title: string; value: string; subtitle: string }) {
  return (
    <Card padding={4} radius={3} border>
      <Stack space={3}>
        <Text size={1} muted>
          {props.title}
        </Text>
        <Heading size={1}>{props.value}</Heading>
        <Text size={1} muted>
          {props.subtitle}
        </Text>
      </Stack>
    </Card>
  );
}

function ValidationMessageCard(props: { message: CsvValidationMessage }) {
  const tone = props.message.level === "error" ? "critical" : "caution";
  const Icon = props.message.level === "error" ? ErrorOutlineIcon : WarningOutlineIcon;

  return (
    <Card padding={3} radius={2} tone={tone}>
      <Flex align="flex-start" gap={3}>
        <Box paddingTop={1}>
          <Icon />
        </Box>
        <Text size={1}>{props.message.message}</Text>
      </Flex>
    </Card>
  );
}

const tableHeaderStyle: CSSProperties = {
  borderBottom: "1px solid var(--card-border-color)",
  padding: "0.75rem",
  textAlign: "left",
  verticalAlign: "top",
};

const tableCellStyle: CSSProperties = {
  borderBottom: "1px solid var(--card-border-color)",
  padding: "0.75rem",
  verticalAlign: "top",
};
