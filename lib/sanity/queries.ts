import { groq } from "next-sanity";
import { client, hasSanityConfig } from "@/lib/sanity/client";
import type { PageDocument } from "@/lib/sanity/types";

const homepageQuery = groq`
  *[_type == "page" && slug.current == "home"][0]{
    _id,
    title,
    "slug": slug.current,
    defaultHeading,
    defaultDescription,
    countryContent[]{
      countryCode,
      heading,
      description
    }
  }
`;

const fallbackPage: PageDocument = {
  _id: "fallback-home",
  title: "Homepage",
  slug: "home",
  defaultHeading: "Launch a localized homepage from one Sanity document.",
  defaultDescription:
    "Add your Sanity project credentials, create the Page document, and this demo will switch messaging by country with a default fallback.",
  countryContent: [
    {
      countryCode: "IN",
      heading: "Build regional messaging for users in India.",
      description: "Use market-specific copy, offers, and CTAs for traffic identified as coming from India.",
    },
    {
      countryCode: "US",
      heading: "Run localized campaigns for the United States.",
      description: "Keep the default structure while giving US visitors a dedicated message from Sanity.",
    },
    {
      countryCode: "GB",
      heading: "Target visitors in Great Britain with tailored copy.",
      description: "Sanity stores each country variant as structured content instead of hard-coded JSX branches.",
    },
    {
      countryCode: "AU",
      heading: "Ship Australia-specific homepage content cleanly.",
      description: "This pattern keeps the matching logic isolated so geoip-lite can replace the mock detector later.",
    },
  ],
};

export async function getHomepage(): Promise<PageDocument> {
  if (!hasSanityConfig || !client) {
    return fallbackPage;
  }

  try {
    const page = await client.fetch<PageDocument | null>(homepageQuery);
    return page ?? fallbackPage;
  } catch {
    return fallbackPage;
  }
}
