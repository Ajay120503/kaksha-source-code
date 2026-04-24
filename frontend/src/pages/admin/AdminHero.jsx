// src/components/admin/AdminHero.jsx
const gradients = {
  dashboard: "from-purple-600 via-indigo-600 to-blue-600",
  users: "from-emerald-600 via-green-600 to-teal-600",
  classrooms: "from-orange-500 via-amber-500 to-yellow-500",
  stats: "from-pink-600 via-rose-600 to-red-600",
  security: "from-slate-700 via-gray-800 to-zinc-900",
};

export default function AdminHero({
  title,
  subtitle,
  badge,
  actions,
  variant = "dashboard",
}) {
  return (
    <div className="relative overflow-hidden shadow-2xl">
      {/* Background */}
      <div
        className={`bg-linear-to-r ${gradients[variant]} text-white p-8 md:p-10 relative z-10`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          {/* LEFT */}
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>

            {subtitle && (
              <p className="text-white/90 mt-3 max-w-2xl">{subtitle}</p>
            )}

            {badge && (
              <span className="inline-block mt-5 px-5 py-2 bg-white/90 text-black rounded-full font-semibold shadow">
                {badge}
              </span>
            )}
          </div>

          {/* RIGHT ACTIONS */}
          {actions && <div className="flex gap-3 items-center">{actions}</div>}
        </div>
      </div>

      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_40%)]"></div>
    </div>
  );
}
