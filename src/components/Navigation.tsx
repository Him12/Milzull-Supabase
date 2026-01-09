
import { Home, Search, Heart, User } from "lucide-react";

/* ================= TYPES ================= */
export type NavPage =
  | "post"
  | "find"
  | "personalize"
  | "profile";

interface NavigationProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
}

/* ================= COMPONENT ================= */
function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems = [
    { id: "post" as const, label: "Post", icon: Home },
    { id: "find" as const, label: "Milzull", icon: Search },
    { id: "personalize" as const, label: "Homies", icon: Heart },
    { id: "profile" as const, label: "Profile", icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center py-3 px-2 transition-all duration-200 ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`w-6 h-6 mb-1 transition-transform ${
                    isActive ? "scale-110" : "scale-100"
                  }`}
                />
                <span className="text-xs font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
