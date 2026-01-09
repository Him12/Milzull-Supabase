// src/lib/serviceTypes.ts
import { supabase } from "./supabaseClient";

export interface ServiceType {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bg: string;
  active: boolean;
  created_at: string;
}

export async function fetchServiceTypes() {
  return supabase
    .from("milzull_service_types")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true });
}
