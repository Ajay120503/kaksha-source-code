import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaChartBar,
  FaSchool,
  FaUserShield,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";

export default function AdminMobileBottomNav() {
  const { user } = useAuth();

  // show only for admin
  if (user?.role !== "admin") return null;

  const menus = [
    {
      path: "/120503",
      icon: <FaHome size={22} />,
      label: "Home",
    },
    {
      path: "/120503/users",
      icon: <FaUsers size={22} />,
      label: "Users",
    },
    {
      path: "/120503/stats",
      icon: <FaChartBar size={22} />,
      label: "Stats",
    },
    {
      path: "/120503/classrooms",
      icon: <FaSchool size={22} />,
      label: "Classes",
    },
    {
      path: "/120503",
      icon: <FaUserShield size={22} />,
      label: "Admin",
      floating: true, // special style
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full md:hidden z-50">
      <div className="relative bg-base-100 border-t border-base-300 shadow-2xl">
        <div className="flex justify-around items-center py-2">
          {menus.map((item) =>
            item.floating ? (
              /* CENTER FLOATING ADMIN BUTTON */
              <NavLink
                key={item.label}
                to={item.path}
                className="
                  absolute -top-6
                  flex items-center justify-center
                  w-14 h-14 rounded-full
                  bg-linear-to-r from-purple-600 via-indigo-600 to-blue-600
                  text-white shadow-2xl
                  hover:scale-110 transition
                "
              >
                {item.icon}
              </NavLink>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-1 transition ${
                    isActive ? "text-primary font-semibold" : "text-gray-500"
                  }`
                }
              >
                {item.icon}
                <span className="text-[11px]">{item.label}</span>
              </NavLink>
            )
          )}
        </div>
      </div>
    </div>
  );
}
