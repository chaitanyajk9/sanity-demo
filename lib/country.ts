export const DEFAULT_COUNTRY = "IN";
export const SUPPORTED_COUNTRIES = ["IN", "US", "GB", "AU"] as const;

export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

export function isSupportedCountry(value: string | undefined | null): value is SupportedCountry {
  return SUPPORTED_COUNTRIES.includes((value ?? "").toUpperCase() as SupportedCountry);
}

// Keep detection isolated so replacing MOCK_COUNTRY with geoip-lite later only touches this layer.
export function normalizeCountryCode(value: string | undefined | null): SupportedCountry {
  return isSupportedCountry(value) ? value.toUpperCase() as SupportedCountry : DEFAULT_COUNTRY;
}
