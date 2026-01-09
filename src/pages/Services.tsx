
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import CreateServiceModal from "../components/CreateServiceModal";

export default function Services({
  serviceType,
  user,
  onBack
}: {
  serviceType: string | null;
  user: User;
  onBack: () => void;
}) {
  const [services, setServices] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !serviceType) return;

    setLoading(true);

    supabase
      .from("milzull_services")
      .select(`
        id,
        city,
        state,
        note,
        created_at,
        creator_id
      `)
      .eq("service_type", serviceType)
      .eq("state", user.user_metadata?.state)
      .eq("city", user.user_metadata?.city)
      .neq("creator_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setServices(data || []);
        setLoading(false);
      });
  }, [serviceType, user]);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-gray-600">
        ← Back
      </button>

      <h2 className="text-xl font-bold capitalize">
        {serviceType}
      </h2>

      <button
        onClick={() => setShowCreate(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Start Milzull
      </button>

      {loading && (
        <p className="text-gray-500">Loading services…</p>
      )}

      {!loading && services.length === 0 && (
        <p className="text-gray-500">
          No active milzulls nearby.
        </p>
      )}

      {services.map(s => (
        <div
          key={s.id}
          className="bg-white p-4 border rounded space-y-1"
        >
          <p className="font-medium">
            {s.city}, {s.state}
          </p>

          {s.note && (
            <p className="text-sm text-gray-700 italic">
              📍 {s.note}
            </p>
          )}

          <p className="text-xs text-gray-500">
            {new Date(s.created_at).toLocaleString()}
          </p>
        </div>
      ))}

      {showCreate && (
        <CreateServiceModal
          serviceType={serviceType!}
          userId={user.id}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            // refresh list after create
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}
