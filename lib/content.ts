import type { PageDocument } from "@/lib/sanity/types";
import type { SupportedCountry } from "@/lib/country";

export function resolveCountryContent(page: PageDocument, country: SupportedCountry) {
  const match = page.countryContent.find((item) => item.countryCode === country);

  if (match) {
    return {
      heading: match.heading,
      description: match.description,
      matchType: "Country override",
    };
  }

  return {
    heading: page.defaultHeading,
    description: page.defaultDescription,
    matchType: "Default fallback",
  };
}
