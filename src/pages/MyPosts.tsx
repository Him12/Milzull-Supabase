// src/pages/MyPosts.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";
import { User } from "@supabase/supabase-js";

type Post = {
  id: string;
  content: string;
  created_at: string;
  media_url: string | null;
  media_type: "text" | "image" | "video";
};

export default function MyPosts({
  user,
  onBack
}: {
  user: User;
  onBack: () => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  async function fetchMyPosts() {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });

    setPosts(data || []);
  }

  return (
    <div className="space-y-4">

      <button onClick={onBack} className="flex items-center gap-2 text-blue-600">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h2 className="text-2xl font-bold">My Posts</h2>

      {posts.length === 0 && (
        <div className="bg-white p-6 rounded-xl text-center text-gray-500">
          You haven’t posted anything yet.
        </div>
      )}

      {posts.map(p => (
        <div key={p.id} className="bg-white border rounded-xl p-4">
          <p>{p.content}</p>

          {p.media_type === "image" && p.media_url && (
            <img src={p.media_url} className="mt-3 rounded-lg" />
          )}

          {p.media_type === "video" && p.media_url && (
            <video src={p.media_url} controls className="mt-3 rounded-lg w-full" />
          )}

          <p className="text-xs text-gray-500 mt-2">
            {new Date(p.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
