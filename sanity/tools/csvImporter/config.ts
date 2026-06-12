import type { CsvImporterTarget } from "./types";

// The config shape is generic so more array-field mappings can be added without
// changing the parser or import UI.
export const csvImporterTargets: CsvImporterTarget[] = [
  {
    id: "pageSpecifications",
    title: "Page specifications",
    description: "Replace the `specifications` array on a selected Page document.",
    documentType: "page",
    arrayField: "specifications",
    itemType: "specification",
    requiredColumns: ["title", "value", "description"],
    previewColumns: ["title", "value", "description"],
    createItem: (row) => ({
      _type: "specification",
      _key: crypto.randomUUID(),
      title: row.values.title,
      value: row.values.value,
      description: row.values.description,
    }),
  },
  {
    id: "pageImperialLensSpecificationsDe",
    title: "Page imperial lens specifications DE",
    description: "Replace the `imperialLensSpecificationsDe` array on a selected Page document.",
    documentType: "page",
    arrayField: "imperialLensSpecificationsDe",
    itemType: "imperialLensSpecification",
    requiredColumns: [
      "brennweite",
      "blende",
      "irisdrehung",
      "naheinstellgrenze1",
      "fokussdrehung",
      "lange2",
      "frontdurchmesser",
      "bildwinkel (ff)3",
      "gewicht4",
      "filtergewinde",
    ],
    previewColumns: [
      "brennweite",
      "blende",
      "naheinstellgrenze1",
      "fokussdrehung",
      "gewicht4",
    ],
    createItem: (row) => ({
      _type: "imperialLensSpecification",
      _key: crypto.randomUUID(),
      brennweite: row.values.brennweite,
      blende: row.values.blende,
      irisdrehung: row.values.irisdrehung,
      naheinstellgrenze: row.values.naheinstellgrenze1,
      fokussdrehung: row.values.fokussdrehung,
      lange: row.values.lange2,
      frontdurchmesser: row.values.frontdurchmesser,
      bildwinkelFf: row.values["bildwinkel (ff)3"],
      gewicht: row.values.gewicht4,
      filtergewinde: row.values.filtergewinde,
    }),
  },
];
