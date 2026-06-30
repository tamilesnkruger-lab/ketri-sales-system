"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { currency } from "@/lib/format";
import type { Client, ClientFormData, Product, Quote, QuoteFormData, QuoteItemFormData, QuoteStatus, UserRole } from "@/lib/types";

type QuotesViewProps = {
  clients: Client[];
  currentSellerId: string;
  isRealSession: boolean;
  products: Product[];
  quotes: Quote[];
  role: UserRole;
  onCreateClient: (client: ClientFormData) => Promise<void>;
  onCreateQuote: (quote: QuoteFormData) => Promise<void>;
  onDeleteQuote: (quote: Quote) => Promise<void>;
  onUpdateQuote: (id: string, quote: QuoteFormData) => Promise<void>;
  onUpdateQuoteStatus: (quote: Quote, status: QuoteStatus) => Promise<void>;
};

const quoteStatuses: QuoteStatus[] = ["rascunho", "enviado", "aprovado", "perdido"];

function buildItem(product?: Product): QuoteItemFormData {
  return {
    productId: product?.id ?? "",
    quantity: 1,
    unitPrice: product?.price ?? 0
  };
}

function buildForm(client?: Client, product?: Product): QuoteFormData {
  return {
    clientId: client?.id ?? "",
    sellerId: client?.sellerId ?? "",
    status: "rascunho",
    items: product ? [buildItem(product)] : []
  };
}

function quoteToForm(quote: Quote): QuoteFormData {
  return {
    clientId: quote.clientId,
    sellerId: quote.sellerId,
    status: quote.status,
    items: quote.items.map((item) => ({ ...item }))
  };
}

