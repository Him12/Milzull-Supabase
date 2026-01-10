

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Plus, Image, Video, X, Trash2 } from "lucide-react";
import CommentModal from "../components/CommentModal";
import { BadgeCheck } from "lucide-react";


/* ===============================
   TYPES
=============================== */
export interface UserType {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

type ProfileType = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_verified: boolean;
};

type PostType = {
  id: string;
  author_id: string | null;
  content: string | null;
  media_url?: string | null;
  media_type?: "text" | "image" | "video";
  created_at: string;
  like_count: number;
  comment_count: number;
  repost_count: number;
  repost_of?: string | null;
  profile?: ProfileType | null;
};

/* ===============================
   COMPONENT
=============================== */
export default function Post({
  user,
  viewUserId,
  onOpenProfile
}: {
  user: UserType | null;
  viewUserId?: string | null;
  onOpenProfile?: (profileId: string) => void;
}) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [homieIds, setHomieIds] = useState<string[]>([]);
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const [showComposer, setShowComposer] = useState(false);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  /* ===============================
     FETCH POSTS
  =============================== */
  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("posts-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        fetchPosts
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [viewUserId]);

  useEffect(() => {
    if (user) {
      fetchLikedPosts();
      fetchHomies();
    }
  }, [user]);

  async function fetchPosts() {
    let query = supabase
      .from("posts")
      .select(`
        id,
        author_id,
        content,
        media_url,
        media_type,
        created_at,
        like_count,
        comment_count,
        repost_count,
        repost_of
      `)
      .order("created_at", { ascending: false });

    if (viewUserId) query = query.eq("author_id", viewUserId);

    const { data } = await query;

    if (!data?.length) {
      setPosts([]);
      return;
    }

    const authorIds = [...new Set(data.map(p => p.author_id).filter(Boolean))];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, username, avatar_url, is_verified")
      .in("id", authorIds);

    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    setPosts(
      data.map(p => ({
        ...p,
        profile: p.author_id
          ? profileMap.get(p.author_id) || {
            id: p.author_id,
            display_name: "User",
            username: null,
            avatar_url: null,
            is_verified: false
          }
          : null
      }))
    );
  }

  async function fetchLikedPosts() {
    const { data } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", user!.id);

    setLikedPostIds((data || []).map(l => l.post_id));
  }

  async function fetchHomies() {
    const { data } = await supabase
      .from("personalize")
      .select("following_id")
      .eq("follower_id", user!.id);

    setHomieIds((data || []).map(h => h.following_id));
  }

  /* ===============================
     CREATE POST
  =============================== */
  async function createPost() {
    if (!content.trim() && !file) return;
    setUploading(true);

    let mediaUrl: string | null = null;
    let mediaType: "text" | "image" | "video" = "text";

    if (file && user) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("posts-media")
        .upload(path, file, { upsert: true });

      if (error) {
        alert("Upload failed");
        setUploading(false);
        return;
      }

      mediaUrl = supabase.storage
        .from("posts-media")
        .getPublicUrl(path).data.publicUrl;

      mediaType = file.type.startsWith("video") ? "video" : "image";
    }

    await supabase.from("posts").insert({
      author_id: user!.id,
      author_name:
        user?.user_metadata?.full_name || user?.email || "User",
      content,
      media_url: mediaUrl,
      media_type: mediaType
    });

    setContent("");
    setFile(null);
    setShowComposer(false);
    setUploading(false);
    fetchPosts();
  }

  /* ===============================
     DELETE POST ✅
  =============================== */
  async function deletePost(postId: string) {
    const ok = confirm("Delete this post?");
    if (!ok) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      alert(error.message);
      return;
    }

    fetchPosts();
  }

  /* ===============================
     ACTIONS
  =============================== */
  async function toggleLike(postId: string) {
    const liked = likedPostIds.includes(postId);

    if (liked) {
      await supabase.from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user!.id);
      await supabase.rpc("decrement_post_like_count", { p_post_id: postId });
    } else {
      await supabase.from("likes")
        .insert({ post_id: postId, user_id: user!.id });
      await supabase.rpc("increment_post_like_count", { p_post_id: postId });
    }

    fetchPosts();
    fetchLikedPosts();
  }

  async function repost(post: PostType) {
    const { data: existing } = await supabase
      .from("posts")
      .select("id")
      .eq("author_id", user!.id)
      .eq("repost_of", post.id)
      .maybeSingle();

    if (existing) {
      await supabase.from("posts").delete().eq("id", existing.id);
      await supabase.rpc("decrement_post_repost_count", { p_post_id: post.id });
    } else {
      await supabase.from("posts").insert({
        author_id: user!.id,
        repost_of: post.id
      });
      await supabase.rpc("increment_post_repost_count", { p_post_id: post.id });
    }

    fetchPosts();
  }

  async function togglePersonalize(authorId: string | null) {
    if (!authorId || authorId === user?.id) return;

    const { data } = await supabase
      .from("personalize")
      .delete()
      .eq("follower_id", user!.id)
      .eq("following_id", authorId)
      .select();

    if (!data?.length) {
      await supabase.from("personalize").insert({
        follower_id: user!.id,
        following_id: authorId
      });
    }

    fetchHomies();
  }

  /* ===============================
     UI
  =============================== */
  return (
    <div className="space-y-6 relative pb-32">
      {posts.map(post => (
        <div key={post.id} className="bg-white p-4 rounded-xl border relative">

          {/* DELETE (ONLY OWNER) */}
          {post.author_id === user?.id && (
            <button
              onClick={() => deletePost(post.id)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              title="Delete post"
            >
              <Trash2 size={18} />
            </button>
          )}

          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => post.profile?.id && onOpenProfile?.(post.profile.id)}
          >
            <img
              src={post.profile?.avatar_url || `https://ui-avatars.com/api/?name=${post.profile?.display_name || "User"}`}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-1 font-semibold">
                <span>
                  {post.profile?.display_name || "User"}
                </span>

                {post.profile?.is_verified && (
                  <span title="Verified user">
                    <BadgeCheck
                      size={14}
                      className="text-blue-600"
                    />
                  </span>
                )}
              </div>

              {post.profile?.username && (
                <div className="text-xs text-gray-500">@{post.profile.username.replace(/^@/, "")}</div>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-1">
            {new Date(post.created_at).toLocaleString()}
          </div>

          {post.content && <p className="mt-3">{post.content}</p>}

          {post.media_type === "image" && post.media_url && (
            <img src={post.media_url} className="mt-3 rounded-lg w-full max-h-[70vh] object-contain" />
          )}

          {post.media_type === "video" && post.media_url && (
            <video src={post.media_url} controls className="mt-3 rounded-lg w-full" />
          )}

          <div className="flex justify-around flex-wrap gap-3 mt-4 text-sm">
            <button onClick={() => toggleLike(post.id)}>❤️ {post.like_count}</button>
            <button onClick={() => setActivePostId(post.id)}>💬 {post.comment_count}</button>
            <button onClick={() => repost(post)}>🔁 {post.repost_count}</button>

            {post.author_id !== user?.id && (
              <button
                onClick={() => togglePersonalize(post.author_id)}
                className={homieIds.includes(post.author_id!) ? "text-yellow-500" : ""}
              >
                ⭐ Personalize
              </button>
            )}
          </div>
        </div>
      ))}

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setShowComposer(true)}
        className="fixed bottom-28 right-4 sm:bottom-20 sm:right-6 bg-blue-600 text-white p-4 rounded-full z-40"
      >
        <Plus />
      </button>

      {/* COMPOSER */}
      {showComposer && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:max-w-lg p-6 rounded-t-2xl sm:rounded-2xl pb-24">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold">Create Post</h3>
              <button onClick={() => setShowComposer(false)}><X /></button>
            </div>

            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              className="w-full border rounded p-3 mb-3"
              placeholder="What's happening?"
            />

            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <label className="cursor-pointer"><Image />
                  <input hidden type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
                </label>
                <label className="cursor-pointer"><Video />
                  <input hidden type="file" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              <button
                disabled={uploading}
                onClick={createPost}
                className="bg-blue-600 text-white px-6 py-2 rounded"
              >
                {uploading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activePostId && user && (
        <CommentModal
          postId={activePostId}
          user={user}
          onClose={() => setActivePostId(null)}
          onCommentAdded={fetchPosts}
        />
      )}
    </div>
  );
}
