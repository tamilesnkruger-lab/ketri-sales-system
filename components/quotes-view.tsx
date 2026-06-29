"use client";

import { clients, products } from "@/lib/demo-data";
import { currency } from "@/lib/format";
import type { Quote } from "@/lib/types";

type QuotesViewProps = {
  quotes: Quote[];
};

export function QuotesView({ quotes: visibleQuotes }: QuotesViewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {visibleQuotes.map((quote) => {
        const client = clients.find((item) => item.id === quote.clientId);
        const total = quote.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        return (
          <article key={quote.id} className="rounded-lg border border-black/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-sky">{quote.id}</p>
                <h3 className="font-bold text-ink">{client?.name}</h3>
              </div>
              <span className="rounded-md bg-leaf/10 px-2 py-1 text-xs font-bold text-leaf">
                {quote.status}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {quote.items.map((item) => {
                const product = products.find((entry) => entry.id === item.productId);
                return (
                  <div key={item.productId} className="flex justify-between gap-3 text-sm">
                    <span className="text-ink/70">
                      {item.quantity}x {product?.name}
                    </span>
                    <strong>{currency(item.quantity * item.unitPrice)}</strong>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
              <span className="text-sm text-ink/60">Total</span>
              <strong className="text-lg">{currency(total)}</strong>
            </div>
          </article>
        );
      })}
    </div>
  );
}
