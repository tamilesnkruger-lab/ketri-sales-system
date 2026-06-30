import {
  activities as demoActivities,
  clients as demoClients,
  products as demoProducts,
  quotes as demoQuotes,
  users as demoUsers
} from "@/lib/demo-data";
import {
  mapActivityToActivity,
  mapFollowUpToFollowUp,
  mapClientToClient,
  mapProductToProduct,
  mapProfileToUser,
  mapQuoteToQuote,
  type ActivityRow,
  type FollowUpRow,
  type ClientRow,
  type ProductRow,
  type ProfileRow,
  type QuoteItemRow,
  type QuoteRow
} from "@/lib/mappers";
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
  User
} from "@/lib/types";

export type DataMode = "demo" | "real";

type DataOptions = {
  mode?: DataMode;
  includeInactive?: boolean;
};

type CurrentUserData = {
  currentUser: User | null;
  isSupabaseConfigured: boolean;
  isAuthenticated: boolean;
  mode: DataMode;
  profileError: string | null;
};

type QuoteWithItemsRow = QuoteRow & {
  quote_items?: QuoteItemRow[] | null;
};

function isSupabaseConfigured() {
  return Boolean(supabase);
}

function getRequestedMode(options?: DataOptions): DataMode {
  return options?.mode ?? "demo";
}

function ensureSupabase(scope: string) {
  if (!supabase) {
    throw new Error(`${scope}: Supabase nao configurado.`);
  }

  return supabase;
}

function ensureRealMode(scope: string, options?: DataOptions) {
  if (getRequestedMode(options) !== "real") {
    throw new Error(`${scope}: operacao disponivel apenas no modo real.`);
  }
}

function logRealDataError(scope: string, error: unknown) {
  console.error(`[data] Erro no modo real em ${scope}.`, error);
}

function fallbackCurrentUser(): CurrentUserData {
  return {
    currentUser: demoUsers[0],
    isSupabaseConfigured: isSupabaseConfigured(),
    isAuthenticated: false,
    mode: "demo",
    profileError: null
  };
}

function clientSelectFields() {
  return "id, name, contact_name, phone, city, status, potential, seller_id, last_activity";
}

function toClientRowInput(input: ClientFormData) {
  return {
    name: input.name.trim(),
    contact_name: input.contactName.trim(),
    phone: input.phone.trim() || null,
    city: input.city.trim() || null,
    status: input.status,
    potential: input.potential,
    seller_id: input.sellerId,
    last_activity: input.lastActivity.trim() || null
  };
}

function activitySelectFields() {
  return "id, client_id, seller_id, type, note, due_at, done";
}

function followUpSelectFields() {
  return "id, client_id, seller_id, activity_id, title, due_at, done";
}

function productSelectFields() {
  return "id, sku, name, category, price, stock_status, active, cost_price, b2b_price, b2c_price, image_url, tags, featured, favorite";
}

function quoteSelectFields() {
  return "id, client_id, seller_id, status, created_at";
}

function quoteWithItemsSelectFields() {
  return "id, client_id, seller_id, status, created_at, quote_items(product_id, quantity, unit_price)";
}

function toQuoteRowInput(input: QuoteFormData) {
  return {
    client_id: input.clientId,
    seller_id: input.sellerId,
    status: input.status
  };
}

function toQuoteItemRowInput(quoteId: string, item: QuoteItemRow) {
  return {
    quote_id: quoteId,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price
  };
}

function toQuoteItemRowsInput(quoteId: string, items: QuoteFormData["items"]) {
  return items.map((item) =>
    toQuoteItemRowInput(quoteId, {
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice
    })
  );
}

function toProductRowInput(input: ProductFormData) {
  return {
    sku: input.sku.trim(),
    name: input.name.trim(),
    category: input.category.trim(),
    price: input.price,
    stock_status: input.stockStatus === "pronto" ? "disponivel" : input.stockStatus,
    cost_price: input.costPrice ?? null,
    b2b_price: input.b2bPrice ?? null,
    b2c_price: input.b2cPrice ?? input.price,
    image_url: input.imageUrl?.trim() || null,
    tags: input.tags ?? [],
    featured: input.featured ?? false,
    favorite: input.favorite ?? false
  };
}

function toActivityRowInput(input: ActivityFormData) {
  return {
    client_id: input.clientId,
    seller_id: input.sellerId,
    type: input.type,
    note: input.note.trim(),
    due_at: input.dueAt || null
  };
}

function toFollowUpRowInput(input: FollowUpFormData) {
  return {
    client_id: input.clientId,
    seller_id: input.sellerId,
    activity_id: input.activityId,
    title: input.title.trim(),
    due_at: input.dueAt
  };
}

