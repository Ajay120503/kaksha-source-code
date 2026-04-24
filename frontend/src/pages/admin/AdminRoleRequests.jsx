import { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import toast from "react-hot-toast";
import {
  FaCheck,
  FaTimes,
  FaTrash,
  FaEllipsisV,
  FaUserShield,
} from "react-icons/fa";

export default function AdminRoleRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data } = await adminService.getRoleRequests();
      setRequests(data);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  /* ================= ACTIONS ================= */

  const approve = async (id) => {
    try {
      await adminService.approveRoleRequest(id);
      toast.success("Role Approved");
      fetchRequests();
    } catch {
      toast.error("Approval failed");
    }
  };

  const reject = async (id) => {
    try {
      await adminService.rejectRoleRequest(id);
      toast.success("Request Rejected");
      fetchRequests();
    } catch {
      toast.error("Reject failed");
    }
  };

  const deleteRequest = async (id) => {
    try {
      await adminService.deleteRoleRequest(id);
      toast.success("Request deleted");
      fetchRequests();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= LOADING ================= */

  if (loading)
    return (
      <div className="flex justify-center mt-20">
        <span className="loading loading-lg"></span>
      </div>
    );

  /* ================= UI ================= */

  return (
    <div className="max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-xl bg-primary/10">
          <FaUserShield className="text-primary text-2xl" />
        </div>

        <div>
          <h1 className="text-xl font-bold">Teacher Role Requests</h1>
          <p className="text-sm opacity-60">
            Manage user requests for teacher role access
          </p>
        </div>
      </div>

      {/* EMPTY STATE */}
      {requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 opacity-70">
          <FaUserShield size={40} />
          <p className="mt-3 text-sm">No role requests available</p>
        </div>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {requests.map((req) => {
          const name = req?.user?.name || "Unknown User";
          const parts = name.trim().split(" ").filter(Boolean);

          const initials =
            parts.length === 1
              ? parts[0][0].toUpperCase()
              : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();

          return (
            <div
              key={req._id}
              className="group flex relative flex-col sm:flex-row sm:items-start gap-4 p-4 bg-base-100 border border-base-300 rounded-xl hover:shadow-lg transition"
            >
              {/* STATUS BAR */}
              <div
                className={`w-full sm:w-1 h-1 sm:h-full rounded-full ${
                  req.status === "approved"
                    ? "bg-success"
                    : req.status === "rejected"
                    ? "bg-error"
                    : "bg-warning"
                }`}
              />

              {/* MAIN CONTENT */}
              <div className="flex items-start gap-3 flex-1">
                {/* AVATAR */}
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
                  {initials}
                </div>

                {/* USER INFO */}
                <div className="flex-1">
                  <p className="font-semibold text-base-content">{name}</p>

                  <p className="text-sm opacity-60 break-all">
                    {req.user?.email}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-sm">
                      Requested:
                      <span className="ml-1 font-medium text-primary">
                        {req.requestedRole}
                      </span>
                    </span>

                    <span
                      className={`badge badge-sm ${
                        req.status === "approved"
                          ? "badge-success"
                          : req.status === "rejected"
                          ? "badge-error"
                          : "badge-warning"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end sm:justify-start gap-2 mt-2 sm:mt-0">
                {/* DESKTOP */}
                {/* <div className="hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  {req.status === "pending" && (
                    <>
                      <button
                        onClick={() => approve(req._id)}
                        className="btn btn-success btn-xs btn-circle"
                      >
                        <FaCheck size={12} />
                      </button>

                      <button
                        onClick={() => reject(req._id)}
                        className="btn btn-error btn-xs btn-circle"
                      >
                        <FaTimes size={12} />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => deleteRequest(req._id)}
                    className="btn btn-ghost btn-xs text-error btn-circle"
                  >
                    <FaTrash size={18} />
                  </button>
                </div> */}

                {/* MOBILE MENU */}
                <div className="dropdown dropdown-end absolute sm:top-1 top-6 right-1">
                  <label
                    tabIndex={0}
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    <FaEllipsisV size={14} />
                  </label>

                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36 border border-base-300"
                  >
                    {req.status === "pending" && (
                      <>
                        <li>
                          <button
                            onClick={() => approve(req._id)}
                            className="text-success"
                          >
                            <FaCheck /> Approve
                          </button>
                        </li>

                        <li>
                          <button
                            onClick={() => reject(req._id)}
                            className="text-warning"
                          >
                            <FaTimes /> Reject
                          </button>
                        </li>
                      </>
                    )}

                    <li>
                      <button
                        onClick={() => deleteRequest(req._id)}
                        className="text-error"
                      >
                        <FaTrash /> Delete
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
