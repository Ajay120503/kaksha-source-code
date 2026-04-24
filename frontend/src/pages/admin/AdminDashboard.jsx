import { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import AdminHero from "./AdminHero";
import {
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSchool,
  FaUserCheck,
  FaUserSlash,
  FaClock,
} from "react-icons/fa";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    adminService.getUsers().then((res) => {
      setUsers(res.data || []);
    });
  }, []);

  const stats = {
    total: users.length,
    teachers: users.filter((u) => u.role === "teacher").length,
    students: users.filter((u) => u.role === "student").length,
    admins: users.filter((u) => u.role === "admin").length,
    active: users.filter((u) => !u.isBlocked).length,
    blocked: users.filter((u) => u.isBlocked).length,
  };

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <AdminHero
        title="Admin Control Center 🛡️"
        subtitle="Monitor users, roles and platform health."
        badge="👑 Super Admin"
        variant="dashboard"
      />

      {/* MAIN STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          label="Total Users"
          value={stats.total}
          icon={<FaUsers />}
          gradient="from-blue-500 to-indigo-500"
        />
        <StatCard
          label="Teachers"
          value={stats.teachers}
          icon={<FaChalkboardTeacher />}
          gradient="from-emerald-500 to-green-500"
        />
        <StatCard
          label="Students"
          value={stats.students}
          icon={<FaUserGraduate />}
          gradient="from-yellow-500 to-orange-500"
        />
        <StatCard
          label="Admins"
          value={stats.admins}
          icon={<FaSchool />}
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* SECONDARY STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* STATUS */}
        <div className="bg-base-100 border border-base-300 shadow-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">User Status</h2>

          <StatusRow
            label="Active Users"
            value={stats.active}
            icon={<FaUserCheck />}
            color="success"
          />
          <StatusRow
            label="Blocked Users"
            value={stats.blocked}
            icon={<FaUserSlash />}
            color="error"
          />
        </div>

        {/* ROLE DISTRIBUTION (CUSTOM BAR – FREE) */}
        <div className="bg-base-100 border border-base-300 shadow-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">Role Distribution</h2>
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
        </div>

        {/* SYSTEM INFO */}
        <div className="bg-base-100 border border-base-300 shadow-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">System Info</h2>

          <InfoRow label="Server Status" value="Online" />
          <InfoRow label="Database" value="Connected" />
          <InfoRow label="Last Sync" value="Just now" />
        </div>
      </div>

      {/* RECENT USERS */}
      <div className="bg-base-100 border border-base-300 shadow-xl">
        <div className="p-6 border-b border-base-300">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaClock /> Recent Users
          </h2>
        </div>

        <div className="divide-y divide-base-300 h-70 overflow-auto">
          {recentUsers.map((u) => (
            <div
              key={u._id}
              className="p-5 flex justify-between items-center hover:bg-base-200 transition"
            >
              <div>
                <p className="font-semibold">{u.name || "Unnamed User"}</p>
                <p className="text-sm opacity-60">{u.email}</p>
              </div>

              <div className="text-right">
                <span className="badge badge-outline capitalize">{u.role}</span>
                <p className="text-xs opacity-50 mt-1">
                  {new Date(u.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value, icon, gradient }) {
  return (
    <div className="relative overflow-hidden bg-base-100 border border-base-300 shadow-xl">
      <div className={`h-2 bg-linear-to-r ${gradient}`} />
      <div className="p-6 flex items-center gap-4">
        <div className="p-4 rounded-2xl bg-base-200 text-3xl shadow-inner">
          {icon}
        </div>
        <div>
          <p className="text-sm opacity-70">{label}</p>
          <p className="text-4xl font-extrabold">{value}</p>
        </div>
      </div>
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
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center p-3 rounded-2xl bg-base-200">
      <span className="font-medium">{label}</span>
      <span className="badge badge-outline">{value}</span>
    </div>
  );
}
