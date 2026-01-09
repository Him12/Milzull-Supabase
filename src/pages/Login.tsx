// import { useEffect, useState } from "react";
// import { supabase } from "../lib/supabaseClient";
// import AuthLayout from "../components/auth/AuthLayout";


// export default function Login({
//   onLogin,
//   goToRegister
// }: {
//   onLogin: () => void;
//   goToRegister: () => void;
// }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   async function handleLogin(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password
//     });

//     setLoading(false);
//     if (error) return setError(error.message);
//     onLogin();
//   }

//   useEffect(() => {
//     supabase.auth.getSession().then(res => {
//       if (res.data.session) onLogin();
//     });
//   }, []);

//   return (
//     <AuthLayout>
//     <div className="
//       w-full max-w-md rounded-3xl p-8
//       bg-white/80 backdrop-blur-xl
//       shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)]
//       border border-white/40
//     ">
//       <div className="flex justify-center mb-6">
//         <img
//           src="/images/milzul_logo.png"
//           alt="Milzull"
//           className="w-40 h-30"
//         />
//       </div>

//       <h2 className="text-3xl font-bold text-center mb-1">
//         Welcome back
//       </h2>
//       <p className="text-center text-gray-500 mb-8">
//         Login to continue to Milzull
//       </p>

//       {error && (
//         <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
//           {error}
//         </div>
//       )}

//       <form onSubmit={handleLogin} className="space-y-5">
//         <input
//           type="email"
//           placeholder="Email address"
//           value={email}
//           onChange={e => setEmail(e.target.value)}
//           className="
//             w-full px-4 py-3 rounded-xl border
//             bg-white/70 backdrop-blur
//             focus:ring-2 focus:ring-blue-500
//             outline-none transition
//           "
//           required
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={e => setPassword(e.target.value)}
//           className="
//             w-full px-4 py-3 rounded-xl border
//             bg-white/70 backdrop-blur
//             focus:ring-2 focus:ring-blue-500
//             outline-none transition
//           "
//           required
//         />

//         <button
//           disabled={loading}
//           className="
//             w-full py-3 rounded-xl font-semibold text-white
//             bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500
//             hover:brightness-110 active:scale-[0.99]
//             transition-all duration-200
//             disabled:opacity-60
//           "
//         >
//           {loading ? "Signing in..." : "Login"}
//         </button>
//       </form>

//       <div className="text-center text-sm mt-6 text-gray-600">
//         Don’t have an account?{" "}
//         <button
//           onClick={goToRegister}
//           className="text-blue-600 font-medium hover:underline"
//         >
//           Create one
//         </button>
//       </div>
//     </div>
//     </AuthLayout>
//   );
// }



import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AuthLayout from "../components/auth/AuthLayout";

export default function Login({
  onLogin,
  goToRegister
}: {
  onLogin: () => void;
  goToRegister: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);
    if (error) return setError(error.message);
    onLogin();
  }

  async function handleForgotPassword() {
    setError(null);
    setResetSent(false);

    if (!email) {
      setError("Please enter your email to reset password");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://milzull.online"
    });

    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(res => {
      if (res.data.session) onLogin();
    });
  }, []);

  return (
    <AuthLayout>
      <div className="w-full max-w-md rounded-3xl p-8 bg-white/80 backdrop-blur-xl shadow-xl border">
        <div className="flex justify-center mb-6">
          <img src="/images/milzul_logo.png" alt="Milzull" className="w-40" />
        </div>

        <h2 className="text-3xl font-bold text-center mb-1">
          Welcome back
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Login to continue to Milzull
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {resetSent && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
            Password reset link sent to your email.
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border"
            required
          />

          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-emerald-500 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="text-center text-sm mt-6 text-gray-600">
          Don’t have an account?{" "}
          <button
            onClick={goToRegister}
            className="text-blue-600 font-medium hover:underline"
          >
            Create one
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
