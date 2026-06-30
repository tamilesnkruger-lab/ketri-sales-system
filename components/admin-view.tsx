"use client";

import { Activity, UserRound } from "lucide-react";
import type { User, UserRole } from "@/lib/types";

type AdminViewProps = {
  role: UserRole;
  users: User[];
};

export function AdminView({ role, users }: AdminViewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-lg border border-black/10 bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <UserRound aria-hidden className="h-5 w-5 text-coral" />
          <h3 className="font-bold">Usuarios e permissoes</h3>
        </div>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-lg bg-paper px-3 py-3">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-ink/60">{user.email}</p>
              </div>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-bold">{user.role}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-black/10 bg-white p-4">
        <div className="mb-4 flex items-center gap-2">
          <Activity aria-hidden className="h-5 w-5 text-leaf" />
          <h3 className="font-bold">Configuracoes da V1</h3>
        </div>
        <div className="space-y-3 text-sm text-ink/70">
          <p>Perfil atual: {role === "admin" ? "Admin ve toda a operacao." : "Vendedor ve carteira propria."}</p>
          <p>Clientes concentram status, historico, follow-ups e orcamentos.</p>
          <p>Produtos usam base unica para evitar duplicidade no catalogo.</p>
        </div>
      </section>
    </div>
  );
}