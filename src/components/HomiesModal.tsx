import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Homie = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  isFollowing: boolean;
};

export default function HomiesModal({
  userId,
  currentUserId,
  onClose,
  onOpenProfile
}: {
  userId: string;
  currentUserId: string;
  onClose: () => void;
  onOpenProfile: (id: string) => void;
}) {
  const [homies, setHomies] = useState<Homie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomies();
  }, []);

  async function loadHomies() {
    setLoading(true);

    /* 1️⃣ Get followers of this profile */
    const { data, error } = await supabase
      .from("followers")
      .select(`
        follower_id,
        profiles!followers_follower_fkey (
          id,
          display_name,
          username,
          avatar_url
        )
      `)
      .eq("following_id", userId);

    if (error || !data) {
      setLoading(false);
      return;
    }

    /* 2️⃣ Get who current user follows */
    const { data: myFollows } = await supabase
      .from("followers")
      .select("following_id")
      .eq("follower_id", currentUserId);

    const followingSet = new Set(
      (myFollows || []).map(f => f.following_id)
    );

    /* 3️⃣ Map result */
    const mapped: Homie[] = data.map((row: any) => ({
      id: row.profiles.id,
      display_name: row.profiles.display_name,
      username: row.profiles.username,
      avatar_url: row.profiles.avatar_url,
      isFollowing: followingSet.has(row.profiles.id)
    }));

    setHomies(mapped);
    setLoading(false);
  }

  async function toggleFollow(targetId: string, isFollowing: boolean) {
    if (isFollowing) {
      await supabase
        .from("followers")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", targetId);
    } else {
      await supabase
        .from("followers")
        .insert({
          follower_id: currentUserId,
          following_id: targetId
        });
    }

    setHomies(prev =>
      prev.map(h =>
        h.id === targetId
          ? { ...h, isFollowing: !isFollowing }
          : h
      )
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white w-full max-w-md rounded-xl p-5 space-y-4">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Homies</h3>
          <button
            onClick={onClose}
            className="text-xl text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto space-y-3">
          {loading && (
            <p className="text-sm text-gray-500">Loading...</p>
          )}

          {!loading && homies.length === 0 && (
            <p className="text-sm text-gray-500">
              No homies yet
            </p>
          )}

          {homies.map(h => (
            <div
              key={h.id}
              className="flex items-center justify-between"
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => onOpenProfile(h.id)}
              >
                <img
                  src={
                    h.avatar_url ||
                    `https://ui-avatars.com/api/?name=${h.display_name}`
                  }
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div>
                  <p className="text-sm font-medium">
                    {h.display_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    @{h.username}
                  </p>
                </div>
              </div>

              {h.id !== currentUserId && (
                <button
                  onClick={() =>
                    toggleFollow(h.id, h.isFollowing)
                  }
                  className={`text-xs px-3 py-1 rounded-full border ${
                    h.isFollowing
                      ? "bg-gray-100 text-gray-700"
                      : "bg-blue-600 text-white border-blue-600"
                  }`}
                >
                  {h.isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
