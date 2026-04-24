import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import classroomService from "../../services/classroomService";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import {
  FaUsers,
  FaBookOpen,
  FaFileAlt,
  FaBullhorn,
  FaBan,
  FaCopy,
  FaCheck,
  FaUser,
} from "react-icons/fa";
import { useClassroom } from "../../context/ClassroomDetailContext";
import { BiLock } from "react-icons/bi";
import { FaUserGroup } from "react-icons/fa6";
import ChatButton from "../../components/chat/ChatButton";

const classroomImages = [
  "/images/1.jpg",
  "/images/2.jpg",
  "/images/3.jpg",
  "/images/4.jpg",
  "/images/5.jpg",
  "/images/6.jpg",
  "/images/7.jpg",
];

export default function ClassroomDetail() {
  const { classId } = useParams();
  const { user } = useAuth();
  const { classroomsById, setClassroomsById } = useClassroom();
  const classroom = classroomsById[classId];
  const [copied, setCopied] = useState(false);
  const [bgImage, setBgImage] = useState(classroomImages[0]);

  const [banDialog, setBanDialog] = useState({
    open: false,
    studentId: null,
    studentName: "",
  });

  useEffect(() => {
    const random =
      classroomImages[Math.floor(Math.random() * classroomImages.length)];
    setBgImage(random);
  }, []);

  // ================== LOAD CLASSROOM ==================
  useEffect(() => {
    if (classroomsById[classId]) return;

    let alive = true;

    (async () => {
      try {
        const res = await classroomService.getClassroomById(classId);
        if (alive) {
          setClassroomsById((prev) => ({ ...prev, [classId]: res }));
        }
      } catch {
        toast.error("Failed to load classroom");
      }
    })();

    return () => (alive = false);
  }, [classId]);

  // const handleBanStudent = async (studentId) => {
  //   if (!confirm("Ban this student from rejoining the classroom?")) return;

  //   try {
  //     await classroomService.banStudent(classId, studentId);
  //     toast.success("Student banned successfully");

  //     setClassroomsById((prev) => {
  //       const cls = prev[classId] || {};
  //       const student = cls.students.find((s) => s._id === studentId);
  //       return {
  //         ...prev,
  //         [classId]: {
  //           ...cls,
  //           students: (cls.students || []).filter((s) => s._id !== studentId),
  //           bannedStudents: [...(cls.bannedStudents || []), student],
  //         },
  //       };
  //     });
  //   } catch {
  //     toast.error("Failed to ban student");
  //   }
  // };

  const confirmBanStudent = async () => {
    try {
      await classroomService.banStudent(classId, banDialog.studentId);

      toast.success("Student banned successfully");

      setClassroomsById((prev) => {
        const cls = prev[classId] || {};
        const student = cls.students.find((s) => s._id === banDialog.studentId);

        return {
          ...prev,
          [classId]: {
            ...cls,
            students: (cls.students || []).filter(
              (s) => s._id !== banDialog.studentId
            ),
            bannedStudents: [...(cls.bannedStudents || []), student],
          },
        };
      });
    } catch {
      toast.error("Failed to ban student");
    } finally {
      setBanDialog({ open: false, studentId: null, studentName: "" });
    }
  };

  const handleUnbanStudent = async (studentId) => {
    if (!confirm("Allow this student to rejoin the classroom?")) return;

    try {
      await classroomService.unbanStudent(classId, studentId);
      toast.success("Student unbanned successfully");

      setClassroomsById((prev) => {
        const cls = prev[classId] || {};
        const unbannedStudent = cls.bannedStudents.find(
          (s) => s._id === studentId
        );
        return {
          ...prev,
          [classId]: {
            ...cls,
            bannedStudents: (cls.bannedStudents || []).filter(
              (s) => s._id !== studentId
            ),
            students: [...(cls.students || []), unbannedStudent],
          },
        };
      });
    } catch {
      toast.error("Failed to unban student");
    }
  };

  if (!classroom)
    return (
      <div className="p-6 text-center h-100 flex justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ================= HERO ================= */}
      <div className="relative overflow-hidden border border-base-300 bg-base-100 shadow-2xl">
        <div className="absolute top-4 right-4 z-20">
          <ChatButton
            classId={classroom._id}
            className="btn btn-circle btn-primary shadow-lg hover:scale-105 transition-all duration-300"
          />
        </div>
        {/* Background Image */}
        <div
          className="h-58 md:h-64 w-full bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url(${bgImage})`,
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-tr from-black/80 via-black/50 to-black/10" />

        {/* Content */}
        <div className="absolute inset-0 flex items-end p-5 md:p-8">
          <div className="w-full flex flex-wrap items-end justify-between gap-6">
            {/* LEFT CONTENT */}
            <div className="max-w-3xl space-y-3">
              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white flex items-center gap-3 tracking-tight">
                {/* <div className="rounded-full bg-base-100 p-3 border border-base-300">
                  <GiTeacher className="opacity-90 text-primary" />
                </div> */}
                {classroom.name}
              </h1>

              {/* Description */}
              <p
                className="text-gray-100 text-sm md:text-base leading-relaxed
                     bg-white/10 backdrop-blur-md px-4 py-2
                     line-clamp-2 hover:overflow-y-auto transition-all duration-300"
                style={{ wordBreak: "break-word" }}
              >
                {classroom.description || "No description provided."}
              </p>

              {/* META INFO */}
              <div className="flex flex-wrap gap-2 pt-2 text-xs md:text-sm">
                {/* Teacher / Owner */}
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 
                           bg-white/15 backdrop-blur-md text-white shadow-md"
                >
                  {user?.role === "student" ? (
                    <>
                      <FaUser fontSize={16} className="opacity-80" />
                      Teacher:
                      <span className="font-semibold text-pretty">
                        {classroom.teacher?.name}
                      </span>
                    </>
                  ) : (
                    <>Your Classroom</>
                  )}
                </span>

                {/* Class Code */}
                {user?.role === "teacher" && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(classroom.code);
                      setCopied(true);
                      toast.success("Class code copied");
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-1.5
                         bg-white/15 backdrop-blur-md text-white
                         hover:bg-white/25 transition-all shadow-md"
                    title="Click to copy class code"
                  >
                    <BiLock fontSize={18} />
                    {copied ? (
                      <>
                        <FaCheck fontSize={18} className="text-green-400" />{" "}
                        Copied
                      </>
                    ) : (
                      <>
                        <span className="text-pretty">{classroom.code}</span>
                        <FaCopy size={18} className="opacity-80" />
                      </>
                    )}
                  </button>
                )}

                {/* Students Count */}
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5
                           bg-white/15 backdrop-blur-md text-white shadow-md"
                >
                  <FaUserGroup fontSize={18} />
                  <span className="text-pretty">
                    {classroom.students?.length || 0}
                  </span>
                  Students
                </span>
              </div>
            </div>

            {/* RIGHT AVATAR */}
            <div
              className="hidden xl:flex w-16 h-16 rounded-full 
                      bg-linear-to-br from-primary to-secondary
                      text-white font-bold text-3xl items-center justify-center
                      shadow-2xl ring-4 ring-white/30"
            >
              {(() => {
                const name = user?.name || "";
                const parts = name.trim().split(" ").filter(Boolean);

                if (parts.length === 0) return "C";
                if (parts.length === 1) return parts[0][0];

                return parts[0][0] + parts[parts.length - 1][0];
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* ================= ACTION CARDS ================= */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[
          {
            to: `/posts/${classId}`,
            icon: <FaBullhorn />,
            title: "Posts & Announcements",
            desc: "View class updates & discussions.",
            gradient: "from-blue-500 to-purple-500",
            bg: "bg-blue-100 text-blue-600",
          },
          {
            to: `/assignments/${classId}`,
            icon: <FaFileAlt />,
            title: "Assignments",
            desc: "Submit and track your work.",
            gradient: "from-green-500 to-blue-500",
            bg: "bg-green-100 text-green-600",
          },
          {
            to: `/materials/${classId}`,
            icon: <FaBookOpen />,
            title: "Study Materials",
            desc: "Access notes & resources.",
            gradient: "from-purple-500 to-pink-500",
            bg: "bg-purple-100 text-purple-600",
          },
        ].map((card, i) => (
          <Link
            key={i}
            to={card.to}
            className="group relative border border-base-300 bg-base-100 shadow hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div
              className={`absolute inset-0 opacity-10 bg-linear-to-r ${card.gradient} transition-all group-hover:opacity-20`}
            ></div>
            <div className="relative flex items-center gap-4 p-6">
              <div
                className={`p-3 rounded-full text-3xl shadow-inner ${card.bg} transition-transform`}
              >
                {card.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold group-hover:text-primary transition-all duration-300">
                  {card.title}
                </h2>
                <p className="text-sm opacity-70 mt-1 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                  {card.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ================= ACTIVE STUDENTS ================= */}
      {user?.role === "teacher" && (
        <StudentTable
          students={classroom.students}
          bannedStudents={classroom.bannedStudents}
          // handleBanStudent={handleBanStudent}
          setBanDialog={setBanDialog}
          handleUnbanStudent={handleUnbanStudent}
        />
      )}

      {/* ================= BANNED STUDENTS ================= */}
      {user?.role === "teacher" && classroom.bannedStudents?.length > 0 && (
        <BannedTable
          bannedStudents={classroom.bannedStudents}
          students={classroom.students}
          handleUnbanStudent={handleUnbanStudent}
        />
      )}

      {/* ================= BAN STUDENT MODAL ================= */}

      {banDialog.open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-warning flex items-center gap-2">
              <FaBan /> Ban Student
            </h3>

            <p className="py-4">
              Are you sure you want to ban <b>{banDialog.studentName}</b> from
              this classroom?
              <br />
              The student will not be able to rejoin unless unbanned.
            </p>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() =>
                  setBanDialog({
                    open: false,
                    studentId: null,
                    studentName: "",
                  })
                }
              >
                Cancel
              </button>

              <button className="btn btn-warning" onClick={confirmBanStudent}>
                Ban Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= ACTIVE STUDENTS TABLE ================= */
function StudentTable({ students, bannedStudents, setBanDialog }) {
  if (!students?.length)
    return <p className="opacity-70 text-sm">No students have joined yet.</p>;

  return (
    <div className="shadow-xl pt-2 bg-base-100 border border-base-300">
      <h2 className="text-2xl pl-2 font-bold mb-4 flex items-center gap-2">
        <FaUsers /> Joined Students
      </h2>
      <div className="overflow-x-auto max-h-70">
        <table className="table table-zebra min-w-150">
          <thead className="bg-base-200">
            <tr>
              <th>Student</th>
              <th>Email</th>
              <th className="text-center">Role</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((stu) => (
              <tr key={stu._id} className="hover">
                <td className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 aspect-square shrink-0 rounded-full 
                  bg-primary text-primary-content 
                  flex items-center justify-center 
                  font-bold"
                  >
                    {(() => {
                      const name = stu?.name || "";
                      const parts = name.trim().split(" ").filter(Boolean);

                      if (parts.length === 0) return "C";
                      if (parts.length === 1) return parts[0][0];

                      return parts[0][0] + parts[parts.length - 1][0];
                    })()}
                  </div>

                  <span className="font-semibold truncate">{stu.name}</span>
                </td>
                <td className="text-sm opacity-70">{stu.email}</td>
                <td className="text-center">
                  <span className="badge badge-outline">Student</span>
                </td>
                <td className="flex gap-2 justify-end">
                  {!bannedStudents?.includes(stu._id) && (
                    <button
                      className="btn btn-warning btn-sm btn-circle tooltip"
                      data-tip="Ban"
                      // onClick={() => handleBanStudent(stu._id)}
                      onClick={() =>
                        setBanDialog({
                          open: true,
                          studentId: stu._id,
                          studentName: stu.name,
                        })
                      }
                    >
                      <FaBan size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= BANNED STUDENTS TABLE ================= */
function BannedTable({ bannedStudents, handleUnbanStudent }) {
  return (
    <div className="shadow-xl pt-2 bg-base-100 border border-base-300 mt-8">
      <h2 className="text-2xl pl-2 font-bold mb-4 flex items-center gap-2">
        <FaBan /> Banned Students
      </h2>
      <div className="overflow-x-auto">
        <table className="table table-zebra min-w-150">
          <thead className="bg-base-200">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Student ID</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bannedStudents.map((stu) => (
              <tr key={stu._id} className="hover">
                <td className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 aspect-square shrink-0 rounded-full 
                  bg-primary text-primary-content 
                  flex items-center justify-center 
                  font-bold"
                  >
                    {(() => {
                      const name = stu?.name || "";
                      const parts = name.trim().split(" ").filter(Boolean);

                      if (parts.length === 0) return "C";
                      if (parts.length === 1) return parts[0][0];

                      return parts[0][0] + parts[parts.length - 1][0];
                    })()}
                  </div>

                  <span className="font-semibold truncate">{stu.name}</span>
                </td>
                <td>{stu.email}</td>
                <td>{stu._id}</td>
                <td className="flex gap-2 justify-end">
                  <button
                    className="btn btn-success btn-sm btn-circle tooltip"
                    onClick={() => handleUnbanStudent(stu._id)}
                    data-tip="Unban"
                  >
                    <FaBan size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
