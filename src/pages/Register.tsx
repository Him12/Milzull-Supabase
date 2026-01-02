// src/pages/Register.tsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Register({ onRegister }: { onRegister: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error) {
      setError(error.message);
      return;
    }
    // Optionally create profile row
    if (data?.user?.id) {
      await supabase.from("profiles").upsert({ id: data.user.id, display_name: name });
    }
    alert("Registration success. Check your email (if confirmation enabled).");
    onRegister();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl p-8 shadow-lg">
        <div className="flex justify-center mb-4">
          <img src="/Milzull-Supabase/images/milzul_logo.png" alt="logo" className="w-20 h-20 object-contain"/>
        </div>

        <h2 className="text-2xl font-bold text-center mb-4">Create account</h2>
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <input value={name} onChange={e=>setName(e.target.value)} type="text" placeholder="Full name" className="w-full p-3 rounded-lg border"/>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" className="w-full p-3 rounded-lg border"/>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 rounded-lg border"/>
          <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white p-3 rounded-lg">Register</button>
        </form>
      </div>
    </div>
  );
}
