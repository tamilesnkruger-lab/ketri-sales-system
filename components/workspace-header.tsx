"use client";

import { Search } from "lucide-react";
import type { TabId } from "@/components/navigation";
import { tabs } from "@/components/navigation";
import type { UserRole } from "@/lib/types";

type WorkspaceHeaderProps = {
  activeTab: TabId;
  currentSellerName?: string;
  query: string;
  role: UserRole;
  onQueryChange: (query: string) => void;
};

function placeholderForTab(tab: TabId) {
  if (tab === "produtos") {
    return "Buscar produto, código ou categoria";
  }

  if (tab === "orcamentos") {
    return "Buscar orçamento, cliente ou status";
  }

  if (tab === "atendimento") {
    return "Buscar cliente para atendimento";
  }

  return "Buscar cliente, cidade ou status";
}
export function WorkspaceHeader({
  activeTab,
  currentSellerName,
  query,
  role,
  onQueryChange
}: WorkspaceHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-ink/55">
          {role === "admin" ? "Visao completa da operacao" : `Carteira de ${currentSellerName}`}
        </p>
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">
          {tabs.find((tab) => tab.id === activeTab)?.label}
        </h2>
      </div>
      <div className="relative w-full sm:max-w-xs">
        <Search aria-hidden className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
        <input
          className="h-11 w-full rounded-lg border border-black/10 bg-white pl-10 pr-3 text-sm"
          placeholder={placeholderForTab(activeTab)}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
    </div>
  );
}
