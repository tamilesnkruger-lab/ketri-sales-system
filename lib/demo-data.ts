import type { Activity, Client, Product, Quote, User } from "@/lib/types";

export const users: User[] = [
  {
    id: "admin-ana",
    name: "Ana Ketri",
    email: "admin@ketricriativa.com",
    role: "admin"
  },
  {
    id: "vend-lia",
    name: "Lia Ramos",
    email: "lia@ketricriativa.com",
    role: "vendedor"
  },
  {
    id: "vend-marcos",
    name: "Marcos Silva",
    email: "marcos@ketricriativa.com",
    role: "vendedor"
  }
];

export const clients: Client[] = [
  {
    id: "cli-pet-bela",
    name: "Pet Bela Vista",
    contactName: "Camila Prado",
    phone: "(11) 98888-1020",
    city: "Sao Paulo, SP",
    status: "follow-up",
    sellerId: "vend-lia",
    lastActivity: "Orcamento enviado para linha Pets e tal.",
    nextFollowUp: "2026-06-29T14:30:00",
    potential: "alto"
  },
  {
    id: "cli-mundo-pet",
    name: "Mundo Pet Jardins",
    contactName: "Rafael Nunes",
    phone: "(11) 97777-4040",
    city: "Sao Paulo, SP",
    status: "orcamento",
    sellerId: "vend-lia",
    lastActivity: "Escolheu bandanas e tags personalizadas.",
    nextFollowUp: "2026-06-30T10:00:00",
    potential: "medio"
  },
  {
    id: "cli-auau",
    name: "Auau Boutique",
    contactName: "Bruna Teixeira",
    phone: "(19) 96666-8800",
    city: "Campinas, SP",
    status: "atendimento",
    sellerId: "vend-marcos",
    lastActivity: "Solicitou catalogo atualizado.",
    nextFollowUp: "2026-07-01T09:00:00",
    potential: "alto"
  },
  {
    id: "cli-casa-patas",
    name: "Casa das Patas",
    contactName: "Joao Matos",
    phone: "(21) 95555-2211",
    city: "Rio de Janeiro, RJ",
    status: "lead",
    sellerId: "vend-marcos",
    lastActivity: "Lead recebido pela landing page.",
    nextFollowUp: "2026-06-29T16:00:00",
    potential: "baixo"
  }
];

export const products: Product[] = [
  {
    id: "prod-bandana-p",
    sku: "PET-BAN-P",
    name: "Bandana Pets e tal P",
    category: "Bandanas",
    price: 24.9,
    stockStatus: "pronto"
  },
  {
    id: "prod-bandana-m",
    sku: "PET-BAN-M",
    name: "Bandana Pets e tal M",
    category: "Bandanas",
    price: 29.9,
    stockStatus: "pronto"
  },
  {
    id: "prod-tag",
    sku: "PET-TAG-01",
    name: "Tag de identificacao personalizada",
    category: "Acessorios",
    price: 18.5,
    stockStatus: "sob encomenda"
  },
  {
    id: "prod-kit",
    sku: "PET-KIT-LOJA",
    name: "Kit expositor loja pet",
    category: "Kits comerciais",
    price: 189,
    stockStatus: "sob encomenda"
  }
];

export const quotes: Quote[] = [
  {
    id: "orc-1001",
    clientId: "cli-pet-bela",
    sellerId: "vend-lia",
    status: "enviado",
    createdAt: "2026-06-28T11:00:00",
    items: [
      { productId: "prod-bandana-m", quantity: 20, unitPrice: 29.9 },
      { productId: "prod-tag", quantity: 20, unitPrice: 18.5 }
    ]
  },
  {
    id: "orc-1002",
    clientId: "cli-mundo-pet",
    sellerId: "vend-lia",
    status: "rascunho",
    createdAt: "2026-06-29T09:20:00",
    items: [
      { productId: "prod-kit", quantity: 1, unitPrice: 189 },
      { productId: "prod-bandana-p", quantity: 12, unitPrice: 24.9 }
    ]
  }
];

export const activities: Activity[] = [
  {
    id: "atv-1",
    clientId: "cli-pet-bela",
    sellerId: "vend-lia",
    type: "whatsapp",
    note: "Confirmar recebimento do orcamento e ajustar volumes.",
    dueAt: "2026-06-29T14:30:00",
    done: false
  },
  {
    id: "atv-2",
    clientId: "cli-casa-patas",
    sellerId: "vend-marcos",
    type: "ligacao",
    note: "Primeiro contato apos cadastro na landing page.",
    dueAt: "2026-06-29T16:00:00",
    done: false
  },
  {
    id: "atv-3",
    clientId: "cli-mundo-pet",
    sellerId: "vend-lia",
    type: "email",
    note: "Enviar tabela com prazos de personalizacao.",
    dueAt: "2026-06-30T10:00:00",
    done: false
  }
];
