
import React from "react";

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">

      {/* LEFT BRANDING — DESKTOP ONLY */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-sky-500 to-emerald-500 text-white">
        <div className="absolute inset-0 bg-black/10" />

        <div className="relative z-10 flex flex-col justify-center px-16 space-y-10">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Milzull
          </h1>

          <p className="text-xl max-w-md text-white/90 leading-relaxed">
            Milzull is a peer-to-peer social connection platform.
            <br />
            Discover people. Start conversations. Meet responsibly.
          </p>

          <ul className="space-y-4 text-lg">
            <li>🤝 Connect with people for real-life activities</li>
            <li>☕ Coffee, walks, travel & social meetups</li>
            <li>💬 Chat freely and build genuine connections</li>
            <li>🔒 You decide how, when & where to connect</li>
            <li>⚠️ You’re always in control of your interactions</li>
          </ul>

          <p className="text-sm text-white/70 pt-10">
            Milzull provides the platform — connections are your choice.
            <br />
            © 2026 Milzull
          </p>
        </div>
      </div>


      {/* RIGHT AUTH — MOBILE & DESKTOP */}
      <div
        className="
          flex w-full lg:w-1/2
          min-h-screen
          items-center justify-center
          bg-gradient-to-br from-blue-50 via-white to-emerald-50
          px-4 py-10
        "
      >
        {children}
      </div>
    </div>
  );
}
