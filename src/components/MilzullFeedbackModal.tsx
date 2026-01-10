import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

/* ================= COMPONENT ================= */

export default function MilzullFeedbackModal({
  chatId,
  serviceId,
  fromUserId,
  toUserId,
  onDone
}: {
  chatId: string;
  serviceId: string;
  fromUserId: string;
  toUserId: string;
  onDone: () => void;
}) {
  /* ================= STATE ================= */

  const [csatRating, setCsatRating] = useState<number>(5);
  const [personRating, setPersonRating] = useState<number>(5);

  const [serviceQuality, setServiceQuality] =
    useState<"excellent" | "good" | "average" | "poor">("excellent");

  const [behaviour, setBehaviour] =
    useState<"friendly" | "neutral" | "rude">("friendly");

  const [punctual, setPunctual] = useState<boolean>(true);
  const [feltSafe, setFeltSafe] = useState<boolean>(true);

  const [recommend, setRecommend] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);

  /* ================= SUBMIT ================= */

  async function submitFeedback() {
    if (submitting) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("milzull_feedback")
      .insert({
        chat_id: chatId,
        service_id: serviceId,
        from_user_id: fromUserId,
        to_user_id: toUserId,

        csat_rating: csatRating,
        person_rating: personRating,
        recommend: recommend,

        service_quality: serviceQuality,
        behaviour: behaviour,
        punctual: punctual,
        felt_safe: feltSafe,

        notes: notes || null
      });

    if (error) {
      console.error("Feedback insert failed:", error);
      alert("Failed to submit feedback. Please try again.");
      setSubmitting(false);
      return;
    }

    // finalize chat if both users submitted feedback
    await supabase.rpc("finalize_milzull_if_complete", {
      p_chat_id: chatId
    });

    setSubmitting(false);
    onDone();
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-5">

        <h2 className="text-lg font-bold">Milzull Feedback</h2>

        {/* CSAT */}
        <div>
          <label className="block text-sm font-medium mb-1">
            How was the overall service experience?
          </label>
          <input
            type="range"
            min={0}
            max={5}
            value={csatRating}
            onChange={e => setCsatRating(+e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Rating: {csatRating} / 5
          </p>
        </div>

        {/* PERSON RATING */}
        <div>
          <label className="block text-sm font-medium mb-1">
            How would you rate the other person?
          </label>
          <input
            type="range"
            min={0}
            max={5}
            value={personRating}
            onChange={e => setPersonRating(+e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Rating: {personRating} / 5
          </p>
        </div>

        {/* SERVICE QUALITY */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Service quality
          </label>
          <select
            className="w-full border rounded p-2"
            value={serviceQuality}
            onChange={e =>
              setServiceQuality(e.target.value as any)
            }
          >
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="average">Average</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        {/* BEHAVIOUR */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Other person’s behaviour
          </label>
          <select
            className="w-full border rounded p-2"
            value={behaviour}
            onChange={e =>
              setBehaviour(e.target.value as any)
            }
          >
            <option value="friendly">Friendly</option>
            <option value="neutral">Neutral</option>
            <option value="rude">Rude</option>
          </select>
        </div>

        {/* PUNCTUAL */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={punctual}
            onChange={e => setPunctual(e.target.checked)}
          />
          Was the person punctual?
        </label>

        {/* SAFETY */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={feltSafe}
            onChange={e => setFeltSafe(e.target.checked)}
          />
          Did you feel safe during the Milzull?
        </label>

        {/* RECOMMEND */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={recommend}
            onChange={e => setRecommend(e.target.checked)}
          />
          Would you recommend this person to others?
        </label>

        {/* NOTES */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Additional notes (optional)
          </label>
          <textarea
            className="w-full border rounded p-2"
            rows={3}
            placeholder="Anything else you want to share…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* SUBMIT */}
        <button
          onClick={submitFeedback}
          disabled={submitting}
          className={`w-full py-3 rounded text-white font-medium ${
            submitting ? "bg-gray-400" : "bg-blue-600"
          }`}
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}
