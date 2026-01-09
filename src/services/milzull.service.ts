import { supabase } from "../lib/supabaseClient";
import { MilzullService } from "../types/service";

export async function fetchOpenMilzullServices() {
  return supabase
    .from("milzull_services")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });
}

export async function createMilzullService(
  payload: Partial<MilzullService>
) {
  return supabase.from("milzull_services").insert(payload);
}
