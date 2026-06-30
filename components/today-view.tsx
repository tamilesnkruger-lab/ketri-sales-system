"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { BadgePlus, CalendarCheck, Check, ClipboardList, Pencil, Trash2, UsersRound, X } from "lucide-react";
import { shortDateTime } from "@/lib/format";
import type {
  Activity,
  ActivityFormData,
  ActivityType,
  Client,
  FollowUp,
  FollowUpFormData,
  UserRole
} from "@/lib/types";
import { Metric } from "@/components/metric";

type TodayViewProps = {
  activities: Activity[];
  clients: Client[];
  clientsCount: number;
  currentSellerId: string;
  followUps: FollowUp[];
  isRealSession: boolean;
  quotesCount: number;
  role: UserRole;
  onCompleteActivity: (activity: Activity) => Promise<void>;
  onCompleteFollowUp: (followUp: FollowUp) => Promise<void>;
  onCreateActivity: (activity: ActivityFormData) => Promise<void>;
  onCreateFollowUp: (followUp: FollowUpFormData) => Promise<void>;
  onDeleteActivity: (activity: Activity) => Promise<void>;
  onDeleteFollowUp: (followUp: FollowUp) => Promise<void>;
  onUpdateActivity: (id: string, activity: ActivityFormData) => Promise<void>;
};

const activityTypes: ActivityType[] = ["ligacao", "whatsapp", "email", "reuniao", "pos-venda"];

function toInputDateTime(value: string) {
  if (!value) {
    return "";
  }

  return value.slice(0, 16);
}

function initialActivity(client?: Client, currentSellerId = ""): ActivityFormData {
  return {
    clientId: client?.id ?? "",
    sellerId: client?.sellerId ?? currentSellerId,
    type: "whatsapp",
    note: "",
    dueAt: ""
  };
}

function initialFollowUp(client?: Client, currentSellerId = ""): FollowUpFormData {
  return {
    clientId: client?.id ?? "",
    sellerId: client?.sellerId ?? currentSellerId,
    activityId: null,
    title: "",
    dueAt: ""
  };
}

