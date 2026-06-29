"use client";

import { products } from "@/lib/demo-data";
import { currency } from "@/lib/format";

export function ProductsView() {
  return (
    <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="bg-ink text-white">
          <tr>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">Produto</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Preco</th>
            <th className="px-4 py-3">Estoque</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/10">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-3 font-semibold">{product.sku}</td>
              <td className="px-4 py-3">{product.name}</td>
              <td className="px-4 py-3">{product.category}</td>
              <td className="px-4 py-3">{currency(product.price)}</td>
              <td className="px-4 py-3">{product.stockStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
