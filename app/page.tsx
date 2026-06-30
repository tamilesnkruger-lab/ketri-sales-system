"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminView } from "@/components/admin-view";
import { AppHeader } from "@/components/app-header";
import { ClientsView } from "@/components/clients-view";
import { GuidedServiceView } from "@/components/guided-service-view";
import { SidebarNav, type TabId } from "@/components/navigation";
import { ProductsView } from "@/components/products-view";
import { QuotesView } from "@/components/quotes-view";
import { statusLabels } from "@/components/status";
import { TodayView } from "@/components/today-view";
import { WorkspaceHeader } from "@/components/workspace-header";
import {
  completeActivity,
  completeFollowUp,
  createActivity,
  createClient,
  createFollowUp,
  createProduct,
  createQuote,
  deleteActivity as deleteActivityRecord,
  deleteClient as deleteClientRecord,
  deleteFollowUp as deleteFollowUpRecord,
  deleteProduct as deleteProductRecord,
  deleteQuote as deleteQuoteRecord,
  getActivities,
  getClients,
  getCurrentUser,
  getFollowUps,
  getProducts,
  getQuotes,
  getUsers,
  setProductActive,
  updateActivity,
  updateClient,
  updateProduct,
  updateQuote,
  updateQuoteStatus
} from "@/lib/data";
import { supabase } from "@/lib/supabase";
import type {
  Activity,
  ActivityFormData,
  Client,
  ClientFormData,
  FollowUp,
  FollowUpFormData,
  Product,
  ProductFormData,
  Quote,
  QuoteFormData,
  QuoteStatus,
  User,
  UserRole
} from "@/lib/types";

