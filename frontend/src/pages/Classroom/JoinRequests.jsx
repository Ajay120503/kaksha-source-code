import { useEffect, useState } from "react";
import joinRequestService from "../../services/joinRequestService";
import toast from "react-hot-toast";
import { FaUserClock, FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import { MoreVertical } from "lucide-react";

export default function JoinRequests() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const { data } = await joinRequestService.getRequests();
      setRequests(data);
    } catch {
      toast.error("Failed to load requests");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approve = async (id) => {
    await joinRequestService.approve(id);
    toast.success("Student approved");
    fetchRequests();
  };

  const reject = async (id) => {
    await joinRequestService.reject(id);
    toast("Request rejected");
    fetchRequests();
  };

  const remove = async (id) => {
    await joinRequestService.delete(id);
    toast.success("Request deleted");
    fetchRequests();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* HEADER */}

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-xl">
          <FaUserClock className="text-primary text-2xl" />
        </div>

        <div>
          <h2 className="text-xl font-bold">Join Requests</h2>
          <p className="text-sm opacity-60">
            Students requesting access to your classrooms
          </p>
        </div>
      </div>

      {/* EMPTY STATE */}

      {requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 opacity-70">
          <FaUserClock size={40} />
          <p className="mt-3 text-sm">No join requests yet</p>
        </div>
      )}

      {/* REQUEST LIST */}

      <div className="space-y-3">
        {requests.map((r) => (
          <div
            key={r._id}
            className="
  group
  flex flex-col sm:flex-row
  sm:items-start
  gap-4
  p-4 rounded-xl border
  bg-base-100
  border-base-300
  hover:bg-base-200
  hover:shadow-md
  transition
  relative
  "
          >
            {/* TOP SECTION */}

            <div className="flex items-start gap-3 flex-1">
              {/* STATUS DOT */}

              <div className="mt-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full block ${
                    r.status === "pending"
                      ? "bg-warning"
                      : r.status === "approved"
                      ? "bg-success"
                      : "bg-error"
                  }`}
                />
              </div>

              {/* AVATAR */}

              <div
                className="
      bg-primary text-white
      rounded-full w-10 h-10
      flex items-center justify-center
      text-sm font-bold
      shadow shrink-0
      "
              >
                {(() => {
                  const name = r?.student?.name || "";
                  const parts = name.trim().split(" ").filter(Boolean);

                  if (parts.length === 0) return "U";
                  if (parts.length === 1) return parts[0][0].toUpperCase();

                  return (
                    parts[0][0] + parts[parts.length - 1][0]
                  ).toUpperCase();
                })()}
              </div>

              {/* CONTENT */}

              <div className="flex-1">
                <p className="font-semibold leading-snug">
                  {r.student.name}

                  <span className="font-normal text-base-content/70">
                    {" "}
                    requested to join{" "}
                  </span>

                  <span className="text-primary font-medium wrap-break-word">
                    {r.classroom.name}
                  </span>
                </p>

                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span
                    className={`badge badge-sm ${
                      r.status === "pending"
                        ? "badge-warning"
                        : r.status === "approved"
                        ? "badge-success"
                        : "badge-error"
                    }`}
                  >
                    {r.status}
                  </span>

                  <span className="text-xs opacity-50">
                    Classroom access request
                  </span>

                  <span className="text-xs opacity-40">
                    {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex items-center justify-end gap-2 mt-2 sm:mt-0">
              {/* DESKTOP ACTIONS */}
              {/* <div className="hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition">
                {r.status === "pending" && (
                  <>
                    <button
                      onClick={() => approve(r._id)}
                      className="btn btn-xs btn-success gap-1"
                    >
                      <FaCheck size={12} />
                      Approve
                    </button>

                    <button
                      onClick={() => reject(r._id)}
                      className="btn btn-xs btn-error gap-1"
                    >
                      <FaTimes size={12} />
                      Reject
                    </button>
                  </>
                )}

                <button
                  onClick={() => remove(r._id)}
                  className="btn btn-xs gap-1 btn-ghost text-error"
                >
                  <FaTrash size={12} />
                  Delete
                </button>
              </div> */}

              {/* MOBILE MENU */}
              <div className="dropdown dropdown-end absolute top-1 right-1">
                <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
                  <MoreVertical size={20} />
                </label>

                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36 border border-base-300"
                >
                  {r.status === "pending" && (
                    <>
                      <li>
                        <button
                          onClick={() => approve(r._id)}
                          className="text-success"
                        >
                          <FaCheck /> Approve
                        </button>
                      </li>

                      <li>
                        <button
                          onClick={() => reject(r._id)}
                          className="text-warning"
                        >
                          <FaTimes /> Reject
                        </button>
                      </li>
                    </>
                  )}

                  <li>
                    <button
                      onClick={() => remove(r._id)}
                      className="text-error"
                    >
                      <FaTrash /> Delete
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
