"use client";

import { BadgePlus, CalendarCheck, ClipboardList, UsersRound } from "lucide-react";
import { clients } from "@/lib/demo-data";
import { shortDateTime } from "@/lib/format";
import type { Activity } from "@/lib/types";
import { Metric } from "@/components/metric";

type TodayViewProps = {
  activities: Activity[];
  clientsCount: number;
  quotesCount: number;
};

export function TodayView({ activities, clientsCount, quotesCount }: TodayViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={UsersRound} label="Clientes na carteira" value={clientsCount.toString()} />
        <Metric icon={CalendarCheck} label="Follow-ups abertos" value={activities.length.toString()} />
        <Metric icon={ClipboardList} label="Orcamentos ativos" value={quotesCount.toString()} />
      </div>

      <div className="rounded-lg border border-black/10 bg-white">
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
          <h3 className="font-bold text-ink">O que precisa ser feito</h3>
          <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-leaf px-3 text-sm font-semibold text-white">
            <BadgePlus aria-hidden className="h-4 w-4" />
            Nova atividade
          </button>
        </div>
        <div className="divide-y divide-black/10">
          {activities.map((activity) => {
            const client = clients.find((item) => item.id === activity.clientId);
            return (
              <article key={activity.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase text-sky">{activity.type}</p>
                  <h4 className="font-bold text-ink">{client?.name}</h4>
                  <p className="mt-1 text-sm text-ink/65">{activity.note}</p>
                </div>
                <span className="rounded-md bg-maize/25 px-3 py-2 text-sm font-semibold text-ink">
                  {shortDateTime(activity.dueAt)}
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
