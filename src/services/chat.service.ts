import { supabase } from "../lib/supabaseClient";

type GetOrCreateChatArgs = {
  serviceId: string;
  creatorId: string;
  memberIds: string[];
  isGroup: boolean;
};

export async function getOrCreateChat({
  serviceId,
  creatorId,
  memberIds,
  isGroup
}: GetOrCreateChatArgs): Promise<string> {
  const { data, error } = await supabase.rpc("get_or_create_chat", {
    p_service_id: serviceId,
    p_creator_id: creatorId,
    p_member_ids: memberIds,
    p_is_group: isGroup
  });

  if (error) {
    console.error("RPC error:", error);
    throw error;
  }

  return data;
}
