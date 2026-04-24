import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUnreadCount } from "../services/notificationService";

export default function NotificationButton() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  /* ================= LOAD COUNT ON MOUNT ================= */
  useEffect(() => {
    const loadCount = async () => {
      try {
        const unread = await getUnreadCount();
        setCount(unread || 0);
      } catch (err) {
        console.error("Notification count error:", err);
      }
    };

    loadCount();
  }, []);

  return (
    <button
      onClick={() => navigate("/notifications")}
      className="
        relative
        btn btn-ghost btn-circle
        hover:bg-base-300
        transition-all duration-200
      "
    >
      {/* Bell Icon */}
      <Bell
        size={22}
        className="
          text-base-content
          transition-transform duration-200
          group-hover:scale-110 
        "
      />

      {/* Notification Badge */}
      {count > 0 && (
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
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
