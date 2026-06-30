"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CalendarPlus,
  Check,
  Clipboard,
  FileText,
  MessageSquarePlus,
  Plus,
  Send,
  ShoppingCart,
  Trash2
} from "lucide-react";
import { currency, shortDateTime } from "@/lib/format";
import type {
  Activity,
  ActivityFormData,
  Client,
  FollowUpFormData,
  Product,
  Quote,
  QuoteFormData,
  QuoteItemFormData,
  UserRole
} from "@/lib/types";

type ResponseCategory =
  | "interessado"
  | "pediu catalogo"
  | "pediu valores"
  | "sem resposta"
  | "objecao"
  | "retorno agendado"
  | "venda encaminhada";

type CustomerProfile = "tutor" | "clinica" | "pet shop" | "loja" | "revendedor" | "parceiro";

type GuidedServiceViewProps = {
  activities: Activity[];
  clients: Client[];
  currentSellerId: string;
  isRealSession: boolean;
  products: Product[];
  quotes: Quote[];
  role: UserRole;
  onCreateActivity: (activity: ActivityFormData) => Promise<void>;
  onCreateFollowUp: (followUp: FollowUpFormData) => Promise<void>;
  onCreateQuote: (quote: QuoteFormData) => Promise<void>;
  onUpdateQuote: (id: string, quote: QuoteFormData) => Promise<void>;
};

type SessionRecord = {
  id: string;
  clientId: string;
  category: ResponseCategory;
  response: string;
  createdAt: string;
};

const categories: ResponseCategory[] = [
  "interessado",
  "pediu catalogo",
  "pediu valores",
  "sem resposta",
  "objecao",
  "retorno agendado",
  "venda encaminhada"
];

const customerProfiles: { value: CustomerProfile; label: string; keywords: string[] }[] = [
  { value: "tutor", label: "Tutor", keywords: ["tutor", "presente", "cach", "cao", "gato", "gateiro", "decor"] },
  { value: "clinica", label: "Clinica", keywords: ["clinica", "vet", "veterin", "recepc", "organiz", "mesa"] },
  { value: "pet shop", label: "Pet shop", keywords: ["pet shop", "loja", "vitrine", "coleira", "pote", "comedouro"] },
  { value: "loja", label: "Loja", keywords: ["loja", "vitrine", "organiz", "chaveiro", "decor", "wall art"] },
  { value: "revendedor", label: "Revendedor", keywords: ["revenda", "atacado", "kit", "chaveiro", "catalogo"] },
  { value: "parceiro", label: "Parceiro", keywords: ["parceiro", "evento", "brinde", "kit", "personal"] }
];

const messageTemplates: Array<{ title: string; profile?: CustomerProfile; text: string }> = [
  {
    title: "Abertura",
    text: "Oi! Tudo bem? Sou da Ketri Criativa. Posso te mostrar algumas opcoes da linha Pets e tal para o seu perfil?"
  },
  {
    title: "Entender necessidade",
    text: "Para eu indicar melhor, voce procura algo para uso proprio, presente, vitrine, recepcao, revenda ou uma acao comercial?"
  },
  {
    title: "Clinica",
    profile: "clinica",
    text: "Para clinicas, eu sugiro comecar por itens de recepcao e organizacao, porque ajudam no atendimento e deixam o ambiente com identidade pet."
  },
  {
    title: "Pet shop",
    profile: "pet shop",
    text: "Para pet shop, vale montar uma selecao de produtos de vitrine e itens de giro para testar interesse dos clientes sem comecar com volume alto."
  },
  {
    title: "Revenda",
    profile: "revendedor",
    text: "Para revenda, posso montar uma sugestao com produtos de entrada e itens mais chamativos, ja pensando em margem e variedade."
  },
  {
    title: "Valores",
    text: "Vou montar um orcamento com os itens sugeridos. Se quiser, ajusto quantidade e combinacao para caber melhor no seu objetivo."
  },
  {
    title: "Retorno",
    text: "Combinado. Vou deixar seu retorno agendado e te chamo na data combinada para continuarmos com a proposta."
  }
];

function nowInputDateTime() {
  return new Date().toISOString().slice(0, 16);
}

function tomorrowInputDateTime() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(10, 0, 0, 0);
  return date.toISOString().slice(0, 16);
}

function clientSummary(client?: Client) {
  if (!client) {
    return "Selecione um cliente para iniciar o atendimento.";
  }

  return [client.contactName, client.phone, client.city].filter(Boolean).join(" | ");
}

