"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
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

type CustomerProfile = "tutor" | "clinica" | "veterinario" | "pet shop" | "loja" | "revendedor" | "parceiro";

type StepId = "client" | "goal" | "context" | "products" | "quote" | "conversation" | "followUp" | "finish";

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
  { value: "clinica", label: "Clínica", keywords: ["clinica", "vet", "veterin", "recepc", "organiz", "mesa"] },
  { value: "veterinario", label: "Veterinário", keywords: ["veterinario", "vet", "clinica", "atendimento", "recepc", "organiz"] },
  { value: "pet shop", label: "Pet shop", keywords: ["pet shop", "loja", "vitrine", "coleira", "pote", "comedouro"] },
  { value: "loja", label: "Loja", keywords: ["loja", "vitrine", "organiz", "chaveiro", "decor", "wall art"] },
  { value: "revendedor", label: "Revendedor", keywords: ["revenda", "atacado", "kit", "chaveiro", "catalogo"] },
  { value: "parceiro", label: "Parceiro", keywords: ["parceiro", "evento", "brinde", "kit", "personal"] }
];

const serviceSteps: Array<{ id: StepId; label: string }> = [
  { id: "client", label: "Cliente" },
  { id: "goal", label: "Objetivo" },
  { id: "context", label: "Contexto" },
  { id: "products", label: "Produtos" },
  { id: "quote", label: "Orçamento" },
  { id: "conversation", label: "Conversa" },
  { id: "followUp", label: "Follow-up" },
  { id: "finish", label: "Finalização" }
];

