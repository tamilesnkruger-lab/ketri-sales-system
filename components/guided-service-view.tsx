"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CalendarPlus, Check, Clipboard, MessageSquarePlus, Plus, Send } from "lucide-react";
import { shortDateTime } from "@/lib/format";
import type {
  Activity,
  ActivityFormData,
  Client,
  FollowUpFormData,
  Product,
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

type GuidedServiceViewProps = {
  activities: Activity[];
  clients: Client[];
  currentSellerId: string;
  isRealSession: boolean;
  products: Product[];
  role: UserRole;
  onCreateActivity: (activity: ActivityFormData) => Promise<void>;
  onCreateFollowUp: (followUp: FollowUpFormData) => Promise<void>;
};

type SessionRecord = {
  id: string;
  clientId: string;
  category: ResponseCategory;
  response: string;
  createdAt: string;
};

const checklist = [
  "Apresentacao",
  "Entender perfil do cliente",
  "Apresentar linha Pets e tal",
  "Sugerir produtos/kits",
  "Registrar objecao",
  "Definir proximo passo"
];

const categories: ResponseCategory[] = [
  "interessado",
  "pediu catalogo",
  "pediu valores",
  "sem resposta",
  "objecao",
  "retorno agendado",
  "venda encaminhada"
];

const messageTemplates = [
  {
    title: "Abertura",
    text: "Oi! Tudo bem? Sou da Ketri Criativa e queria te apresentar a linha Pets e tal, com produtos pensados para lojas pet e clientes que amam personalizacao."
  },
  {
    title: "Catalogo",
    text: "Posso te enviar nosso catalogo da linha Pets e tal? Temos bandanas, tags e kits que funcionam muito bem para loja, evento e presente personalizado."
  },
  {
    title: "Valores",
    text: "Me conta a quantidade aproximada que voce imagina para eu te passar valores mais certos e sugerir o kit com melhor custo-beneficio."
  },
  {
    title: "Retorno",
    text: "Combinado. Vou deixar seu retorno agendado e te chamo no melhor horario para continuarmos com a proposta."
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

export function GuidedServiceView({
  activities,
  clients,
  currentSellerId,
  isRealSession,
  products,
  role,
  onCreateActivity,
  onCreateFollowUp
}: GuidedServiceViewProps) {
  const manageableClients = useMemo(
    () => (role === "admin" ? clients : clients.filter((client) => client.sellerId === currentSellerId)),
    [clients, currentSellerId, role]
  );
  const activeProducts = useMemo(() => products.filter((product) => product.active !== false), [products]);
  const [selectedClientId, setSelectedClientId] = useState(manageableClients[0]?.id ?? "");
  const [checkedSteps, setCheckedSteps] = useState<string[]>([]);
  const [response, setResponse] = useState("");
  const [category, setCategory] = useState<ResponseCategory>("interessado");
  const [activityNote, setActivityNote] = useState("");
  const [activityDueAt, setActivityDueAt] = useState(nowInputDateTime());
  const [followUpTitle, setFollowUpTitle] = useState("Retomar atendimento Pets e tal");
  const [followUpDueAt, setFollowUpDueAt] = useState(tomorrowInputDateTime());
  const [localHistory, setLocalHistory] = useState<SessionRecord[]>([]);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedClient = manageableClients.find((client) => client.id === selectedClientId) ?? manageableClients[0];
  const selectedClientActivities = activities.filter((activity) => activity.clientId === selectedClient?.id);

  function resolveSellerId() {
    return role === "admin" ? selectedClient?.sellerId ?? currentSellerId : currentSellerId;
  }

  function toggleStep(step: string) {
    setCheckedSteps((current) =>
      current.includes(step) ? current.filter((item) => item !== step) : [...current, step]
    );
  }

  async function copyMessage(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Mensagem copiada.");
    } catch {
      setMessage("Nao foi possivel copiar automaticamente.");
    }
  }

  function ensureClientSelected() {
    if (!selectedClient) {
      throw new Error("Selecione um cliente.");
    }

    if (role !== "admin" && selectedClient.sellerId !== currentSellerId) {
      throw new Error("Vendedor nao pode registrar atendimento em cliente de outro vendedor.");
    }
  }

  async function submitResponse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      ensureClientSelected();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cliente invalido.");
      return;
    }

    if (!response.trim()) {
      setMessage("Registre a resposta do cliente.");
      return;
    }

    const record: SessionRecord = {
      id: `${Date.now()}`,
      clientId: selectedClient.id,
      category,
      response: response.trim(),
      createdAt: new Date().toISOString()
    };

    setIsSaving(true);

    try {
      await onCreateActivity({
        clientId: selectedClient.id,
        sellerId: resolveSellerId(),
        type: "whatsapp",
        note: `[Atendimento guiado] ${category}: ${response.trim()}`,
        dueAt: nowInputDateTime()
      });
      setLocalHistory((current) => [record, ...current]);
      setResponse("");
      setMessage("Resposta registrada como atividade.");
    } catch (error) {
      setLocalHistory((current) => [record, ...current]);
      setMessage(error instanceof Error ? error.message : "Resposta mantida no historico local.");
    } finally {
      setIsSaving(false);
    }
  }

  async function submitActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      ensureClientSelected();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cliente invalido.");
      return;
    }

    if (!activityNote.trim() || !activityDueAt) {
      setMessage("Informe anotacao e prazo da atividade.");
      return;
    }

    setIsSaving(true);

    try {
      await onCreateActivity({
        clientId: selectedClient.id,
        sellerId: resolveSellerId(),
        type: "whatsapp",
        note: `[Atendimento guiado] ${activityNote.trim()}`,
        dueAt: activityDueAt
      });
      setActivityNote("");
      setMessage("Atividade criada a partir do atendimento.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel criar a atividade.");
    } finally {
      setIsSaving(false);
    }
  }

  async function submitFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      ensureClientSelected();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cliente invalido.");
      return;
    }

    if (!followUpTitle.trim() || !followUpDueAt) {
      setMessage("Informe titulo e prazo do follow-up.");
      return;
    }

    setIsSaving(true);

    try {
      await onCreateFollowUp({
        clientId: selectedClient.id,
        sellerId: resolveSellerId(),
        activityId: null,
        title: followUpTitle.trim(),
        dueAt: followUpDueAt
      });
      setMessage("Follow-up criado a partir do atendimento.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel criar o follow-up.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-black/10 bg-white p-4">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
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
              <p className="mt-2 text-sm font-semibold text-sky">Status: {selectedClient.status} | Potencial: {selectedClient.potential}</p>
            )}
          </div>
        </div>
        <p className="mt-3 text-sm font-medium text-ink/60">
          {isRealSession ? "Atendimento real: registros usam atividades e follow-ups." : "Modo demonstracao: fluxo visual; gravacoes reais ficam bloqueadas."}
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-sky/20 bg-sky/10 px-4 py-3 text-sm font-semibold text-sky">
          {message}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-black/10 bg-white p-4">
          <h3 className="text-base font-bold text-ink">Checklist da conversa</h3>
          <div className="mt-3 grid gap-2">
            {checklist.map((step) => (
              <label key={step} className="flex items-center gap-3 rounded-lg border border-black/10 px-3 py-2 text-sm font-semibold text-ink">
                <input
                  className="h-4 w-4 accent-leaf"
                  checked={checkedSteps.includes(step)}
                  type="checkbox"
                  onChange={() => toggleStep(step)}
                />
                {step}
              </label>
            ))}
          </div>

          <div className="mt-5">
            <h3 className="text-base font-bold text-ink">Mensagens prontas</h3>
            <div className="mt-3 grid gap-2">
              {messageTemplates.map((template) => (
                <button
                  key={template.title}
                  className="grid gap-1 rounded-lg border border-black/10 px-3 py-2 text-left text-sm hover:border-sky/40"
                  onClick={() => copyMessage(template.text)}
                  type="button"
                >
                  <span className="inline-flex items-center gap-2 font-bold text-ink"><Clipboard className="h-4 w-4" />{template.title}</span>
                  <span className="text-ink/60">{template.text}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5">
          <form className="rounded-lg border border-black/10 bg-white p-4" onSubmit={submitResponse}>
            <h3 className="text-base font-bold text-ink">Resposta do cliente</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr]">
              <label className="grid gap-1 text-sm font-semibold text-ink">
                Categoria
                <select className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={category} onChange={(event) => setCategory(event.target.value as ResponseCategory)}>
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold text-ink">
                Registro
                <textarea className="min-h-24 rounded-lg border border-black/10 px-3 py-2 text-sm font-normal" value={response} onChange={(event) => setResponse(event.target.value)} />
              </label>
            </div>
            <button className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white disabled:opacity-60" disabled={isSaving} type="submit">
              <Send className="h-4 w-4" />
              Registrar resposta
            </button>
          </form>

          <div className="grid gap-5 lg:grid-cols-2">
            <form className="rounded-lg border border-black/10 bg-white p-4" onSubmit={submitFollowUp}>
              <h3 className="inline-flex items-center gap-2 text-base font-bold text-ink"><CalendarPlus className="h-4 w-4" />Criar follow-up</h3>
              <label className="mt-3 grid gap-1 text-sm font-semibold text-ink">
                Titulo
                <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={followUpTitle} onChange={(event) => setFollowUpTitle(event.target.value)} />
              </label>
              <label className="mt-3 grid gap-1 text-sm font-semibold text-ink">
                Prazo
                <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" type="datetime-local" value={followUpDueAt} onChange={(event) => setFollowUpDueAt(event.target.value)} />
              </label>
              <button className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-leaf px-4 text-sm font-semibold text-white disabled:opacity-60" disabled={isSaving} type="submit">
                <Plus className="h-4 w-4" />
                Criar follow-up
              </button>
            </form>

            <form className="rounded-lg border border-black/10 bg-white p-4" onSubmit={submitActivity}>
              <h3 className="inline-flex items-center gap-2 text-base font-bold text-ink"><MessageSquarePlus className="h-4 w-4" />Criar atividade</h3>
              <label className="mt-3 grid gap-1 text-sm font-semibold text-ink">
                Anotacao
                <textarea className="min-h-20 rounded-lg border border-black/10 px-3 py-2 text-sm font-normal" value={activityNote} onChange={(event) => setActivityNote(event.target.value)} />
              </label>
              <label className="mt-3 grid gap-1 text-sm font-semibold text-ink">
                Prazo
                <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" type="datetime-local" value={activityDueAt} onChange={(event) => setActivityDueAt(event.target.value)} />
              </label>
              <button className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-sky px-4 text-sm font-semibold text-white disabled:opacity-60" disabled={isSaving} type="submit">
                <Check className="h-4 w-4" />
                Criar atividade
              </button>
            </form>
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-black/10 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-bold text-ink">Historico do atendimento</h3>
          <p className="text-sm text-ink/55">Produtos sugeridos: {activeProducts.slice(0, 3).map((product) => product.name).join(", ") || "sem produtos ativos"}</p>
        </div>
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
          {localHistory.filter((record) => record.clientId === selectedClient?.id).length === 0 && selectedClientActivities.length === 0 && (
            <p className="rounded-lg bg-black/[0.03] px-3 py-4 text-sm font-medium text-ink/55">Nenhum registro para este cliente ainda.</p>
          )}
        </div>
      </section>
    </div>
  );
}