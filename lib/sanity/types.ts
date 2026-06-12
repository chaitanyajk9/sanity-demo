import type { SupportedCountry } from "@/lib/country";

export type CountryContentItem = {
  countryCode: SupportedCountry;
  heading: string;
  description: string;
};

export type PageDocument = {
  _id: string;
  title: string;
  slug: string;
  defaultHeading: string;
  defaultDescription: string;
  countryContent: CountryContentItem[];
};
