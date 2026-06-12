import { resolveCountryContent } from "@/lib/content";
import type { SupportedCountry } from "@/lib/country";
import type { PageDocument } from "@/lib/sanity/types";

type DemoPanelProps = {
  page: PageDocument;
  country: SupportedCountry;
  source: "vercel-header" | "env" | "default";
};

export function DemoPanel({ page, country, source }: DemoPanelProps) {
  const resolvedContent = resolveCountryContent(page, country);

  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-card backdrop-blur md:p-8">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Live Demo</p>
            <h2 className="mt-2 text-2xl font-semibold text-accent">Homepage Content Resolver</h2>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            {source === "vercel-header" ? "vercel geo" : source}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard label="Detected country" value={country} />
          <InfoCard label="Matched content" value={resolvedContent.matchType} />
        </div>

        <div className="space-y-4 rounded-2xl border border-line bg-slate-50 p-5">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Current heading</p>
            <h3 className="mt-2 text-2xl font-semibold text-accent">{resolvedContent.heading}</h3>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Current description</p>
            <p className="mt-2 text-base leading-7 text-slate-700">{resolvedContent.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-accent">{value}</p>
    </div>
  );
}
