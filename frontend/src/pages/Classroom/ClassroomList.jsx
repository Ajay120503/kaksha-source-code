import { Link } from "react-router-dom";
import { useClassroom } from "../../hooks/useClassroom";
import { useAuth } from "../../hooks/useAuth";
import { FaUsers, FaUser } from "react-icons/fa";
import { FaCopy, FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";
import { useState } from "react";
import { FaTrash, FaSignOutAlt } from "react-icons/fa";
import classroomService from "../../services/classroomService";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClassroomList() {
  const { user } = useAuth();
  const { classrooms, loading } = useClassroom();
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  const [leaveDialog, setLeaveDialog] = useState({
    open: false,
    classId: null,
    className: "",
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    classId: null,
    className: "",
  });

  const classroomImages = [
    "/images/1.jpg",
    "/images/2.jpg",
    "/images/3.jpg",
    "/images/4.jpg",
    "/images/5.jpg",
    "/images/6.jpg",
    "/images/7.jpg",
  ];

  if (loading)
    return (
      <div className="p-6 text-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  // const handleDeleteClass = async (e, classId) => {
  //   e.preventDefault();
  //   e.stopPropagation();

  //   if (!confirm("Delete this classroom permanently?")) return;

  //   try {
  //     await classroomService.deleteClassroom(classId);
  //     toast.success("Classroom deleted");
  //     window.location.reload();
  //   } catch {
  //     toast.error("Failed to delete classroom");
  //   }
  // };

  const confirmDeleteClass = async () => {
    try {
      await classroomService.deleteClassroom(deleteDialog.classId);

      toast.success("Classroom deleted");

      window.location.reload();
    } catch {
      toast.error("Failed to delete classroom");
    } finally {
      setDeleteDialog({ open: false, classId: null, className: "" });
    }
  };

  // const handleLeaveClass = async (e, classId) => {
  //   e.preventDefault();
  //   e.stopPropagation();

  //   if (!confirm("Leave this classroom?")) return;

  //   try {
  //     await classroomService.leaveClassroom(classId);
  //     toast.success("You left the classroom");
  //     window.location.reload();
  //   } catch {
  //     toast.error("Failed to leave classroom");
  //   }
  // };

  const confirmLeaveClass = async () => {
    try {
      await classroomService.leaveClassroom(leaveDialog.classId);

      toast.success("You left the classroom");

      window.location.reload();
    } catch {
      toast.error("Failed to leave classroom");
    } finally {
      setLeaveDialog({ open: false, classId: null, className: "" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-2xl font-bold">
            {user?.role === "teacher" ? "My Classrooms" : "Join Classrooms"}
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            {user?.role === "teacher"
              ? "Manage and organize your classes"
              : "Access classrooms you’ve joined"}
          </p>
        </div>

        {user?.role === "student" && (
          <Link to="/join" className="btn btn-sm btn-primary gap-2">
            Join Classroom
          </Link>
        )}

        {user?.role === "teacher" && (
          <Link to="/create" className="btn btn-sm btn-primary gap-2">
            Create Classroom
          </Link>
        )}
      </div>

      {/* Classroom Cards Grid */}
      {/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6"> */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {classrooms.map((c, index) => (
          // <Link
          //   key={c._id}
          //   to={`/class/${c._id}`}
          //   className="relative group block"
          // >
          <div
            key={c._id}
            className="relative group block cursor-pointer"
            onClick={() => navigate(`/class/${c._id}`)}
          >
            <div className="border border-base-300 shadow-xl bg-base-100">
              {/* Top Gradient Banner */}
              <div className="h-24 w-full bg-linear-to-r from-primary to-secondary relative">
                <div className="absolute -bottom-10 left-6 z-10">
                  <div className="w-16 h-16 z-50 rounded-full bg-base-100 shadow-xl border flex items-center justify-center text-primary text-3xl font-bold uppercase">
                    {(() => {
                      const name = c?.teacher?.name || "";
                      const parts = name.trim().split(" ").filter(Boolean);

                      if (parts.length === 0) return "C";
                      if (parts.length === 1) return parts[0][0];

                      return parts[0][0] + parts[parts.length - 1][0];
                    })()}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div
                className="pt-12 px-6 pb-6 relative text-white"
                style={{
                  backgroundImage: `url(${
                    classroomImages[index % classroomImages.length]
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* overlay */}
                <div className="absolute inset-0 bg-black/40"></div>

                <div className="relative">
                  <h2 className="text-2xl font-bold">{c.name}</h2>

                  <p className="opacity-90 text-sm mt-1 line-clamp-2">
                    {c.description}
                  </p>

                  {/* Footer */}
                  <div className="mt-5 flex justify-between items-center">
                    <span className="badge badge-primary badge-lg flex items-center gap-2 truncate max-w-30">
                      {user?.role === "student" ? (
                        <span className="truncate max-w-30">
                          {c.teacher?.name}
                        </span>
                      ) : (
                        <span className="truncate max-w-30">{`Your Class`}</span>
                      )}
                    </span>

                    {/* STUDENT COUNT (teacher only) */}
                    {user?.role === "teacher" && (
                      <span className="badge badge-outline flex items-center gap-2 absolute top-0 right-0">
                        <FaUser /> {c.students?.length || 0}
                      </span>
                    )}
                    {user?.role === "teacher" && (
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          navigator.clipboard.writeText(c.code);
                          setCopiedId(c._id);
                          toast.success("Class code copied");

                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="badge badge-outline cursor-pointer flex items-center gap-2 hover:bg-black/50 transition"
                        title="Click to copy class code"
                      >
                        {copiedId === c._id ? (
                          <>
                            <FaCheck className="text-success" />
                            Copied
                          </>
                        ) : (
                          <>
                            {c.code}
                            <FaCopy className="opacity-70" />
                          </>
                        )}
                      </span>
                    )}
                    {/* TEACHER DELETE */}
                    {/* {user?.role === "teacher" && (
                      // <button
                      //   onClick={(e) => handleDeleteClass(e, c._id)}
                      //   className="badge badge-error gap-2 cursor-pointer btn-circle btn-sm"
                      //   title="Delete Classroom"
                      // >
                      //   <FaTrash />
                      // </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          setDeleteDialog({
                            open: true,
                            classId: c._id,
                            className: c.name,
                          });
                        }}
                        className="badge badge-error gap-2 cursor-pointer btn-circle btn-sm"
                        title="Delete Classroom"
                      >
                        <FaTrash />
                      </button>
                    )} */}
                    {user?.role === "teacher" && (
                      <div
                        className="dropdown dropdown-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button className="btn btn-ghost btn-sm btn-circle">
                          <MoreVertical size={20} />
                        </button>

                        <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 border border-base-300 z-50">
                          <li>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                setDeleteDialog({
                                  open: true,
                                  classId: c._id,
                                  className: c.name,
                                });
                              }}
                              className="flex items-center gap-2 text-error"
                            >
                              <FaTrash size={14} />
                              Delete Class
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* STUDENT LEAVE */}
                    {user?.role === "student" && (
                      // <button
                      //   onClick={(e) => handleLeaveClass(e, c._id)}
                      //   className="badge badge-warning gap-2 cursor-pointer btn-circle btn-sm"
                      //   title="Leave Classroom"
                      // >
                      //   <FaSignOutAlt />
                      // </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          setLeaveDialog({
                            open: true,
                            classId: c._id,
                            className: c.name,
                          });
                        }}
                        className="badge badge-warning gap-2 cursor-pointer btn-circle btn-sm"
                        title="Leave Classroom"
                      >
                        <FaSignOutAlt />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!classrooms.length && (
        <div className="text-center py-20 opacity-60">
          <FaUsers className="text-5xl mx-auto mb-4" />
          <p>No classrooms available</p>
        </div>
      )}

      {/* ================= LEAVE CLASSROOM MODAL ================= */}

      {leaveDialog.open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-warning">Leave Classroom</h3>

            <p className="py-4">
              Are you sure you want to leave <b>{leaveDialog.className}</b>?
            </p>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() =>
                  setLeaveDialog({ open: false, classId: null, className: "" })
                }
              >
                Cancel
              </button>

              <button className="btn btn-warning" onClick={confirmLeaveClass}>
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CLASSROOM MODAL ================= */}

      {deleteDialog.open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Delete Classroom</h3>

            <p className="py-4">
              Are you sure you want to delete <b>{deleteDialog.className}</b>?
              <br />
              This action cannot be undone.
            </p>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() =>
                  setDeleteDialog({ open: false, classId: null, className: "" })
                }
              >
                Cancel
              </button>

              <button className="btn btn-error" onClick={confirmDeleteClass}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
