import type { SupabaseClient } from "@supabase/supabase-js";

export interface UserQuota {
  maxAttempts: number;
  usedAttempts: number;
}

export async function getUserQuota(
  supabase: SupabaseClient,
  userId: string
): Promise<UserQuota | null> {
  const { data, error } = await supabase
    .from("user_quota")
    .select("max_attempts, used_attempts")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return { maxAttempts: data.max_attempts, usedAttempts: data.used_attempts };
}

// Atomically checks + increments via the consume_quota() Postgres function
// (supabase/migrations/0001_user_quota.sql) — true if a use was granted,
// false if the user has no quota row or is already at their limit.
export async function consumeQuota(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("consume_quota", { p_user_id: userId });
  if (error) return false;
  return data === true;
}
