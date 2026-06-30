"use client";

import {
  Boxes,
  ClipboardList,
  Headphones,
  LayoutDashboard,
  Settings,
  UsersRound
} from "lucide-react";
import clsx from "clsx";

export const tabs = [
  { id: "hoje", label: "Hoje", icon: LayoutDashboard },
  { id: "atendimento", label: "Atendimento", icon: Headphones },
  { id: "clientes", label: "Clientes", icon: UsersRound },
  { id: "produtos", label: "Produtos", icon: Boxes },
  { id: "orcamentos", label: "Orcamentos", icon: ClipboardList },
  { id: "administracao", label: "Administracao", icon: Settings }
] as const;

export type TabId = (typeof tabs)[number]["id"];

type SidebarNavProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

export function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  return (
    <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:block lg:space-y-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            className={clsx(
              "flex h-12 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition lg:w-full lg:justify-start",
              activeTab === tab.id
                ? "border-ink bg-ink text-white shadow-soft"
                : "border-black/10 bg-white text-ink/75 hover:border-ink/30"
            )}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon aria-hidden className="h-4 w-4 shrink-0" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
