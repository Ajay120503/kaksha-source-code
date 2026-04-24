import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import assignmentService from "../../services/assignmentService";
import submissionService from "../../services/submissionService";
import classroomService from "../../services/classroomService";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { FaCheckCircle, FaClock, FaUsers } from "react-icons/fa";
import { useAssignment } from "../../context/AssignmentContext";

export default function AllAssignmentList() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const classroomImages = [
    "/images/1.jpg",
    "/images/4.jpg",
    "/images/5.jpg",
    "/images/6.jpg",
  ];

  const { assignments, setAssignments } = useAssignment();

  const loadAllAssignments = async () => {
    try {
      setLoading(true);

      const classes = await classroomService.myClassrooms();
      let result = [];

      for (const cls of classes) {
        const assignments = await assignmentService.getAssignmentsByClass(
          cls._id
        );

        for (const a of assignments) {
          if (user.role === "student") {
            const mySub = await submissionService.getMySubmission(a._id);

            result.push({
              classroom: cls.name,
              assignment: a,
              submitted: !!mySub,
              submission: mySub,
            });
          }

          if (user.role === "teacher") {
            const subs = await submissionService.getAllSubmissions(a._id);

            result.push({
              classroom: cls.name,
              assignment: a,
              submittedCount: subs.length,
              totalStudents: cls.students.length,
            });
          }
        }
      }

      return result;
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assignments");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignments !== null) {
      setData(assignments);
      setLoading(false);
      return;
    }

    loadAllAssignments().then((result) => {
      setData(result);
      setAssignments(result);
    });
  }, [assignments, user.role]);

  const processedData = data
    // 🔍 SEARCH (Multi-field search)
    .filter((item) => {
      const query = search.toLowerCase();

      return (
        item.assignment.title?.toLowerCase().includes(query) ||
        item.classroom?.toLowerCase().includes(query) ||
        item.assignment.description?.toLowerCase().includes(query) ||
        String(item.assignment.maxMarks || "")
          .toLowerCase()
          .includes(query) ||
        (item.assignment.deadline &&
          new Date(item.assignment.deadline)
            .toLocaleDateString()
            .toLowerCase()
            .includes(query))
      );
    })

    // 🎯 FILTER (Student Only)
    .filter((item) => {
      if (user.role !== "student") return true;

      if (filter === "submitted") return item.submitted;
      if (filter === "pending") return !item.submitted;

      return true;
    })

    // 📅 SORT
    .sort((a, b) => {
      const dateA = a.assignment.deadline
        ? new Date(a.assignment.deadline)
        : new Date(0);

      const dateB = b.assignment.deadline
        ? new Date(b.assignment.deadline)
        : new Date(0);

      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  if (loading)
    return (
      <div className="flex justify-center items-center h-72">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {user.role === "student" ? "My Assignments" : "Classroom Overview"}
          </h1>
          <p className="text-sm opacity-70 mt-1">
            {user.role === "student"
              ? "Track your submissions and deadlines"
              : "Monitor assignment progress"}
          </p>
        </div>

        {/* Teacher Summary */}
        {user.role === "teacher" && (
          <div className="bg-base-200 rounded-lg px-4 py-3 shadow-sm">
            <div className="flex items-center justify-end gap-4">
              <span className="text-sm font-medium">Total Assignments</span>

              <span className="text-lg font-bold text-primary">
                {data.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            className={`btn btn-sm ${
              filter === "all" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          {user.role === "student" && (
            <>
              <button
                className={`btn btn-sm ${
                  filter === "submitted" ? "btn-success" : "btn-ghost"
                }`}
                onClick={() => setFilter("submitted")}
              >
                Submitted
              </button>

              <button
                className={`btn btn-sm ${
                  filter === "pending" ? "btn-warning" : "btn-ghost"
                }`}
                onClick={() => setFilter("pending")}
              >
                Pending
              </button>
            </>
          )}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search assignment..."
          className="input input-bordered input-md w-full md:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Sort */}
        <select
          className="select select-bordered select-md w-full md:w-40"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">Deadline ↑</option>
          <option value="desc">Deadline ↓</option>
        </select>
      </div>

      {/* Empty State */}
      {data.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-2xl">
          <h2 className="text-xl font-semibold mb-2">No Assignments Found</h2>
          <p className="opacity-70">
            Assignments will appear here once created.
          </p>
        </div>
      ) : (
        // <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-1">
          {processedData.map((item, i) => {
            const { assignment } = item;

            const isLate =
              assignment.deadline && new Date() > new Date(assignment.deadline);

            // Status Badge
            let statusBadge;

            if (user.role === "student") {
              if (item.submitted) {
                statusBadge = (
                  <span className="badge badge-success gap-1">
                    <FaCheckCircle /> Submitted
                  </span>
                );
              } else if (isLate) {
                statusBadge = (
                  <span className="badge badge-error gap-1">
                    <FaClock /> Late
                  </span>
                );
              } else {
                statusBadge = (
                  <span className="badge badge-warning gap-1">
                    <FaClock /> Pending
                  </span>
                );
              }
            }

            return (
              <div
                key={i}
                onClick={() =>
                  navigate(`/assignment/submission/${assignment._id}`)
                }
                className="group relative h-70 overflow-hidden border border-base-300 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
                style={{
                  backgroundImage: `url(${
                    classroomImages[i % classroomImages.length]
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/40 to-black/70 group-hover:to-black/80 transition-all duration-300" />

                {/* Classroom Badge */}
                <span className="absolute top-4 right-4 z-30 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-black shadow">
                  {item.classroom}
                </span>

                {/* Content */}
                <div className="relative z-20 flex flex-col justify-between h-full p-5 text-white">
                  {/* TOP */}
                  <div>
                    <h2 className="text-lg font-semibold leading-snug line-clamp-2">
                      {assignment.title}
                    </h2>

                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {assignment.deadline ? (
                        <span className="py-1 rounded-md flex items-center gap-1">
                          {new Date(assignment.deadline).toLocaleDateString()} •{" "}
                          {assignment.endTime
                            ? new Date(
                                `1970-01-01T${assignment.endTime}`
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "No Time"}
                        </span>
                      ) : (
                        <span>No Deadline</span>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM */}
                  <div className="flex items-center justify-between">
                    {/* LEFT SIDE */}
                    <div>
                      {user.role === "student" ? (
                        statusBadge
                      ) : (
                        <span className="badge badge-info badge-sm gap-1">
                          <FaUsers />
                          {item.submittedCount}/{item.totalStudents}
                        </span>
                      )}
                    </div>

                    {/* RIGHT SIDE BUTTON */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/assignment/submission/${assignment._id}`);
                      }}
                      className={`
        btn btn-xs rounded-full px-4
        ${user.role === "student" ? "btn-primary" : "btn-success"}
      `}
                    >
                      {user.role === "student"
                        ? item.submitted
                          ? "View"
                          : "Submit"
                        : "View"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
