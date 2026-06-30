"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowUpDown,
  Check,
  Copy,
  Filter,
  History,
  ImageIcon,
  MoreVertical,
  PackagePlus,
  Pencil,
  Plus,
  Power,
  Share2,
  Star,
  Trash2,
  X
} from "lucide-react";
import clsx from "clsx";
import { currency } from "@/lib/format";
import type { Client, Product, ProductFormData, QuoteFormData, UserRole } from "@/lib/types";

type ProductsViewProps = {
  clients: Client[];
  currentSellerId: string;
  isRealSession: boolean;
  products: Product[];
  query: string;
  role: UserRole;
  onCreateProduct: (product: ProductFormData) => Promise<void>;
  onCreateQuote: (quote: QuoteFormData) => Promise<void>;
  onDeleteProduct: (product: Product) => Promise<void>;
  onSetProductActive: (product: Product, active: boolean) => Promise<void>;
  onUpdateProduct: (id: string, product: ProductFormData) => Promise<void>;
};

type QuickFilter =
  | "todos"
  | "gateiros"
  | "cachorros"
  | "clinicas"
  | "enriquecimento"
  | "presentes"
  | "herois"
  | "favoritos"
  | "com foto"
  | "sem foto"
  | "ativos"
  | "inativos";

type SortKey = "name" | "category" | "b2bPrice" | "b2cPrice" | "sku" | "bestSellers" | "recent";

const emptyProductForm: ProductFormData = {
  sku: "",
  name: "",
  category: "",
  price: 0,
  b2bPrice: null,
  b2cPrice: null,
  costPrice: null,
  imageUrl: "",
  tags: [],
  featured: false,
  favorite: false,
  stockStatus: "disponivel"
};

const quickFilters: { id: QuickFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "gateiros", label: "Gateiros" },
  { id: "cachorros", label: "Cachorros" },
  { id: "clinicas", label: "Clínicas" },
  { id: "enriquecimento", label: "Enriquecimento" },
  { id: "presentes", label: "Presentes" },
  { id: "herois", label: "Produtos Herói" },
  { id: "favoritos", label: "Favoritos" },
  { id: "com foto", label: "Com foto" },
  { id: "sem foto", label: "Sem foto" },
  { id: "ativos", label: "Ativos" },
  { id: "inativos", label: "Inativos" }
];

const sortOptions: { id: SortKey; label: string }[] = [
  { id: "name", label: "Nome" },
  { id: "category", label: "Categoria" },
  { id: "b2bPrice", label: "Preço B2B" },
  { id: "b2cPrice", label: "Preço B2C" },
  { id: "sku", label: "Código" },
  { id: "bestSellers", label: "Mais vendidos" },
  { id: "recent", label: "Mais recentes" }
];

