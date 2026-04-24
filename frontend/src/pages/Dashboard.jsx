import { useEffect, useState } from "react";
import { useClassroom } from "../hooks/useClassroom";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FaCopy, FaCheck } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";

import { FaChalkboardTeacher, FaUsers } from "react-icons/fa";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const { classrooms, loading: classLoading } = useClassroom();
  const [recentClassrooms, setRecentClassrooms] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  const classroomImages = [
    "/images/1.jpg",
    "/images/2.jpg",
    "/images/3.jpg",
    "/images/4.jpg",
    "/images/5.jpg",
    "/images/6.jpg",
    "/images/7.jpg",
  ];

  const ROLE_UI = {
    teacher: {
      gradient: "from-emerald-600 via-teal-600 to-cyan-600",
      title: "Welcome to Kaksha 👋",
      highlight: "Teacher",
      message:
        "Create, manage, and inspire your learners effortlessly with powerful classroom tools.",
      badge: "Teacher Panel",
      badgeBg: "bg-white/90 text-black",
    },
    student: {
      gradient: "from-blue-600 via-indigo-600 to-purple-600",
      title: "Welcome to Kaksha 👋",
      highlight: "Student",
      message:
        "Join classrooms, track assignments, collaborate, and grow every day with smarter learning.",
      badge: "Student Panel",
      badgeBg: "bg-white/90 text-black",
    },
    admin: {
      gradient: "from-rose-600 via-red-600 to-orange-600",
      message:
        "Monitor the platform, manage users, and keep everything running smoothly.",
      badge: "Admin Dashboard",
      badgeBg: "bg-black/80 text-white",
    },
  };

  useEffect(() => {
    setRecentClassrooms(classrooms.slice(0, 3));
  }, [classrooms]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* for only admin */}
      {user?.role === "admin" && (
        <NavLink
          to="/120503"
          className="
      fixed bottom-2 right-5 z-50
      btn btn-outline btn-circle btn-md
      shadow-2xl
    "
          title="Admin Panel"
        >
          <CiSettings fontSize={22} />
        </NavLink>
      )}

      {/* HEADER */}
      <div className="relative overflow-hidden shadow-2xl">
        {/* Role-based Background */}
        <div
          className={`bg-linear-to-r ${ROLE_UI[user?.role]?.gradient} 
    text-white p-7 md:p-9 relative z-10`}
        >
          <div className="flex justify-between flex-wrap gap-4 items-center">
            {/* Text */}
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Welcome to <span className="text-yellow-300">Kaksha</span> 👋
              </h1>

              <p className="mt-3 text-sm sm:text-base leading-relaxed max-w-2xl opacity-90">
                {ROLE_UI[user?.role]?.message}
              </p>
            </div>

            {/* Role Badge */}
            {/* <span
              className={`px-5 py-2.5 rounded-full backdrop-blur font-semibold shadow-lg text-sm tracking-wide flex items-center gap-2 ${
                ROLE_UI[user?.role]?.badgeBg
              }`}
            >
              {ROLE_UI[user?.role]?.badge}
            </span> */}
          </div>
        </div>

        {/* Soft Shine Effect */}
        <div className="absolute inset-0 bg-[radial-linear(circle_at_top_left,rgba(255,255,255,0.25),transparent_40%)]"></div>

        {/* Pattern Grid Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[linear-linear(45deg,white_1px,transparent_1px),linear-linear(-45deg,white_1px,transparent_1px)] bg-size-[50px_50px]"></div>
      </div>

      {/* STATS */}
      {(user?.role === "student" || user?.role === "teacher") && (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Card — Classrooms Count */}
          <div className="relative overflow-hidden border border-base-300 shadow-xl bg-base-100">
            {/* linear Strip */}
            <div className="h-2 bg-linear-to-r from-blue-500 to-indigo-500"></div>

            <div className="p-6 flex items-center gap-4">
              <div className="p-4 rounded-full bg-blue-100 text-blue-600 text-4xl shadow-inner">
                <FaChalkboardTeacher />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  {user?.role === "teacher"
                    ? "Classrooms Created"
                    : "Enrolled Classrooms"}
                </h2>

                <p className="text-4xl font-extrabold mt-1">
                  {classrooms.length}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {user?.role === "teacher"
                    ? "You are shaping minds"
                    : "Keep learning consistently"}
                </p>
              </div>
            </div>
          </div>

          {/* Card — Active Learning */}
          <div className="relative overflow-hidden border border-base-300 shadow-xl bg-base-100">
            <div className="h-2 bg-linear-to-r from-green-500 to-emerald-500"></div>

            <div className="p-6 flex items-center gap-4">
              <div className="p-4 rounded-full bg-green-100 text-green-600 text-4xl shadow-inner">
                <FaUsers />
              </div>

              <div>
                <h2 className="text-lg font-semibold">Active Learning</h2>

                <p className="text-4xl font-extrabold mt-1">
                  {classrooms.length > 0 ? "ON" : "OFF"}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Keep up the great work
                </p>
              </div>
            </div>
          </div>

          {/* Card — Progress */}
          <div className="relative overflow-hidden border border-base-300 shadow-xl bg-base-100">
            <div className="h-2 bg-linear-to-r from-purple-500 to-pink-500"></div>

            <div className="p-6 flex items-center gap-4">
              <div className="p-4 rounded-full bg-purple-100 text-purple-600 text-4xl shadow-inner">
                📚
              </div>

              <div>
                <h2 className="text-lg font-semibold">Learning Progress</h2>

                <p className="text-4xl font-extrabold mt-1">
                  {user?.role === "teacher" ? "Great" : "Growing"}
                </p>

                <p className="text-sm text-gray-500 mt-1">Stay consistent</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLASSROOMS */}
      {(user?.role === "student" || user?.role === "teacher") && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {user?.role === "teacher"
                ? "Your Created Classrooms"
                : "Recent Joined Classrooms"}
            </h2>
          </div>

          {/* Loading Skeleton */}
          {classLoading ? (
            <div className="text-center">Loading...</div>
          ) : classrooms.length === 0 ? (
            <div className="text-center py-14 border border-base-300  shadow-sm bg-base-100">
              <p className="text-lg font-semibold">
                {user?.role === "teacher"
                  ? "You haven't created any classrooms yet."
                  : "You haven't joined any classroom yet."}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Start your learning journey today
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {recentClassrooms.map((cls, index) => (
                <Link
                  to={`/class/${cls._id}`}
                  key={cls._id}
                  className="group relative block"
                >
                  <div className="group relative border border-base-300 shadow-xl bg-base-100 overflow-hidden cursor-pointer">
                    {/* Top Banner */}
                    <div className="h-24 w-full bg-linear-to-r from-primary to-secondary relative">
                      <div className="absolute -bottom-10 left-6 z-10">
                        <div
                          className="w-16 h-16 rounded-full bg-base-100 shadow-xl border 
                flex items-center justify-center text-primary 
                text-3xl font-bold uppercase"
                        >
                          {(() => {
                            const name = cls?.teacher?.name || "";
                            const parts = name
                              .trim()
                              .split(" ")
                              .filter(Boolean);

                            if (parts.length === 0) return "C";
                            if (parts.length === 1) return parts[0][0];

                            return parts[0][0] + parts[parts.length - 1][0];
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
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
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 transition-all"></div>

                      <div className="relative backdrop-blur-md bg-black/20 rounded-2xl p-4 text-white transition-all duration-300">
                        <h3 className="text-xl font-bold transition truncate group-hover:line-clamp-none">
                          {cls.name}
                        </h3>

                        <p className="opacity-80 text-sm mt-1 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                          {cls.description || "No description added"}
                        </p>

                        <div className="flex justify-between items-center mt-5">
                          {/* Teacher Badge */}
                          <span className="badge badge-primary badge-lg flex items-center gap-2 truncate max-w-30">
                            {user?.role === "student" ? (
                              <span className="truncate max-w-30">
                                {cls.teacher?.name || "Teacher"}
                              </span>
                            ) : (
                              <span className="truncate max-w-30">{`Your Class`}</span>
                            )}
                          </span>

                          {/* Role Badge / Class Code */}
                          {user?.role === "teacher" ? (
                            <span
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigator.clipboard.writeText(cls.code);
                                setCopiedId(cls._id);
                                toast.success("Class code copied!");
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="badge badge-outline cursor-pointer flex items-center gap-2 hover:bg-black/50 transition-all duration-300"
                              title="Click to copy class code"
                            >
                              {copiedId === cls._id ? (
                                <>
                                  <FaCheck className="text-success" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  {cls.code}
                                  <FaCopy className="opacity-70" />
                                </>
                              )}
                            </span>
                          ) : (
                            <span className="badge badge-success badge-ghost flex items-center gap-2">
                              <span className="w-2 h-2 bg-success rounded-full"></span>
                              Enrolled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
