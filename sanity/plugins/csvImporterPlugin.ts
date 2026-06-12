import { UploadIcon } from "@sanity/icons";
import { definePlugin, type Tool } from "sanity";
import { CsvImporterTool } from "../tools/csvImporter/CsvImporterTool";

const csvImporterTool: Tool = {
  name: "csv-importer",
  title: "CSV Importer",
  icon: UploadIcon,
  component: CsvImporterTool,
};

export const csvImporterPlugin = definePlugin({
  name: "csv-importer-plugin",
  tools: (previousTools) => [...previousTools, csvImporterTool],
});
