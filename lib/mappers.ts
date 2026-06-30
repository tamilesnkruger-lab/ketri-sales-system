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
  cost_price?: number | string | null;
  b2b_price?: number | string | null;
  b2c_price?: number | string | null;
  image_url?: string | null;
  tags?: string[] | null;
  featured?: boolean | null;
  favorite?: boolean | null;
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
  const b2cPrice = row.b2c_price == null ? toNumber(row.price) : toNumber(row.b2c_price);

  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    price: toNumber(row.price),
    stockStatus: row.stock_status,
    active: row.active ?? true,
    costPrice: row.cost_price == null ? null : toNumber(row.cost_price),
    b2bPrice: row.b2b_price == null ? null : toNumber(row.b2b_price),
    b2cPrice,
    imageUrl: row.image_url ?? null,
    tags: row.tags ?? [],
    featured: row.featured ?? false,
    favorite: row.favorite ?? false
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