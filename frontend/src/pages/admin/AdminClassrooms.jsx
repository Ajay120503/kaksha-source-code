import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaTrash,
  FaCopy,
  FaCheck,
} from "react-icons/fa";
import adminService from "../../services/adminService";
import AdminHero from "./AdminHero";
import { MdMoreVert } from "react-icons/md";

export default function AdminClassrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");

  const [dialog, setDialog] = useState({
    open: false,
    classroom: null,
  });

  // Fetch classrooms
  const loadClassrooms = async () => {
    try {
      setLoading(true);
      const res = await adminService.getClassrooms();
      setClassrooms(res.data || []);
    } catch {
      toast.error("Failed to load classrooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassrooms();
  }, []);

  // const handleDeleteClass = async (id) => {
  //   if (!confirm("Delete this classroom permanently?")) return;
  //   try {
  //     await adminService.deleteClassroom(id);
  //     setClassrooms((prev) => prev.filter((c) => c._id !== id));
  //     toast.success("Classroom deleted!");
  //   } catch {
  //     toast.error("Delete failed!");
  //   }
  // };

  const confirmDeleteClass = async () => {
    try {
      await adminService.deleteClassroom(dialog.classroom._id);

      setClassrooms((prev) =>
        prev.filter((c) => c._id !== dialog.classroom._id)
      );

      toast.success("Classroom deleted!");
    } catch {
      toast.error("Delete failed!");
    } finally {
      setDialog({ open: false, classroom: null });
    }
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Class code copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter classrooms
  const filteredClassrooms = classrooms
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter((c) => (filterTeacher ? c.teacher?.name === filterTeacher : true));

  const teachers = [
    ...new Set(classrooms.map((c) => c.teacher?.name).filter(Boolean)),
  ];

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  // Compute summary stats
  const totalStudents = classrooms.reduce(
    (acc, c) => acc + (c.students?.length || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ================= HERO ================= */}
      <div className="relative overflow-hidden shadow-2xl">
        <AdminHero
          title="Classroom Overview"
          subtitle="Monitor teachers, students and classrooms."
          badge="Classrooms"
          variant="classrooms"
        />

        {/* shine */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_40%)]"></div>
      </div>
      {/* ================= HEADER + FILTER ================= */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Classroom Dashboard</h1>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search classrooms..."
            className="input input-bordered w-full md:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select select-bordered md:w-48"
            value={filterTeacher}
            onChange={(e) => setFilterTeacher(e.target.value)}
          >
            <option value="">All Teachers</option>
            {teachers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Classrooms"
          value={classrooms.length}
          icon={<FaChalkboardTeacher />}
          gradient="from-blue-500 to-indigo-500"
          note="All classes"
        />
        <SummaryCard
          title="Total Students"
          value={totalStudents}
          icon={<FaUserGraduate />}
          gradient="from-emerald-500 to-green-500"
          note="All learners"
        />
        <SummaryCard
          title="Total Teachers"
          value={teachers.length}
          icon={<FaChalkboardTeacher />}
          gradient="from-orange-500 to-amber-500"
          note="Content creators"
        />
      </div>

      {/* ================= CLASSROOM TABLE ================= */}
      <GlassCard title="All Classrooms">
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <th>Name</th>
                <th>Teacher</th>
                <th>Students</th>
                <th>Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClassrooms.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.teacher?.name || "N/A"}</td>
                  <td>{c.students?.length || 0}</td>
                  <td>
                    <span
                      className="badge badge-outline cursor-pointer"
                      onClick={() => handleCopyCode(c.code, c._id)}
                    >
                      {copiedId === c._id ? (
                        <>
                          <FaCheck className="text-success" /> Copied
                        </>
                      ) : (
                        <>
                          {c.code} <FaCopy className="opacity-70" />
                        </>
                      )}
                    </span>
                  </td>
                  <td className="flex justify-end">
                    <div className="dropdown dropdown-end">
                      <label
                        tabIndex={0}
                        className="btn btn-ghost btn-sm btn-circle"
                      >
                        <MdMoreVert size={20} />
                      </label>

                      <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36 border border-base-300"
                      >
                        <li>
                          <button
                            onClick={() =>
                              setDialog({
                                open: true,
                                classroom: c,
                              })
                            }
                            className="text-error"
                          >
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* ================= DELETE MODAL ================= */}

      {dialog.open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Delete Classroom</h3>

            <p className="py-4">
              Are you sure you want to delete classroom{" "}
              <b>{dialog.classroom?.name}</b>?
              <br />
              This action cannot be undone.
            </p>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setDialog({ open: false, classroom: null })}
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

/* ================= REUSABLE UI ================= */

function SummaryCard({ title, value, icon, gradient, note }) {
  return (
    <div className="relative overflow-hidden shadow-xl bg-base-100 border border-base-300">
      <div className={`h-2 bg-linear-to-r ${gradient}`} />
      <div className="p-6 flex items-center gap-4">
        <div className="p-4 rounded-2xl bg-base-200 text-3xl shadow-inner">
          {icon}
        </div>
        <div>
          <p className="text-sm opacity-70">{title}</p>
          <p className="text-4xl font-extrabold">{value}</p>
          {note && <p className="text-xs opacity-60 mt-1">{note}</p>}
        </div>
      </div>
    </div>
  );
}

function GlassCard({ title, children }) {
  return (
    <div className="bg-base-100/80 backdrop-blur border border-base-300 shadow-xl p-6">
      <h2 className="text-xl font-bold mb-5">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}


