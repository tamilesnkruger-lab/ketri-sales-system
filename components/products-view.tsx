"use client";

import { useState, type FormEvent } from "react";
import { Check, Pencil, Plus, Power, Trash2, X } from "lucide-react";
import { currency } from "@/lib/format";
import type { Product, ProductFormData, UserRole } from "@/lib/types";

type ProductsViewProps = {
  isRealSession: boolean;
  products: Product[];
  role: UserRole;
  onCreateProduct: (product: ProductFormData) => Promise<void>;
  onDeleteProduct: (product: Product) => Promise<void>;
  onSetProductActive: (product: Product, active: boolean) => Promise<void>;
  onUpdateProduct: (id: string, product: ProductFormData) => Promise<void>;
};

const emptyProductForm: ProductFormData = {
  sku: "",
  name: "",
  category: "",
  price: 0,
  stockStatus: "pronto"
};

function formFromProduct(product: Product): ProductFormData {
  return {
    sku: product.sku,
    name: product.name,
    category: product.category,
    price: product.price,
    stockStatus: product.stockStatus
  };
}

export function ProductsView({
  isRealSession,
  products,
  role,
  onCreateProduct,
  onDeleteProduct,
  onSetProductActive,
  onUpdateProduct
}: ProductsViewProps) {
  const canManage = role === "admin";
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyProductForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function openNewProduct() {
    setEditingProduct(null);
    setForm(emptyProductForm);
    setFormError("");
    setIsFormOpen(true);
  }

  function openEditProduct(product: Product) {
    setEditingProduct(product);
    setForm(formFromProduct(product));
    setFormError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingProduct(null);
    setForm(emptyProductForm);
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!form.sku.trim() || !form.name.trim() || !form.category.trim() || form.price < 0) {
      setFormError("Informe SKU, produto, categoria e preco valido.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, form);
      } else {
        await onCreateProduct(form);
      }

      closeForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Nao foi possivel salvar o produto.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">Produtos</h2>
          <p className="text-sm text-ink/60">
            {canManage
              ? "Admin gerencia produtos ativos e inativos."
              : "Vendedores podem consultar produtos ativos."}
          </p>
        </div>
        {canManage && (
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            onClick={openNewProduct}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Novo produto
          </button>
        )}
      </div>

      {canManage && isFormOpen && (
        <form className="grid gap-3 rounded-lg border border-black/10 bg-white p-4" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-ink">
              {editingProduct ? "Editar produto" : "Novo produto"}
            </h3>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10" onClick={closeForm} type="button">
              <X className="h-4 w-4" />
            </button>
          </div>

          {formError && (
            <div className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">
              {formError}
            </div>
          )}

          {!isRealSession && (
            <div className="rounded-lg border border-maize/40 bg-maize/15 px-3 py-2 text-sm font-semibold text-ink">
              Modo demonstracao: entre com Supabase para salvar produtos reais.
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-5">
            <label className="grid gap-1 text-sm font-semibold text-ink/70">
              SKU
              <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))} />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink/70 md:col-span-2">
              Produto
              <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink/70">
              Categoria
              <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink/70">
              Preco
              <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" min="0" step="0.01" type="number" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))} />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <label className="grid gap-1 text-sm font-semibold text-ink/70">
              Estoque
              <select className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={form.stockStatus} onChange={(event) => setForm((current) => ({ ...current, stockStatus: event.target.value as ProductFormData["stockStatus"] }))}>
                <option value="pronto">pronto</option>
                <option value="sob encomenda">sob encomenda</option>
              </select>
            </label>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-leaf px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={isSaving} type="submit">
              <Check className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preco</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Status</th>
              {canManage && <th className="px-4 py-3 text-right">Acoes</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {products.map((product) => {
              const isActive = product.active !== false;

              return (
                <tr key={product.id} className={isActive ? undefined : "bg-black/[0.03] text-ink/60"}>
                  <td className="px-4 py-3 font-semibold">{product.sku}</td>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">{currency(product.price)}</td>
                  <td className="px-4 py-3">{product.stockStatus}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-1 text-xs font-bold ${isActive ? "bg-leaf/10 text-leaf" : "bg-black/5 text-ink/60"}`}>
                      {isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="inline-flex h-9 items-center gap-1 rounded-lg border border-black/10 px-2 text-sm font-semibold" onClick={() => openEditProduct(product)} type="button">
                          <Pencil className="h-4 w-4" />
                          Editar
                        </button>
                        <button className="inline-flex h-9 items-center gap-1 rounded-lg border border-leaf/25 px-2 text-sm font-semibold text-leaf" onClick={() => onSetProductActive(product, !isActive)} type="button">
                          <Power className="h-4 w-4" />
                          {isActive ? "Desativar" : "Ativar"}
                        </button>
                        <button className="inline-flex h-9 items-center gap-1 rounded-lg border border-coral/25 px-2 text-sm font-semibold text-coral" onClick={() => onDeleteProduct(product)} type="button">
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}