export async function getCurrentUser(): Promise<CurrentUserData> {
  if (!supabase) {
    return fallbackCurrentUser();
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      if (authError) {
        console.warn("[data] Sessao Supabase ausente ou invalida.", authError);
      }

      return fallbackCurrentUser();
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, email, role")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profileData) {
      logRealDataError("getCurrentUser.profile", profileError);
      return {
        currentUser: null,
        isSupabaseConfigured: true,
        isAuthenticated: true,
        mode: "real",
        profileError: profileError?.message ?? "Perfil autenticado nao encontrado."
      };
    }

    return {
      currentUser: mapProfileToUser(profileData as unknown as ProfileRow),
      isSupabaseConfigured: true,
      isAuthenticated: true,
      mode: "real",
      profileError: null
    };
  } catch (error) {
    logRealDataError("getCurrentUser", error);
    return {
      currentUser: null,
      isSupabaseConfigured: true,
      isAuthenticated: true,
      mode: "real",
      profileError: error instanceof Error ? error.message : "Erro ao buscar perfil."
    };
  }
}

export async function getUsers(options?: DataOptions): Promise<User[]> {
  if (getRequestedMode(options) === "demo") {
    return demoUsers;
  }

  const client = ensureSupabase("getUsers");
  const { data, error } = await client
    .from("profiles")
    .select("id, name, email, role")
    .order("name", { ascending: true });

  if (error) {
    logRealDataError("getUsers", error);
    throw error;
  }

  return ((data ?? []) as unknown as ProfileRow[]).map(mapProfileToUser);
}

export async function getClients(options?: DataOptions): Promise<Client[]> {
  if (getRequestedMode(options) === "demo") {
    return demoClients;
  }

  const client = ensureSupabase("getClients");
  const { data, error } = await client
    .from("clients")
    .select(clientSelectFields())
    .order("updated_at", { ascending: false });

  if (error) {
    logRealDataError("getClients", error);
    throw error;
  }

  return ((data ?? []) as unknown as ClientRow[]).map(mapClientToClient);
}

export async function createClient(input: ClientFormData, options?: DataOptions): Promise<Client> {
  ensureRealMode("createClient", options);

  const client = ensureSupabase("createClient");
  const { data, error } = await client
    .from("clients")
    .insert(toClientRowInput(input))
    .select(clientSelectFields())
    .single();

  if (error) {
    logRealDataError("createClient", error);
    throw error;
  }

  return mapClientToClient(data as unknown as ClientRow);
}

export async function updateClient(
  id: string,
  input: ClientFormData,
  options?: DataOptions
): Promise<Client> {
  ensureRealMode("updateClient", options);

  const client = ensureSupabase("updateClient");
  const { data, error } = await client
    .from("clients")
    .update(toClientRowInput(input))
    .eq("id", id)
    .select(clientSelectFields())
    .single();

  if (error) {
    logRealDataError("updateClient", error);
    throw error;
  }

  return mapClientToClient(data as unknown as ClientRow);
}

export async function deleteClient(id: string, options?: DataOptions): Promise<void> {
  ensureRealMode("deleteClient", options);

  const client = ensureSupabase("deleteClient");
  const { error } = await client.from("clients").delete().eq("id", id);

  if (error) {
    logRealDataError("deleteClient", error);
    throw error;
  }
}

export async function getProducts(options?: DataOptions): Promise<Product[]> {
  if (getRequestedMode(options) === "demo") {
    return demoProducts;
  }

  const client = ensureSupabase("getProducts");
  let query = client.from("products").select(productSelectFields()).order("name", { ascending: true });

  if (!options?.includeInactive) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;

  if (error) {
    logRealDataError("getProducts", error);
    throw error;
  }

  return ((data ?? []) as unknown as ProductRow[]).map(mapProductToProduct);
}

export async function createProduct(input: ProductFormData, options?: DataOptions): Promise<Product> {
  ensureRealMode("createProduct", options);

  const client = ensureSupabase("createProduct");
  const { data, error } = await client
    .from("products")
    .insert({ ...toProductRowInput(input), active: true })
    .select(productSelectFields())
    .single();

  if (error) {
    logRealDataError("createProduct", error);
    throw error;
  }

  return mapProductToProduct(data as unknown as ProductRow);
}

export async function updateProduct(
  id: string,
  input: ProductFormData,
  options?: DataOptions
): Promise<Product> {
  ensureRealMode("updateProduct", options);

  const client = ensureSupabase("updateProduct");
  const { data, error } = await client
    .from("products")
    .update(toProductRowInput(input))
    .eq("id", id)
    .select(productSelectFields())
    .single();

  if (error) {
    logRealDataError("updateProduct", error);
    throw error;
  }

  return mapProductToProduct(data as unknown as ProductRow);
}