function quoteToForm(quote: Quote): QuoteFormData {
  return {
    clientId: quote.clientId,
    sellerId: quote.sellerId,
    status: quote.status,
    items: quote.items.map((item) => ({ ...item }))
  };
}

function buildQuoteItem(product: Product): QuoteItemFormData {
  return {
    productId: product.id,
    quantity: 1,
    unitPrice: product.price
  };
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function GuidedServiceView({
  activities,
  clients,
  currentSellerId,
  isRealSession,
  products,
  quotes,
  role,
  onCreateActivity,
  onCreateFollowUp,
  onCreateQuote,
  onUpdateQuote
}: GuidedServiceViewProps) {
  const manageableClients = useMemo(
    () => (role === "admin" ? clients : clients.filter((client) => client.sellerId === currentSellerId)),
    [clients, currentSellerId, role]
  );
  const activeProducts = useMemo(() => products.filter((product) => product.active !== false), [products]);
  const [selectedClientId, setSelectedClientId] = useState(manageableClients[0]?.id ?? "");
  const [need, setNeed] = useState("");
  const [profile, setProfile] = useState<CustomerProfile>("pet shop");
  const [response, setResponse] = useState("");
  const [category, setCategory] = useState<ResponseCategory>("interessado");
  const [quoteItems, setQuoteItems] = useState<QuoteItemFormData[]>([]);
  const [followUpTitle, setFollowUpTitle] = useState("Retomar atendimento Pets e tal");
  const [followUpDueAt, setFollowUpDueAt] = useState(tomorrowInputDateTime());
  const [localHistory, setLocalHistory] = useState<SessionRecord[]>([]);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedClient = manageableClients.find((client) => client.id === selectedClientId) ?? manageableClients[0];
  const selectedClientActivities = activities.filter((activity) => activity.clientId === selectedClient?.id);
  const selectedClientQuotes = quotes.filter((quote) => quote.clientId === selectedClient?.id);
  const editableQuote = selectedClientQuotes.find((quote) => quote.status === "rascunho") ?? selectedClientQuotes[0];
  const selectedProfile = customerProfiles.find((item) => item.value === profile) ?? customerProfiles[0];

  const suggestedProducts = useMemo(() => {
    const needWords = normalizeText(need)
      .split(/\s+/)
      .filter((word) => word.length >= 4);
    const keywords = [...selectedProfile.keywords, ...needWords].map(normalizeText);

    return activeProducts
      .map((product) => {
        const haystack = normalizeText(`${product.name} ${product.category} ${product.sku}`);
        const score = keywords.reduce((sum, keyword) => (haystack.includes(keyword) ? sum + 1 : sum), 0);
        return { product, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
      .slice(0, 6)
      .map((entry) => entry.product);
  }, [activeProducts, need, selectedProfile]);

  const fallbackProducts = suggestedProducts.length > 0 ? suggestedProducts : activeProducts.slice(0, 6);
  const quoteTotal = quoteItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const nextStep = !selectedClient
    ? "Selecione um cliente para iniciar."
    : !need.trim()
      ? "Registre a necessidade do cliente."
      : quoteItems.length === 0
        ? "Adicione produtos sugeridos ao orcamento."
        : !response.trim()
          ? "Registre a conversa antes de finalizar."
          : "Salve atividade, follow-up e orcamento.";

  useEffect(() => {
    if (!selectedClientId && manageableClients[0]) {
      setSelectedClientId(manageableClients[0].id);
    }
  }, [manageableClients, selectedClientId]);

  useEffect(() => {
    if (editableQuote && editableQuote.clientId === selectedClient?.id) {
      setQuoteItems(editableQuote.items.map((item) => ({ ...item })));
    } else {
      setQuoteItems([]);
    }
  }, [editableQuote, selectedClient?.id]);

  function resolveSellerId() {
    return role === "admin" ? selectedClient?.sellerId ?? currentSellerId : currentSellerId;
  }

  function getProduct(productId: string) {
    return products.find((product) => product.id === productId);
  }

  function ensureClientSelected() {
    if (!selectedClient) {
      throw new Error("Selecione um cliente.");
    }

    if (role !== "admin" && selectedClient.sellerId !== currentSellerId) {
      throw new Error("Vendedor nao pode registrar atendimento em cliente de outro vendedor.");
    }
  }

  async function copyMessage(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Mensagem copiada.");
    } catch {
      setMessage("Nao foi possivel copiar automaticamente.");
    }
  }

  function addProductToQuote(product: Product) {
    setQuoteItems((current) => {
      const existing = current.find((item) => item.productId === product.id);

      if (existing) {
        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...current, buildQuoteItem(product)];
    });
    setMessage(`${product.name} adicionado ao orcamento.`);
  }

  function updateItem(index: number, item: QuoteItemFormData) {
    setQuoteItems((current) => current.map((entry, itemIndex) => (itemIndex === index ? item : entry)));
  }

  function removeItem(index: number) {
    setQuoteItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function buildConversationNote() {
    const productsText = quoteItems
      .map((item) => {
        const product = getProduct(item.productId);
        return product ? `${item.quantity}x ${product.name}` : "produto indisponivel";
      })
      .join(", ");

    return [
      "[Atendimento guiado]",
      `Perfil: ${selectedProfile.label}`,
      `Necessidade: ${need.trim() || "nao informada"}`,
      `Resposta: ${category} - ${response.trim() || "sem resposta registrada"}`,
      productsText ? `Produtos no orcamento: ${productsText}` : "Produtos no orcamento: nenhum"
    ].join(" | ");
  }

  async function registerConversation() {
    ensureClientSelected();

    if (!need.trim()) {
      throw new Error("Registre a necessidade do cliente.");
    }

    if (!response.trim()) {
      throw new Error("Registre a resposta ou conversa do cliente.");
    }

    const record: SessionRecord = {
      id: `${Date.now()}`,
      clientId: selectedClient.id,
      category,
      response: response.trim(),
      createdAt: new Date().toISOString()
    };

    await onCreateActivity({
      clientId: selectedClient.id,
      sellerId: resolveSellerId(),
      type: "whatsapp",
      note: buildConversationNote(),
      dueAt: nowInputDateTime()
    });

    setLocalHistory((current) => [record, ...current]);
  }

  async function saveFollowUp() {
    ensureClientSelected();

    if (!followUpTitle.trim() || !followUpDueAt) {
      throw new Error("Informe titulo e data do follow-up.");
    }

    if (new Date(followUpDueAt).getTime() <= Date.now()) {
      throw new Error("O follow-up precisa ter uma data futura.");
    }

    await onCreateFollowUp({
      clientId: selectedClient.id,
      sellerId: resolveSellerId(),
      activityId: null,
      title: followUpTitle.trim(),
      dueAt: followUpDueAt
    });
  }

  async function saveQuote() {
    ensureClientSelected();

    if (quoteItems.length === 0) {
      throw new Error("Adicione pelo menos um produto ao orcamento.");
    }

    if (quoteItems.some((item) => !item.productId || item.quantity <= 0 || item.unitPrice < 0)) {
      throw new Error("Revise produto, quantidade e preco dos itens.");
    }

    const payload: QuoteFormData = {
      clientId: selectedClient.id,
      sellerId: selectedClient.sellerId,
      status: editableQuote?.status ?? "rascunho",
      items: quoteItems.map((item) => ({ ...item }))
    };

    if (editableQuote) {
      await onUpdateQuote(editableQuote.id, payload);
      return;
    }

    await onCreateQuote(payload);
  }

  async function handleRegisterActivity() {
    setMessage("");
    setIsSaving(true);

    try {
      await registerConversation();
      setResponse("");
      setMessage("Conversa registrada no historico do cliente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel registrar a conversa.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateFollowUp() {
    setMessage("");
    setIsSaving(true);

    try {
      await saveFollowUp();
      setMessage("Follow-up criado para o cliente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel criar o follow-up.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveQuote() {
    setMessage("");
    setIsSaving(true);

    try {
      await saveQuote();
      setMessage(editableQuote ? "Orcamento atualizado." : "Orcamento criado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel salvar o orcamento.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleFinishService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    try {
      await registerConversation();
      await saveFollowUp();
      await saveQuote();
      setResponse("");
      setMessage("Atendimento salvo: conversa, follow-up e orcamento foram atualizados.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel finalizar o atendimento.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleFinishService}>
      <section className="rounded-lg border border-black/10 bg-white p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-ink">
              Cliente em atendimento
              <select
                className="h-11 rounded-lg border border-black/10 px-3 text-sm font-normal"
                value={selectedClient?.id ?? ""}
                onChange={(event) => setSelectedClientId(event.target.value)}
              >
                {manageableClients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-ink">
              Perfil do cliente
              <select
                className="h-11 rounded-lg border border-black/10 px-3 text-sm font-normal"
                value={profile}
                onChange={(event) => setProfile(event.target.value as CustomerProfile)}
              >
                {customerProfiles.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="rounded-lg bg-black/[0.03] p-3">
            <p className="text-xs font-bold uppercase text-ink/45">Proximo passo</p>
            <p className="mt-1 text-sm font-bold text-ink">{nextStep}</p>
            <p className="mt-2 text-xs font-semibold text-ink/50">
              {isRealSession ? "Sessao real: salvar usa Supabase." : "Modo demonstracao: salve apenas apos entrar com Supabase."}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Necessidade do cliente
            <textarea
              className="min-h-24 rounded-lg border border-black/10 px-3 py-2 text-sm font-normal"
              placeholder="Ex.: montar vitrine de pet shop, organizar recepcao da clinica, comprar presente, revender kits..."
              value={need}
              onChange={(event) => setNeed(event.target.value)}
            />
          </label>
          <div className="rounded-lg bg-black/[0.03] p-3">
            <p className="text-xs font-bold uppercase text-ink/45">Dados principais</p>
            <h3 className="mt-1 text-lg font-bold text-ink">{selectedClient?.name ?? "Sem cliente"}</h3>
            <p className="text-sm text-ink/65">{clientSummary(selectedClient)}</p>
            {selectedClient && (
              <p className="mt-2 text-sm font-semibold text-sky">
                Status: {selectedClient.status} | Potencial: {selectedClient.potential}
              </p>
            )}
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-lg border border-sky/20 bg-sky/10 px-4 py-3 text-sm font-semibold text-sky">
          {message}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-lg border border-black/10 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-ink">Produtos sugeridos</h3>
              <p className="text-sm text-ink/55">Baseado no perfil e na necessidade registrada.</p>
            </div>
            <span className="rounded-lg bg-leaf/10 px-3 py-1 text-xs font-bold text-leaf">
              {fallbackProducts.length} sugestoes
            </span>
          </div>

          <div className="mt-3 grid gap-3">
            {fallbackProducts.map((product) => (
              <article key={product.id} className="rounded-lg border border-black/10 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-sky">{product.category}</p>
                    <h4 className="font-bold text-ink">{product.name}</h4>
                    <p className="text-sm text-ink/55">SKU {product.sku} | {product.stockStatus}</p>
                  </div>
                  <strong className="text-sm text-ink">{currency(product.price)}</strong>
                </div>
                <button
                  className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-ink px-3 text-sm font-semibold text-white"
                  onClick={() => addProductToQuote(product)}
                  type="button"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Adicionar
                </button>
              </article>
            ))}
            {fallbackProducts.length === 0 && (
              <p className="rounded-lg bg-black/[0.03] px-3 py-4 text-sm font-medium text-ink/55">
                Nenhum produto ativo disponivel para sugestao.
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-5">
          <div className="rounded-lg border border-black/10 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="inline-flex items-center gap-2 text-base font-bold text-ink">
                  <FileText className="h-4 w-4" />
                  Orcamento do atendimento
                </h3>
                <p className="text-sm text-ink/55">
                  {editableQuote ? `Atualizando orcamento ${editableQuote.id}` : "Novo rascunho para o cliente"}
                </p>
              </div>
              <strong className="text-lg text-ink">{currency(quoteTotal)}</strong>
            </div>

            <div className="mt-3 grid gap-2">
              {quoteItems.map((item, index) => {
                const product = getProduct(item.productId);
                return (
                  <div key={`${item.productId}-${index}`} className="grid gap-2 rounded-lg border border-black/10 p-3 md:grid-cols-[1fr_92px_120px_auto] md:items-end">
                    <div>
                      <p className="text-sm font-bold text-ink">{product?.name ?? "Produto indisponivel"}</p>
                      <p className="text-xs font-semibold text-ink/50">{product?.category ?? "Sem categoria"}</p>
                    </div>
                    <label className="grid gap-1 text-xs font-bold text-ink/60">
                      Qtd.
                      <input
                        className="h-9 rounded-lg border border-black/10 px-2 text-sm font-normal"
                        min="1"
                        type="number"
                        value={item.quantity}
                        onChange={(event) => updateItem(index, { ...item, quantity: Number(event.target.value) })}
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-bold text-ink/60">
                      Unitario
                      <input
                        className="h-9 rounded-lg border border-black/10 px-2 text-sm font-normal"
                        min="0"
                        step="0.01"
                        type="number"
                        value={item.unitPrice}
                        onChange={(event) => updateItem(index, { ...item, unitPrice: Number(event.target.value) })}
                      />
                    </label>
                    <button
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-coral/25 px-3 text-coral"
                      onClick={() => removeItem(index)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
              {quoteItems.length === 0 && (
                <p className="rounded-lg bg-black/[0.03] px-3 py-4 text-sm font-medium text-ink/55">
                  Adicione produtos sugeridos para gerar o orcamento.
                </p>
              )}
            </div>

            <button
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-leaf px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              onClick={handleSaveQuote}
              type="button"
            >
              <Check className="h-4 w-4" />
              {editableQuote ? "Atualizar orcamento" : "Gerar orcamento"}
            </button>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-4">
            <h3 className="text-base font-bold text-ink">Mensagens prontas</h3>
            <div className="mt-3 grid gap-2">
              {messageTemplates
                .filter((template) => !template.profile || template.profile === profile)
                .map((template) => (
                  <button
                    key={template.title}
                    className="grid gap-1 rounded-lg border border-black/10 px-3 py-2 text-left text-sm hover:border-sky/40"
                    onClick={() => copyMessage(template.text)}
                    type="button"
                  >
                    <span className="inline-flex items-center gap-2 font-bold text-ink">
                      <Clipboard className="h-4 w-4" />{template.title}
                    </span>
                    <span className="text-ink/60">{template.text}</span>
                  </button>
                ))}
            </div>
          </div>
        </section>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-black/10 bg-white p-4">
          <h3 className="text-base font-bold text-ink">Registro da conversa</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-[190px_1fr]">
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Categoria
              <select
                className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal"
                value={category}
                onChange={(event) => setCategory(event.target.value as ResponseCategory)}
              >
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Resposta do cliente
              <textarea
                className="min-h-24 rounded-lg border border-black/10 px-3 py-2 text-sm font-normal"
                value={response}
                onChange={(event) => setResponse(event.target.value)}
              />
            </label>
          </div>
          <button
            className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-sky px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            onClick={handleRegisterActivity}
            type="button"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Registrar conversa
          </button>
        </div>

        <div className="rounded-lg border border-black/10 bg-white p-4">
          <h3 className="inline-flex items-center gap-2 text-base font-bold text-ink">
            <CalendarPlus className="h-4 w-4" />
            Proximo contato
          </h3>
          <label className="mt-3 grid gap-1 text-sm font-semibold text-ink">
            Titulo
            <input
              className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal"
              value={followUpTitle}
              onChange={(event) => setFollowUpTitle(event.target.value)}
            />
          </label>
          <label className="mt-3 grid gap-1 text-sm font-semibold text-ink">
            Data futura
            <input
              className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal"
              type="datetime-local"
              value={followUpDueAt}
              onChange={(event) => setFollowUpDueAt(event.target.value)}
            />
          </label>
          <button
            className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-leaf px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            onClick={handleCreateFollowUp}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Criar follow-up
          </button>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 bg-white p-4">
        <div>
          <p className="text-sm font-bold text-ink">Finalizar atendimento</p>
          <p className="text-sm text-ink/55">Salva conversa, cria follow-up e gera ou atualiza o orcamento.</p>
        </div>
        <button
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
          type="submit"
        >
          <Send className="h-4 w-4" />
          {isSaving ? "Salvando..." : "Salvar atendimento completo"}
        </button>
      </div>

      <section className="rounded-lg border border-black/10 bg-white p-4">
        <h3 className="text-base font-bold text-ink">Historico do cliente</h3>
        <div className="mt-3 grid gap-3">
          {localHistory.filter((record) => record.clientId === selectedClient?.id).map((record) => (
            <article key={record.id} className="rounded-lg border border-black/10 px-3 py-2 text-sm">
              <p className="font-bold text-ink">{record.category} | {shortDateTime(record.createdAt)}</p>
              <p className="text-ink/65">{record.response}</p>
            </article>
          ))}
          {selectedClientActivities.map((activity) => (
            <article key={activity.id} className="rounded-lg border border-black/10 px-3 py-2 text-sm">
              <p className="font-bold text-ink">{activity.type} | {activity.dueAt ? shortDateTime(activity.dueAt) : "sem prazo"}</p>
              <p className="text-ink/65">{activity.note}</p>
            </article>
          ))}
          {selectedClientQuotes.map((quote) => (
            <article key={quote.id} className="rounded-lg border border-black/10 px-3 py-2 text-sm">
              <p className="font-bold text-ink">Orcamento {quote.status} | {shortDateTime(quote.createdAt)}</p>
              <p className="text-ink/65">
                {quote.items.length} item(ns) | {currency(quote.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))}
              </p>
            </article>
          ))}
          {localHistory.filter((record) => record.clientId === selectedClient?.id).length === 0 &&
            selectedClientActivities.length === 0 &&
            selectedClientQuotes.length === 0 && (
              <p className="rounded-lg bg-black/[0.03] px-3 py-4 text-sm font-medium text-ink/55">
                Nenhum registro para este cliente ainda.
              </p>
            )}
        </div>
      </section>
    </form>
  );
}