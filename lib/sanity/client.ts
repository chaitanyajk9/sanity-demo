import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION ?? "2024-11-01";

export const sanityConfig = {
  projectId,
  dataset,
  apiVersion,
};

export const hasSanityConfig = Boolean(projectId && dataset);

export const client = hasSanityConfig
  ? createClient({
      projectId: projectId!,
      dataset: dataset!,
      apiVersion,
      useCdn: false,
    })
  : null;
