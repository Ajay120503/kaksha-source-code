import { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import toast from "react-hot-toast";
import UsersTable from "./UsersTable";
import { FaSearch } from "react-icons/fa";
import AdminHero from "./AdminHero";
import { useAuth } from "../../hooks/useAuth";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { user } = useAuth();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers();
      setUsers(res.data || []);
    } catch {
      toast.error("Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "blocked" && u.isBlocked) ||
      (statusFilter === "active" && !u.isBlocked);

    return matchSearch && matchRole && matchStatus;
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ================= HERO ================= */}
      <AdminHero
        title="User Management"
        subtitle="Block, activate and manage platform users."
        badge="Users Module"
        variant="users"
      />

      {/* ================= HEADER / TOOLBAR ================= */}
      <div className="relative bg-base-100 border border-base-300 shadow-xl p-5 md:p-6">
        <div className="flex flex-col gap-4">
          {/* TOP ROW : TITLE + META */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* LEFT */}
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                User Management
              </h1>
              <p className="text-sm opacity-70 mt-1">
                Search, filter, block or manage platform users
              </p>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="divider my-0"></div>

          {/* FILTER ROW */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* SEARCH */}
            <div className="relative flex-1 min-w-60">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 opacity-60" />
              <input
                className="input input-bordered w-full pl-11"
                placeholder="Search by email or role"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* ROLE FILTER */}
            <select
              className="select select-bordered w-full sm:w-44"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>

            {/* STATUS FILTER */}
            <select
              className="select select-bordered w-full sm:w-44"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* RESET */}
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
              className="btn btn-ghost btn-sm w-fit"
            >
              Reset
            </button>
          </div>
        </div>

        {/* SOFT GLOW */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.04),transparent_40%)]"></div>
      </div>

      {/* TABLE */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-base-100 shadow">
          <p className="text-lg font-semibold">No users found</p>
          <p className="text-sm opacity-60 mt-1">
            Try changing search or filters
          </p>
        </div>
      ) : (
        <UsersTable
          users={filteredUsers}
          setUsers={setUsers}
          currentUserId={user?._id}
        />
      )}
    </div>
  );
}
