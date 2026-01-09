import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AuthLayout from "../components/auth/AuthLayout";

export default function Register({
  onRegister,
  goToLogin
}: {
  onRegister: () => void;
  goToLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });

    if (error) {
      setLoading(false);
      return setError(error.message);
    }

    if (data?.user?.id) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: name
      });
    }

    setLoading(false);
    alert("Account created successfully! You can now login.");
    onRegister();
  }

  return (
    <AuthLayout>
      <div
        className="
          w-full max-w-md rounded-3xl p-8
          bg-white/80 backdrop-blur-xl
          shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)]
          border border-white/40
        "
      >
        <div className="flex justify-center mb-6">
          <img
            src="/images/milzul_logo.png"
            alt="Milzull"
            className="w-40 h-30"
          />
        </div>

        <h2 className="text-3xl font-bold text-center mb-1">
          Create your account
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Join Milzull and start real connections
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="
              w-full px-4 py-3 rounded-xl border
              bg-white/70 backdrop-blur
              focus:ring-2 focus:ring-blue-500
              outline-none transition
            "
            required
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="
              w-full px-4 py-3 rounded-xl border
              bg-white/70 backdrop-blur
              focus:ring-2 focus:ring-blue-500
              outline-none transition
            "
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="
              w-full px-4 py-3 rounded-xl border
              bg-white/70 backdrop-blur
              focus:ring-2 focus:ring-blue-500
              outline-none transition
            "
            required
          />

          <button
            disabled={loading}
            className="
              w-full py-3 rounded-xl font-semibold text-white
              bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-600
              hover:brightness-110 active:scale-[0.99]
              transition-all duration-200
              disabled:opacity-60
            "
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="text-center text-sm mt-6 text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={goToLogin}
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}

