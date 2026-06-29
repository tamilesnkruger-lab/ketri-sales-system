"use client";

import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import type { Client } from "@/lib/types";
import { journey, statusLabels } from "@/components/status";

type ClientsViewProps = {
  clients: Client[];
};

export function ClientsView({ clients: visibleClients }: ClientsViewProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {visibleClients.map((client) => (
          <article key={client.id} className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-ink">{client.name}</h3>
                <p className="text-sm text-ink/60">{client.contactName}</p>
              </div>
              <span className="rounded-md bg-coral/10 px-2 py-1 text-xs font-bold text-coral">
                {statusLabels[client.status]}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink/70">{client.city}</p>
            <p className="mt-1 text-sm text-ink/70">{client.phone}</p>
            <div className="mt-4 flex items-center gap-1 overflow-hidden">
              {journey.map((step) => (
                <div
                  key={step}
                  className={clsx(
                    "h-2 flex-1 rounded-full",
                    journey.indexOf(step) <= journey.indexOf(client.status) ? "bg-leaf" : "bg-black/10"
                  )}
                  title={statusLabels[step]}
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-ink/65">{client.lastActivity}</p>
            <button className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-semibold text-ink">
              Abrir cliente
              <ChevronRight aria-hidden className="h-4 w-4" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
