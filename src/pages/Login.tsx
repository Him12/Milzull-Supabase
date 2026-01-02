// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login({ onLogin, goToRegister }: {
  onLogin: () => void;
  goToRegister: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      setError(error.message);
      return;
    }
    onLogin();
  };

  // Optional: if user already logged in (session)
  useEffect(() => {
    supabase.auth.getSession().then(res => {
      if (res.data.session) onLogin();
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl p-8 shadow-lg">
        <div className="flex justify-center mb-4">
          <img src="/Milzull-Supabase/images/milzul_logo.png" alt="logo" className="w-20 h-20 object-contain"/>
        </div>

        <h2 className="text-2xl font-bold text-center mb-4">Welcome back</h2>
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full p-3 rounded-lg border"/>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-3 rounded-lg border"/>
          <button className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white p-3 rounded-lg">Login</button>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <button type="button" className="text-blue-600" onClick={goToRegister}>Create one</button>
          </div>
        </form>
      </div>
    </div>
  );
}
