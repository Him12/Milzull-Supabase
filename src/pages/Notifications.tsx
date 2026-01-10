
import { useEffect, useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { getOrCreateChat } from "../services/chat.service";


/* ================= TYPES ================= */

type Notification = {
  id: number;
  user_id: string;
  from_user_id: string | null;
  type: string;
  title: string;
  message: string;
  service_id: string | null;
  milzull_service_id: string | null;
  created_at: string;
  is_read: boolean;

  service?: {
    id: string;
    note: string | null;
    city: string;
    state: string;
    service_type: string;
  } | null;
};

/* ================= COMPONENT ================= */

export default function Notifications({
  user,
  onOpenChat,
  onOpenProfile
}: {
  user: User;
  onOpenChat: (chatId: string) => void;
  onOpenProfile: (userId: string) => void;
}) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchingRef = useRef(false);

  /* ================= FETCH ================= */

  async function fetchNotifications(silent = false) {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    if (!silent) setLoading(true);

    const { data } = await supabase
      .from("milzull_notifications")
      .select(`
        id,
        user_id,
        from_user_id,
        type,
        title,
        message,
        service_id,
        milzull_service_id,
        created_at,
        is_read,
        milzull_services (
          id,
          note,
          city,
          state,
          service_type
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const normalized =
      data?.map((n: any) => ({
        ...n,
        service: n.milzull_services || null
      })) || [];

    setItems(normalized);
    setLoading(false);
    fetchingRef.current = false;
  }

  /* ================= AUTO REFRESH ================= */

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  /* ================= MARK READ ================= */

  useEffect(() => {
    supabase
      .from("milzull_notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  }, [user]);

  /* ================= ACTIONS ================= */

  async function deleteNotification(id: number) {
    await supabase.from("milzull_notifications").delete().eq("id", id);
    setItems(prev => prev.filter(n => n.id !== id));
  }

  async function approveService(n: Notification) {
    const serviceId =
      n.service_id ||
      n.milzull_service_id ||
      n.service?.id;

    if (!serviceId) return;

    await supabase.from("milzull_interests").insert({
      service_id: serviceId,
      user_id: user.id,
      status: "approved"
    });

    deleteNotification(n.id);
  }

  async function startChat(n: Notification) {
  const serviceId =
    n.service_id ||
    n.milzull_service_id ||
    n.service?.id;

  if (!serviceId || !n.from_user_id) return;

  try {
    const chatId = await getOrCreateChat({
      serviceId,
      creatorId: user.id,
      memberIds: [user.id, n.from_user_id], // ✅ 1-1 chat
      isGroup: false
    });

    onOpenChat(chatId);
    deleteNotification(n.id);
  } catch (err) {
    console.error("Failed to start chat from notification", err);
  }
}


  /* ================= UI ================= */

  if (loading) return <p>Loading notifications...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Notifications</h2>

      {items.length === 0 && (
        <p className="text-gray-500">No notifications</p>
      )}

      {items.map(n => (
        <div
          key={n.id}
          className="bg-white border rounded-xl p-4 flex justify-between gap-4"
        >
          {/* LEFT */}
          <div className="space-y-1">
            <h3 className="font-semibold">{n.title}</h3>

            <p className="text-sm text-gray-600">
              {n.message}
            </p>

            {n.service?.note && (
              <p className="text-sm italic text-gray-800">
                📍 {n.service.note}
              </p>
            )}

            {n.service && (
              <p className="text-xs text-gray-400">
                {n.service.city}, {n.service.state}
              </p>
            )}

            <p className="text-xs text-gray-400">
              {new Date(n.created_at).toLocaleString()}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-2">
            {n.from_user_id && (
              <button
                onClick={() => onOpenProfile(n.from_user_id!)}
                className="bg-gray-200 px-3 py-1 rounded text-sm"
              >
                View Profile
              </button>
            )}

            {(n.type === "milzull" || n.type === "milzull_new") && (
              <button
                onClick={() => approveService(n)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Approve
              </button>
            )}

            {(n.type === "approved" || n.type === "milzull_interest" || n.type === "chat") && (
              <button
                onClick={() => startChat(n)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Start Chat
              </button>
            )}

            <button
              onClick={() => deleteNotification(n.id)}
              className="bg-gray-300 px-3 py-1 rounded text-sm"
            >
              Ignore
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
