// src/pages/Find.tsx
import {
  Coffee,
  Cloud,
  MapPin,
  Package,
  Utensils,
  Film,
  Dumbbell,
  Users
} from "lucide-react";

interface Activity {
  type: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

export default function Find({
  onSelectService
}: {
  onSelectService: (type: string) => void;
}) {
  const activities: Activity[] = [
    { type: "coffee", title: "Coffee", description: "Need a friend for coffee chat", icon: Coffee, color: "text-amber-600", bg: "bg-amber-50" },
    { type: "tea", title: "Tea Time", description: "Looking for a tea buddy", icon: Cloud, color: "text-green-600", bg: "bg-green-50" },
    { type: "picnic", title: "Picnic", description: "Join me for a picnic outing", icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
    { type: "moving", title: "Room Shifting", description: "Help needed with moving", icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
    { type: "dining", title: "Dining Out", description: "Looking for a dinner companion", icon: Utensils, color: "text-red-600", bg: "bg-red-50" },
    { type: "movie", title: "Movie Night", description: "Want to catch a movie together", icon: Film, color: "text-indigo-600", bg: "bg-indigo-50" },
    { type: "workout", title: "Workout Buddy", description: "Need a gym partner", icon: Dumbbell, color: "text-orange-600", bg: "bg-orange-50" },
    { type: "other", title: "Other Tasks", description: "Any other activity or help", icon: Users, color: "text-gray-600", bg: "bg-gray-50" }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Find Friends</h2>
        <p className="text-gray-600">Choose an activity</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map(a => {
          const Icon = a.icon;
          return (
            <button
              key={a.type}
              onClick={() => onSelectService(a.type)}
              className="bg-white border rounded-2xl p-6 text-left hover:shadow-lg transition"
            >
              <div className={`w-14 h-14 ${a.bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-7 h-7 ${a.color}`} />
              </div>
              <h3 className="font-semibold">{a.title}</h3>
              <p className="text-sm text-gray-600">{a.description}</p>
              <span className={`text-xs font-semibold ${a.color}`}>View →</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
