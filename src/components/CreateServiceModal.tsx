
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type StateRow = { id: number; name: string };
type CityRow = { id: number; name: string; state_id: number };

export default function CreateServiceModal({
  serviceType,
  userId,
  onClose,
  onCreated
}: any) {
  const isOther = serviceType === "other";

  const [states, setStates] = useState<StateRow[]>([]);
  const [cities, setCities] = useState<CityRow[]>([]);

  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [km, setKm] = useState(3);
  const [note, setNote] = useState("");

  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("states").select("id,name").then(r => setStates(r.data || []));
  }, []);

  async function loadCities(stateName: string) {
    const s = states.find(x => x.name === stateName);
    if (!s) return;
    const { data } = await supabase
      .from("cities")
      .select("id,name,state_id")
      .eq("state_id", s.id);
    setCities(data || []);
  }

  async function create() {
    if (!state || !city) return alert("Select state & city");
    if (isOther && !customTitle.trim()) return alert("Enter service name");

    setLoading(true);

    /* 🔹 STEP 1: CREATE REQUEST (SAFE TABLE) */
    if (isOther) {
      await supabase.from("milzull_service_requests").insert({
        user_id: userId,
        requested_title: customTitle,
        requested_description: customDescription || null,
        state,
        city,
        km_range: km,
        note: note || null
      });
    }

    /* 🔹 STEP 2: CREATE MILZULL (PENDING IF OTHER) */
    const { error } = await supabase.from("milzull_services").insert({
      creator_id: userId,
      service_type: isOther ? "other" : serviceType,
      state,
      city,
      km_range: km,
      note: note || null,
      status: isOther ? "pending" : "active"
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
        <h3 className="font-bold">
          {isOther ? "Request New Service" : "Start Milzull"}
        </h3>

        {isOther && (
          <>
            <input
              className="w-full border p-2 rounded"
              placeholder="Service name"
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
            />
            <textarea
              className="w-full border p-2 rounded"
              placeholder="Description"
              value={customDescription}
              onChange={e => setCustomDescription(e.target.value)}
            />
          </>
        )}

        <select
          className="w-full border p-2 rounded"
          value={state}
          onChange={e => {
            setState(e.target.value);
            setCity("");
            loadCities(e.target.value);
          }}
        >
          <option value="">Select State</option>
          {states.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>

        <select
          className="w-full border p-2 rounded"
          value={city}
          onChange={e => setCity(e.target.value)}
        >
          <option value="">Select City</option>
          {cities.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        <input
          type="range"
          min={1}
          max={50}
          value={km}
          onChange={e => setKm(+e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Address / note"
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <button
          onClick={create}
          disabled={loading}
          className="bg-blue-600 text-white w-full py-3 rounded"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        <button onClick={onClose} className="w-full text-gray-500">
          Cancel
        </button>
      </div>
    </div>
  );
}
