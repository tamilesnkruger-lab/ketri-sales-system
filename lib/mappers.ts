import type { Activity, Client, FollowUp, Product, Quote, QuoteItem, User } from "@/lib/types";

export type ProfileRow = {
  id: string;
  name: string;
  email: string;
  role: User["role"];
};

export type ClientRow = {
  id: string;
  name: string;
  contact_name: string;
  phone: string | null;
  city: string | null;
  status: Client["status"];
  potential: Client["potential"];
  seller_id: string;
  last_activity: string | null;
};

export type ProductRow = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number | string;
  stock_status: Product["stockStatus"];
  active?: boolean;
};

export type QuoteRow = {
  id: string;
  client_id: string;
  seller_id: string;
  status: Quote["status"];
  created_at: string;
};

export type QuoteItemRow = {
  product_id: string;
  quantity: number;
  unit_price: number | string;
};

export type ActivityRow = {
  id: string;
  client_id: string;
  seller_id: string;
  type: Activity["type"];
  note: string;
  due_at: string | null;
  done: boolean;
};

export type FollowUpRow = {
  id: string;
  client_id: string;
  seller_id: string;
  activity_id: string | null;
  title: string;
  due_at: string;
  done: boolean;
};

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

export function mapProfileToUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role
  };
}

export function mapClientToClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contact_name,
    phone: row.phone ?? "",
    city: row.city ?? "",
    status: row.status,
    sellerId: row.seller_id,
    lastActivity: row.last_activity ?? "",
    // Later this should come from follow_ups.due_at or activities.due_at.
    nextFollowUp: null,
    potential: row.potential
  };
}

export function mapProductToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    price: toNumber(row.price),
    stockStatus: row.stock_status,
    active: row.active ?? true
  };
}

export function mapQuoteItemToQuoteItem(row: QuoteItemRow): QuoteItem {
  return {
    productId: row.product_id,
    quantity: row.quantity,
    unitPrice: toNumber(row.unit_price)
  };
}

export function mapQuoteToQuote(row: QuoteRow, items: QuoteItemRow[] = []): Quote {
  return {
    id: row.id,
    clientId: row.client_id,
    sellerId: row.seller_id,
    status: row.status,
    createdAt: row.created_at,
    items: items.map(mapQuoteItemToQuoteItem)
  };
}

export function mapActivityToActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    clientId: row.client_id,
    sellerId: row.seller_id,
    type: row.type,
    note: row.note,
    dueAt: row.due_at ?? "",
    done: row.done
  };
}

export function mapFollowUpToFollowUp(row: FollowUpRow): FollowUp {
  return {
    id: row.id,
    clientId: row.client_id,
    sellerId: row.seller_id,
    activityId: row.activity_id,
    title: row.title,
    dueAt: row.due_at,
    done: row.done
  };
}