export async function setProductActive(
  id: string,
  active: boolean,
  options?: DataOptions
): Promise<Product> {
  ensureRealMode("setProductActive", options);

  const client = ensureSupabase("setProductActive");
  const { data, error } = await client
    .from("products")
    .update({ active })
    .eq("id", id)
    .select(productSelectFields())
    .single();

  if (error) {
    logRealDataError("setProductActive", error);
    throw error;
  }

  return mapProductToProduct(data as unknown as ProductRow);
}

export type DeleteProductResult = "deleted" | "deactivated";

export async function deleteProduct(id: string, options?: DataOptions): Promise<DeleteProductResult> {
  ensureRealMode("deleteProduct", options);

  const client = ensureSupabase("deleteProduct");
  const { count, error: countError } = await client
    .from("quote_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);

  if (countError) {
    logRealDataError("deleteProduct.quoteItems", countError);
    throw countError;
  }

  if ((count ?? 0) > 0) {
    await setProductActive(id, false, options);
    return "deactivated";
  }

  const { error } = await client.from("products").delete().eq("id", id);

  if (error) {
    logRealDataError("deleteProduct", error);
    throw error;
  }

  return "deleted";
}

export async function getQuotes(options?: DataOptions): Promise<Quote[]> {
  if (getRequestedMode(options) === "demo") {
    return demoQuotes;
  }

  const client = ensureSupabase("getQuotes");
  const { data, error } = await client
    .from("quotes")
    .select(quoteWithItemsSelectFields())
    .order("created_at", { ascending: false });

  if (error) {
    logRealDataError("getQuotes", error);
    throw error;
  }

  return ((data ?? []) as unknown as QuoteWithItemsRow[]).map((quote) =>
    mapQuoteToQuote(quote, quote.quote_items ?? [])
  );
}

async function getQuoteWithItems(id: string): Promise<Quote> {
  const client = ensureSupabase("getQuoteWithItems");
  const { data, error } = await client
    .from("quotes")
    .select(quoteWithItemsSelectFields())
    .eq("id", id)
    .single();

  if (error) {
    logRealDataError("getQuoteWithItems", error);
    throw error;
  }

  const quote = data as unknown as QuoteWithItemsRow;
  return mapQuoteToQuote(quote, quote.quote_items ?? []);
}

async function replaceQuoteItems(quoteId: string, items: QuoteFormData["items"]): Promise<void> {
  const client = ensureSupabase("replaceQuoteItems");
  const { error: deleteError } = await client.from("quote_items").delete().eq("quote_id", quoteId);

  if (deleteError) {
    logRealDataError("replaceQuoteItems.delete", deleteError);
    throw deleteError;
  }

  const { error: insertError } = await client.from("quote_items").insert(toQuoteItemRowsInput(quoteId, items));

  if (insertError) {
    logRealDataError("replaceQuoteItems.insert", insertError);
    throw insertError;
  }
}

export async function createQuote(input: QuoteFormData, options?: DataOptions): Promise<Quote> {
  ensureRealMode("createQuote", options);

  const client = ensureSupabase("createQuote");
  const { data, error } = await client
    .from("quotes")
    .insert(toQuoteRowInput(input))
    .select(quoteSelectFields())
    .single();

  if (error) {
    logRealDataError("createQuote", error);
    throw error;
  }

  const quote = data as unknown as QuoteRow;

  try {
    await replaceQuoteItems(quote.id, input.items);
  } catch (error) {
    await client.from("quotes").delete().eq("id", quote.id);
    throw error;
  }

  return getQuoteWithItems(quote.id);
}

export async function updateQuote(
  id: string,
  input: QuoteFormData,
  options?: DataOptions
): Promise<Quote> {
  ensureRealMode("updateQuote", options);

  const previousQuote = await getQuoteWithItems(id);
  const client = ensureSupabase("updateQuote");
  const { error } = await client.from("quotes").update(toQuoteRowInput(input)).eq("id", id);

  if (error) {
    logRealDataError("updateQuote", error);
    throw error;
  }

  try {
    await replaceQuoteItems(id, input.items);
  } catch (error) {
    try {
      await replaceQuoteItems(id, previousQuote.items);
    } catch (restoreError) {
      logRealDataError("updateQuote.restoreItems", restoreError);
    }

    throw error;
  }

  return getQuoteWithItems(id);
}

export async function updateQuoteStatus(
  id: string,
  status: QuoteStatus,
  options?: DataOptions
): Promise<Quote> {
  ensureRealMode("updateQuoteStatus", options);

  const client = ensureSupabase("updateQuoteStatus");
  const { error } = await client.from("quotes").update({ status }).eq("id", id);

  if (error) {
    logRealDataError("updateQuoteStatus", error);
    throw error;
  }

  return getQuoteWithItems(id);
}

export async function deleteQuote(id: string, options?: DataOptions): Promise<void> {
  ensureRealMode("deleteQuote", options);

  const client = ensureSupabase("deleteQuote");
  const { error } = await client.from("quotes").delete().eq("id", id);

  if (error) {
    logRealDataError("deleteQuote", error);
    throw error;
  }
}

export async function getActivities(options?: DataOptions): Promise<Activity[]> {
  if (getRequestedMode(options) === "demo") {
    return demoActivities;
  }

  const client = ensureSupabase("getActivities");
  const { data, error } = await client
    .from("activities")
    .select(activitySelectFields())
    .eq("done", false)
    .order("due_at", { ascending: true });

  if (error) {
    logRealDataError("getActivities", error);
    throw error;
  }

  return ((data ?? []) as unknown as ActivityRow[]).map(mapActivityToActivity);
}

export async function createActivity(input: ActivityFormData, options?: DataOptions): Promise<Activity> {
  ensureRealMode("createActivity", options);

  const client = ensureSupabase("createActivity");
  const { data, error } = await client
    .from("activities")
    .insert(toActivityRowInput(input))
    .select(activitySelectFields())
    .single();

  if (error) {
    logRealDataError("createActivity", error);
    throw error;
  }

  return mapActivityToActivity(data as unknown as ActivityRow);
}

export async function updateActivity(
  id: string,
  input: ActivityFormData,
  options?: DataOptions
): Promise<Activity> {
  ensureRealMode("updateActivity", options);

  const client = ensureSupabase("updateActivity");
  const { data, error } = await client
    .from("activities")
    .update(toActivityRowInput(input))
    .eq("id", id)
    .select(activitySelectFields())
    .single();

  if (error) {
    logRealDataError("updateActivity", error);
    throw error;
  }

  return mapActivityToActivity(data as unknown as ActivityRow);
}

export async function completeActivity(id: string, options?: DataOptions): Promise<void> {
  ensureRealMode("completeActivity", options);

  const client = ensureSupabase("completeActivity");
  const { error } = await client.from("activities").update({ done: true }).eq("id", id);

  if (error) {
    logRealDataError("completeActivity", error);
    throw error;
  }
}

export async function deleteActivity(id: string, options?: DataOptions): Promise<void> {
  ensureRealMode("deleteActivity", options);

  const client = ensureSupabase("deleteActivity");
  const { error } = await client.from("activities").delete().eq("id", id);

  if (error) {
    logRealDataError("deleteActivity", error);
    throw error;
  }
}

export async function getFollowUps(options?: DataOptions): Promise<FollowUp[]> {
  if (getRequestedMode(options) === "demo") {
    return [];
  }

  const client = ensureSupabase("getFollowUps");
  const { data, error } = await client
    .from("follow_ups")
    .select(followUpSelectFields())
    .eq("done", false)
    .order("due_at", { ascending: true });

  if (error) {
    logRealDataError("getFollowUps", error);
    throw error;
  }

  return ((data ?? []) as unknown as FollowUpRow[]).map(mapFollowUpToFollowUp);
}

export async function createFollowUp(input: FollowUpFormData, options?: DataOptions): Promise<FollowUp> {
  ensureRealMode("createFollowUp", options);

  const client = ensureSupabase("createFollowUp");
  const { data, error } = await client
    .from("follow_ups")
    .insert(toFollowUpRowInput(input))
    .select(followUpSelectFields())
    .single();

  if (error) {
    logRealDataError("createFollowUp", error);
    throw error;
  }

  return mapFollowUpToFollowUp(data as unknown as FollowUpRow);
}

export async function completeFollowUp(id: string, options?: DataOptions): Promise<void> {
  ensureRealMode("completeFollowUp", options);

  const client = ensureSupabase("completeFollowUp");
  const { error } = await client.from("follow_ups").update({ done: true }).eq("id", id);

  if (error) {
    logRealDataError("completeFollowUp", error);
    throw error;
  }
}

export async function deleteFollowUp(id: string, options?: DataOptions): Promise<void> {
  ensureRealMode("deleteFollowUp", options);

  const client = ensureSupabase("deleteFollowUp");
  const { error } = await client.from("follow_ups").delete().eq("id", id);

  if (error) {
    logRealDataError("deleteFollowUp", error);
    throw error;
  }
}