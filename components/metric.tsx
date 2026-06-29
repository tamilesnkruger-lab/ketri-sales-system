"use client";

import type { LucideIcon } from "lucide-react";

type MetricProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export function Metric({ icon: Icon, label, value }: MetricProps) {
  return (
    <article className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sky/10 text-sky">
        <Icon aria-hidden className="h-5 w-5" />
      </div>
      <p className="text-3xl font-bold text-ink">{value}</p>
      <p className="text-sm font-medium text-ink/60">{label}</p>
    </article>
  );
}
