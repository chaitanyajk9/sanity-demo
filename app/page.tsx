import { headers } from "next/headers";
import { DemoPanel } from "@/components/demo-panel";
import { detectCountryFromHeaders } from "@/lib/country-detector";
import { getHomepage } from "@/lib/sanity/queries";

export default async function HomePage() {
  const homepage = await getHomepage();
  const countryResult = detectCountryFromHeaders(await headers());

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16 md:px-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <span className="inline-flex rounded-full border border-teal-200 bg-white/70 px-4 py-2 text-sm font-medium text-brand shadow-sm backdrop-blur">
            Next.js 15 + Sanity CMS
          </span>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-accent md:text-6xl">
              Country-aware homepage content, driven by structured Sanity data.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              The homepage loads a single Page document from Sanity, detects the visitor country from Vercel
              request geolocation, then resolves the most relevant content block with a safe default fallback.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Schema" value="Page" />
            <StatCard label="Detection" value="Vercel IP Geo" />
            <StatCard label="Fallback" value="IN or default fields" />
          </div>
        </section>
        <DemoPanel page={homepage} country={countryResult.country} source={countryResult.source} />
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-card backdrop-blur">
      <p className="text-sm uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-accent">{value}</p>
    </div>
  );
}
