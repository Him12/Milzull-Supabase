
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import MilzullFeedbackModal from "../MilzullFeedbackModal";

/* ================= TYPES ================= */

type Sender = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender: Sender | null;
};

/* ================= COMPONENT ================= */

export function ChatWindow({
  chatId,
  userId
}: {
  chatId: string;
  userId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  const [chatStatus, setChatStatus] =
    useState<"active" | "awaiting_feedback" | "closed">("active");

  const [showFeedback, setShowFeedback] = useState(false);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);

  const [serviceId, setServiceId] = useState<string | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  /* ================= LOADERS ================= */

  async function loadMessages() {
    const { data } = await supabase
      .from("messages")
      .select(`
        id,
        chat_id,
        sender_id,
        message,
        created_at,
        sender:profiles (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq("chat_id", chatId)
      .order("created_at");

    setMessages((data as Message[]) || []);
  }

  async function markMessagesRead() {
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("chat_id", chatId)
      .neq("sender_id", userId)
      .is("read_at", null);
  }

  async function loadChatMeta() {
    const { data } = await supabase
      .from("milzull_chats")
      .select("status, service_id")
      .eq("id", chatId)
      .single();

    if (data) {
      setChatStatus(data.status);
      setServiceId(data.service_id);
    }
  }

  async function loadOtherUser(serviceId: string) {
    const { data } = await supabase
      .from("milzull_interests")
      .select("user_id")
      .eq("service_id", serviceId)
      .eq("status", "approved")
      .limit(1)
      .single();

    if (data?.user_id) {
      setOtherUserId(data.user_id);
    }
  }

  async function checkFeedbackStatus(): Promise<boolean> {
    const { data } = await supabase
      .from("milzull_feedback")
      .select("id")
      .eq("chat_id", chatId)
      .eq("from_user_id", userId)
      .maybeSingle();

    const submitted = !!data;
    setHasSubmittedFeedback(submitted);
    return submitted;
  }


  /* ================= INITIAL LOAD + REALTIME ================= */

  useEffect(() => {
    if (!chatId || !userId) return;

    loadMessages();
    markMessagesRead();
    loadMessages();
    markMessagesRead();

    (async () => {
      await loadChatMeta();
      await checkFeedbackStatus();
    })();



    const messageChannel = supabase
      .channel(`chat-messages-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`
        },
        async () => {
          await loadMessages();
          await markMessagesRead();
        }
      )
      .subscribe();

    const statusChannel = supabase
      .channel(`chat-status-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "milzull_chats",
          filter: `id=eq.${chatId}`
        },
        payload => {
          if (payload.new?.status) {
            setChatStatus(payload.new.status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(statusChannel);
    };
  }, [chatId, userId]);

  /* ================= LOAD OTHER USER ================= */

  useEffect(() => {
    if (serviceId) {
      loadOtherUser(serviceId);
    }
  }, [serviceId]);

  /* ================= FEEDBACK SYNC (FIX) ================= */

  // 🔥 Re-check feedback when chat moves to awaiting_feedback
  useEffect(() => {
    if (chatStatus === "awaiting_feedback") {
      checkFeedbackStatus();
    }
  }, [chatStatus]);

  // 🔥 Show feedback modal instantly when needed
  useEffect(() => {
  if (
    chatStatus === "awaiting_feedback" &&
    hasSubmittedFeedback === false
  ) {
    setShowFeedback(true);
  } else {
    setShowFeedback(false);
  }
}, [chatStatus, hasSubmittedFeedback]);


  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */

  async function send() {
    if (chatStatus !== "active") return;
    if (!text.trim()) return;

    await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: userId,
      message: text
    });

    setText("");
  }

  /* ================= END MILZULL (FIXED) ================= */

  async function endMilzull() {
    await supabase.rpc("close_milzull_chat", {
      p_chat_id: chatId,
      p_user_id: userId
    });

    // 🔥 OPTIMISTIC UI UPDATE (NO REFRESH NEEDED)
    setChatStatus("awaiting_feedback");
    setShowFeedback(true);
  }

  /* ================= UI ================= */

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white rounded-xl border">

      {/* END MILZULL */}
      {chatStatus === "active" && (
        <button
          onClick={endMilzull}
          className="bg-red-600 text-white px-4 py-2 rounded m-2"
        >
          End Milzull
        </button>
      )}

      {/* MESSAGES */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.map(m => {
          const isMe = m.sender_id === userId;

          return (
            <div key={m.id} className={isMe ? "ml-auto text-right" : ""}>
              {!isMe && (
                <p className="text-xs text-gray-500 mb-1">
                  {m.sender?.display_name || "User"}
                </p>
              )}

              <div
                className={`inline-block max-w-[75%] px-4 py-2 rounded-xl text-sm ${isMe
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-900"
                  }`}
              >
                {m.message}
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      {chatStatus === "active" ? (
        <div className="border-t p-3 flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message…"
          />
          <button
            onClick={send}
            className="bg-blue-600 text-white px-4 rounded-lg"
          >
            Send
          </button>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          Chat closed. Please submit feedback.
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {showFeedback && serviceId && otherUserId && (
        <MilzullFeedbackModal
          chatId={chatId}
          serviceId={serviceId}
          fromUserId={userId}
          toUserId={otherUserId}
          onDone={() => {
            setShowFeedback(false);
            setHasSubmittedFeedback(true);
          }}
        />
      )}
    </div>
  );
}