function describeError(error: unknown) {
  return error instanceof Error ? error.message : "Erro desconhecido.";
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("hoje");
  const [role, setRole] = useState<UserRole>("admin");
  const [sellerId, setSellerId] = useState("vend-lia");
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("admin@ketricriativa.com");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("Modo demonstracao ativo");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRealSession, setIsRealSession] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setDataError("");

    try {
      const currentUserData = await getCurrentUser();
      const isRealMode = currentUserData.mode === "real";

      setCurrentUser(currentUserData.currentUser);
      setIsRealSession(isRealMode && Boolean(currentUserData.currentUser));

      if (isRealMode && !currentUserData.currentUser) {
        setUsers([]);
        setClients([]);
        setProducts([]);
        setActivities([]);
        setFollowUps([]);
        setQuotes([]);
        setDataError(`Nao foi possivel carregar o perfil real: ${currentUserData.profileError}`);
        setAuthMessage("Sessao Supabase ativa, mas o perfil nao foi carregado.");
        return;
      }

      const dataMode = isRealMode ? "real" : "demo";

      try {
        const [loadedUsers, loadedClients, loadedProducts, loadedActivities, loadedFollowUps, loadedQuotes] =
          await Promise.all([
            getUsers({ mode: dataMode }),
            getClients({ mode: dataMode }),
            getProducts({ mode: dataMode, includeInactive: isRealMode && currentUserData.currentUser?.role === "admin" }),
            getActivities({ mode: dataMode }),
            getFollowUps({ mode: dataMode }),
            getQuotes({ mode: dataMode })
          ]);

        const nextUsers =
          isRealMode && currentUserData.currentUser && !loadedUsers.some((user) => user.id === currentUserData.currentUser?.id)
            ? [currentUserData.currentUser, ...loadedUsers]
            : loadedUsers;

        setUsers(nextUsers);
        setClients(loadedClients);
        setProducts(loadedProducts);
        setActivities(loadedActivities);
        setFollowUps(loadedFollowUps);
        setQuotes(loadedQuotes);

        if (isRealMode && currentUserData.currentUser) {
          setRole(currentUserData.currentUser.role);
          setSellerId(currentUserData.currentUser.id);
          setAuthMessage(`Sessao ativa: ${currentUserData.currentUser.name}.`);
        } else {
          setAuthMessage(
            currentUserData.isSupabaseConfigured
              ? "Supabase configurado. Entre para ativar perfil real."
              : "Modo demonstracao ativo"
          );
        }
      } catch (error) {
        console.error("[app] Erro ao carregar dados reais.", error);

        if (isRealMode) {
          setUsers(currentUserData.currentUser ? [currentUserData.currentUser] : []);
          setClients([]);
          setProducts([]);
          setActivities([]);
          setFollowUps([]);
          setQuotes([]);
          setDataError(`Erro ao carregar dados reais do Supabase: ${describeError(error)}`);
          setAuthMessage("Sessao ativa, mas houve erro ao carregar dados reais.");
          return;
        }

        throw error;
      }
    } catch (error) {
      console.error("[app] Erro ao carregar dados.", error);
      setUsers([]);
      setClients([]);
      setProducts([]);
      setActivities([]);
      setFollowUps([]);
      setQuotes([]);
      setDataError(`Nao foi possivel carregar os dados agora: ${describeError(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialData() {
      if (isActive) {
        await loadData();
      }
    }

    loadInitialData();

    return () => {
      isActive = false;
    };
  }, [loadData]);

  const visibleClients = useMemo(() => {
    const scoped =
      role === "admin" ? clients : clients.filter((client) => client.sellerId === sellerId);

    return scoped.filter((client) =>
      [client.name, client.contactName, client.city, statusLabels[client.status]]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [clients, query, role, sellerId]);

  const visibleActivities = activities.filter((activity) =>
    role === "admin" ? true : activity.sellerId === sellerId
  );

  const visibleQuotes = quotes.filter((quote) =>
    role === "admin" ? true : quote.sellerId === sellerId
  );

  const visibleFollowUps = followUps.filter((followUp) =>
    role === "admin" ? true : followUp.sellerId === sellerId
  );

  const currentSeller = users.find((user) => user.id === sellerId);

  function ensureClientCrudAllowed() {
    if (!isRealSession || !currentUser) {
      throw new Error("Modo demonstracao: entre com Supabase para salvar clientes reais.");
    }
  }

  function normalizeClientPayload(payload: ClientFormData): ClientFormData {
    if (!currentUser) {
      return payload;
    }

    return {
      ...payload,
      sellerId: currentUser.role === "admin" ? payload.sellerId : currentUser.id
    };
  }

  async function handleCreateClient(payload: ClientFormData) {
    setDataError("");
    ensureClientCrudAllowed();

    try {
      const createdClient = await createClient(normalizeClientPayload(payload), { mode: "real" });
      setClients((current) => [createdClient, ...current]);
      setAuthMessage("Cliente criado com sucesso.");
    } catch (error) {
      const message = `Erro ao criar cliente: ${describeError(error)}`;
      setDataError(message);
      throw new Error(message);
    }
  }

  async function handleUpdateClient(id: string, payload: ClientFormData) {
    setDataError("");
    ensureClientCrudAllowed();

    try {
      const updatedClient = await updateClient(id, normalizeClientPayload(payload), { mode: "real" });
      setClients((current) =>
        current.map((client) => (client.id === updatedClient.id ? updatedClient : client))
      );
      setAuthMessage("Cliente atualizado com sucesso.");
    } catch (error) {
      const message = `Erro ao atualizar cliente: ${describeError(error)}`;
      setDataError(message);
      throw new Error(message);
    }
  }

  async function handleDeleteClient(client: Client) {
    setDataError("");
    ensureClientCrudAllowed();

    const confirmed = window.confirm(`Excluir cliente ${client.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteClientRecord(client.id, { mode: "real" });
      setClients((current) => current.filter((item) => item.id !== client.id));
      setAuthMessage("Cliente excluido com sucesso.");
    } catch (error) {
      const message = `Erro ao excluir cliente: ${describeError(error)}`;
      setDataError(message);
      throw new Error(message);
    }
  }

  function ensureProductCrudAllowed() {
    if (!isRealSession || !currentUser) {
      throw new Error("Modo demonstracao: entre com Supabase para salvar produtos reais.");
    }

    if (currentUser.role !== "admin") {
      throw new Error("Apenas administradores podem gerenciar produtos.");
    }
  }

  async function handleCreateProduct(payload: ProductFormData) {
    setDataError("");

    try {
      ensureProductCrudAllowed();
      await createProduct(payload, { mode: "real" });
      await loadData();
      setAuthMessage("Produto criado com sucesso.");
    } catch (error) {
      const message = `Erro ao criar produto: ${describeError(error)}`;
      setDataError(message);
      throw new Error(message);
    }
  }

  async function handleUpdateProduct(id: string, payload: ProductFormData) {
    setDataError("");

    try {
      ensureProductCrudAllowed();
      await updateProduct(id, payload, { mode: "real" });
      await loadData();
      setAuthMessage("Produto atualizado com sucesso.");
    } catch (error) {
      const message = `Erro ao atualizar produto: ${describeError(error)}`;
      setDataError(message);
      throw new Error(message);
    }
  }

  async function handleSetProductActive(product: Product, active: boolean) {
    setDataError("");

    try {
      ensureProductCrudAllowed();
      await setProductActive(product.id, active, { mode: "real" });
      await loadData();
      setAuthMessage(active ? "Produto ativado com sucesso." : "Produto desativado com sucesso.");
    } catch (error) {
      const message = `${active ? "Erro ao ativar produto" : "Erro ao desativar produto"}: ${describeError(error)}`;
      setDataError(message);
    }
  }

  async function handleDeleteProduct(product: Product) {
    setDataError("");

    try {
      ensureProductCrudAllowed();

      if (!window.confirm(`Excluir produto ${product.name}? Produtos em orcamentos serao apenas desativados.`)) {
        return;
      }

      const result = await deleteProductRecord(product.id, { mode: "real" });
      await loadData();
      setAuthMessage(
        result === "deleted"
          ? "Produto excluido com sucesso."
          : "Produto vinculado a orcamento: foi desativado para preservar historico."
      );
    } catch (error) {
      const message = `Erro ao excluir produto: ${describeError(error)}`;
      setDataError(message);
    }
  }

  function ensureQuoteCrudAllowed() {
    if (!isRealSession || !currentUser) {
      throw new Error("Modo demonstracao: entre com Supabase para salvar orcamentos reais.");
    }
  }

  function ensureQuoteOwner(quote: Quote) {
    if (currentUser?.role !== "admin" && quote.sellerId !== currentUser?.id) {
      throw new Error("Vendedor so pode gerenciar orcamentos dos proprios clientes.");
    }
  }

  function normalizeQuotePayload(payload: QuoteFormData): QuoteFormData {
    const client = clients.find((item) => item.id === payload.clientId);

    if (!client) {
      throw new Error("Cliente do orcamento nao encontrado.");
    }

    if (currentUser?.role !== "admin" && client.sellerId !== currentUser?.id) {
      throw new Error("Vendedor so pode gerenciar orcamentos dos proprios clientes.");
    }

    return {
      ...payload,
      sellerId: client.sellerId,
      items: payload.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    };
  }

  async function handleCreateQuote(payload: QuoteFormData) {
    setDataError("");

    try {
      ensureQuoteCrudAllowed();
      await createQuote(normalizeQuotePayload(payload), { mode: "real" });
      await loadData();
      setAuthMessage("Orcamento criado com sucesso.");
    } catch (error) {
      const message = `Erro ao criar orcamento: ${describeError(error)}`;
      setDataError(message);
      throw new Error(message);
    }
  }

  async function handleUpdateQuote(id: string, payload: QuoteFormData) {
    setDataError("");

    try {
      ensureQuoteCrudAllowed();
      const existingQuote = quotes.find((quote) => quote.id === id);

      if (existingQuote) {
        ensureQuoteOwner(existingQuote);
      }

      await updateQuote(id, normalizeQuotePayload(payload), { mode: "real" });
      await loadData();
      setAuthMessage("Orcamento atualizado com sucesso.");
    } catch (error) {
      const message = `Erro ao atualizar orcamento: ${describeError(error)}`;
      setDataError(message);
      throw new Error(message);
    }
  }

  async function handleUpdateQuoteStatus(quote: Quote, status: QuoteStatus) {
    setDataError("");

    try {
      ensureQuoteCrudAllowed();
      ensureQuoteOwner(quote);
      await updateQuoteStatus(quote.id, status, { mode: "real" });
      await loadData();
      setAuthMessage("Status do orcamento atualizado.");
    } catch (error) {
      const message = `Erro ao alterar status do orcamento: ${describeError(error)}`;
      setDataError(message);
    }
  }

  async function handleDeleteQuote(quote: Quote) {
    setDataError("");

    try {
      ensureQuoteCrudAllowed();
      ensureQuoteOwner(quote);

      if (!window.confirm(`Excluir orcamento ${quote.id}?`)) {
        return;
      }

      await deleteQuoteRecord(quote.id, { mode: "real" });
      await loadData();
      setAuthMessage("Orcamento excluido com sucesso.");
    } catch (error) {
      const message = `Erro ao excluir orcamento: ${describeError(error)}`;
      setDataError(message);
    }
  }

  function ensureActivityCrudAllowed() {
    if (!isRealSession || !currentUser) {
      throw new Error("Modo demonstracao: entre com Supabase para salvar atividades reais.");
    }
  }

  function normalizeActivityPayload(payload: ActivityFormData): ActivityFormData {
    if (!currentUser) {
      return payload;
    }

    return {
      ...payload,
      sellerId: currentUser.role === "admin" ? payload.sellerId : currentUser.id
    };
  }

  function normalizeFollowUpPayload(payload: FollowUpFormData): FollowUpFormData {
    if (!currentUser) {
      return payload;
    }

    return {
      ...payload,
      sellerId: currentUser.role === "admin" ? payload.sellerId : currentUser.id
    };
  }

  async function handleCreateActivity(payload: ActivityFormData) {
    setDataError("");

    try {
      ensureActivityCrudAllowed();
      await createActivity(normalizeActivityPayload(payload), { mode: "real" });
      await loadData();
      setAuthMessage("Atividade criada com sucesso.");
    } catch (error) {
      const message = `Erro ao criar atividade: ${describeError(error)}`;
      setDataError(message);
      throw new Error(message);
    }
  }

  async function handleUpdateActivity(id: string, payload: ActivityFormData) {
    setDataError("");

    try {
      ensureActivityCrudAllowed();
      await updateActivity(id, normalizeActivityPayload(payload), { mode: "real" });
      await loadData();
      setAuthMessage("Atividade atualizada com sucesso.");
    } catch (error) {
      const message = `Erro ao atualizar atividade: ${describeError(error)}`;
      setDataError(message);
      throw new Error(message);
    }
  }

  async function handleCompleteActivity(activity: Activity) {
    setDataError("");

    try {
      ensureActivityCrudAllowed();
      await completeActivity(activity.id, { mode: "real" });
      await loadData();
      setAuthMessage("Atividade concluida com sucesso.");
    } catch (error) {
      const message = `Erro ao concluir atividade: ${describeError(error)}`;
      setDataError(message);
    }
  }

  async function handleDeleteActivity(activity: Activity) {
    setDataError("");

    try {
      ensureActivityCrudAllowed();

      if (!window.confirm(`Excluir atividade de ${activity.type}?`)) {
        return;
      }

      await deleteActivityRecord(activity.id, { mode: "real" });
      await loadData();
      setAuthMessage("Atividade excluida com sucesso.");
    } catch (error) {
      const message = `Erro ao excluir atividade: ${describeError(error)}`;
      setDataError(message);
    }
  }

  async function handleCreateFollowUp(payload: FollowUpFormData) {
    setDataError("");

    try {
      ensureActivityCrudAllowed();
      await createFollowUp(normalizeFollowUpPayload(payload), { mode: "real" });
      await loadData();
      setAuthMessage("Follow-up criado com sucesso.");
    } catch (error) {
      const message = `Erro ao criar follow-up: ${describeError(error)}`;
      setDataError(message);
      throw new Error(message);
    }
  }

  async function handleCompleteFollowUp(followUp: FollowUp) {
    setDataError("");

    try {
      ensureActivityCrudAllowed();
      await completeFollowUp(followUp.id, { mode: "real" });
      await loadData();
      setAuthMessage("Follow-up concluido com sucesso.");
    } catch (error) {
      const message = `Erro ao concluir follow-up: ${describeError(error)}`;
      setDataError(message);
    }
  }

  async function handleDeleteFollowUp(followUp: FollowUp) {
    setDataError("");

    try {
      ensureActivityCrudAllowed();

      if (!window.confirm(`Excluir follow-up ${followUp.title}?`)) {
        return;
      }

      await deleteFollowUpRecord(followUp.id, { mode: "real" });
      await loadData();
      setAuthMessage("Follow-up excluido com sucesso.");
    } catch (error) {
      const message = `Erro ao excluir follow-up: ${describeError(error)}`;
      setDataError(message);
    }
  }
  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setAuthMessage("Configure o Supabase em .env.local para ativar o login real.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAuthMessage(error.message);
      return;
    }

    setAuthMessage("Login realizado com sucesso. Carregando perfil...");
    setPassword("");
    await loadData();
  }

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setCurrentUser(null);
    setIsRealSession(false);
    setRole("admin");
    setSellerId("vend-lia");
    setAuthMessage("Modo demonstracao ativo");
    await loadData();
  }

  return (
    <main className="min-h-screen bg-paper">
      <AppHeader
        authMessage={authMessage}
        email={email}
        isRoleLocked={isRealSession}
        password={password}
        role={role}
        sellerId={sellerId}
        users={users}
        onEmailChange={setEmail}
        onLogout={isRealSession ? handleLogout : undefined}
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
            currentSellerName={currentSeller?.name ?? currentUser?.name}
            query={query}
            role={role}
            onQueryChange={setQuery}
          />

          {dataError && (
            <div className="mb-4 rounded-lg border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-semibold text-coral">
              {dataError}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-lg border border-black/10 bg-white px-4 py-6 text-sm font-medium text-ink/60">
              Carregando dados...
            </div>
          ) : (
            <>
              {activeTab === "hoje" && (
                <TodayView
                  activities={visibleActivities}
                  clients={clients}
                  clientsCount={visibleClients.length}
                  currentSellerId={sellerId}
                  followUps={visibleFollowUps}
                  isRealSession={isRealSession}
                  quotesCount={visibleQuotes.length}
                  role={role}
                  onCompleteActivity={handleCompleteActivity}
                  onCompleteFollowUp={handleCompleteFollowUp}
                  onCreateActivity={handleCreateActivity}
                  onCreateFollowUp={handleCreateFollowUp}
                  onDeleteActivity={handleDeleteActivity}
                  onDeleteFollowUp={handleDeleteFollowUp}
                  onUpdateActivity={handleUpdateActivity}
                />
              )}
              {activeTab === "atendimento" && (
                <GuidedServiceView
                  activities={visibleActivities}
                  clients={clients}
                  currentSellerId={sellerId}
                  isRealSession={isRealSession}
                  products={products}
                  quotes={visibleQuotes}
                  role={role}
                  onCreateActivity={handleCreateActivity}
                  onCreateFollowUp={handleCreateFollowUp}
                  onCreateQuote={handleCreateQuote}
                  onUpdateQuote={handleUpdateQuote}
                />
              )}
              {activeTab === "clientes" && (
                <ClientsView
                  clients={visibleClients}
                  currentSellerId={sellerId}
                  isRealSession={isRealSession}
                  role={role}
                  users={users}
                  onCreateClient={handleCreateClient}
                  onDeleteClient={handleDeleteClient}
                  onUpdateClient={handleUpdateClient}
                />
              )}
              {activeTab === "produtos" && (
                <ProductsView
                  clients={visibleClients}
                  currentSellerId={sellerId}
                  isRealSession={isRealSession}
                  products={products}
                  query={query}
                  role={role}
                  onCreateProduct={handleCreateProduct}
                  onCreateQuote={handleCreateQuote}
                  onDeleteProduct={handleDeleteProduct}
                  onSetProductActive={handleSetProductActive}
                  onUpdateProduct={handleUpdateProduct}
                />
              )}
              {activeTab === "orcamentos" && (
                <QuotesView
                  clients={clients}
                  currentSellerId={sellerId}
                  isRealSession={isRealSession}
                  products={products}
                  quotes={visibleQuotes}
                  role={role}
                  onCreateQuote={handleCreateQuote}
                  onDeleteQuote={handleDeleteQuote}
                  onUpdateQuote={handleUpdateQuote}
                  onUpdateQuoteStatus={handleUpdateQuoteStatus}
                />
              )}
              {activeTab === "administracao" && <AdminView role={role} users={users} />}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

