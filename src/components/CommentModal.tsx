
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { X } from "lucide-react";

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
};



type AuthUser = {
  id: string;
};

interface CommentModalProps {
  postId: string;
  user: AuthUser;
  onClose: () => void;
  onCommentAdded: () => void;
  onOpenProfile: (userId: string) => void;
}


export default function CommentModal({
  postId,
  user,
  onClose,
  onCommentAdded,
  onOpenProfile   //  THIS
}: CommentModalProps) {

  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");

  /* ===============================
     LOCK BACKGROUND SCROLL
  =============================== */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  async function fetchComments() {
  const { data, error } = await supabase
    .from("comments")
    .select(`
      id,
      content,
      created_at,
      user_id,
      profiles (
        id,
        display_name,
        username,
        avatar_url
      )
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Fetch comments failed:", error);
    return;
  }

  setComments(data || []);
}




  async function addComment() {
    if (!text.trim()) return;

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: user.id,
      content: text
    });

    if (!error) {
      await supabase.rpc("increment_post_comment_count", {
        p_post_id: postId
      });

      // 🔔 Notify post owner
      const { data: post } = await supabase
        .from("posts")
        .select("author_id")
        .eq("id", postId)
        .single();

      if (post?.author_id && post.author_id !== user.id) {
        await supabase.from("milzull_notifications").insert({
          user_id: post.author_id,
          from_user_id: user.id,
          type: "post_comment",
          title: "New comment",
          message: "Someone commented on your post",
          service_id: null
        });
      }

      setText("");
      fetchComments();
      onCommentAdded();
    }

  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-[999]">
      <div
        className="
          bg-white
          w-full
          sm:max-w-lg
          rounded-t-2xl sm:rounded-2xl
          p-6
          max-h-[85vh]
          flex
          flex-col
        "
        style={{
          paddingBottom: "calc(6rem + env(safe-area-inset-bottom))"
        }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Comments</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* COMMENTS LIST */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {comments.map(c => (
  <div key={c.id} className="bg-gray-100 p-3 rounded-lg text-sm space-y-1">
    
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => onOpenProfile(c.profiles.id)}
    >
      <img
        src={
          c.profiles.avatar_url ||
          `https://ui-avatars.com/api/?name=${c.profiles.display_name}`
        }
        className="w-7 h-7 rounded-full object-cover"
      />

      <div className="text-xs font-medium">
        {c.profiles.display_name || `@${c.profiles.username}`}
      </div>
    </div>

    <p className="text-sm">{c.content}</p>
  </div>
))}


          {comments.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              No comments yet
            </p>
          )}
        </div>

        {/* INPUT (STICKY & SAFE) */}
        <div className="sticky bottom-0 bg-white pt-3 mt-3">
          <div className="flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border rounded p-2"
            />
            <button
              onClick={addComment}
              className="bg-blue-600 text-white px-4 rounded"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
