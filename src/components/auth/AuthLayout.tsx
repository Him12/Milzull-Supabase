// import React from "react";

// export default function AuthLayout({
//   children
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      
//       {/* LEFT BRAND PANEL */}
//       <div className="
//         hidden lg:flex flex-col justify-center px-16
//         bg-gradient-to-br from-blue-600 via-sky-500 to-emerald-500
//         text-white
//       ">
//         <h1 className="text-5xl font-extrabold mb-6">
//           Milzull
//         </h1>

//         <p className="text-lg text-white/90 mb-10 max-w-md">
//           Find people nearby. Build real connections.
//           No noise. Just meaningful conversations.
//         </p>

//         <ul className="space-y-4 text-lg">
//           <li>🤝 Discover homies around you</li>
//           <li>☕ Coffee, walks & activities</li>
//           <li>💬 Instant chat after matching</li>
//           <li>🔒 Safe, private & trusted</li>
//         </ul>

//         <p className="mt-16 text-sm text-white/70">
//           © {new Date().getFullYear()} Milzull
//         </p>
//       </div>

//       {/* RIGHT FORM PANEL */}
//       <div className="
//         flex items-center justify-center
//         bg-gradient-to-br from-slate-50 to-slate-100
//         p-6
//       ">
//         {children}
//       </div>

//     </div>
//   );
// }


// // src/pages/AuthLayout.tsx
// import React from "react";

// export default function AuthLayout({
//   children
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

//       {/* LEFT – BRANDING (hidden on mobile) */}
//       <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-blue-600 via-sky-500 to-emerald-500 text-white">
//         <div className="absolute inset-0 bg-black/10" />

//         <div className="relative z-10 flex flex-col justify-center px-16 space-y-10">
//           <h1 className="text-5xl font-extrabold tracking-tight">
//             Milzull
//           </h1>

//           <p className="text-xl max-w-md text-white/90 leading-relaxed">
//             Find people nearby. Build real connections.
//             <br />
//             No noise. Just meaningful conversations.
//           </p>

//           <ul className="space-y-4 text-lg">
//             <li>🤝 Discover homies around you</li>
//             <li>☕ Coffee, walks & activities</li>
//             <li>💬 Instant chat after matching</li>
//             <li>🔒 Safe, private & trusted</li>
//           </ul>

//           <p className="text-sm text-white/70 pt-10">
//             © 2026 Milzull
//           </p>
//         </div>
//       </div>

//       {/* RIGHT – AUTH CARD */}
//       <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-4">
//         {children}
//       </div>
//     </div>
//   );
// }


// src/pages/AuthLayout.tsx
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
            Find people nearby. Build real connections.
            <br />
            No noise. Just meaningful conversations.
          </p>

          <ul className="space-y-4 text-lg">
            <li>🤝 Discover homies around you</li>
            <li>☕ Coffee, walks & activities</li>
            <li>💬 Instant chat after matching</li>
            <li>🔒 Safe, private & trusted</li>
          </ul>

          <p className="text-sm text-white/70 pt-10">
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