const messageTemplates: Array<{ title: string; profile?: CustomerProfile; text: string }> = [
  {
    title: "Abertura",
    text: "Oi! Tudo bem? Sou da Ketri Criativa. Posso te mostrar algumas opções da linha Pets e tal para o seu perfil?"
  },
  {
    title: "Entender contexto",
    text: "Para eu indicar melhor, você procura algo para uso próprio, presente, vitrine, recepção, revenda ou uma ação comercial?"
  },
  {
    title: "Clínica",
    profile: "clinica",
    text: "Para clínicas, eu sugiro comecar por itens de recepção e organização, porque ajudam no atendimento e deixam o ambiente com identidade pet."
  },
  {
    title: "Pet shop",
    profile: "pet shop",
    text: "Para pet shop, vale montar uma selecao de produtos de vitrine e itens de giro para testar interesse dos clientes sem comecar com volume alto."
  },
  {
    title: "Revenda",
    profile: "revendedor",
    text: "Para revenda, posso montar uma sugestão com produtos de entrada e itens mais chamativos, ja pensando em margem e variedade."
  },
  {
    title: "Valores",
    text: "Vou montar um orçamento com os itens sugeridos. Se quiser, ajusto quantidade e combinação para caber melhor no seu objetivo."
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
  const [activeStep, setActiveStep] = useState<StepId>("client");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [areMessagesOpen, setAreMessagesOpen] = useState(false);

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
      ? "Registre o resumo da conversa."
      : quoteItems.length === 0
        ? "Adicione produtos sugeridos ao orçamento."
        : !response.trim()
          ? "Registre a conversa antes de finalizar."
          : "Salve atividade, follow-up e orçamento.";

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
      throw new Error("Vendedor não pode registrar atendimento em cliente de outro vendedor.");
    }
  }

  async function copyMessage(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Mensagem copiada.");
    } catch {
      setMessage("Não foi possível copiar automaticamente.");
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
    setMessage(`${product.name} adicionado ao orçamento.`);
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
        return product ? `${item.quantity}x ${product.name}` : "produto indisponível";
      })
      .join(", ");

    return [
      "[Atendimento guiado]",
      `Perfil: ${selectedProfile.label}`,
      `Resumo da conversa: ${need.trim() || "não informado"}`,
      `Resposta: ${category} - ${response.trim() || "sem resposta registrada"}`,
      productsText ? `Produtos no orçamento: ${productsText}` : "Produtos no orçamento: nenhum"
    ].join(" | ");
  }

  async function registerConversation() {
    ensureClientSelected();

    if (!need.trim()) {
      throw new Error("Registre o resumo da conversa.");
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
      throw new Error("Adicione pelo menos um produto ao orçamento.");
    }

    if (quoteItems.some((item) => !item.productId || item.quantity <= 0 || item.unitPrice < 0)) {
      throw new Error("Revise produto, quantidade e preço dos itens.");
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
      setMessage("Conversa registrada no histórico do cliente.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível registrar a conversa.");
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
      setMessage(error instanceof Error ? error.message : "Não foi possível criar o follow-up.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveQuote() {
    setMessage("");
    setIsSaving(true);

    try {
      await saveQuote();
      setMessage(editableQuote ? "Orçamento atualizado." : "Orçamento criado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar o orçamento.");
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
      setMessage("Atendimento salvo: conversa, follow-up e orçamento foram atualizados.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível finalizar o atendimento.");
    } finally {
      setIsSaving(false);
    }
  }

  const serviceGoalLabel = "Objetivo a definir";
  const activeStepIndex = Math.max(serviceSteps.findIndex((step) => step.id === activeStep), 0);
  const activeStepLabel = serviceSteps[activeStepIndex]?.label ?? "Cliente";
  const progressPercent = Math.round(((activeStepIndex + 1) / serviceSteps.length) * 100);
  const historyItemsCount = localHistory.filter((record) => record.clientId === selectedClient?.id).length + selectedClientActivities.length + selectedClientQuotes.length;
  const quoteStatusLabel = editableQuote?.status ?? (quoteItems.length > 0 ? "rascunho" : "sem orçamento");

  function isStepComplete(step: StepId) {
    if (step === "client") return Boolean(selectedClient);
    if (step === "goal") return false;
    if (step === "context") return Boolean(need.trim());
    if (step === "products") return quoteItems.length > 0;
    if (step === "quote") return Boolean(editableQuote) || quoteItems.length > 0;
    if (step === "conversation") return Boolean(response.trim()) || selectedClientActivities.length > 0;
    if (step === "followUp") return Boolean(followUpTitle.trim() && followUpDueAt);
    return false;
  }

  function stepState(step: StepId) {
    if (step === activeStep) return "atual";
    return isStepComplete(step) ? "concluida" : "pendente";
  }

  function goToNextStep() {
    setActiveStep(serviceSteps[Math.min(activeStepIndex + 1, serviceSteps.length - 1)].id);
  }

  function handlePrimaryAction() {
    goToNextStep();
  }

  const primaryButtonLabel = "Continuar";
  function stepSummary(step: StepId) {
    if (step === "client") return selectedClient?.name ?? "Cliente pendente";
    if (step === "goal") return serviceGoalLabel;
    if (step === "context") return `Perfil: ${selectedProfile.label}`;
    if (step === "products") return `${fallbackProducts.length} produto(s) sugerido(s)`;
    if (step === "quote") return `${quoteItems.length} item(ns) | ${currency(quoteTotal)}`;
    if (step === "conversation") return response.trim() ? category : `${selectedClientActivities.length} registro(s)`;
    if (step === "followUp") return followUpDueAt ? shortDateTime(followUpDueAt) : "Sem data";
    return quoteItems.length > 0 ? `Total ${currency(quoteTotal)}` : "Resumo pendente";
  }

  function StepShell({
    children,
    description,
    id,
    title
  }: {
    children: ReactNode;
    description?: string;
    id: StepId;
    title: string;
  }) {
    const isOpen = activeStep === id;
    const state = stepState(id);
    const isComplete = isStepComplete(id);

    return (
      <section className={isOpen ? "overflow-hidden rounded-lg border border-sky/40 bg-white shadow-sm" : "overflow-hidden rounded-lg border border-black/10 bg-white"}>
        <button
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          onClick={() => setActiveStep(id)}
          type="button"
        >
          <div className="min-w-0">
            <p className={isOpen ? "text-xs font-bold uppercase text-sky" : "text-xs font-bold uppercase text-ink/45"}>{state}</p>
            <div className="mt-1 flex items-center gap-2">
              {isComplete && !isOpen && <Check className="h-4 w-4 shrink-0 text-leaf" />}
              <h3 className="truncate text-base font-bold text-ink">{title}</h3>
            </div>
            {isOpen && description && <p className="mt-1 text-sm text-ink/55">{description}</p>}
            {!isOpen && <p className="mt-1 truncate text-sm font-semibold text-ink/55">{stepSummary(id)}</p>}
          </div>
          <span className={isOpen ? "rounded-md bg-sky/10 px-2 py-1 text-xs font-bold text-sky" : "rounded-md bg-black/[0.04] px-2 py-1 text-xs font-bold text-ink/60"}>
            {isOpen ? "Aberta" : isComplete ? "Concluída" : "Abrir"}
          </span>
        </button>
        <div className={isOpen ? "grid gap-4 border-t border-black/10 p-4" : "hidden"}>
          {children}
          {id !== "finish" && (
            <div className="flex justify-end border-t border-black/10 pt-3">
              <button className="inline-flex h-10 items-center justify-center rounded-lg bg-ink px-4 text-sm font-semibold text-white" onClick={goToNextStep} type="button">
                Continuar
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }
  return (
    <form className="space-y-5 pb-20 lg:pb-0" onSubmit={handleFinishService}>
      <section className="sticky top-0 z-20 rounded-lg border border-black/10 bg-white/95 p-3 shadow-sm backdrop-blur lg:p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-ink/45">Atendimento guiado</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-bold text-ink lg:text-xl">{selectedClient?.name ?? "Selecione um cliente"}</h2>
              <span className="rounded-md bg-black/[0.04] px-2 py-1 text-xs font-bold text-ink/60">{serviceGoalLabel}</span>
              <span className="rounded-md bg-sky/10 px-2 py-1 text-xs font-bold text-sky">{activeStepLabel}</span>
              <span className={isRealSession ? "rounded-md bg-leaf/10 px-2 py-1 text-xs font-bold text-leaf" : "rounded-md bg-maize/20 px-2 py-1 text-xs font-bold text-ink"}>
                {isRealSession ? "Real" : "Demonstração"}
              </span>
            </div>
            <p className="mt-1 truncate text-sm text-ink/60">{clientSummary(selectedClient)}</p>
          </div>
          <div className="min-w-[220px]">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-ink/45">
              <span>Progresso</span>
              <span>{activeStepIndex + 1}/{serviceSteps.length}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/[0.06]">
              <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {serviceSteps.map((step) => {
            const state = stepState(step.id);
            return (
              <button
                key={step.id}
                className={
                  state === "atual"
                    ? "shrink-0 rounded-lg bg-ink px-3 py-2 text-xs font-bold text-white"
                    : state === "concluida"
                      ? "shrink-0 rounded-lg bg-leaf/10 px-3 py-2 text-xs font-bold text-leaf"
                      : "shrink-0 rounded-lg bg-black/[0.04] px-3 py-2 text-xs font-bold text-ink/55"
                }
                onClick={() => setActiveStep(step.id)}
                type="button"
              >
                {step.label}
              </button>
            );
          })}
        </div>
      </section>

      {message && (
        <div className="rounded-lg border border-sky/20 bg-sky/10 px-4 py-3 text-sm font-semibold text-sky">
          {message}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          <StepShell id="client" title="Cliente" description="Confirme quem esta em atendimento.">
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
          </StepShell>

          <StepShell id="goal" title="Objetivo" description="Placeholder visual desta sprint.">
            <div className="rounded-lg bg-black/[0.03] p-4">
              <p className="text-sm font-bold text-ink">Objetivo do atendimento</p>
              <p className="mt-1 text-sm text-ink/60">{serviceGoalLabel}. A selecao funcional fica para a próxima sprint.</p>
            </div>
          </StepShell>

          <StepShell id="context" title="Contexto" description="Registre as anotações do atendimento e o perfil do cliente.">
            <div className="grid gap-4 md:grid-cols-2">
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
              <label className="grid gap-2 text-sm font-semibold text-ink md:col-span-2">
                Resumo da conversa
                <textarea
                  className="min-h-24 rounded-lg border border-black/10 px-3 py-2 text-sm font-normal"
                  placeholder="Ex.: cliente pediu catálogo, quer orçamento, ficou de responder, precisa de produtos para vitrine ou atendimento..."
                  value={need}
                  onChange={(event) => setNeed(event.target.value)}
                />
              </label>
            </div>
          </StepShell>

          <StepShell id="products" title="Produtos" description="Sugestoes atuais baseadas no perfil e contexto.">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-ink">Produtos sugeridos</h3>
                <p className="text-sm text-ink/55">Baseado no perfil e no resumo da conversa.</p>
              </div>
              <span className="rounded-lg bg-leaf/10 px-3 py-1 text-xs font-bold text-leaf">
                {fallbackProducts.length} sugestões
              </span>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
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
                  Nenhum produto ativo disponível para sugestão.
                </p>
              )}
            </div>
          </StepShell>

          <StepShell id="quote" title="Orçamento" description={activeStep === "quote" ? "Edite os itens do atendimento." : `${quoteItems.length} item(ns) | ${currency(quoteTotal)} | ${quoteStatusLabel}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="inline-flex items-center gap-2 text-base font-bold text-ink">
                  <FileText className="h-4 w-4" />
                  Orçamento do atendimento
                </h3>
                <p className="text-sm text-ink/55">
                  {editableQuote ? `Atualizando orçamento ${editableQuote.id}` : "Novo rascunho para o cliente"}
                </p>
              </div>
              <strong className="text-lg text-ink">{currency(quoteTotal)}</strong>
            </div>
            <div className="grid gap-2">
              {quoteItems.map((item, index) => {
                const product = getProduct(item.productId);
                return (
                  <div key={`${item.productId}-${index}`} className="grid gap-2 rounded-lg border border-black/10 p-3 md:grid-cols-[1fr_92px_120px_auto] md:items-end">
                    <div>
                      <p className="text-sm font-bold text-ink">{product?.name ?? "Produto indisponível"}</p>
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
                  Adicione produtos sugeridos para gerar o orçamento.
                </p>
              )}
            </div>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-leaf px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              onClick={handleSaveQuote}
              type="button"
            >
              <Check className="h-4 w-4" />
              {editableQuote ? "Atualizar orçamento" : "Gerar orçamento"}
            </button>
          </StepShell>

          <StepShell id="conversation" title="Conversa" description="Registre resposta e categoria do cliente.">
            <div className="grid gap-3 md:grid-cols-[190px_1fr]">
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
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-sky px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              onClick={handleRegisterActivity}
              type="button"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Registrar conversa
            </button>
          </StepShell>

          <StepShell id="followUp" title="Follow-up" description="Defina o proximo contato.">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold text-ink">
                Titulo
                <input
                  className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal"
                  value={followUpTitle}
                  onChange={(event) => setFollowUpTitle(event.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-ink">
                Data futura
                <input
                  className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal"
                  type="datetime-local"
                  value={followUpDueAt}
                  onChange={(event) => setFollowUpDueAt(event.target.value)}
                />
              </label>
            </div>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-leaf px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              onClick={handleCreateFollowUp}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Criar follow-up
            </button>
          </StepShell>

          <StepShell id="finish" title="Finalização" description="Salva conversa, follow-up e orçamento com as ações atuais.">
            <div className="rounded-lg bg-black/[0.03] p-4">
              <p className="text-sm font-bold text-ink">Resumo do atendimento</p>
              <div className="mt-3 grid gap-2 text-sm text-ink/65 md:grid-cols-2">
                <span>Cliente: {selectedClient?.name ?? "pendente"}</span>
                <span>Objetivo: {serviceGoalLabel}</span>
                <span>Resumo: {need.trim() ? "registrado" : "pendente"}</span>
                <span>Produtos: {quoteItems.length} item(ns)</span>
                <span>Orçamento: {currency(quoteTotal)}</span>
                <span>Follow-up: {followUpDueAt ? shortDateTime(followUpDueAt) : "pendente"}</span>
              </div>
            </div>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              <Send className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar atendimento completo"}
            </button>
          </StepShell>
        </div>

        <aside className="grid gap-4 self-start xl:sticky xl:top-32">
          <section className="rounded-lg border border-black/10 bg-white">
            <button
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              onClick={() => setAreMessagesOpen((current) => !current)}
              type="button"
            >
              <div>
                <h3 className="text-base font-bold text-ink">Mensagens prontas</h3>
                <p className="text-sm text-ink/55">Roteiro de atendimento: copie a mensagem, registre a resposta e avance.</p>
              </div>
              <span className="rounded-md bg-black/[0.04] px-2 py-1 text-xs font-bold text-ink/60">{areMessagesOpen ? "Fechar" : "Abrir"}</span>
            </button>
            <div className={areMessagesOpen ? "grid gap-2 border-t border-black/10 p-4" : "hidden border-t border-black/10 p-4 xl:grid xl:gap-2"}>
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
          </section>

          <section className="rounded-lg border border-black/10 bg-white">
            <button
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              onClick={() => setIsHistoryOpen((current) => !current)}
              type="button"
            >
              <div>
                <h3 className="text-base font-bold text-ink">Historico do cliente</h3>
                <p className="text-sm text-ink/55">{historyItemsCount} registro(s) acessiveis.</p>
              </div>
              <span className="rounded-md bg-black/[0.04] px-2 py-1 text-xs font-bold text-ink/60">{isHistoryOpen ? "Fechar" : "Abrir"}</span>
            </button>
            <div className={isHistoryOpen ? "grid gap-3 border-t border-black/10 p-4" : "hidden border-t border-black/10 p-4 xl:grid xl:gap-3"}>
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
                  <p className="font-bold text-ink">Orçamento {quote.status} | {shortDateTime(quote.createdAt)}</p>
                  <p className="text-ink/65">
                    {quote.items.length} item(ns) | {currency(quote.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))}
                  </p>
                </article>
              ))}
              {historyItemsCount === 0 && (
                <p className="rounded-lg bg-black/[0.03] px-3 py-4 text-sm font-medium text-ink/55">
                  Nenhum registro para este cliente ainda.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white p-3 shadow-soft lg:hidden">
        <button
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
          onClick={handlePrimaryAction}
          type="button"
        >
          <Send className="h-4 w-4" />
          {isSaving ? "Salvando..." : primaryButtonLabel}
        </button>
      </div>
    </form>
  );
}