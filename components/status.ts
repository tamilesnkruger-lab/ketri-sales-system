import type { ClientStatus } from "@/lib/types";

export const statusLabels: Record<ClientStatus, string> = {
  lead: "Lead",
  atendimento: "Atendimento",
  orcamento: "Orcamento",
  "follow-up": "Follow-up",
  venda: "Venda",
  "pos-venda": "Pos-venda"
};

export const journey: ClientStatus[] = [
  "lead",
  "atendimento",
  "orcamento",
  "follow-up",
  "venda",
  "pos-venda"
];
