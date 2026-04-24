import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import {
  FaHome,
  FaChalkboardTeacher,
  FaTasks,
  FaFolderOpen,
} from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

export default function Sidebar() {
  const { user } = useAuth();
  const [collapsed /*setCollapsed*/] = useState(false);

  const defaultMenus = {
    teacher: [
      { path: "/", label: "Dashboard", icon: <FaHome size={22} /> },
      {
        path: "/classrooms",
        label: "My Classrooms",
        icon: <FaChalkboardTeacher size={22} />,
      },
      {
        path: "/assignments",
        label: "My Assignments",
        icon: <FaTasks size={22} />,
      },
      {
        path: "/materials",
        label: "My Materials",
        icon: <FaFolderOpen size={22} />,
      },
    ],

    student: [
      { path: "/", label: "Dashboard", icon: <FaHome size={22} /> },
      {
        path: "/classrooms",
        label: "Joined Classrooms",
        icon: <FaChalkboardTeacher size={22} />,
      },
      {
        path: "/assignments",
        label: "All Assignments",
        icon: <FaTasks size={22} />,
      },
      {
        path: "/materials",
        label: "All Materials",
        icon: <FaFolderOpen size={22} />,
      },
    ],
  };

  const menu = defaultMenus[user?.role] || [];

  return (
    <>
      {/* Desktop Sidebar Only */}
      <aside
        className={`bg-base-200 min-h-screen border-r-2 border-base-300 transition-all duration-300
        ${collapsed ? "w-16" : "w-64"} 
        hidden md:flex flex-col shadow-sm fixed left-0 top-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-base-300">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tighter">
                Kaksha
              </span>
            </Link>
          )}

          {/* <button
            onClick={() => setCollapsed(!collapsed)}
            className="btn btn-md btn-circle hover:bg-primary hover:text-white transition"
          >
            <FiSidebar size={20} />
          </button> */}
        </div>
        {/* User Section */}
        {/* <div className="flex items-center gap-3 p-3 border-b-2 border-base-300">
          <div className="avatar placeholder">
            <div className="bg-primary text-white rounded-full w-10 flex items-center justify-center text-lg font-bold">
              {(() => {
                const name = user?.name || "";
                const parts = name.trim().split(" ").filter(Boolean);

                if (parts.length === 0) return "C";
                if (parts.length === 1) return parts[0][0];

                return parts[0][0] + parts[parts.length - 1][0];
              })()}
            </div>
          </div>

          {!collapsed && (
            <div>
              <p className="font-semibold leading-none">{user?.name}</p>
              <p className="text-xs opacity-60 capitalize mt-1">{user?.role}</p>
            </div>
          )}
        </div> */}

        <Link
          to="/profile"
          className="flex items-center gap-3 p-2 cursor-pointer group border-b-2 border-base-300 hover:bg-base-300"
        >
          {/* Avatar */}
          <div
            className="bg-primary text-white rounded-full w-10 h-10
               flex items-center justify-center
               text-sm font-bold shadow-md"
          >
            {(() => {
              const name = user?.name || "";
              const parts = name.trim().split(" ").filter(Boolean);

              if (parts.length === 0) return "U";
              if (parts.length === 1) return parts[0][0].toUpperCase();

              return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            })()}
          </div>

          {/* Name (optional but recommended UX) */}
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-semibold text-sm">
              {user?.name || "User"}
            </span>
            <span className="text-xs opacity-60">View Profile</span>
          </div>
        </Link>

        {/* Menu */}
        <ul className="menu grow w-full p-2">
          {menu.map((item) => (
            <li key={item.path} className="my-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-none ${
                    isActive
                      ? "bg-primary text-white"
                      : "hover:bg-base-300 transition"
                  }`
                }
              >
                {item.icon}
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
        {/* Footer */}
        <div className="border-t-2 shadow-md border-base-300 p-2">
          {!collapsed && (
            <p className="text-sm text-center opacity-70 py-2">
              © {new Date().getFullYear()} Kaksha
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
