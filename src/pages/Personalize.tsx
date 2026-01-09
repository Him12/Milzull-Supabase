// src/pages/Personalize.tsx
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

type PostType = {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  media_url?: string | null;
  media_type?: "text" | "image" | "video";
  created_at: string;
};

export default function Personalize({ user }: { user: User | null }) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  /* ===============================
     INIT + REALTIME
  =============================== */
  useEffect(() => {
    if (!user) return;

    fetchHomiesAndPosts();

    const channel = supabase
      .channel("personalize-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        fetchHomiesAndPosts
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  /* ===============================
     FETCH HOMIES + POSTS
  =============================== */
  async function fetchHomiesAndPosts() {
    if (!user) return;

    setLoading(true);

    // 1️⃣ Fetch users I personalized
    const { data: homies, error: homieError } = await supabase
      .from("personalize")
      .select("following_id")
      .eq("follower_id", user.id);

    if (homieError) {
      console.error("Failed to fetch homies", homieError);
      setLoading(false);
      return;
    }

    const homieIds = (homies || []).map(h => h.following_id);

    if (homieIds.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    // 2️⃣ Fetch posts from homies only
    const { data: postsData, error: postError } = await supabase
      .from("posts")
      .select("*")
      .in("author_id", homieIds)
      .order("created_at", { ascending: false });

    if (postError) {
      console.error("Failed to fetch posts", postError);
      setLoading(false);
      return;
    }

    setPosts(postsData || []);
    setLoading(false);
  }

  /* ===============================
     UI
  =============================== */
  if (!user) {
    return (
      <div className="text-center p-6 bg-white rounded-xl shadow-sm">
        Please login to see your personalized (Homies) feed.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
        <h2 className="font-semibold text-lg">Homies Feed</h2>
        <p className="text-sm text-gray-600 mt-1">
          Posts from people you personalized ⭐
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="bg-white p-6 rounded-xl text-center text-gray-500">
          Loading Homies posts...
        </div>
      )}

      {/* POSTS */}
      {!loading && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map(post => (
            <div
              key={post.id}
              className="bg-white p-4 rounded-xl shadow-sm border"
            >
              <div className="font-semibold">{post.author_name}</div>
              <div className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleString()}
              </div>

              <p className="mt-3">{post.content}</p>

              {post.media_type === "image" && post.media_url && (
                <img
                  src={post.media_url}
                  className="mt-3 rounded-lg max-h-96"
                />
              )}

              {post.media_type === "video" && post.media_url && (
                <video
                  src={post.media_url}
                  controls
                  className="mt-3 rounded-lg w-full"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && posts.length === 0 && (
        <div className="bg-white p-6 rounded-xl text-center text-gray-600">
          <p className="font-medium mb-1">No Homies posts yet</p>
          <p className="text-sm">
            Go to the feed and ⭐ Personalize someone to see their posts here.
          </p>
        </div>
      )}
    </div>
  );
}
