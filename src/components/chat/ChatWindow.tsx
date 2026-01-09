
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

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

export function ChatWindow({
  chatId,
  userId
}: {
  chatId: string;
  userId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);


  /* ================= LOAD ================= */
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


  /* ================= REALTIME + POLLING ================= */
  useEffect(() => {
  loadMessages();
  markMessagesRead();

  const channel = supabase
    .channel(`chat-${chatId}`)
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
        await markMessagesRead(); // ✅ critical
      }
    )
    .subscribe();

  const interval = setInterval(async () => {
    await loadMessages();
    await markMessagesRead(); // ✅ critical
  }, 1000);

  return () => {
    clearInterval(interval);
    supabase.removeChannel(channel);
  };
}, [chatId]);


  // useEffect(() => {
  //   bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [messages]);

  useEffect(() => {
  const el = listRef.current;
  if (!el) return;

  el.scrollTo({
    top: el.scrollHeight,
    behavior: "smooth"
  });
}, [messages]);

  /* ================= SEND ================= */
  async function send() {
    if (!text.trim()) return;

    await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: userId,
      message: text
    });

    setText("");
  }

  /* ================= UI ================= */
  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white rounded-xl border">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
        <div ref={bottomRef} />
      </div>

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
    </div>
  );
}

