import { useEffect, useState } from "react";
import { X } from "lucide-react";

type TermsSection = {
  heading: string;
  points: string[];
};

type TermsData = {
  title: string;
  lastUpdated: string;
  sections: TermsSection[];
};

export default function TermsModal({
  onAccept,
  onClose
}: {
  onAccept: () => void;
  onClose: () => void;
}) {
  const [terms, setTerms] = useState<TermsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/termsAndConditions.json")
      .then(res => res.json())
      .then(data => setTerms(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl">
          Loading terms…
        </div>
      </div>
    );
  }

  if (!terms) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white max-w-2xl w-full p-6 rounded-xl relative">

        {/* ❌ Close (allow other tabs) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X />
        </button>

        <h3 className="text-xl font-bold mb-1">
          {terms.title}
        </h3>

        <p className="text-xs text-gray-500 mb-4">
          Last Updated: {terms.lastUpdated}
        </p>

        {/* SCROLLABLE TERMS */}
        <div className="max-h-[60vh] overflow-y-auto space-y-5 text-sm text-gray-700 pr-2">
          {terms.sections.map((section, i) => (
            <div key={i}>
              <h4 className="font-semibold mb-2">
                {section.heading}
              </h4>
              <ul className="list-disc ml-5 space-y-1">
                {section.points.map((point, j) => (
                  <li key={j}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ACCEPT */}
        <button
          onClick={onAccept}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl"
        >
          I Agree & Continue
        </button>
      </div>
    </div>
  );
}
