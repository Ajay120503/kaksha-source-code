import { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import {
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserShield,
  FaBan,
  FaCheckCircle,
} from "react-icons/fa";
import AdminHero from "./AdminHero";

export default function AdminStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await adminService.getUsers();
      const users = res.data || [];

      setStats({
        total: users.length,
        students: users.filter((u) => u.role === "student").length,
        teachers: users.filter((u) => u.role === "teacher").length,
        admins: users.filter((u) => u.role === "admin").length,
        isBlocked: users.filter((u) => u.isBlocked).length,
        active: users.filter((u) => !u.isBlocked).length,
        users,
      });
    };

    load();
  }, []);

  if (!stats)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ================= HERO ================= */}
      <div className="relative overflow-hidden  shadow-2xl">
        <AdminHero
          title="Platform Analytics"
          subtitle="Insights into growth and activity."
          badge="Live Stats"
          variant="stats"
        />

        {/* shine */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_40%)]"></div>
      </div>

      {/* ================= TOP STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.total}
          icon={<FaUsers />}
          gradient="from-blue-500 to-indigo-500"
          note="Platform-wide"
        />

        <StatCard
          title="Students"
          value={stats.students}
          icon={<FaUserGraduate />}
          gradient="from-emerald-500 to-green-500"
          note="Active learners"
        />

        <StatCard
          title="Teachers"
          value={stats.teachers}
          icon={<FaChalkboardTeacher />}
          gradient="from-orange-500 to-amber-500"
          note="Content creators"
        />

        <StatCard
          title="Admins"
          value={stats.admins}
          icon={<FaUserShield />}
          gradient="from-purple-500 to-pink-500"
          note="System managers"
        />
      </div>

      {/* ================= STATUS + ROLES ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STATUS */}
        <GlassCard title="User Status Overview">
          <StatusRow
            label="Active Users"
            value={stats.active}
            icon={<FaCheckCircle fontSize={18} />}
            color="success"
          />
          <StatusRow
            label="Blocked Users"
            value={stats.isBlocked}
            icon={<FaBan fontSize={18} />}
            color="error"
          />
        </GlassCard>

        {/* ROLE BREAKDOWN */}
        <GlassCard title="Role Distribution">
          <RoleBar
            label="Students"
            value={stats.students}
            total={stats.total}
          />
          <RoleBar
            label="Teachers"
            value={stats.teachers}
            total={stats.total}
          />
          <RoleBar label="Admins" value={stats.admins} total={stats.total} />
        </GlassCard>
      </div>

      {/* ================= RECENT USERS ================= */}
      <GlassCard title="Recently Registered Users">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="opacity-70">
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered At</th> {/* optional */}
              </tr>
            </thead>
            <tbody>
              {stats.users
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((u) => (
                  <tr key={u._id}>
                    <td className="font-medium">{u.email}</td>
                    <td>
                      <span className="badge badge-outline capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.isBlocked ? (
                        <span className="badge badge-error">Blocked</span>
                      ) : (
                        <span className="badge badge-success">Active</span>
                      )}
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

/* ================= REUSABLE UI ================= */

function StatCard({ title, value, icon, gradient, note }) {
  return (
    <div className="relative overflow-hidden  shadow-xl bg-base-100 border border-base-300">
      <div className={`h-2 bg-linear-to-r ${gradient}`} />
      <div className="p-6 flex items-center gap-4">
        <div className="p-4 rounded-2xl bg-base-200 text-3xl shadow-inner">
          {icon}
        </div>
        <div>
          <p className="text-sm opacity-70">{title}</p>
          <p className="text-4xl font-extrabold">{value}</p>
          <p className="text-xs opacity-60 mt-1">{note}</p>
        </div>
      </div>
    </div>
  );
}

function GlassCard({ title, children }) {
  return (
    <div className=" bg-base-100/80 backdrop-blur border border-base-300 shadow-xl p-6">
      <h2 className="text-xl font-bold mb-5">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function StatusRow({ label, value, icon, color }) {
  return (
    <div className="flex justify-between items-center">
      <span className="flex items-center gap-2">
        {icon} {label}
      </span>
      <span className={`badge badge-${color} badge-lg`}>{value}</span>
    </div>
  );
}

function RoleBar({ label, value, total }) {
  const percent = total ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="w-full bg-base-300 rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}