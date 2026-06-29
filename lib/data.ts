import { activities, clients, products, quotes, users } from "@/lib/demo-data";
import { supabase } from "@/lib/supabase";

export function getCurrentUser() {
  return {
    currentUser: users[0],
    users,
    isSupabaseConfigured: Boolean(supabase)
  };
}

export function getCustomers() {
  return clients;
}

export function getProducts() {
  return products;
}

export function getQuotes() {
  return quotes;
}

export function getActivities() {
  return activities;
}
