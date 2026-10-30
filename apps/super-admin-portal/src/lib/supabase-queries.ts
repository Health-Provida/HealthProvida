/**
 * Supabase query functions for the Super Admin Portal.
 *
 * Each function gracefully handles a missing Supabase client (returns empty
 * arrays / null) so the portal can still render with mock data during local
 * development without credentials.
 */

import { supabase } from "./supabase";
import type {
  Provider,
  Tariff,
  Encounter,
  Transaction,
  HmoAccount,
  Campaign,
  AdminAction,
  AdminUser,
} from "./types";

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

export async function fetchProviders(): Promise<Provider[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("admin_providers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("fetchProviders:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchProviderById(id: string): Promise<Provider | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("admin_providers")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("fetchProviderById:", error.message);
    return null;
  }
  return data;
}

export async function updateProviderVerification(
  id: string,
  verification: string,
  adminComment?: string,
) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("admin_providers")
    .update({
      verification,
      admin_comments: adminComment,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("updateProviderVerification:", error.message);
    return null;
  }
  return data;
}

export async function updateProviderStatus(id: string, status: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("admin_providers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("updateProviderStatus:", error.message);
    return null;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Tariffs
// ---------------------------------------------------------------------------

export async function fetchTariffs(): Promise<Tariff[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("admin_tariffs")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("fetchTariffs:", error.message);
    return [];
  }
  return data ?? [];
}

export async function upsertTariff(tariff: Partial<Tariff>) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("admin_tariffs")
    .upsert(tariff, { onConflict: "id" })
    .select()
    .single();
  if (error) {
    console.error("upsertTariff:", error.message);
    return null;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Encounters
// ---------------------------------------------------------------------------

export async function fetchEncounters(): Promise<Encounter[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("admin_encounters")
    .select("*")
    .order("check_in_time", { ascending: false });
  if (error) {
    console.error("fetchEncounters:", error.message);
    return [];
  }
  return data ?? [];
}

// ---------------------------------------------------------------------------
// HMO Accounts
// ---------------------------------------------------------------------------

export async function fetchHmoAccounts(): Promise<HmoAccount[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("admin_hmo_accounts")
    .select("*")
    .order("name");
  if (error) {
    console.error("fetchHmoAccounts:", error.message);
    return [];
  }
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export async function fetchTransactions(): Promise<Transaction[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("admin_transactions")
    .select("*")
    .order("date", { ascending: false });
  if (error) {
    console.error("fetchTransactions:", error.message);
    return [];
  }
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export async function fetchCampaigns(): Promise<Campaign[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("admin_campaigns")
    .select("*")
    .order("start_date", { ascending: false });
  if (error) {
    console.error("fetchCampaigns:", error.message);
    return [];
  }
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Admin Users
// ---------------------------------------------------------------------------

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("name");
  if (error) {
    console.error("fetchAdminUsers:", error.message);
    return [];
  }
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Admin Audit Log
// ---------------------------------------------------------------------------

export async function fetchAdminActions(): Promise<AdminAction[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("*")
    .order("logged_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("fetchAdminActions:", error.message);
    return [];
  }
  return data ?? [];
}

export async function insertAdminAction(action: Omit<AdminAction, "id">) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("admin_audit_log")
    .insert(action)
    .select()
    .single();
  if (error) {
    console.error("insertAdminAction:", error.message);
    return null;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Dashboard KPIs (aggregated view)
// ---------------------------------------------------------------------------

export async function fetchDashboardStats() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("admin_dashboard_stats")
    .select("*")
    .single();
  if (error) {
    console.error("fetchDashboardStats:", error.message);
    return null;
  }
  return data;
}
