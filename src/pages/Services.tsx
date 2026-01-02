// src/pages/Services.tsx
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import CreateServiceModal from "../components/CreateServiceModal";

type ServiceRequest = {
  id: string;
  service_type: string;
  state: string;
  city: string;
  radius_km: number;
  note: string | null;
  created_at: string;
  created_by: string;
};

const STATES = {
  Karnataka: ["Bengaluru", "Mysuru"],
  Maharashtra: ["Mumbai", "Pune"],
  Delhi: ["New Delhi"],
  UP: ["Lucknow", "Noida"]
};

export default function Services({
  serviceType,
  user,
  onBack
}: {
  serviceType: string | null;
  user: User | null;
  onBack: () => void;
}) {
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [interestedIds, setInterestedIds] = useState<string[]>([]);

  useEffect(() => {
    if (state && city) {
      fetchRequests();
      fetchMyInterests();
    }
  }, [state, city]);

  async function fetchRequests() {
    if (!serviceType || !user) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("milzull_services")
      .select("*")
      .eq("service_type", serviceType)
      .eq("state", state)
      .eq("city", city)
      .eq("status", "open")
      .neq("created_by", user.id) // ✅ creator does NOT see own
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch services", error);
      setLoading(false);
      return;
    }

    setRequests(data || []);
    setLoading(false);
  }

  async function fetchMyInterests() {
    if (!user) return;

    const { data } = await supabase
      .from("milzull_interests")
      .select("service_id")
      .eq("user_id", user.id);

    setInterestedIds((data || []).map(d => d.service_id));
  }

  async function markInterested(serviceId: string) {
    if (!user) return;

    const { error } = await supabase
      .from("milzull_interests")
      .insert({
        service_id: serviceId,
        user_id: user.id,
        status: "pending"
      });

    if (error) {
      alert(error.message);
      return;
    }

    fetchMyInterests();
  }

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-xl text-center">
        Please login to view services.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* BACK */}
      <button onClick={onBack} className="text-blue-600 text-sm">
        ← Back to Find
      </button>

      {/* HEADER */}
      <h2 className="text-2xl font-bold capitalize">
        {serviceType} Requests
      </h2>

      {/* FILTERS */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <select
          value={state}
          onChange={e => {
            setState(e.target.value);
            setCity("");
          }}
          className="w-full border rounded p-2"
        >
          <option value="">Select State</option>
          {Object.keys(STATES).map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          value={city}
          onChange={e => setCity(e.target.value)}
          disabled={!state}
          className="w-full border rounded p-2"
        >
          <option value="">Select City</option>
          {state &&
            STATES[state as keyof typeof STATES].map(c => (
              <option key={c}>{c}</option>
            ))}
        </select>
      </div>

      {/* CREATE */}
      <button
        onClick={() => setShowCreate(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
      >
        + Start Milzull
      </button>

      {/* LIST */}
      {loading && (
        <div className="bg-white p-6 rounded-xl text-center text-gray-500">
          Loading requests…
        </div>
      )}

      {!loading && requests.length === 0 && state && city && (
        <div className="bg-white p-6 rounded-xl text-center text-gray-600">
          No active requests in {city}
        </div>
      )}

      <div className="space-y-4">
        {requests.map(r => {
          const alreadyInterested = interestedIds.includes(r.id);

          return (
            <div
              key={r.id}
              className="bg-white border rounded-xl p-4 shadow-sm"
            >
              <div className="flex justify-between text-sm text-gray-500">
                <span>{r.city}</span>
                <span>{r.radius_km} km</span>
              </div>

              <p className="mt-2 text-gray-800">
                {r.note || "No additional note"}
              </p>

              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleString()}
                </span>

                <button
                  disabled={alreadyInterested}
                  onClick={() => markInterested(r.id)}
                  className={`px-4 py-1 rounded text-sm font-semibold ${
                    alreadyInterested
                      ? "bg-gray-200 text-gray-500"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {alreadyInterested ? "Interested ✓" : "I'm Interested"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <CreateServiceModal
          serviceType={serviceType!}
          userId={user.id}
          onClose={() => setShowCreate(false)}
          onCreated={fetchRequests}
        />
      )}
    </div>
  );
}
