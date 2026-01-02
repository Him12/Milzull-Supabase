import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabaseClient";
import { Bell, MessageCircle } from "lucide-react";

import Post from "./pages/Post";
import Find from "./pages/Find";
import Services from "./pages/Services";
import Personalize from "./pages/Personalize";
import Profile from "./pages/Profile";
import MyPosts from "./pages/MyPosts";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navigation from "./components/Navigation";

/* ================= TYPES ================= */
export type MainPage =
  | "post"
  | "find"
  | "services"
  | "personalize"
  | "profile"
  | "my-posts";

/* ================= APP ================= */
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);

  const [authPage, setAuthPage] =
    useState<"login" | "register">("login");

  const [mainPage, setMainPage] =
    useState<MainPage>("post");

  const [selectedService, setSelectedService] =
    useState<string | null>(null);

  // ⭐ NEW: used to open OTHER user's profile
  const [viewProfileId, setViewProfileId] =
    useState<string | null>(null);

  /* ================= AUTH ================= */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setIsAuth(!!data.session?.user);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ?? null);
        setIsAuth(!!session?.user);
      });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  /* ================= PAGE RENDER ================= */
  const renderPage = () => {
    if (!isAuth) {
      return authPage === "login" ? (
        <Login
          onLogin={() => setIsAuth(true)}
          goToRegister={() => setAuthPage("register")}
        />
      ) : (
        <Register onRegister={() => setAuthPage("login")} />
      );
    }

    // 🔒 HARD GUARD (fixes User | null everywhere)
    if (!user) {
      return <div>Loading...</div>;
    }

    switch (mainPage) {
      case "post":
        return (
          <Post
            user={user}
            onOpenProfile={(profileId) => {
              setViewProfileId(profileId);
              setMainPage("profile");
            }}
          />
        );

      case "my-posts":
        return (
          <MyPosts
            user={user}
            onBack={() => {
              setViewProfileId(null);
              setMainPage("profile");
            }}
          />
        );

      case "find":
        return (
          <Find
            onSelectService={(service) => {
              setSelectedService(service);
              setMainPage("services");
            }}
          />
        );

      case "services":
        return (
          <Services
            serviceType={selectedService}
            user={user}
            onBack={() => setMainPage("find")}
          />
        );

      case "personalize":
        return <Personalize user={user} />;

      case "profile":
        return (
          <Profile
            user={user}
            viewUserId={viewProfileId}
            onGoMyPosts={() => {
              setViewProfileId(null);
              setMainPage("my-posts");
            }}
            onLogout={async () => {
              await supabase.auth.signOut();
              setUser(null);
              setIsAuth(false);
              setAuthPage("login");
            }}
          />
        );

      default:
        return <Post user={user} />;
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">

      {isAuth && (
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
            <h1 className="text-2xl font-bold text-blue-600">
              Milzull
            </h1>
            <div className="flex gap-4">
              <Bell className="w-6 h-6 text-gray-600" />
              <MessageCircle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {renderPage()}
      </main>

      {isAuth && (
        <Navigation
          currentPage={
            mainPage === "services"
              ? "find"
              : mainPage === "my-posts"
              ? "profile"
              : mainPage
          }
          onNavigate={(page) => {
            if (page !== "profile") {
              setViewProfileId(null);
            }
            setMainPage(page);
          }}
        />
      )}
    </div>
  );
}

export default App;