export function TodayView({
  activities,
  clients,
  clientsCount,
  currentSellerId,
  followUps,
  isRealSession,
  quotesCount,
  role,
  onCompleteActivity,
  onCompleteFollowUp,
  onCreateActivity,
  onCreateFollowUp,
  onDeleteActivity,
  onDeleteFollowUp,
  onUpdateActivity
}: TodayViewProps) {
  const manageableClients = useMemo(
    () => (role === "admin" ? clients : clients.filter((client) => client.sellerId === currentSellerId)),
    [clients, currentSellerId, role]
  );
  const firstClient = manageableClients[0];
  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [followUpFormOpen, setFollowUpFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityForm, setActivityForm] = useState<ActivityFormData>(() => initialActivity(firstClient, currentSellerId));
  const [followUpForm, setFollowUpForm] = useState<FollowUpFormData>(() => initialFollowUp(firstClient, currentSellerId));
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function getClient(clientId: string) {
    return clients.find((client) => client.id === clientId);
  }

  function openNewActivity() {
    setEditingActivity(null);
    setActivityForm(initialActivity(firstClient, currentSellerId));
    setFormError("");
    setActivityFormOpen(true);
    setFollowUpFormOpen(false);
  }

  function openEditActivity(activity: Activity) {
    setEditingActivity(activity);
    setActivityForm({
      clientId: activity.clientId,
      sellerId: activity.sellerId,
      type: activity.type,
      note: activity.note,
      dueAt: toInputDateTime(activity.dueAt)
    });
    setFormError("");
    setActivityFormOpen(true);
    setFollowUpFormOpen(false);
  }

  function openNewFollowUp() {
    setFollowUpForm(initialFollowUp(firstClient, currentSellerId));
    setFormError("");
    setFollowUpFormOpen(true);
    setActivityFormOpen(false);
  }

  function resolveSellerId(clientId: string) {
    const client = getClient(clientId);
    return role === "admin" ? client?.sellerId ?? currentSellerId : currentSellerId;
  }

  async function submitActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!activityForm.clientId || !activityForm.note.trim() || !activityForm.dueAt) {
      setFormError("Informe cliente, anotacao e prazo.");
      return;
    }

    const payload = {
      ...activityForm,
      sellerId: resolveSellerId(activityForm.clientId)
    };

    setIsSaving(true);
    try {
      if (editingActivity) {
        await onUpdateActivity(editingActivity.id, payload);
      } else {
        await onCreateActivity(payload);
      }
      setActivityFormOpen(false);
      setEditingActivity(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Nao foi possivel salvar a atividade.");
    } finally {
      setIsSaving(false);
    }
  }

  async function submitFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!followUpForm.clientId || !followUpForm.title.trim() || !followUpForm.dueAt) {
      setFormError("Informe cliente, titulo e prazo.");
      return;
    }

    const payload = {
      ...followUpForm,
      sellerId: resolveSellerId(followUpForm.clientId)
    };

    setIsSaving(true);
    try {
      await onCreateFollowUp(payload);
      setFollowUpFormOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Nao foi possivel salvar o follow-up.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={UsersRound} label="Clientes na carteira" value={clientsCount.toString()} />
        <Metric icon={CalendarCheck} label="Follow-ups abertos" value={followUps.length.toString()} />
        <Metric icon={ClipboardList} label="Orcamentos ativos" value={quotesCount.toString()} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink/60">
          {isRealSession ? "Atividades reais do Supabase" : "Modo demonstracao: alteracoes nao sao salvas"}
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-leaf px-3 text-sm font-semibold text-white" onClick={openNewActivity} type="button">
            <BadgePlus aria-hidden className="h-4 w-4" />
            Nova atividade
          </button>
          <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-semibold text-ink" onClick={openNewFollowUp} type="button">
            <BadgePlus aria-hidden className="h-4 w-4" />
            Novo follow-up
          </button>
        </div>
      </div>

      {activityFormOpen && (
        <form className="rounded-lg border border-black/10 bg-white p-4 shadow-sm" onSubmit={submitActivity}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-ink">{editingActivity ? "Editar atividade" : "Nova atividade"}</h3>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10" onClick={() => setActivityFormOpen(false)} type="button" aria-label="Fechar">
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Cliente
              <select className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={activityForm.clientId} onChange={(event) => setActivityForm((current) => ({ ...current, clientId: event.target.value, sellerId: resolveSellerId(event.target.value) }))}>
                {manageableClients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Tipo
              <select className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={activityForm.type} onChange={(event) => setActivityForm((current) => ({ ...current, type: event.target.value as ActivityType }))}>
                {activityTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Prazo
              <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" type="datetime-local" value={activityForm.dueAt} onChange={(event) => setActivityForm((current) => ({ ...current, dueAt: event.target.value }))} />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink md:col-span-2">
              Anotacao
              <textarea className="min-h-20 rounded-lg border border-black/10 px-3 py-2 text-sm font-normal" value={activityForm.note} onChange={(event) => setActivityForm((current) => ({ ...current, note: event.target.value }))} />
            </label>
          </div>
          {formError && <p className="mt-3 text-sm font-semibold text-coral">{formError}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <button className="h-9 rounded-lg border border-black/10 px-3 text-sm font-semibold" type="button" onClick={() => setActivityFormOpen(false)}>Cancelar</button>
            <button className="h-9 rounded-lg bg-leaf px-3 text-sm font-semibold text-white disabled:opacity-60" disabled={isSaving} type="submit">{isSaving ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      )}

      {followUpFormOpen && (
        <form className="rounded-lg border border-black/10 bg-white p-4 shadow-sm" onSubmit={submitFollowUp}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-ink">Novo follow-up</h3>
            <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10" onClick={() => setFollowUpFormOpen(false)} type="button" aria-label="Fechar">
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Cliente
              <select className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={followUpForm.clientId} onChange={(event) => setFollowUpForm((current) => ({ ...current, clientId: event.target.value, sellerId: resolveSellerId(event.target.value) }))}>
                {manageableClients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Prazo
              <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" type="datetime-local" value={followUpForm.dueAt} onChange={(event) => setFollowUpForm((current) => ({ ...current, dueAt: event.target.value }))} />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink md:col-span-2">
              Titulo
              <input className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal" value={followUpForm.title} onChange={(event) => setFollowUpForm((current) => ({ ...current, title: event.target.value }))} />
            </label>
          </div>
          {formError && <p className="mt-3 text-sm font-semibold text-coral">{formError}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <button className="h-9 rounded-lg border border-black/10 px-3 text-sm font-semibold" type="button" onClick={() => setFollowUpFormOpen(false)}>Cancelar</button>
            <button className="h-9 rounded-lg bg-leaf px-3 text-sm font-semibold text-white disabled:opacity-60" disabled={isSaving} type="submit">{isSaving ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-black/10 bg-white">
        <div className="border-b border-black/10 px-4 py-3">
          <h3 className="font-bold text-ink">O que precisa ser feito</h3>
        </div>
        <div className="divide-y divide-black/10">
          {activities.map((activity) => {
            const client = getClient(activity.clientId);
            return (
              <article key={activity.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase text-sky">{activity.type}</p>
                  <h4 className="font-bold text-ink">{client?.name}</h4>
                  <p className="mt-1 text-sm text-ink/65">{activity.note}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-maize/25 px-3 py-2 text-sm font-semibold text-ink">{shortDateTime(activity.dueAt)}</span>
                  <button className="inline-flex h-9 items-center gap-1 rounded-lg border border-black/10 px-2 text-sm font-semibold" onClick={() => openEditActivity(activity)} type="button"><Pencil className="h-4 w-4" />Editar</button>
                  <button className="inline-flex h-9 items-center gap-1 rounded-lg border border-leaf/25 px-2 text-sm font-semibold text-leaf" onClick={() => onCompleteActivity(activity)} type="button"><Check className="h-4 w-4" />Concluir</button>
                  <button className="inline-flex h-9 items-center gap-1 rounded-lg border border-coral/25 px-2 text-sm font-semibold text-coral" onClick={() => onDeleteActivity(activity)} type="button"><Trash2 className="h-4 w-4" />Excluir</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-black/10 bg-white">
        <div className="border-b border-black/10 px-4 py-3">
          <h3 className="font-bold text-ink">Follow-ups</h3>
        </div>
        <div className="divide-y divide-black/10">
          {followUps.map((followUp) => {
            const client = getClient(followUp.clientId);
            return (
              <article key={followUp.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <h4 className="font-bold text-ink">{followUp.title}</h4>
                  <p className="text-sm text-ink/65">{client?.name}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-maize/25 px-3 py-2 text-sm font-semibold text-ink">{shortDateTime(followUp.dueAt)}</span>
                  <button className="inline-flex h-9 items-center gap-1 rounded-lg border border-leaf/25 px-2 text-sm font-semibold text-leaf" onClick={() => onCompleteFollowUp(followUp)} type="button"><Check className="h-4 w-4" />Concluir</button>
                  <button className="inline-flex h-9 items-center gap-1 rounded-lg border border-coral/25 px-2 text-sm font-semibold text-coral" onClick={() => onDeleteFollowUp(followUp)} type="button"><Trash2 className="h-4 w-4" />Excluir</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}