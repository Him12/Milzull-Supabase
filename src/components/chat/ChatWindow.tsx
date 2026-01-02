import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export function ChatWindow({ chatId, userId }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    supabase
      .channel(`chat-${chatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", table: "messages", filter: `chat_id=eq.${chatId}` },
        payload => setMessages(m => [...m, payload.new])
      )
      .subscribe();

    loadMessages();
  }, []);

  async function loadMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at");

    setMessages(data || []);
  }

  async function send() {
    if (!text) return;

    await supabase.from("messages").insert({
      chat_id: chatId,
      sender_id: userId,
      message: text
    });

    setText("");
  }

  return (
    <div>
      {messages.map(m => (
        <p key={m.id}>{m.message}</p>
      ))}

      <input value={text} onChange={e => setText(e.target.value)} />
      <button onClick={send}>Send</button>
    </div>
  );
}
