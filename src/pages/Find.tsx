

import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { PlusCircle, HelpCircle } from "lucide-react";
import { fetchServiceTypes, ServiceType } from "../lib/serviceTypes";

export default function Find({
  onSelectService
}: {
  onSelectService: (type: string) => void;
}) {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServiceTypes().then(({ data, error }) => {
      if (error) setError("Failed to load services");
      else setServices(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-center py-10">Loading…</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Find Friends</h2>
        <p className="text-gray-600">Choose an activity</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(service => {
          const Icon =
            (Icons as any)[service.icon] || HelpCircle;

          return (
            <button
              key={service.id}
              onClick={() => onSelectService(service.type)}
              className="bg-white border rounded-2xl p-6 text-left hover:shadow-lg"
            >
              <div className={`w-14 h-14 ${service.bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-7 h-7 ${service.color}`} />
              </div>

              <h3 className="font-semibold">{service.title}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
            </button>
          );
        })}

        {/* OTHER */}
        <button
          onClick={() => onSelectService("other")}
          className="bg-white border-2 border-dashed rounded-2xl p-6 text-left"
        >
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
            <PlusCircle className="w-7 h-7 text-gray-500" />
          </div>

          <h3 className="font-semibold">Other</h3>
          <p className="text-sm text-gray-600">
            Didn’t find your activity? Request one.
          </p>
        </button>
      </div>
    </div>
  );
}
