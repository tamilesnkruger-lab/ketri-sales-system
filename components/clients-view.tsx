"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { BadgePlus, Pencil, Trash2, X } from "lucide-react";
import clsx from "clsx";
import type { Client, ClientFormData, ClientStatus, User, UserRole } from "@/lib/types";
import { journey, statusLabels } from "@/components/status";

type ClientsViewProps = {
  clients: Client[];
  currentSellerId: string;
  isRealSession: boolean;
  role: UserRole;
  users: User[];
  onCreateClient: (client: ClientFormData) => Promise<void>;
  onDeleteClient: (client: Client) => Promise<void>;
  onUpdateClient: (id: string, client: ClientFormData) => Promise<void>;
};

const potentialOptions: Array<ClientFormData["potential"]> = ["baixo", "medio", "alto"];

function getInitialClientForm(sellerId: string): ClientFormData {
  return {
    name: "",
    contactName: "",
    phone: "",
    city: "",
    status: "lead",
    sellerId,
    lastActivity: "",
    potential: "medio"
  };
}

function getClientFormFromClient(client: Client): ClientFormData {
  return {
    name: client.name,
    contactName: client.contactName,
    phone: client.phone,
    city: client.city,
    status: client.status,
    sellerId: client.sellerId,
    lastActivity: client.lastActivity,
    potential: client.potential
  };
}

export function ClientsView({
  clients: visibleClients,
  currentSellerId,
  isRealSession,
  role,
  users,
  onCreateClient,
  onDeleteClient,
  onUpdateClient
}: ClientsViewProps) {
  const sellerOptions = useMemo(() => users.filter((user) => user.role === "vendedor"), [users]);
  const defaultSellerId =
    role === "admin" ? sellerOptions[0]?.id ?? currentSellerId : currentSellerId;
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>(() => getInitialClientForm(defaultSellerId));
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isFormOpen || editingClient) {
      return;
    }

    setFormData((current) => ({
      ...current,
      sellerId: role === "admin" ? current.sellerId || defaultSellerId : currentSellerId
    }));
  }, [currentSellerId, defaultSellerId, editingClient, isFormOpen, role]);

  function openCreateForm() {
    setEditingClient(null);
    setFormData(getInitialClientForm(defaultSellerId));
    setFormError("");
    setIsFormOpen(true);
  }

  function openEditForm(client: Client) {
    setEditingClient(client);
    setFormData(getClientFormFromClient(client));
    setFormError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingClient(null);
    setFormError("");
    setIsFormOpen(false);
  }

  function updateForm<Key extends keyof ClientFormData>(key: Key, value: ClientFormData[Key]) {
    setFormData((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.contactName.trim()) {
      setFormError("Informe nome do cliente e contato.");
      return;
    }

    const normalizedData: ClientFormData = {
      ...formData,
      sellerId: role === "admin" ? formData.sellerId : currentSellerId
    };

    setIsSaving(true);

    try {
      if (editingClient) {
        await onUpdateClient(editingClient.id, normalizedData);
      } else {
        await onCreateClient(normalizedData);
      }

      closeForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Nao foi possivel salvar o cliente.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink/60">
          {isRealSession ? "Clientes reais do Supabase" : "Modo demonstracao: alteracoes nao sao salvas"}
        </p>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-leaf px-3 text-sm font-semibold text-white"
          onClick={openCreateForm}
          type="button"
        >
          <BadgePlus aria-hidden className="h-4 w-4" />
          Novo cliente
        </button>
      </div>

      {isFormOpen && (
        <form className="rounded-lg border border-black/10 bg-white p-4 shadow-sm" onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-bold text-ink">{editingClient ? "Editar cliente" : "Novo cliente"}</h3>
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-ink"
              onClick={closeForm}
              type="button"
              aria-label="Fechar formulario"
            >
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Cliente
              <input
                className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal"
                value={formData.name}
                onChange={(event) => updateForm("name", event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Contato
              <input
                className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal"
                value={formData.contactName}
                onChange={(event) => updateForm("contactName", event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Telefone
              <input
                className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal"
                value={formData.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Cidade
              <input
                className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal"
                value={formData.city}
                onChange={(event) => updateForm("city", event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Status
              <select
                className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal"
                value={formData.status}
                onChange={(event) => updateForm("status", event.target.value as ClientStatus)}
              >
                {journey.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Potencial
              <select
                className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal"
                value={formData.potential}
                onChange={(event) => updateForm("potential", event.target.value as ClientFormData["potential"])}
              >
                {potentialOptions.map((potential) => (
                  <option key={potential} value={potential}>
                    {potential}
                  </option>
                ))}
              </select>
            </label>
            {role === "admin" && (
              <label className="grid gap-1 text-sm font-semibold text-ink">
                Vendedor
                <select
                  className="h-10 rounded-lg border border-black/10 px-3 text-sm font-normal"
                  value={formData.sellerId}
                  onChange={(event) => updateForm("sellerId", event.target.value)}
                >
                  {sellerOptions.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="grid gap-1 text-sm font-semibold text-ink md:col-span-2">
              Ultima atividade
              <textarea
                className="min-h-20 rounded-lg border border-black/10 px-3 py-2 text-sm font-normal"
                value={formData.lastActivity}
                onChange={(event) => updateForm("lastActivity", event.target.value)}
              />
            </label>
          </div>

          {formError && <p className="mt-3 text-sm font-semibold text-coral">{formError}</p>}

          <div className="mt-4 flex justify-end gap-2">
            <button
              className="h-9 rounded-lg border border-black/10 px-3 text-sm font-semibold text-ink"
              onClick={closeForm}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="h-9 rounded-lg bg-leaf px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {visibleClients.map((client) => (
          <article key={client.id} className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-ink">{client.name}</h3>
                <p className="text-sm text-ink/60">{client.contactName}</p>
              </div>
              <span className="rounded-md bg-coral/10 px-2 py-1 text-xs font-bold text-coral">
                {statusLabels[client.status]}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink/70">{client.city}</p>
            <p className="mt-1 text-sm text-ink/70">{client.phone}</p>
            <div className="mt-4 flex items-center gap-1 overflow-hidden">
              {journey.map((step) => (
                <div
                  key={step}
                  className={clsx(
                    "h-2 flex-1 rounded-full",
                    journey.indexOf(step) <= journey.indexOf(client.status) ? "bg-leaf" : "bg-black/10"
                  )}
                  title={statusLabels[step]}
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-ink/65">{client.lastActivity}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-semibold text-ink"
                onClick={() => openEditForm(client)}
                type="button"
              >
                <Pencil aria-hidden className="h-4 w-4" />
                Editar
              </button>
              <button
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-coral/25 px-3 text-sm font-semibold text-coral"
                onClick={() => onDeleteClient(client)}
                type="button"
              >
                <Trash2 aria-hidden className="h-4 w-4" />
                Excluir
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}