function formFromProduct(product: Product): ProductFormData {
  return {
    sku: product.sku,
    name: product.name,
    category: product.category,
    price: product.price,
    b2bPrice: product.b2bPrice ?? null,
    b2cPrice: product.b2cPrice ?? product.price,
    costPrice: product.costPrice ?? null,
    imageUrl: product.imageUrl ?? "",
    tags: product.tags ?? [],
    featured: product.featured ?? false,
    favorite: product.favorite ?? false,
    stockStatus: product.stockStatus === "pronto" ? "disponivel" : product.stockStatus
  };
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function displayPrice(value?: number | null) {
  return value == null ? "Não informado" : currency(value);
}

function productB2cPrice(product: Product) {
  return product.b2cPrice ?? product.price;
}

function productB2bPrice(product: Product) {
  return product.b2bPrice ?? null;
}

function tagList(product: Product) {
  const derived = new Set(product.tags ?? []);
  const text = normalizeText(`${product.category} ${product.name}`);

  if (text.includes("gat") || text.includes("felin")) derived.add("Gateiros");
  if (text.includes("cao") || text.includes("cachorro") || text.includes("canin")) derived.add("Cachorros");
  if (text.includes("enriquec")) derived.add("Enriquecimento");
  if (text.includes("decor") || text.includes("wall art")) derived.add("Decoração");
  if (text.includes("passeio") || text.includes("coleira")) derived.add("Passeio");
  if (text.includes("clinic") || text.includes("vet")) derived.add("Clínicas");
  if (text.includes("personal")) derived.add("Personalizados");

  return Array.from(derived).slice(0, 4);
}

function stockLabel(status: Product["stockStatus"]) {
  const normalized = status === "pronto" ? "disponivel" : status;

  const labels: Record<string, string> = {
    disponivel: "Disponível",
    "sob encomenda": "Sob encomenda",
    indisponivel: "Indisponível",
    "em producao": "Em produção"
  };

  return labels[normalized] ?? status;
}

function stockClass(status: Product["stockStatus"]) {
  const normalized = status === "pronto" ? "disponivel" : status;

  if (normalized === "disponivel") return "bg-leaf/10 text-leaf";
  if (normalized === "sob encomenda") return "bg-sky/10 text-sky";
  if (normalized === "em producao") return "bg-maize/20 text-ink";
  return "bg-coral/10 text-coral";
}

function categoryClass(tag: string) {
  const normalized = normalizeText(tag);

  if (normalized.includes("gat")) return "bg-sky/10 text-sky";
  if (normalized.includes("cach") || normalized.includes("cao")) return "bg-leaf/10 text-leaf";
  if (normalized.includes("clinic")) return "bg-coral/10 text-coral";
  if (normalized.includes("enriquec")) return "bg-maize/20 text-ink";
  return "bg-black/[0.04] text-ink/70";
}

function canDisplayImage(imageUrl?: string | null) {
  if (!imageUrl) return false;
  return imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("/");
}

function matchesFilter(product: Product, filter: QuickFilter) {
  const text = normalizeText(`${product.name} ${product.category} ${product.sku} ${(product.tags ?? []).join(" ")}`);
  const hasImage = Boolean(product.imageUrl);
  const isActive = product.active !== false;

  if (filter === "todos") return true;
  if (filter === "gateiros") return text.includes("gat") || text.includes("felin");
  if (filter === "cachorros") return text.includes("cao") || text.includes("cachorro") || text.includes("canin");
  if (filter === "clinicas") return text.includes("clinic") || text.includes("vet");
  if (filter === "enriquecimento") return text.includes("enriquec");
  if (filter === "presentes") return text.includes("presente") || text.includes("decor") || text.includes("chaveiro");
  if (filter === "herois") return product.featured === true;
  if (filter === "favoritos") return product.favorite === true;
  if (filter === "com foto") return hasImage;
  if (filter === "sem foto") return !hasImage;
  if (filter === "ativos") return isActive;
  if (filter === "inativos") return !isActive;

  return true;
}

function sortProducts(products: Product[], sort: SortKey) {
  return [...products].sort((a, b) => {
    if (sort === "category") return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
    if (sort === "b2bPrice") return (productB2bPrice(a) ?? Number.MAX_SAFE_INTEGER) - (productB2bPrice(b) ?? Number.MAX_SAFE_INTEGER);
    if (sort === "b2cPrice") return productB2cPrice(a) - productB2cPrice(b);
    if (sort === "sku") return a.sku.localeCompare(b.sku);
    if (sort === "bestSellers") return Number(b.featured ?? false) - Number(a.featured ?? false) || a.name.localeCompare(b.name);
    if (sort === "recent") return b.sku.localeCompare(a.sku);
    return a.name.localeCompare(b.name);
  });
}

export function ProductsView({
  clients,
  currentSellerId,
  isRealSession,
  products,
  query,
  role,
  onCreateProduct,
  onCreateQuote,
  onDeleteProduct,
  onSetProductActive,
  onUpdateProduct
}: ProductsViewProps) {
  const canManage = role === "admin";
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyProductForm);
  const [formError, setFormError] = useState("");
  const [catalogMessage, setCatalogMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("todos");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [actionProductId, setActionProductId] = useState<string | null>(null);
  const manageableClients = useMemo(
    () => (role === "admin" ? clients : clients.filter((client) => client.sellerId === currentSellerId)),
    [clients, currentSellerId, role]
  );
  const [quoteClientId, setQuoteClientId] = useState(manageableClients[0]?.id ?? "");

  useEffect(() => {
    if (!manageableClients.some((client) => client.id === quoteClientId)) {
      setQuoteClientId(manageableClients[0]?.id ?? "");
    }
  }, [manageableClients, quoteClientId]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    const filtered = products.filter((product) => {
      const searchTarget = normalizeText(`${product.name} ${product.sku} ${product.category} ${(product.tags ?? []).join(" ")}`);
      return (!normalizedQuery || searchTarget.includes(normalizedQuery)) && matchesFilter(product, quickFilter);
    });

    return sortProducts(filtered, sortKey);
  }, [products, query, quickFilter, sortKey]);

  const activeCount = products.filter((product) => product.active !== false).length;
  const photoCount = products.filter((product) => product.imageUrl).length;

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
    setActionProductId(null);
  }

  function duplicateProduct(product: Product) {
    setEditingProduct(null);
    setForm({
      ...formFromProduct(product),
      sku: `${product.sku}-COPIA`,
      name: `${product.name} - cópia`
    });
    setFormError("");
    setIsFormOpen(true);
    setActionProductId(null);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingProduct(null);
    setForm(emptyProductForm);
    setFormError("");
  }

  function updateTags(value: string) {
    setForm((current) => ({
      ...current,
      tags: value.split(",").map((tag) => tag.trim()).filter(Boolean)
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const b2cPrice = form.b2cPrice ?? form.price;

    if (!form.sku.trim() || !form.name.trim() || !form.category.trim() || b2cPrice < 0 || form.price < 0) {
      setFormError("Informe código, produto, categoria e preço válido.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        ...form,
        price: b2cPrice,
        b2cPrice
      };

      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, payload);
      } else {
        await onCreateProduct(payload);
      }

      closeForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Não foi possível salvar o produto.");
    } finally {
      setIsSaving(false);
    }
  }

  async function copyProductInfo(product: Product, mode: "summary" | "description") {
    const text =
      mode === "summary"
        ? `${product.name}\nCódigo: ${product.sku}\nCategoria: ${product.category}\nPreço B2B: ${displayPrice(productB2bPrice(product))}\nPreço B2C: ${displayPrice(productB2cPrice(product))}\nDisponibilidade: ${stockLabel(product.stockStatus)}`
        : `${product.name}: produto da categoria ${product.category}. Disponibilidade: ${stockLabel(product.stockStatus)}.`;

    try {
      await navigator.clipboard.writeText(text);
      setCatalogMessage(mode === "summary" ? "Informações copiadas." : "Descrição copiada.");
    } catch {
      setCatalogMessage("Não foi possível copiar automaticamente.");
    }
  }

  async function shareProduct(product: Product) {
    const text = `${product.name} (${product.sku}) - ${displayPrice(productB2cPrice(product))}`;

    if (navigator.share) {
      await navigator.share({ title: product.name, text });
      return;
    }

    await copyProductInfo(product, "summary");
  }

  async function addToQuote(product: Product) {
    setCatalogMessage("");
    const client = manageableClients.find((item) => item.id === quoteClientId);

    if (!client) {
      setCatalogMessage("Selecione um cliente para gerar o orçamento.");
      return;
    }

    setIsSaving(true);

    try {
      await onCreateQuote({
        clientId: client.id,
        sellerId: client.sellerId,
        status: "rascunho",
        items: [
          {
            productId: product.id,
            quantity: 1,
            unitPrice: productB2bPrice(product) ?? productB2cPrice(product)
          }
        ]
      });
      setCatalogMessage(`Orçamento criado para ${client.name} com ${product.name}.`);
    } catch (error) {
      setCatalogMessage(error instanceof Error ? error.message : "Não foi possível adicionar ao orçamento.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-black/10 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-ink">Catálogo Comercial</h2>
            <p className="mt-1 max-w-2xl text-sm text-ink/60">
              Encontre produtos, copie informações comerciais e gere orçamentos rápidos sem abrir uma tabela administrativa.
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

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg bg-black/[0.03] px-3 py-3">
            <p className="text-xs font-bold uppercase text-ink/45">Produtos ativos</p>
            <strong className="text-xl text-ink">{activeCount}</strong>
          </div>
          <div className="rounded-lg bg-black/[0.03] px-3 py-3">
            <p className="text-xs font-bold uppercase text-ink/45">Com foto cadastrada</p>
            <strong className="text-xl text-ink">{photoCount}</strong>
          </div>
          <label className="grid gap-1 rounded-lg bg-black/[0.03] px-3 py-3 text-sm font-semibold text-ink">
            Cliente para orçamento rápido
            <select
              className="h-9 rounded-lg border border-black/10 bg-white px-3 text-sm font-normal"
              value={quoteClientId}
              onChange={(event) => setQuoteClientId(event.target.value)}
            >
              {manageableClients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-sm font-bold text-ink/60">
            <Filter className="h-4 w-4" />
            Filtros
          </span>
          {quickFilters.map((filter) => (
            <button
              key={filter.id}
              className={clsx(
                "h-9 rounded-lg border px-3 text-xs font-bold transition",
                quickFilter === filter.id
                  ? "border-ink bg-ink text-white"
                  : "border-black/10 bg-white text-ink/70 hover:border-ink/30"
              )}
              onClick={() => setQuickFilter(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="mt-4 flex max-w-xs items-center gap-2 text-sm font-semibold text-ink/70">
          <ArrowUpDown className="h-4 w-4" />
          Ordenar por
          <select
            className="h-9 flex-1 rounded-lg border border-black/10 bg-white px-3 text-sm font-normal"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value as SortKey)}
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
        </label>
      </section>

      {catalogMessage && (
        <div className="rounded-lg border border-sky/20 bg-sky/10 px-4 py-3 text-sm font-semibold text-sky">
          {catalogMessage}
        </div>
      )}

      {canManage && isFormOpen && (
        <form className="grid gap-4 rounded-lg border border-black/10 bg-white p-4" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-ink">
                {editingProduct ? "Editar produto" : "Novo produto"}
              </h3>
              <p className="text-sm text-ink/55">Campos comerciais do catálogo e dados internos de administração.</p>
            </div>
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
              Modo demonstração: entre com Supabase para salvar produtos reais.
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-6">
            <label className="grid gap-1 text-sm font-semibold text-ink/70">
              Código
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
              Preço B2B
              <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" min="0" step="0.01" type="number" value={form.b2bPrice ?? ""} onChange={(event) => setForm((current) => ({ ...current, b2bPrice: event.target.value === "" ? null : Number(event.target.value) }))} />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink/70">
              Preço B2C
              <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" min="0" step="0.01" type="number" value={form.b2cPrice ?? form.price} onChange={(event) => setForm((current) => ({ ...current, b2cPrice: Number(event.target.value), price: Number(event.target.value) }))} />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-[160px_160px_1fr_160px_160px] md:items-end">
            <label className="grid gap-1 text-sm font-semibold text-ink/70">
              Custo
              <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" min="0" step="0.01" type="number" value={form.costPrice ?? ""} onChange={(event) => setForm((current) => ({ ...current, costPrice: event.target.value === "" ? null : Number(event.target.value) }))} />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink/70">
              Disponibilidade
              <select className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={form.stockStatus === "pronto" ? "disponivel" : form.stockStatus} onChange={(event) => setForm((current) => ({ ...current, stockStatus: event.target.value as ProductFormData["stockStatus"] }))}>
                <option value="disponivel">Disponível</option>
                <option value="sob encomenda">Sob encomenda</option>
                <option value="indisponivel">Indisponível</option>
                <option value="em producao">Em produção</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink/70">
              Foto principal
              <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={form.imageUrl ?? ""} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink/70">
              Tags
              <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={(form.tags ?? []).join(", ")} onChange={(event) => updateTags(event.target.value)} />
            </label>
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-leaf px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={isSaving} type="submit">
              <Check className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>

          <div className="flex flex-wrap gap-4 text-sm font-semibold text-ink/70">
            <label className="inline-flex items-center gap-2">
              <input checked={form.featured ?? false} className="h-4 w-4 accent-leaf" type="checkbox" onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} />
              Produto Herói
            </label>
            <label className="inline-flex items-center gap-2">
              <input checked={form.favorite ?? false} className="h-4 w-4 accent-leaf" type="checkbox" onChange={(event) => setForm((current) => ({ ...current, favorite: event.target.checked }))} />
              Favorito
            </label>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredProducts.map((product) => {
          const isActive = product.active !== false;
          const tags = tagList(product);
          const showImage = canDisplayImage(product.imageUrl);
          const isActionOpen = actionProductId === product.id;

          return (
            <article
              key={product.id}
              className={clsx(
                "flex min-w-0 flex-col overflow-hidden rounded-lg border bg-white shadow-sm",
                isActive ? "border-black/10" : "border-black/10 opacity-70"
              )}
            >
              <div className="flex min-h-full flex-col">
                <div className="flex aspect-[4/3] min-h-[190px] items-center justify-center overflow-hidden border-b border-black/10 bg-black/[0.03] sm:min-h-[220px]">
                  {showImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt={product.name} className="h-full w-full object-cover" src={product.imageUrl ?? ""} />
                  ) : (
                    <div className="grid justify-items-center gap-3 px-5 text-center text-sm font-bold text-ink/45">
                      <ImageIcon className="h-10 w-10" />
                      Foto pendente
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-base font-bold leading-snug text-ink sm:text-lg">{product.name}</h3>
                        <p className="mt-1 text-sm font-semibold text-ink/50">Código {product.sku}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {product.featured && <span className="rounded-md bg-maize/25 px-2 py-1 text-xs font-bold text-ink">Herói</span>}
                        {product.favorite && <Star className="h-4 w-4 fill-maize text-maize" />}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-md bg-black/[0.04] px-2 py-1 text-xs font-bold text-ink/70">{product.category}</span>
                    {tags.map((tag) => (
                      <span key={tag} className={clsx("rounded-md px-2 py-1 text-xs font-bold", categoryClass(tag))}>{tag}</span>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={clsx("rounded-md px-2 py-1 text-xs font-bold", stockClass(product.stockStatus))}>
                      {stockLabel(product.stockStatus)}
                    </span>
                    {canManage && (
                      <span className={clsx("rounded-md px-2 py-1 text-xs font-bold", isActive ? "bg-leaf/10 text-leaf" : "bg-black/5 text-ink/60")}>
                        {isActive ? "Ativo" : "Inativo"}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid gap-2 rounded-lg bg-black/[0.025] p-3 sm:grid-cols-3">
                    {canManage && (
                      <div>
                        <p className="text-xs font-bold uppercase text-ink/40">Custo</p>
                        <p className="text-base font-bold text-ink">{displayPrice(product.costPrice)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase text-ink/40">Preço B2B</p>
                      <p className="text-base font-bold text-ink">{displayPrice(productB2bPrice(product))}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-ink/40">Preço B2C</p>
                      <p className="text-base font-bold text-ink">{displayPrice(productB2cPrice(product))}</p>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                    <button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-ink px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none" disabled={isSaving || !isActive} onClick={() => addToQuote(product)} type="button">
                      <PackagePlus className="h-4 w-4" />
                      Orçamento
                    </button>
                    <button className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-semibold sm:flex-none" onClick={() => copyProductInfo(product, "summary")} type="button">
                      <Copy className="h-4 w-4" />
                      Copiar
                    </button>
                    <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 text-sm font-semibold" onClick={() => shareProduct(product)} type="button">
                      <Share2 className="h-4 w-4" />
                    </button>
                    <div className="relative">
                      <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10" onClick={() => setActionProductId(isActionOpen ? null : product.id)} type="button">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {isActionOpen && (
                        <div className="absolute right-0 z-10 mt-2 grid w-44 gap-1 rounded-lg border border-black/10 bg-white p-2 text-sm font-semibold shadow-soft">
                          <button className="flex items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-black/[0.03]" onClick={() => copyProductInfo(product, "description")} type="button">
                            <Copy className="h-4 w-4" />Descrição
                          </button>
                          <button className="flex items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-black/[0.03]" onClick={() => setCatalogMessage("Histórico comercial será exibido quando houver vendas vinculadas ao produto.")} type="button">
                            <History className="h-4 w-4" />Histórico
                          </button>
                          {canManage && (
                            <>
                              <button className="flex items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-black/[0.03]" onClick={() => openEditProduct(product)} type="button">
                                <Pencil className="h-4 w-4" />Editar
                              </button>
                              <button className="flex items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-black/[0.03]" onClick={() => duplicateProduct(product)} type="button">
                                <Plus className="h-4 w-4" />Duplicar
                              </button>
                              <button className="flex items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-black/[0.03]" onClick={() => onSetProductActive(product, !isActive)} type="button">
                                <Power className="h-4 w-4" />{isActive ? "Desativar" : "Ativar"}
                              </button>
                              <button className="flex items-center gap-2 rounded-md px-2 py-2 text-left text-coral hover:bg-coral/10" onClick={() => onDeleteProduct(product)} type="button">
                                <Trash2 className="h-4 w-4" />Excluir
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="rounded-lg border border-black/10 bg-white px-4 py-8 text-center text-sm font-semibold text-ink/55">
          Nenhum produto encontrado com os filtros atuais.
        </div>
      )}
    </div>
  );
}