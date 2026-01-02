// src/components/CreateServiceModal.tsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Props {
  serviceType: string;
  userId: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateServiceModal({
  serviceType,
  userId,
  onClose,
  onCreated
}: Props) {
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [distance, setDistance] = useState(3);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!state || !city) {
      alert("Please select state and city");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("milzull_services")
      .insert({
        service_type: serviceType,
        state,
        city,
        distance_km: distance,
        note,
        created_by: userId // 🔥 IMPORTANT
      });

    setLoading(false);

    if (error) {
      console.error("Create service failed:", error);
      alert(error.message); // SHOW REAL ERROR
      return;
    }

    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Start {serviceType}
          </h3>
          <button onClick={onClose}>✕</button>
        </div>

        <select
          className="w-full border p-2 rounded"
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          <option value="">Select State</option>
          <option value="Delhi">Delhi</option>
          <option value="Maharashtra">Maharashtra</option>
        </select>

        <select
          className="w-full border p-2 rounded"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">Select City</option>
          <option value="New Delhi">New Delhi</option>
          <option value="Mumbai">Mumbai</option>
        </select>

        <div>
          <label className="text-sm text-gray-600">
            Distance: {distance} km
          </label>
          <input
            type="range"
            min={1}
            max={50}
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Optional note (time, place, etc)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="bg-blue-600 text-white w-full py-3 rounded-xl font-semibold"
        >
          {loading ? "Starting..." : "Start Milzull"}
        </button>
      </div>
    </div>
  );
}
