// src/pages/Notifications.tsx
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

/* ===============================
   TYPES
=============================== */

type NotificationStatus = "pending" | "approved" | "rejected";

type NotificationItem = {
  id: string;
  service_id: string;
  service_type: string;
  requester_name: string;
  status: NotificationStatus;
  created_at: string;
};

/**
 * Actual Supabase response shape
 * IMPORTANT: relations are ARRAYS
 */
type InterestRow = {
  id: string;
  status: NotificationStatus;
  created_at: string;
  milzull_services: {
    id: string;
    service_type: string;
    created_by: string;
    profiles: {
      username: string;
    }[];
  }[];
};

/* ===============================
   COMPONENT
=============================== */

export default function Notifications({ user }: { user: User | null }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user]);

  /* ===============================
     FETCH NOTIFICATIONS
  =============================== */
  async function fetchNotifications() {
    if (!user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("milzull_interests")
      .select(`
        id,
        status,
        created_at,
        milzull_services (
          id,
          service_type,
          created_by,
          profiles:created_by (
            username
          )
        )
      `)
      .eq("milzull_services.created_by", user.id);

    if (error) {
      console.error("Failed to fetch notifications", error);
      setLoading(false);
      return;
    }

    const mapped: NotificationItem[] =
      (data as InterestRow[] | null)?.map((row) => {
        const service = row.milzull_services[0];
        const profile = service?.profiles?.[0];

        return {
          id: row.id,
          service_id: service?.id ?? "",
          service_type: service?.service_type ?? "",
          requester_name: profile?.username ?? "Unknown",
          status: row.status,
          created_at: row.created_at
        };
      }) || [];

    setItems(mapped);
    setLoading(false);
  }

  /* ===============================
     UPDATE STATUS
  =============================== */
  async function updateStatus(
    id: string,
    status: Exclude<NotificationStatus, "pending">
  ) {
    await supabase
      .from("milzull_interests")
      .update({ status })
      .eq("id", id);

    fetchNotifications();
  }

  /* ===============================
     UI
  =============================== */
  if (!user) {
    return (
      <div className="bg-white p-6 rounded-xl text-center text-gray-500">
        Please login to see notifications
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Notifications</h2>

      {loading && (
        <div className="bg-white p-6 rounded-xl text-center text-gray-500">
          Loading notifications...
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="bg-white p-6 rounded-xl text-center text-gray-500">
          No notifications yet
        </div>
      )}

      {!loading &&
        items.map((n) => (
          <div
            key={n.id}
            className="bg-white border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">
                <span className="font-semibold">{n.requester_name}</span>{" "}
                is interested in your{" "}
                <span className="capitalize font-semibold">
                  {n.service_type}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>

            {n.status === "pending" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(n.id, "approved")}
                  className="bg-green-600 text-white px-4 py-1 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(n.id, "rejected")}
                  className="bg-red-500 text-white px-4 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            ) : (
              <span
                className={`text-sm font-semibold ${
                  n.status === "approved"
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {n.status.toUpperCase()}
              </span>
            )}
          </div>
        ))}
    </div>
  );
}
