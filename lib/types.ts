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
  nextFollowUp: string;
  potential: "baixo" | "medio" | "alto";
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stockStatus: "pronto" | "sob encomenda";
};

export type QuoteItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type Quote = {
  id: string;
  clientId: string;
  sellerId: string;
  status: "rascunho" | "enviado" | "aprovado" | "perdido";
  createdAt: string;
  items: QuoteItem[];
};

export type Activity = {
  id: string;
  clientId: string;
  sellerId: string;
  type: "ligacao" | "whatsapp" | "email" | "reuniao" | "pos-venda";
  note: string;
  dueAt: string;
  done: boolean;
};
