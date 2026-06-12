"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Stack,
  Text,
  TextInput,
  useToast,
} from "@sanity/ui";
import {
  CheckmarkCircleIcon,
  ErrorOutlineIcon,
  UploadIcon,
  WarningOutlineIcon,
} from "@sanity/icons";
import { set, type ArrayOfObjectsInputProps } from "sanity";
import { csvImporterTargets } from "../tools/csvImporter/config";
import { parseCsvFile } from "../tools/csvImporter/parser";
import type { CsvImporterTarget } from "../tools/csvImporter/types";

type ImperialLensSpecificationValue = {
  _key: string;
  _type: "imperialLensSpecification";
  brennweite: string;
  blende: string;
  irisdrehung?: string;
  naheinstellgrenze?: string;
  fokussdrehung?: string;
  lange?: string;
  frontdurchmesser?: string;
  bildwinkelFf?: string;
  gewicht?: string;
  filtergewinde?: string;
};

function getImperialLensTarget(): CsvImporterTarget {
  const target = csvImporterTargets.find(
    (candidate) => candidate.id === "pageImperialLensSpecificationsDe",
  );

  if (!target) {
    throw new Error(
      "Missing CSV importer target configuration for imperial lens specifications.",
    );
  }

  return target;
}

export function ImperialLensSpecificationsInput(
  props: ArrayOfObjectsInputProps,
) {
  const target = useMemo(() => getImperialLensTarget(), []);
  const toast = useToast();
  const [selectedFileName, setSelectedFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [messages, setMessages] = useState<
    Array<{ id: string; level: "error" | "warning"; message: string }>
  >([]);

  const errorCount = useMemo(
    () => messages.filter((message) => message.level === "error").length,
    [messages],
  );

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFileName(file.name);
    setParsing(true);
    setPreviewCount(null);
    setMessages([]);

    try {
      const result = await parseCsvFile(file, target);
      setPreviewCount(result.rowCount);
      setMessages(result.messages);

      if (result.messages.some((message) => message.level === "error")) {
        toast.push({
          status: "warning",
          title: "CSV parsed with validation errors",
          description:
            "Fix the CSV and upload it again before using the field data.",
        });
        return;
      }

      const nextItems = result.rows.map(
        (row) => target.createItem(row) as ImperialLensSpecificationValue,
      );
      props.onChange(set(nextItems));

      toast.push({
        status: "success",
        title: "Field updated from CSV",
        description: `Loaded ${nextItems.length} specification rows into this document field.`,
      });
    } catch (error) {
      setPreviewCount(null);
      setMessages([
        {
          id: "inline-upload-error",
          level: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unknown CSV parsing error.",
        },
      ]);
      toast.push({
        status: "error",
        title: "Could not import CSV into field",
        description:
          error instanceof Error ? error.message : "Unknown CSV parsing error.",
      });
    } finally {
      setParsing(false);
      input.value = "";
    }
  }

  return (
    <Stack space={4}>
      <Card padding={4} radius={3} border tone="transparent">
        <Stack space={3}>
          <Flex align="center" justify="space-between" gap={3}>
            <Box>
              <Text size={1} weight="semibold" style={{ marginBottom: 15 }}>
                CSV Upload
              </Text>
              <Text size={1} muted>
                Upload the German imperial lens CSV directly into this field.
                Existing array values will be replaced.
              </Text>
            </Box>
            <Button
              as="label"
              icon={UploadIcon}
              mode="ghost"
              text={parsing ? "Parsing..." : "Upload CSV"}
              disabled={parsing}>
              <input
                accept=".csv,text/csv"
                hidden
                type="file"
                onChange={handleFileChange}
              />
            </Button>
          </Flex>

          <TextInput
            readOnly
            value={selectedFileName}
            placeholder="No CSV selected yet"
          />

          {previewCount !== null ? (
            <Text size={1} muted>
              Parsed {previewCount} populated row{previewCount === 1 ? "" : "s"}
              .
            </Text>
          ) : null}

          {messages.length > 0 ? (
            <Stack space={2}>
              {messages.map((message) => (
                <Card
                  key={message.id}
                  padding={3}
                  radius={2}
                  tone={message.level === "error" ? "critical" : "caution"}>
                  <Flex align="flex-start" gap={3}>
                    <Box paddingTop={1}>
                      {message.level === "error" ? (
                        <ErrorOutlineIcon />
                      ) : (
                        <WarningOutlineIcon />
                      )}
                    </Box>
                    <Text size={1}>{message.message}</Text>
                  </Flex>
                </Card>
              ))}
            </Stack>
          ) : previewCount !== null ? (
            <Card padding={3} radius={2} tone="positive">
              <Flex align="center" gap={3}>
                <CheckmarkCircleIcon />
                <Text size={1}>
                  CSV validated. The field content has been replaced with the
                  parsed rows.
                </Text>
              </Flex>
            </Card>
          ) : null}

          {errorCount === 0 && props.value?.length ? (
            <Text size={1} muted>
              Current items in field: {props.value.length}
            </Text>
          ) : null}
        </Stack>
      </Card>

      {props.renderDefault(props)}
    </Stack>
  );
}
