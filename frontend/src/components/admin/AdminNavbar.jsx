import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import NotificationButton from "../../components/NotificationButton";
import { UserPlus } from "lucide-react";
import adminService from "../../services/adminService";
import { useEffect, useState } from "react";

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const [requestCount, setRequestCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCount = async () => {
      try {
        const { data } = await adminService.getRoleRequestCount();
        setRequestCount(data.count || 0);
      } catch (err) {
        console.error("Role request count error:", err);
      }
    };

    loadCount();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-200 shadow-md sticky top-0 z-40 border-b border-base-300 py-3 px-3">
      {/* LEFT */}
      <div className="flex-1 flex items-center gap-3">
        {/* Mobile Logo */}
        <Link to="/120503" className="flex items-center md:hidden">
          <span className="text-2xl font-bold tracking-tighter">Kaksha</span>
        </Link>
      </div>

      {/* RIGHT */}
      <div className="flex-none flex items-center gap-1">
        <NotificationButton />
        <div className="tooltip tooltip-left" data-tip="See Requests">
          <Link
            to="/120503/role-requests"
            className="
      relative
      btn btn-ghost btn-circle
      hover:bg-base-300
      transition-all duration-200
    "
          >
            <UserPlus size={20} />

            {/* REQUEST BADGE */}
            {requestCount > 0 && (
              <span
                className="
          absolute -top-1 -right-1
          min-w-4.5 h-4.5
          px-1
          flex items-center justify-center
          text-[10px] font-bold
          rounded-full
          bg-primary text-white
          shadow-md
        "
              >
                {requestCount > 99 ? "99+" : requestCount}
              </span>
            )}
          </Link>
        </div>
        {/* USER DROPDOWN */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} className="btn btn-circle avatar placeholder">
            <div className="bg-primary text-white rounded-full w-10 flex items-center justify-center text-lg">
              {(() => {
                const name = user?.name || "";
                const parts = name.trim().split(" ").filter(Boolean);

                if (parts.length === 0) return "C";
                if (parts.length === 1) return parts[0][0];

                return parts[0][0] + parts[parts.length - 1][0];
              })()}
            </div>
          </div>

          <ul className="menu menu-md dropdown-content mt-3 shadow bg-base-100 border border-base-300 rounded-box w-44">
            <li className="py-2 text-sm opacity-70">
              <Link to="/profile" className="flex items-center gap-2">
                <FaUserCircle /> Profile
              </Link>
            </li>

            <li>
              <button
                onClick={handleLogout}
                className="text-error flex items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
