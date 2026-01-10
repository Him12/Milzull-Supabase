
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

/* ================= TYPES ================= */

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type ChatRow = {
  id: string;
  created_at: string;
  service_id: string;
  creator_id: string;
  approved_user_id: string;
  status: "active" | "awaiting_feedback" | "closed";
  other_user?: Profile;
};

/* ================= COMPONENT ================= */

export default function Chats({
  user,
  onOpenChat,
  onOpenProfile
}: {
  user: User;
  onOpenChat: (chatId: string) => void;
  onOpenProfile: (userId: string) => void;
}) {
  const [chats, setChats] = useState<ChatRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();

    // realtime updates for chat status
    const channel = supabase
      .channel("milzull-chats-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "milzull_chats"
        },
        () => {
          loadChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadChats() {
    setLoading(true);

    /* 1️⃣ Fetch chats with status */
    const { data: chatRows, error } = await supabase
      .from("milzull_chats")
      .select(`
        id,
        created_at,
        service_id,
        status,
        milzull_services (
          creator_id
        )
      `)
      .order("created_at", { ascending: false });

    if (error || !chatRows) {
      console.error(error);
      setLoading(false);
      return;
    }

    /* 2️⃣ Approved interests */
    const serviceIds = chatRows.map((c: any) => c.service_id);

    const { data: interests } = await supabase
      .from("milzull_interests")
      .select("service_id, user_id")
      .eq("status", "approved")
      .in("service_id", serviceIds);

    /* 3️⃣ Normalize */
    const normalized: ChatRow[] = chatRows.map((c: any) => {
      const approved = interests?.find(
        i => i.service_id === c.service_id
      );

      return {
        id: c.id,
        created_at: c.created_at,
        service_id: c.service_id,
        creator_id: c.milzull_services.creator_id,
        approved_user_id: approved?.user_id || "",
        status: c.status
      };
    });

    /* 4️⃣ Resolve other user */
    const otherUserIds = Array.from(
      new Set(
        normalized.map(c =>
          c.creator_id === user.id
            ? c.approved_user_id
            : c.creator_id
        )
      )
    ).filter(Boolean);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", otherUserIds);

    /* 5️⃣ Merge */
    const finalChats = normalized.map(chat => {
      const otherUserId =
        chat.creator_id === user.id
          ? chat.approved_user_id
          : chat.creator_id;

      return {
        ...chat,
        other_user: profiles?.find(p => p.id === otherUserId)
      };
    });

    setChats(finalChats);
    setLoading(false);
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Chats</h2>

      {loading && <p className="text-gray-500">Loading chats…</p>}

      {!loading && chats.length === 0 && (
        <p className="text-gray-500">No chats yet</p>
      )}

      {chats.map(chat => (
        <div
          key={chat.id}
          className="bg-white border rounded-xl p-4 flex justify-between items-center"
        >
          {/* LEFT */}
          <div
            className="cursor-pointer"
            onClick={() =>
              chat.other_user &&
              onOpenProfile(chat.other_user.id)
            }
          >
            <p className="font-semibold">
              {chat.other_user?.display_name || "User"}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(chat.created_at).toLocaleString()}
            </p>
          </div>

          {/* RIGHT */}
          <button
            onClick={() => onOpenChat(chat.id)}
            className={`font-medium text-sm ${
              chat.status === "active"
                ? "text-blue-600"
                : chat.status === "awaiting_feedback"
                ? "text-orange-600"
                : "text-gray-400"
            }`}
          >
            {chat.status === "active"
              ? "Open"
              : chat.status === "awaiting_feedback"
              ? "Feedback Pending"
              : "Closed"}
          </button>
        </div>
      ))}
    </div>
  );
}
