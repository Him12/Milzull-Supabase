// src/components/InterestedModal.tsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { X } from "lucide-react";

export default function InterestedModal({
  serviceId,
  userId,
  onClose,
  onSubmitted
}: {
  serviceId: string;
  userId: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitInterest() {
    setLoading(true);

    const { error } = await supabase
      .from("milzull_interests")
      .insert({
        service_id: serviceId,
        user_id: userId,
        message
      });

    setLoading(false);

    if (error) {
      alert("Already interested or failed");
      return;
    }

    onSubmitted();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6">

        <div className="flex justify-between mb-4">
          <h3 className="font-semibold">Show Interest</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Optional message (why you're interested)"
          className="w-full border rounded p-3 mb-4"
          rows={3}
        />

        <button
          onClick={submitInterest}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold"
        >
          {loading ? "Submitting..." : "I'm Interested"}
        </button>
      </div>
    </div>
  );
}
