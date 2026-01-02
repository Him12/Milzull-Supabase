export type MilzullServiceType =
  | "coffee"
  | "tea"
  | "walk"
  | "office";

export type MilzullService = {
  id: string;
  creator_id: string;
  service_type: MilzullServiceType;
  title?: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius_km: number;
  status: "open" | "matched" | "completed" | "expired" | "cancelled";
  expires_at: string;
  created_at: string;
};
