import type { SanityClient } from "sanity";
import type { CsvImporterDocumentOption, CsvImporterRow, CsvImporterTarget } from "./types";

type RawDocumentOption = {
  id: string;
  title: string;
  subtitle: string;
  type: string;
};

function getPublishedId(id: string): string {
  return id.startsWith("drafts.") ? id.slice("drafts.".length) : id;
}

export async function fetchDocumentsForTarget(
  client: SanityClient,
  target: CsvImporterTarget,
): Promise<CsvImporterDocumentOption[]> {
  const query = `
    *[_type == $documentType] | order(coalesce(title, name, _id) asc) {
      "id": _id,
      "title": coalesce(title, name, _id),
      "subtitle": coalesce(slug.current, _id),
      "type": _type
    }
  `;

  const documents = await client.fetch<RawDocumentOption[]>(query, {
    documentType: target.documentType,
  });

  const byPublishedId = new Map<string, CsvImporterDocumentOption>();

  for (const document of documents) {
    const publishedId = getPublishedId(document.id);
    const isDraft = document.id.startsWith("drafts.");
    const existing = byPublishedId.get(publishedId);

    if (!existing) {
      byPublishedId.set(publishedId, {
        id: publishedId,
        editId: document.id,
        title: document.title,
        subtitle: document.subtitle,
        type: document.type,
        hasDraft: isDraft,
      });
      continue;
    }

    if (isDraft) {
      byPublishedId.set(publishedId, {
        ...existing,
        editId: document.id,
        hasDraft: true,
        title: document.title || existing.title,
        subtitle: document.subtitle || existing.subtitle,
      });
    }
  }

  return [...byPublishedId.values()].sort((left, right) => left.title.localeCompare(right.title));
}

export async function replaceArrayField<TItem extends Record<string, unknown>>(
  client: SanityClient,
  options: {
    documentId: string;
    target: CsvImporterTarget<TItem>;
    rows: CsvImporterRow[];
  },
): Promise<number> {
  const nextItems = options.rows.map((row) => options.target.createItem(row));

  await client
    .patch(options.documentId)
    .set({
      [options.target.arrayField]: nextItems,
    })
    .commit({ autoGenerateArrayKeys: false });

  return nextItems.length;
}