export function QuotesView({
  clients,
  currentSellerId,
  isRealSession,
  products,
  quotes: visibleQuotes,
  role,
  onCreateClient,
  onCreateQuote,
  onDeleteQuote,
  onUpdateQuote,
  onUpdateQuoteStatus
}: QuotesViewProps) {
  const manageableClients = useMemo(
    () => (role === "admin" ? clients : clients.filter((client) => client.sellerId === currentSellerId)),
    [clients, currentSellerId, role]
  );
  const activeProducts = useMemo(() => products.filter((product) => product.active !== false), [products]);
  const firstClient = manageableClients[0];
  const firstProduct = activeProducts[0];
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [form, setForm] = useState<QuoteFormData>(() => buildForm(firstClient, firstProduct));
  const [formError, setFormError] = useState("");
  const [formNotice, setFormNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [clientDraft, setClientDraft] = useState({ name: "", contactName: "", phone: "", city: "" });

  function getClient(clientId: string) {
    return clients.find((item) => item.id === clientId);
  }

  function getProduct(productId: string) {
    return products.find((item) => item.id === productId);
  }

  function resolveSellerId(clientId: string) {
    const client = getClient(clientId);
    return client?.sellerId ?? currentSellerId;
  }

  function openNewQuote() {
    setEditingQuote(null);
    setForm(buildForm(firstClient, firstProduct));
    setFormError("");
    setFormNotice("");
    setIsFormOpen(true);
  }

  function openEditQuote(quote: Quote) {
    setEditingQuote(quote);
    setForm(quoteToForm(quote));
    setFormError("");
    setFormNotice("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingQuote(null);
    setForm(buildForm(firstClient, firstProduct));
    setFormError("");
    setFormNotice("");
    setIsClientFormOpen(false);
    setIsFormOpen(false);
  }

  function updateItem(index: number, item: QuoteItemFormData) {
    setForm((current) => ({
      ...current,
      items: current.items.map((entry, itemIndex) => (itemIndex === index ? item : entry))
    }));
  }

  function addItem() {
    if (!firstProduct) {
      setFormError("Cadastre ou ative um produto antes de adicionar itens.");
      return;
    }

    setForm((current) => ({ ...current, items: [...current.items, buildItem(firstProduct)] }));
  }

  function removeItem(index: number) {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  function productOptionsForItem(item: QuoteItemFormData) {
    const selectedProduct = getProduct(item.productId);

    if (!selectedProduct || selectedProduct.active !== false) {
      return activeProducts;
    }

    return [selectedProduct, ...activeProducts.filter((product) => product.id !== selectedProduct.id)];
  }

  async function handleCreateBasicClient() {
    setFormError("");
    setFormNotice("");

    if (!clientDraft.name.trim()) {
      setFormError("Informe o nome do cliente para criar o cadastro básico.");
      return;
    }

    setIsSaving(true);

    try {
      await onCreateClient({
        name: clientDraft.name.trim(),
        contactName: clientDraft.contactName.trim(),
        phone: clientDraft.phone.trim(),
        city: clientDraft.city.trim(),
        status: "lead",
        sellerId: currentSellerId,
        lastActivity: new Date().toISOString(),
        potential: "medio"
      });
      setClientDraft({ name: "", contactName: "", phone: "", city: "" });
      setIsClientFormOpen(false);
      setFormNotice("Cliente criado. Selecione-o no campo Cliente para continuar o orçamento.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível criar o cliente.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!form.clientId) {
      setFormError("Selecione um cliente.");
      return;
    }

    if (form.items.length === 0) {
      setFormError("Adicione pelo menos um item ao orçamento.");
      return;
    }

    if (form.items.some((item) => !item.productId || item.quantity <= 0 || item.unitPrice < 0)) {
      setFormError("Revise produto, quantidade e preço dos itens.");
      return;
    }

    const payload = {
      ...form,
      sellerId: resolveSellerId(form.clientId)
    };

    setIsSaving(true);

    try {
      if (editingQuote) {
        await onUpdateQuote(editingQuote.id, payload);
      } else {
        await onCreateQuote(payload);
      }

      closeForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível salvar o orçamento.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">Orçamentos</h2>
          <p className="text-sm text-ink/60">Crie propostas com itens e total calculado automaticamente.</p>
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white" onClick={openNewQuote} type="button">
          <Plus className="h-4 w-4" />
          Novo orçamento
        </button>
      </div>

      {isFormOpen && (
        <form className="grid gap-4 rounded-lg border border-black/10 bg-white p-4" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-ink">
              {editingQuote ? "Editar orçamento" : "Novo orçamento"}
            </h3>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10" onClick={closeForm} type="button">
              <X className="h-4 w-4" />
            </button>
          </div>

          {formNotice && (
            <div className="rounded-lg border border-leaf/25 bg-leaf/10 px-3 py-2 text-sm font-semibold text-leaf">
              {formNotice}
            </div>
          )}

          {formError && (
            <div className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-semibold text-coral">
              {formError}
            </div>
          )}

          {!isRealSession && (
            <div className="rounded-lg border border-maize/40 bg-maize/15 px-3 py-2 text-sm font-semibold text-ink">
              Modo demonstração: entre com Supabase para salvar orçamentos reais.
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <label className="grid gap-1 text-sm font-semibold text-ink/70">
              Cliente
              <select className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={form.clientId} onChange={(event) => setForm((current) => ({ ...current, clientId: event.target.value, sellerId: resolveSellerId(event.target.value) }))}>
                {manageableClients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink/70">
              Status
              <select className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as QuoteStatus }))}>
                {quoteStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3">
            <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-semibold" onClick={() => setIsClientFormOpen((current) => !current)} type="button">
              <Plus className="h-4 w-4" />
              Criar cliente básico neste orçamento
            </button>
            {isClientFormOpen && (
              <div className="mt-3 grid gap-3 md:grid-cols-4">
                <input className="h-10 rounded-lg border border-black/10 px-3 text-sm" placeholder="Nome do cliente" value={clientDraft.name} onChange={(event) => setClientDraft((current) => ({ ...current, name: event.target.value }))} />
                <input className="h-10 rounded-lg border border-black/10 px-3 text-sm" placeholder="Contato" value={clientDraft.contactName} onChange={(event) => setClientDraft((current) => ({ ...current, contactName: event.target.value }))} />
                <input className="h-10 rounded-lg border border-black/10 px-3 text-sm" placeholder="Telefone" value={clientDraft.phone} onChange={(event) => setClientDraft((current) => ({ ...current, phone: event.target.value }))} />
                <div className="flex gap-2">
                  <input className="h-10 min-w-0 flex-1 rounded-lg border border-black/10 px-3 text-sm" placeholder="Cidade" value={clientDraft.city} onChange={(event) => setClientDraft((current) => ({ ...current, city: event.target.value }))} />
                  <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={isSaving} onClick={handleCreateBasicClient} type="button">
                    Criar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-bold text-ink">Itens</h4>
              <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-semibold" onClick={addItem} type="button">
                <Plus className="h-4 w-4" />
                Item
              </button>
            </div>

            {form.items.map((item, index) => {
              const itemTotal = item.quantity * item.unitPrice;
              const itemProductOptions = productOptionsForItem(item);
              const selectedProduct = getProduct(item.productId);
              return (
                <div key={`${item.productId}-${index}`} className="grid gap-2 rounded-lg border border-black/10 p-3 md:grid-cols-[1fr_110px_130px_110px_auto] md:items-end">
                  <label className="grid gap-1 text-sm font-semibold text-ink/70">
                    Produto
                    <select className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={item.productId} onChange={(event) => {
                      const product = getProduct(event.target.value);
                      updateItem(index, { ...item, productId: event.target.value, unitPrice: product?.price ?? item.unitPrice });
                    }}>
                      {selectedProduct ? null : <option value={item.productId}>Produto indisponível</option>}
                      {itemProductOptions.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}{product.active === false ? " (inativo)" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-ink/70">
                    Qtd.
                    <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" min="1" type="number" value={item.quantity} onChange={(event) => updateItem(index, { ...item, quantity: Number(event.target.value) })} />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold text-ink/70">
                    Unitario
                    <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" min="0" step="0.01" type="number" value={item.unitPrice} onChange={(event) => updateItem(index, { ...item, unitPrice: Number(event.target.value) })} />
                  </label>
                  <div className="grid gap-1 text-sm font-semibold text-ink/70">
                    Total
                    <span className="inline-flex h-10 items-center rounded-lg bg-black/5 px-3 text-sm text-ink">{currency(itemTotal)}</span>
                  </div>
                  <button className="inline-flex h-10 items-center justify-center rounded-lg border border-coral/25 px-3 text-sm font-semibold text-coral" onClick={() => removeItem(index)} type="button">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-black/10 pt-4">
            <span className="text-sm text-ink/60">Total</span>
            <strong className="text-lg text-ink">{currency(form.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))}</strong>
            <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-leaf px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={isSaving} type="submit">
              <Check className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}

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
                <select className="h-9 rounded-lg border border-black/10 px-2 text-xs font-bold text-leaf" value={quote.status} onChange={(event) => onUpdateQuoteStatus(quote, event.target.value as QuoteStatus)}>
                  {quoteStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="mt-4 space-y-2">
                {quote.items.map((item, index) => {
                  const product = products.find((entry) => entry.id === item.productId);
                  return (
                    <div key={`${item.productId}-${index}`} className="flex justify-between gap-3 text-sm">
                      <span className="text-ink/70">
                        {item.quantity}x {product?.name ?? "Produto indisponível"}
                      </span>
                      <strong>{currency(item.quantity * item.unitPrice)}</strong>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
                <div>
                  <span className="text-sm text-ink/60">Total</span>
                  <strong className="ml-2 text-lg">{currency(total)}</strong>
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex h-9 items-center gap-1 rounded-lg border border-black/10 px-2 text-sm font-semibold" onClick={() => openEditQuote(quote)} type="button">
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button className="inline-flex h-9 items-center gap-1 rounded-lg border border-coral/25 px-2 text-sm font-semibold text-coral" onClick={() => onDeleteQuote(quote)} type="button">
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}