import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import {
  Pencil,
  LogOut,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Globe,
  Upload
} from "lucide-react";

/* ================= TYPES ================= */

type StateRow = {
  id: number;
  name: string;
};

type CityRow = {
  id: number;
  name: string;
  state_id: number;
};



type ProfileRow = {
  id: string;
  display_name: string | null;
  username: string | null;
  phone: string | null;
  bio: string | null;
  state: string | null;
  city: string | null;
  avatar_url: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  linkedin: string | null;
  website: string | null;
};

/* ================= COMPONENT ================= */

export default function Profile({
  user,
  viewUserId,
  onGoMyPosts,
  onLogout
}: {
  user: User;
  viewUserId: string | null;
  onGoMyPosts: (userId: string) => void;
  onLogout: () => void;
}) {
  const isOwnProfile = !viewUserId || viewUserId === user.id;

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [postCount, setPostCount] = useState(0);
  const [homiesCount] = useState(0);
  const [milzullCount] = useState(0);

  const [states, setStates] = useState<StateRow[]>([]);
  const [cities, setCities] = useState<CityRow[]>([]);

  const [customState, setCustomState] = useState("");
  const [customCity, setCustomCity] = useState("");



  /* ================= FETCH ================= */

  useEffect(() => {
    fetchProfile();
    fetchPostCount();
    setEditMode(false);
  }, [viewUserId]);

  useEffect(() => {
    fetchStates();
  }, []);


  async function fetchProfile() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", viewUserId || user.id)
      .single();

    setProfile(data);
  }

  async function fetchPostCount() {
    const { count } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", viewUserId || user.id);

    setPostCount(count ?? 0);
  }

  async function fetchStates() {
    const { data } = await supabase
      .from("states")
      .select("id, name")
      .order("name");

    setStates(data || []);
  }

  async function fetchCitiesByState(stateName: string) {
    const state = states.find(s => s.name === stateName);
    if (!state) return;

    const { data } = await supabase
      .from("cities")
      .select("id, name, state_id")
      .eq("state_id", state.id)
      .order("name");

    setCities(data || []);
  }


  /* ================= AVATAR ================= */

  async function uploadAvatar(file: File) {
    if (!profile || !isOwnProfile) return;

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    await supabase.storage
      .from("profile-avatars")
      .upload(path, file, { upsert: true });

    const { data } = supabase.storage
      .from("profile-avatars")
      .getPublicUrl(path);

    const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

    await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
  }

  async function saveProfile() {
    if (!profile || !isOwnProfile) return;
    // Submit pending state/city if needed
    if (customState || customCity) {
      await supabase.from("pending_locations").insert({
        user_id: user.id,
        type: customCity ? "city" : "state",
        state_name: customState || profile.state,
        city_name: customCity || null
      });
    }
    await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        username: profile.username,
        phone: profile.phone,
        bio: profile.bio,
        state: customState || profile.state,
        city: customCity || profile.city,
        instagram: profile.instagram,
        twitter: profile.twitter,
        youtube: profile.youtube,
        linkedin: profile.linkedin,
        website: profile.website
      })
      .eq("id", user.id);

    setEditMode(false);
    fetchProfile();
  }

  if (!profile) return <div>Loading...</div>;

  const socialLinks = [
    { label: "Instagram", icon: <Instagram size={16} />, url: profile.instagram },
    { label: "X", icon: <Twitter size={16} />, url: profile.twitter },
    { label: "YouTube", icon: <Youtube size={16} />, url: profile.youtube },
    { label: "LinkedIn", icon: <Linkedin size={16} />, url: profile.linkedin },
    { label: "Website", icon: <Globe size={16} />, url: profile.website }
  ].filter(l => l.url && l.url.trim() !== "");


  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* ===== HEADER ===== */}
      <div className="bg-white rounded-xl border p-6 flex justify-between">
        <div className="flex gap-4">
          <div className="relative">
            <img
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.display_name}`}
              className="w-20 h-20 rounded-full object-cover"
            />

            {editMode && isOwnProfile && (
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer">
                <Upload size={14} className="text-white" />
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={e => e.target.files && uploadAvatar(e.target.files[0])}
                />
              </label>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold">{profile.display_name}</h2>
            <p className="text-gray-500">@{profile.username}</p>
            <p className="text-sm text-gray-600">
              {profile.city}, {profile.state}
            </p>

            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {socialLinks.map((l, i) => (
                  <a
                    key={i}
                    href={l.url!}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1 text-xs border rounded-full"
                  >
                    {l.icon} {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {isOwnProfile && !editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="text-blue-600 flex items-center gap-1"
          >
            <Pencil size={16} /> Edit
          </button>
        )}
      </div>

      {/* ===== COUNTS ===== */}
      <div className="bg-white rounded-xl border p-4 grid grid-cols-3 text-center">
        <div>
          <p className="text-xl font-bold">{homiesCount}</p>
          <p className="text-xs">HOMIES</p>
        </div>

        <button onClick={() => onGoMyPosts(profile.id)}>
          <p className="text-xl font-bold text-blue-600">{postCount}</p>
          <p className="text-xs">POSTS</p>
        </button>


        <div>
          <p className="text-xl font-bold">{milzullCount}</p>
          <p className="text-xs">MILZULLS</p>
        </div>
      </div>

      {/* ===== EDIT FORM ===== */}
      {editMode && isOwnProfile && (
        <div className="bg-white border rounded-xl p-6 space-y-3">

          <input className="border p-2 w-full"
            value={profile.display_name || ""}
            onChange={e => setProfile({ ...profile, display_name: e.target.value })}
          />

          <input className="border p-2 w-full"
            value={profile.username || ""}
            onChange={e => setProfile({ ...profile, username: e.target.value })}
          />

          <input className="border p-2 w-full"
            value={profile.phone || ""}
            onChange={e => setProfile({ ...profile, phone: e.target.value })}
          />

          <textarea className="border p-2 w-full"
            value={profile.bio || ""}
            onChange={e => setProfile({ ...profile, bio: e.target.value })}
          />

          <select
            className="border p-2 w-full"
            value={profile.state || ""}
            onChange={e => {
              setProfile({ ...profile, state: e.target.value, city: "" });
              fetchCitiesByState(e.target.value);
            }}
          >
            <option value="">Select State</option>

            {states.map(s => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}

            <option value="OTHER">Other</option>
          </select>

          {profile.state === "OTHER" && (
            <input
              className="border p-2 w-full"
              placeholder="Enter State Name"
              value={customState}
              onChange={e => setCustomState(e.target.value)}
            />
          )}



          <select
            className="border p-2 w-full"
            value={profile.city || ""}
            disabled={!profile.state || profile.state === "OTHER"}
            onChange={e => setProfile({ ...profile, city: e.target.value })}
          >
            <option value="">Select City</option>

            {cities.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}

            <option value="OTHER">Other</option>
          </select>
          {profile.city === "OTHER" && (
            <input
              className="border p-2 w-full"
              placeholder="Enter City Name"
              value={customCity}
              onChange={e => setCustomCity(e.target.value)}
            />
          )}



          <input className="border p-2 w-full" placeholder="Instagram"
            value={profile.instagram || ""}
            onChange={e => setProfile({ ...profile, instagram: e.target.value })}
          />
          <input className="border p-2 w-full" placeholder="Twitter / X"
            value={profile.twitter || ""}
            onChange={e => setProfile({ ...profile, twitter: e.target.value })}
          />
          <input className="border p-2 w-full" placeholder="YouTube"
            value={profile.youtube || ""}
            onChange={e => setProfile({ ...profile, youtube: e.target.value })}
          />
          <input className="border p-2 w-full" placeholder="LinkedIn"
            value={profile.linkedin || ""}
            onChange={e => setProfile({ ...profile, linkedin: e.target.value })}
          />
          <input className="border p-2 w-full" placeholder="Website"
            value={profile.website || ""}
            onChange={e => setProfile({ ...profile, website: e.target.value })}
          />

          <div className="flex gap-2">
            <button onClick={saveProfile}
              className="bg-blue-600 text-white px-4 py-2 rounded">
              Save
            </button>
            <button
              onClick={() => { setEditMode(false); fetchProfile(); }}
              className="border px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== LOGOUT ===== */}
      {isOwnProfile && (
        <button
          onClick={onLogout}
          className="w-full bg-red-50 text-red-600 py-4 rounded-xl flex justify-center gap-2"
        >
          <LogOut size={18} /> Log Out
        </button>
      )}
    </div>
  );
}