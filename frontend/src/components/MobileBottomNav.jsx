import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaChalkboardTeacher,
  FaTasks,
  FaFolderOpen,
} from "react-icons/fa";

export default function MobileBottomNav({ role }) {
  const menus = {
    teacher: [
      { path: "/", icon: <FaHome size={22} />, tooltip: "Dashboard" },
      {
        path: "/classrooms",
        icon: <FaChalkboardTeacher size={22} />,
        tooltip: "My Classes",
      },
      {
        path: "/assignments",
        icon: <FaTasks size={22} />,
        tooltip: "Assignments",
      },
      {
        path: "/materials",
        icon: <FaFolderOpen size={22} />,
        tooltip: "Materials",
      },
    ],

    student: [
      { path: "/", icon: <FaHome size={22} />, tooltip: "Dashboard" },
      {
        path: "/classrooms",
        icon: <FaChalkboardTeacher size={22} />,
        tooltip: "Classes",
      },
      {
        path: "/assignments",
        icon: <FaTasks size={22} />,
        tooltip: "Assignments",
      },
      {
        path: "/materials",
        icon: <FaFolderOpen size={22} />,
        tooltip: "Materials",
      },
    ],
  };

  const items = menus[role] || [];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-base-100 border-t-2 border-base-300 shadow-lg md:hidden z-50">
      <div className="flex justify-around py-2">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-2 ${
                isActive ? "text-primary font-semibold" : "text-gray-500"
              }`
            }
          >
            {item.icon}
            <span className="text-[11px]">{item.tooltip}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
