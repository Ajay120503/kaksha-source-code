import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import NotificationButton from "../components/NotificationButton";
import RequestTeacherButton from "./RequestTeacherButton";
import JoinRequestButton from "../components/JoinRequestButton";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-200 sticky top-0 z-50 border-b-2 border-base-300 px-3 py-3">
      {/* LEFT */}
      <div className="flex-1 flex items-center gap-3">
        {/* Mobile Logo */}
        <Link to="/" className="flex items-center md:hidden">
          <span className="text-2xl font-bold tracking-tighter">Kaksha</span>
        </Link>
      </div>

      {/* RIGHT */}
      <div className="flex-none flex items-center gap-1">
        <NotificationButton />
        {user?.role === "teacher" && (
          <div className="tooltip  tooltip-left" data-tip="Join Request">
            <JoinRequestButton />
          </div>
        )}
        {user?.role === "student" && (
          <div className="tooltip  tooltip-left" data-tip="Send Request">
            <RequestTeacherButton />
          </div>
        )}
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
            <li>
              <Link to="/profile" className="flex items-center gap-2">
                <FaUserCircle /> Profile
              </Link>
            </li>

            <li>
              <button onClick={handleLogout} className="text-error flex gap-2">
                <FaSignOutAlt /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
