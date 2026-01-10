
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft } from "lucide-react";
import { User } from "@supabase/supabase-js";

/* ================= TYPES ================= */

type AuthorProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

type Post = {
  id: string;
  content: string | null;
  created_at: string;
  media_url: string | null;
  media_type: "text" | "image" | "video" | null;
  profiles: AuthorProfile | null;
};

/* ================= COMPONENT ================= */

export default function MyPosts({
  user,
  viewUserId,
  onBack
}: {
  user: User;
  viewUserId: string | null;
  onBack: () => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const authorId = viewUserId ?? user.id;

  useEffect(() => {
    fetchPosts();
  }, [authorId]);

  async function fetchPosts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        created_at,
        media_url,
        media_type,
        profiles:author_id (
          id,
          display_name,
          username,
          avatar_url
        )
      `)
      .eq("author_id", authorId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } else {
      setPosts(data || []);
    }

    setLoading(false);
  }

  const authorProfile = posts[0]?.profiles;

  const pageTitle = authorProfile?.display_name
    ? `${authorProfile.display_name}'s Posts`
    : authorProfile?.username
      ? `@${authorProfile.username}'s Posts`
      : viewUserId && viewUserId !== user.id
        ? "User Posts"
        : "My Posts";

  /* ================= UI ================= */

  return (
    <div className="space-y-4">

      {/* ===== BACK ===== */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* ===== HEADER ===== */}
      <h2 className="text-2xl font-bold">{pageTitle}</h2>

      {/* ===== LOADING ===== */}
      {loading && (
        <div className="bg-white p-6 rounded-xl text-center text-gray-500">
          Loading posts...
        </div>
      )}

      {/* ===== EMPTY STATE ===== */}
      {!loading && posts.length === 0 && (
        <div className="bg-white p-6 rounded-xl text-center text-gray-500">
          {viewUserId && viewUserId !== user.id
            ? "This user hasn’t posted anything yet."
            : "You haven’t posted anything yet."}
        </div>
      )}

      {/* ===== POSTS ===== */}
      {posts.map(post => (
        <div
          key={post.id}
          className="bg-white border rounded-xl p-4 space-y-2"
        >
          {/* Content */}
          {post.content && <p>{post.content}</p>}

          {/* Image */}
          {post.media_type === "image" && post.media_url && (
            <img
              src={post.media_url}
              alt="Post media"
              className="rounded-lg mt-2"
            />
          )}

          {/* Video */}
          {post.media_type === "video" && post.media_url && (
            <video
              src={post.media_url}
              controls
              className="rounded-lg w-full mt-2"
            />
          )}

          {/* Date */}
          <p className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
