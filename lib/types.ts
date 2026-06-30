export type UserRole = "admin" | "vendedor";

export type ClientStatus =
  | "lead"
  | "atendimento"
  | "orcamento"
  | "follow-up"
  | "venda"
  | "pos-venda";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Client = {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  city: string;
  status: ClientStatus;
  sellerId: string;
  lastActivity: string;
  nextFollowUp: string | null;
  potential: "baixo" | "medio" | "alto";
};

export type ClientFormData = {
  name: string;
  contactName: string;
  phone: string;
  city: string;
  status: ClientStatus;
  sellerId: string;
  lastActivity: string;
  potential: Client["potential"];
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stockStatus: "pronto" | "sob encomenda";
  active?: boolean;
};

export type ProductFormData = {
  sku: string;
  name: string;
  category: string;
  price: number;
  stockStatus: Product["stockStatus"];
};

export type QuoteItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type QuoteItemFormData = QuoteItem;

export type QuoteStatus = "rascunho" | "enviado" | "aprovado" | "perdido";

export type Quote = {
  id: string;
  clientId: string;
  sellerId: string;
  status: QuoteStatus;
  createdAt: string;
  items: QuoteItem[];
};

export type QuoteFormData = {
  clientId: string;
  sellerId: string;
  status: QuoteStatus;
  items: QuoteItemFormData[];
};

export type ActivityType = "ligacao" | "whatsapp" | "email" | "reuniao" | "pos-venda";

export type Activity = {
  id: string;
  clientId: string;
  sellerId: string;
  type: ActivityType;
  note: string;
  dueAt: string;
  done: boolean;
};

export type ActivityFormData = {
  clientId: string;
  sellerId: string;
  type: ActivityType;
  note: string;
  dueAt: string;
};

export type FollowUp = {
  id: string;
  clientId: string;
  sellerId: string;
  activityId: string | null;
  title: string;
  dueAt: string;
  done: boolean;
};

export type FollowUpFormData = {
  clientId: string;
  sellerId: string;
  activityId: string | null;
  title: string;
  dueAt: string;
};