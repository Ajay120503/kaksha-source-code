import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import assignmentService from "../../services/assignmentService";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import {
  FaPen,
  FaCalendarAlt,
  FaStar,
  FaSearch,
  FaDownload,
} from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useAssignment } from "../../context/AssignmentContext";
import { GrDocumentNotes } from "react-icons/gr";
import { MoreVertical } from "lucide-react";

export default function AssignmentList() {
  const { classId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { assignmentsByClass, setAssignmentsByClass } = useAssignment();
  const assignments = assignmentsByClass[classId] || [];

  const [loading, setLoading] = useState(false);

  // UI states
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("nearest");
  const [preview, setPreview] = useState(null);

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
    title: "",
  });

  const classroomImages = [
    "/images/1.jpg",
    "/images/4.jpg",
    "/images/5.jpg",
    "/images/6.jpg",
  ];

  // const loadAssignments = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await assignmentService.getAssignmentsByClass(classId);
  //     setAssignmentsByClass((prev) => ({ ...prev, [classId]: res || [] }));
  //   } catch {
  //     toast.error("Failed to load assignments");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   if (!assignmentsByClass[classId]) loadAssignments();
  // }, [classId]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const res = await assignmentService.getAssignmentsByClass(classId);

      setAssignmentsByClass((prev) => ({
        ...prev,
        [classId]: res || [],
      }));
    } catch {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!assignmentsByClass[classId]) {
      loadAssignments();
    }
  }, [classId]);

  // const deleteAssignment = async (id) => {
  //   if (!confirm("Delete assignment?")) return;

  //   try {
  //     await assignmentService.deleteAssignment(id);

  //     setAssignmentsByClass((prev) => ({
  //       ...prev,
  //       [classId]: prev[classId]?.filter((a) => a._id !== id),
  //     }));

  //     toast.success("Assignment deleted");
  //   } catch {
  //     toast.error("Delete failed");
  //   }
  // };

  const confirmDeleteAssignment = async () => {
    try {
      await assignmentService.deleteAssignment(deleteDialog.id);

      setAssignmentsByClass((prev) => ({
        ...prev,
        [classId]: prev[classId]?.filter((a) => a._id !== deleteDialog.id),
      }));

      toast.success("Assignment deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteDialog({ open: false, id: null, title: "" });
    }
  };

  // 🧠 Filter + Search + Sort
  const filteredAssignments = useMemo(() => {
    let data = [...assignments];

    const searchTerm = search.toLowerCase().trim();

    // 🔎 ADVANCED SEARCH
    if (searchTerm) {
      data = data.filter((a) => {
        const titleMatch = a.title?.toLowerCase().includes(searchTerm);

        const descriptionMatch = a.description
          ?.toLowerCase()
          .includes(searchTerm);

        const deadlineDate = a.deadline ? new Date(a.deadline) : null;

        const dateMatch = deadlineDate
          ? deadlineDate.toLocaleDateString().toLowerCase().includes(searchTerm)
          : false;

        const monthMatch = deadlineDate
          ? deadlineDate
              .toLocaleString("default", { month: "long" })
              .toLowerCase()
              .includes(searchTerm)
          : false;

        const yearMatch = deadlineDate
          ? deadlineDate.getFullYear().toString().includes(searchTerm)
          : false;

        const withAttachmentMatch =
          searchTerm === "with" && a.attachments?.length;

        const withoutAttachmentMatch =
          searchTerm === "without" && !a.attachments?.length;

        const overdueMatch =
          searchTerm === "overdue" && deadlineDate && new Date() > deadlineDate;

        const noDeadlineMatch = searchTerm === "no deadline" && !a.deadline;

        return (
          titleMatch ||
          descriptionMatch ||
          dateMatch ||
          monthMatch ||
          yearMatch ||
          withAttachmentMatch ||
          withoutAttachmentMatch ||
          overdueMatch ||
          noDeadlineMatch
        );
      });
    }

    // 📎 FILTER
    if (filter === "with") data = data.filter((a) => a.attachments?.length);

    if (filter === "without") data = data.filter((a) => !a.attachments?.length);

    // ⏳ SORT
    data.sort((a, b) => {
      const dateA = a.deadline
        ? new Date(a.deadline)
        : new Date(8640000000000000); // far future

      const dateB = b.deadline
        ? new Date(b.deadline)
        : new Date(8640000000000000);

      return sort === "nearest" ? dateA - dateB : dateB - dateA;
    });

    return data;
  }, [assignments, search, filter, sort]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-72">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Assignments</h1>
          <p className="text-sm opacity-70">
            View, submit, and manage classroom assignments
          </p>
        </div>

        {user?.role === "teacher" && (
          <button
            onClick={() => navigate(`/assignments/create/${classId}`)}
            className="btn btn-primary btn-sm"
          >
            Create Assignment
          </button>
        )}
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            className="input input-bordered pl-10"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select select-bordered"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="with">With Attachment</option>
          <option value="without">Without Attachment</option>
        </select>

        <select
          className="select select-bordered"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="nearest">Nearest Deadline</option>
          <option value="latest">Latest Deadline</option>
        </select>
      </div>

      {/* <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-3 gap-1 space-y-1"> */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-1">
        {filteredAssignments.map((a, i) => {
          const file = a.attachments?.[0]?.url || a.attachments?.[0];
          const isPdf = file?.toLowerCase().includes(".pdf");

          return (
            <div
              key={a._id}
              onClick={() => navigate(`/assignment/submission/${a._id}`)}
              className="group relative h-70 border-2 border-base-300 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer bg-base-100"
              style={{
                backgroundImage: `url(${
                  classroomImages[i % classroomImages.length]
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-linear-to-b 
                      from-white/5 via-black/10 to-black/20
                      group-hover:from-white/5 group-hover:to-black/40
                      transition-all duration-300"
              />

              {/* Badge */}
              <span className="absolute flex gap-2 top-4 right-4 z-30 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-black shadow">
                <GrDocumentNotes size={16} /> Assignment
              </span>
              {/* Content */}
              <div className="z-20 h-full flex flex-col justify-between p-5 text-white">
                {/* Title */}
                <div className="backdrop-blur-md bg-black/40 rounded-xl p-4">
                  <h2 className="text-lg font-bold line-clamp-2">{a.title}</h2>
                  <p className="text-xs mt-1 opacity-90 line-clamp-3">
                    {a.description || "No description provided"}
                  </p>
                </div>

                {/* Bottom */}
                <div className="flex justify-between items-end gap-3 text-xs sm:text-sm">
                  {/* Info */}
                  <div className="space-y-2 text-sm text-white/90">
                    {/* Deadline */}
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-yellow-300" />
                      {a.deadline ? (
                        <span>
                          {new Date(a.deadline).toLocaleDateString()} •{" "}
                          {a.endTime
                            ? new Date(
                                `1970-01-01T${a.endTime}`
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "No Time"}
                        </span>
                      ) : (
                        "No deadline"
                      )}
                    </div>

                    {/* Marks */}
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-400" />
                      <span>Marks: {a.maxMarks}</span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div
                    className="
    flex gap-2
    opacity-100
    md:opacity-0 md:group-hover:opacity-100
    transition-opacity duration-300
  "
                  >
                    {user?.role === "student" && file && (
                      <div className="flex gap-2 z-30">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreview({ url: file, isPdf });
                          }}
                          className="btn btn-outline btn-xs text-white border-white hover:bg-white/20"
                        >
                          Preview
                        </button>
                        {/* ⬇ Download Button (All files) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const link = document.createElement("a");
                            link.href = file;
                            link.download = file.split("/").pop(); // get filename
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="btn btn-outline btn-xs btn-circle text-white border-white hover:bg-white/20"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    )}

                    {/* {user?.role === "teacher" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/assignments/edit/${a._id}`);
                          }}
                          className="btn btn-warning btn-xs btn-circle"
                        >
                          <FaPen size={16} />
                        </button>

                        <button
                          // onClick={(e) => {
                          //   e.stopPropagation();
                          //   deleteAssignment(a._id);
                          // }}
                          onClick={(e) => {
                            e.stopPropagation();

                            setDeleteDialog({
                              open: true,
                              id: a._id,
                              title: a.title,
                            });
                          }}
                          className="btn btn-error btn-xs btn-circle"
                        >
                          <MdDelete size={16} />
                        </button>
                      </>
                    )} */}
                    {user?.role === "teacher" && (
                      <div
                        className="dropdown dropdown-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Three Dot Button */}
                        <label
                          tabIndex={0}
                          className="btn btn-ghost btn-sm btn-circle"
                        >
                          <MoreVertical size={20} />
                        </label>

                        {/* Dropdown Menu */}
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32 border border-base-300 z-100"
                        >
                          <li>
                            <button
                              onClick={() =>
                                navigate(`/assignments/edit/${a._id}`)
                              }
                              className="flex items-center text-blue-500 gap-2"
                            >
                              <FaPen size={14} />
                              Edit
                            </button>
                          </li>

                          <li>
                            <button
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  id: a._id,
                                  title: a.title,
                                })
                              }
                              className="text-error flex items-center gap-2"
                            >
                              <MdDelete size={14} />
                              Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= DELETE ASSIGNMENT MODAL ================= */}

      {deleteDialog.open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error flex items-center gap-2">
              <MdDelete /> Delete Assignment
            </h3>

            <p className="py-4">
              Are you sure you want to delete{" "}
              <b>{deleteDialog.title || "this assignment"}</b> ?
              <br />
              This action cannot be undone.
            </p>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() =>
                  setDeleteDialog({ open: false, id: null, title: "" })
                }
              >
                Cancel
              </button>

              <button
                className="btn btn-error"
                onClick={confirmDeleteAssignment}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 PREVIEW MODAL */}
      {preview && (
        <div className="fixed inset-0 z-70 bg-black/80 flex items-center justify-center">
          <div className="relative bg-base-100 md:rounded-2xl w-full max-w-3xl max-h-[80vh]">
            <button
              className="absolute top-3 right-3 btn btn-sm btn-circle"
              onClick={() => setPreview(null)}
            >
              ✕
            </button>

            <img
              src={preview.url}
              className="w-full h-full object-contain rounded-2xl"
              alt="Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
