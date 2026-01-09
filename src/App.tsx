

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
import Notifications from "./pages/Notifications";
import ResetPassword from "./pages/Reset";
import Chats from "./pages/Chats";

import Navigation from "./components/Navigation";
import { ChatWindow } from "./components/chat/ChatWindow";

import Login from "./pages/Login";
import Register from "./pages/Register";
import TermsModal from "./components/TermsModal";


/* ================= TYPES ================= */
export type MainPage =
  | "post"
  | "find"
  | "services"
  | "personalize"
  | "profile"
  | "my-posts"
  | "notifications"
  | "chat"
  | "chat-window";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [authPage, setAuthPage] = useState<"login" | "register">("login");
  const [mainPage, setMainPage] = useState<MainPage>("post");

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [showTerms, setShowTerms] = useState(false);


  /* ================= AUTH ================= */
  useEffect(() => {
    const hash = window.location.hash;

    if (hash.includes("type=recovery")) {
      setIsPasswordRecovery(true);
      setIsAuth(false);
      setUser(null);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setIsAuth(!!data.session?.user);
    });
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsPasswordRecovery(true);
          setIsAuth(false);
          setUser(null);
          return;
        }

        setUser(session?.user ?? null);
        setIsAuth(!!session?.user);
      }
    );

    return () => listener?.subscription.unsubscribe();
  }, []);

  async function fetchNotificationCount(userId: string) {
    const { count } = await supabase
      .from("milzull_notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    setNotificationCount(count || 0);
  }

  async function fetchChatCount(userId: string) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .is("read_at", null)
      .neq("sender_id", userId);

    setChatCount(count || 0);
  }




  useEffect(() => {
    if (!user) return;

    fetchNotificationCount(user.id);
    fetchChatCount(user.id);

    const interval = setInterval(() => {
      fetchNotificationCount(user.id);
      fetchChatCount(user.id);
    }, 3000); // every 3 seconds

    return () => clearInterval(interval);
  }, [user]);

  async function markNotificationsRead(userId: string) {
    await supabase
      .from("milzull_notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    setNotificationCount(0);
  }



  async function hasAcceptedTerms(userId: string) {
    const { data } = await supabase
      .from("user_terms_acceptance")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    return !!data;
  }


  /* ================= PAGE RENDER ================= */
  const renderPage = () => {
    if (isPasswordRecovery) return <ResetPassword />;

    if (!isAuth) {
      return authPage === "login" ? (
        <Login
          onLogin={() => setIsAuth(true)}
          goToRegister={() => setAuthPage("register")}
        />
      ) : (
        <Register
          onRegister={() => setAuthPage("login")}
          goToLogin={() => setAuthPage("login")}
        />
      );
    }

    if (!user) return <p>Loading...</p>;

    switch (mainPage) {
      case "post":
        return (
          <Post
            user={user}
            viewUserId={viewProfileId}
            onOpenProfile={(id) => {
              setViewProfileId(id);
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

      case "profile":
        return (
          <Profile
            user={user}
            viewUserId={viewProfileId}
            onGoMyPosts={(id) => {
              setViewProfileId(id);
              setMainPage("my-posts");
            }}
            onLogout={async () => {
              await supabase.auth.signOut();
              setIsAuth(false);
              setUser(null);
              setAuthPage("login");
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

      case "notifications":
        return (
          <Notifications
            user={user}
            onOpenChat={(chatId) => {
              setActiveChatId(chatId);
              setMainPage("chat-window");
            }}
            onOpenProfile={(userId) => {
              setViewProfileId(userId);
              setMainPage("profile");
            }}
          />
        );

      case "chat":
        return (
          <Chats
            user={user}
            onOpenChat={(chatId) => {
              setActiveChatId(chatId);
              setMainPage("chat-window");
            }}
            onOpenProfile={(id) => {
              setViewProfileId(id);
              setMainPage("profile");
            }}
          />
        );


      case "chat-window":
        return activeChatId ? (
          <ChatWindow chatId={activeChatId} userId={user.id} />
        ) : (
          <p>No chat selected</p>
        );

      case "personalize":
        return <Personalize user={user} />;
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {isAuth && (
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Milzull</h1>

            <div className="flex gap-5 items-center">

              {/* 🔔 Notifications */}
              <div className="relative cursor-pointer"
                onClick={async () => {
                  if (user) {
                    await markNotificationsRead(user.id);
                  }
                  setMainPage("notifications");
                }}
              >
                <Bell />

                {notificationCount > 0 && (
                  <span className="
        absolute -top-1 -right-2
        bg-red-600 text-white
        text-[10px]
        min-w-[16px] h-[16px]
        flex items-center justify-center
        rounded-full
      ">
                    {notificationCount}
                  </span>
                )}
              </div>

              {/* 💬 Chats */}
              <div className="relative cursor-pointer"
                onClick={async () => {
                  if (user) {
                    await setMainPage("chat");
                    ;
                  }
                  setMainPage("chat");
                }}
              >
                <MessageCircle />

                {chatCount > 0 && (
                  <span className="
        absolute -top-1 -right-2
        bg-red-600 text-white
        text-[10px]
        min-w-[16px] h-[16px]
        flex items-center justify-center
        rounded-full
      ">
                    {chatCount}
                  </span>
                )}
              </div>

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
            mainPage === "chat" || mainPage === "chat-window"
              ? "find"          // ✅ NOT "milzull"
              : mainPage === "services"
                ? "find"
                : mainPage === "my-posts"
                  ? "profile"
                  : mainPage === "notifications"
                    ? "post"
                    : mainPage
          }
          onNavigate={async (page) => {
            if (!user) return;

            // 🔒 Protect Milzull tab
            if (page === "find") {
              const accepted = await hasAcceptedTerms(user.id);

              if (!accepted) {
                setShowTerms(true);
                return; // ❌ block navigation
              }
            }

            if (page !== "profile") setViewProfileId(null);
            setMainPage(page);
          }}

        />

      )}

      {showTerms && user && (
        <TermsModal
          onClose={() => setShowTerms(false)}
          onAccept={async () => {
            if (!user) return; // extra safety

            await supabase
              .from("user_terms_acceptance")
              .insert({ user_id: user.id });

            setShowTerms(false);
            setMainPage("find");
          }}
        />
      )}



    </div>
  );
}

export default App;
