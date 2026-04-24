import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
} from "../../services/notificationService";

import { Trash2, Check, Bell, MoreVertical } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ================= LOAD ================= */

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      toast.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  /* ================= MARK READ ================= */

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);

      setNotifications((prev) =>
        prev.map((n) => {
          if (n._id === id) {
            const updatedRecipients = n.recipients.map((r) =>
              String(r.user) === String(user._id) ? { ...r, read: true } : r
            );
            return { ...n, recipients: updatedRecipients };
          }
          return n;
        })
      );
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  /* ================= DELETE ================= */

  const remove = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= REDIRECT ================= */

  const handleRedirect = async (notification) => {
    try {
      await markRead(notification._id);

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FILTER ================= */

  const roleNotifications = notifications.filter((n) =>
    n.recipients.some((r) => r.role === user.role)
  );

  /* ================= UI ================= */

  return (
    <div className="max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-lg">
          <Bell className="text-primary text-2xl" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm opacity-60">
            Stay updated with classroom activities
          </p>
        </div>
      </div>

      {/* EMPTY STATE */}

      {roleNotifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 opacity-70">
          <Bell size={40} />
          <p className="mt-3 text-sm">No notifications yet</p>
        </div>
      )}

      {/* LIST */}

      <div className="space-y-3">
        {roleNotifications.map((n) => {
          const myRecipient = n.recipients.find(
            (r) => String(r.user) === String(user._id)
          );

          const unread = myRecipient ? myRecipient.read === false : false;

          return (
            <div
              key={n._id}
              onClick={() => handleRedirect(n)}
              className={`
                group
                flex items-start gap-4
                p-4 rounded-xl border
                transition-all duration-200
                cursor-pointer
                hover:shadow-md hover:bg-base-200
                ${
                  unread
                    ? "bg-primary/5 border-primary/30"
                    : "bg-base-100 border-base-300"
                }
              `}
            >
              {/* UNREAD DOT */}

              <div className="mt-1">
                {unread && (
                  <span className="w-2.5 h-2.5 bg-primary rounded-full block"></span>
                )}
              </div>

              {/* CONTENT */}

              <div className="flex-1">
                <h3 className="font-semibold">{n.title}</h3>

                <p className="text-sm opacity-70 mt-1">{n.message}</p>

                <span className="text-xs opacity-50">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              {/* ACTIONS */}

              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {/* DESKTOP ACTIONS */}

                {/* <div className="hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  {unread && (
                    <button
                      onClick={() => markRead(n._id)}
                      className="btn btn-xs btn-success gap-1"
                    >
                      <Check size={14} />
                      Read
                    </button>
                  )}

                  <button
                    onClick={() => remove(n._id)}
                    className="btn btn-xs btn-error btn-circle"
                  >
                    <Trash2 size={14} />
                  </button>
                </div> */}

                {/* MOBILE MENU */}

                <div className="dropdown dropdown-end">
                  <label
                    tabIndex={0}
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    <MoreVertical size={16} />
                  </label>

                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36 border border-base-300"
                  >
                    {unread && (
                      <li>
                        <button
                          onClick={() => markRead(n._id)}
                          className="text-success"
                        >
                          <Check size={14} />
                          Mark Read
                        </button>
                      </li>
                    )}

                    <li>
                      <button
                        onClick={() => remove(n._id)}
                        className="text-error"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
