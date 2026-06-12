import type { NextRequest } from "next/server";
import { DEFAULT_COUNTRY, type SupportedCountry, isSupportedCountry } from "@/lib/country";

export type CountryDetectionResult = {
  country: SupportedCountry;
  source: "vercel-header" | "env" | "default";
};

export function detectCountry(request: NextRequest): CountryDetectionResult {
  const headerValue = request.headers.get("x-vercel-ip-country")?.toUpperCase();
  if (isSupportedCountry(headerValue)) {
    return {
      country: headerValue,
      source: "vercel-header",
    };
  }

  const envValue = process.env.MOCK_COUNTRY?.toUpperCase();
  if (isSupportedCountry(envValue)) {
    return {
      country: envValue,
      source: "env",
    };
  }

  return {
    country: DEFAULT_COUNTRY,
    source: "default",
  };
}

export function detectCountryFromHeaders(headers: Headers): CountryDetectionResult {
  const headerValue = headers.get("x-vercel-ip-country")?.toUpperCase();
  if (isSupportedCountry(headerValue)) {
    return {
      country: headerValue,
      source: "vercel-header",
    };
  }

  const envValue = process.env.MOCK_COUNTRY?.toUpperCase();
  if (isSupportedCountry(envValue)) {
    return {
      country: envValue,
      source: "env",
    };
  }

  return {
    country: DEFAULT_COUNTRY,
    source: "default",
  };
}
