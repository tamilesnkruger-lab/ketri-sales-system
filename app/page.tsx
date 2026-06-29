"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { AdminView } from "@/components/admin-view";
import { AppHeader } from "@/components/app-header";
import { ClientsView } from "@/components/clients-view";
import { SidebarNav, type TabId } from "@/components/navigation";
import { ProductsView } from "@/components/products-view";
import { QuotesView } from "@/components/quotes-view";
import { statusLabels } from "@/components/status";
import { TodayView } from "@/components/today-view";
import { WorkspaceHeader } from "@/components/workspace-header";
import {
  getActivities,
  getCurrentUser,
  getCustomers,
  getQuotes
} from "@/lib/data";
import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/lib/types";

const { users } = getCurrentUser();
const clients = getCustomers();
const activities = getActivities();
const quotes = getQuotes();

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("hoje");
  const [role, setRole] = useState<UserRole>("admin");
  const [sellerId, setSellerId] = useState("vend-lia");
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("admin@ketricriativa.com");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("Modo demonstracao ativo");

  const visibleClients = useMemo(() => {
    const scoped =
      role === "admin" ? clients : clients.filter((client) => client.sellerId === sellerId);

    return scoped.filter((client) =>
      [client.name, client.contactName, client.city, statusLabels[client.status]]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query, role, sellerId]);

  const visibleActivities = activities.filter((activity) =>
    role === "admin" ? true : activity.sellerId === sellerId
  );

  const visibleQuotes = quotes.filter((quote) =>
    role === "admin" ? true : quote.sellerId === sellerId
  );

  const currentSeller = users.find((user) => user.id === sellerId);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setAuthMessage("Configure o Supabase em .env.local para ativar o login real.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthMessage(error ? error.message : "Login realizado com sucesso.");
  }

  return (
    <main className="min-h-screen bg-paper">
      <AppHeader
        authMessage={authMessage}
        email={email}
        password={password}
        role={role}
        sellerId={sellerId}
        users={users}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onRoleChange={setRole}
        onSellerChange={setSellerId}
        onLogin={handleLogin}
      />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />

        <section className="min-w-0">
          <WorkspaceHeader
            activeTab={activeTab}
            currentSellerName={currentSeller?.name}
            query={query}
            role={role}
            onQueryChange={setQuery}
          />

          {activeTab === "hoje" && (
            <TodayView
              activities={visibleActivities}
              clientsCount={visibleClients.length}
              quotesCount={visibleQuotes.length}
            />
          )}
          {activeTab === "clientes" && <ClientsView clients={visibleClients} />}
          {activeTab === "produtos" && <ProductsView />}
          {activeTab === "orcamentos" && <QuotesView quotes={visibleQuotes} />}
          {activeTab === "administracao" && <AdminView role={role} />}
        </section>
      </div>
    </main>
  );
}
