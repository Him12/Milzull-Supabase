import { supabase } from "../lib/supabaseClient";

export async function getOrCreateChat(serviceId: string) {
  const { data, error } = await supabase.rpc("get_or_create_chat", {
    p_service_id: serviceId
  });

  if (error) throw error;
  return data as string;
}

export async function fetchMessages(chatId: string) {
  return supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at");
}

export async function sendMessage(
  chatId: string,
  senderId: string,
  message: string
) {
  return supabase.from("messages").insert({
    chat_id: chatId,
    sender_id: senderId,
    message
  });
}
