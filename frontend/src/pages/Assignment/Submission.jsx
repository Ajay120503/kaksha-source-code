import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import submissionService from "../../services/submissionService";
import assignmentService from "../../services/assignmentService";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { FaFileAlt, FaFilePdf, FaSearch } from "react-icons/fa";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { RiFileExcel2Line } from "react-icons/ri";
import { FaX } from "react-icons/fa6";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Submission() {
  const { id } = useParams();
  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [showPlagModal, setShowPlagModal] = useState(false);
  const [activePlagiarism, setActivePlagiarism] = useState({
    score: 0,
    flagged: false,
    matches: [],
  });

  // Load assignment & submissions
  const loadData = async () => {
    setLoading(true);
    try {
      const a = await assignmentService.getAssignmentById(id);
      setAssignment(a);

      if (user?.role === "student") {
        const sub = await submissionService.getMySubmission(id);
        setMySubmission(sub || null);
      }

      if (user?.role === "teacher") {
        const subs = await submissionService.getAllSubmissions(id);
        setAllSubmissions(
          subs.map((s) => ({
            ...s,
            marksInput: s.marks ?? "",
            feedbackInput: s.feedback ?? "",
          }))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const uploadFile = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await api.post("/upload/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return {
        fileUrl: res.data.fileUrl,
        fileType: file.type,
      };
    } catch (err) {
      console.error(err);
      toast.error("File upload failed");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!file) return toast.error("Select a file to submit");

    try {
      const upload = await uploadFile(file);

      await submissionService.submit({
        assignmentId: id,
        fileUrl: upload.fileUrl,
        fileType: upload.fileType,
      });

      toast.success("Submitted successfully");
      setFile(null);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Submission failed");
    }
  };

  const handleGrade = async (submissionId, marks, feedback, plagiarism) => {
    if (plagiarism?.flagged) {
      return toast.error("Grading blocked: Plagiarism detected");
    }

    if (marks === "" || isNaN(Number(marks)))
      return toast.error("Enter valid marks");

    try {
      await submissionService.gradeSubmission(submissionId, {
        grade: Number(marks),
        feedback,
      });
      toast.success("Graded successfully");
      loadData();
    } catch {
      toast.error("Failed to grade submission");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  if (!assignment)
    return <div className="p-6 text-center">Assignment not found</div>;

  // const checkDeadlinePassed = (date) => new Date() > new Date(date);

  const exportExcel = () => {
    if (!allSubmissions.length) return;

    /* ================= HEADER INFO ================= */
    const teacherName = user?.name || "Teacher";
    const assignmentTitle = assignment?.title || "Assignment";

    /* ================= SUMMARY SHEET ================= */
    const summaryData = [
      { Field: "Teacher", Value: teacherName },
      { Field: "Assignment", Value: assignmentTitle },
      { Field: "Total Submissions", Value: allSubmissions.length },
      {
        Field: "Flagged Cases",
        Value: allSubmissions.filter((s) => s.plagiarism?.flagged).length,
      },
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);

    /* ================= STUDENT SHEET ================= */
    const studentRows = allSubmissions.map((s, i) => ({
      "Sr No": i + 1,
      Student: s.student.name,
      Email: s.student.email,
      Status: s.isLate ? "Late" : "On Time",
      Marks: s.marks ?? "-",
      Feedback: s.feedback ?? "-",
      Similarity: s.plagiarism?.score ?? 0,
    }));

    const studentSheet = XLSX.utils.json_to_sheet(studentRows);

    /* ===== AUTO COLUMN WIDTH ===== */
    studentSheet["!cols"] = Object.keys(studentRows[0]).map(() => ({
      wch: 22,
    }));

    /* ===== COLOR SIMILARITY CELLS ===== */
    studentRows.forEach((row, index) => {
      const cellAddress = `G${index + 2}`; // similarity column

      let color = "C6EFCE"; // green
      if (row.Similarity > 40) color = "FFC7CE";
      else if (row.Similarity > 20) color = "FFEB9C";

      studentSheet[cellAddress].s = {
        fill: { fgColor: { rgb: color } },
      };
    });

    /* ================= PLAGIARISM SHEET ================= */
    const plagRows = [];

    allSubmissions.forEach((s) => {
      (s.plagiarism?.matchedWith || []).forEach((m) => {
        plagRows.push({
          Student: s.student.name,
          MatchedWith: m.student?.name || "Unknown",
          Email: m.student?.email || "-",
          Similarity: m.similarity,
        });
      });
    });

    const plagSheet = XLSX.utils.json_to_sheet(plagRows);

    /* ================= WORKBOOK ================= */
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(wb, studentSheet, "Submissions");
    XLSX.utils.book_append_sheet(wb, plagSheet, "Plagiarism");

    XLSX.writeFile(wb, `${assignmentTitle}-submissions.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    const teacherName = user?.name || "Teacher";
    const assignmentTitle = assignment?.title || "Assignment";

    doc.setFontSize(16);
    doc.text("Assignment Submission Report", 14, 15);

    doc.setFontSize(11);
    doc.text(`Teacher: ${teacherName}`, 14, 25);
    doc.text(`Assignment: ${assignmentTitle}`, 14, 32);

    const tableData = allSubmissions.map((s, i) => [
      i + 1,
      s.student.name,
      s.student.email,
      s.isLate ? "Late" : "On Time",
      s.marks ?? "-",
      s.plagiarism?.score ?? 0 + "%",
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["#", "Student", "Email", "Status", "Marks", "Similarity"]],
      body: tableData,
      styles: { fontSize: 9 },
      didParseCell: function (data) {
        if (data.column.index === 5) {
          const val = parseInt(data.cell.raw);
          if (val > 40) data.cell.styles.fillColor = [255, 199, 206];
          else if (val > 20) data.cell.styles.fillColor = [255, 235, 156];
          else data.cell.styles.fillColor = [198, 239, 206];
        }
      },
    });

    doc.save(`${assignmentTitle}-report.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Assignment Header */}
      <div
        // className="relative py-2 rounded-2xl overflow-hidden shadow-lg border border-base-300"
        className="h-56 sm:h-64 md:h-72 bg-cover bg-center relative py-2 overflow-hidden shadow-lg border border-base-300"
        style={{
          backgroundImage: `url("/images/5.jpg")`,
        }}
      >
        <div className="absolute inset-0 bg-linear-to-r from-black/70 to-black/40"></div>
        <div className="relative h-full flex flex-col px-6 text-white">
          <h1 className="text-3xl font-bold">{assignment.title}</h1>
          {user?.role == "student" && (
            <p className="mt-1 text-sm max-w-2xl md:line-clamp-3 line-clamp-3">
              {assignment.description}
            </p>
          )}
          <div className="mt-3 flex gap-3 text-sm">
            <span
              className={`px-3 py-1 rounded-full font-semibold bg-white/20`} //${
              //   checkDeadlinePassed(assignment.isLate)
              //     ? "bg-red-500/80"
              //     : "bg-green-500/80"
              // }`}
            >
              Due :{" "}
              {assignment.deadline
                ? new Date(assignment.deadline).toLocaleDateString()
                : "—"}{" "}
              •{" "}
              {assignment.endTime
                ? new Date(
                    `1970-01-01T${assignment.endTime}`
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "No Time"}
            </span>
            <span className="px-3 py-1 rounded-full font-semibold bg-white/20">
              Max Marks : {assignment.maxMarks}
            </span>
          </div>
        </div>
      </div>

      {/* Student View */}
      {user?.role === "student" && (
        <div className="space-y-4">
          {/* SECTION TITLE */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Your Submission</h2>

            {mySubmission?.resubmitted && (
              <span className="badge badge-warning badge-md">Resubmitted</span>
            )}
          </div>

          {/* ================= MAIN CARD ================= */}
          {mySubmission ? (
            <div className="bg-base-100 border border-base-300 shadow-xl overflow-hidden">
              {/* ===== STATUS BAR ===== */}
              <div className="bg-base-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <IoCheckmarkDoneCircle className="text-success text-xl" />
                  </div>

                  <div>
                    <p className="font-semibold">Assignment Submitted</p>
                    <p className="text-xs opacity-60">
                      Last updated:{" "}
                      {new Date(mySubmission.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <span className="badge badge-success badge-lg">Submitted</span>
              </div>

              {/* ===== CONTENT ===== */}
              <div className="p-2 space-y-6">
                {/* FILE CARD */}
                {mySubmission.file ? (
                  <a
                    href={mySubmission.file}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <div className="flex items-center justify-between gap-4 p-4 border border-base-300 bg-base-100 hover:bg-base-200 transition cursor-pointer">
                      {/* LEFT SIDE */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary text-primary-content flex items-center justify-center text-lg">
                          <FaFileAlt />
                        </div>

                        <div>
                          <p className="font-semibold">Submitted File</p>
                          <p className="text-sm opacity-70">
                            Click to view or download
                          </p>
                        </div>
                      </div>

                      {/* RIGHT SIDE */}
                      <div className="text-sm font-medium text-primary">
                        Open
                      </div>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-base-300 bg-base-200">
                    <div className="w-12 h-12 rounded-xl bg-base-300 flex items-center justify-center text-lg">
                      <FaFileAlt />
                    </div>

                    <p className="text-sm opacity-60">No file uploaded</p>
                  </div>
                )}

                {/* MARKS + FEEDBACK */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* MARKS CARD */}
                  <div className="flex items-center gap-4 p-5 border border-base-300 bg-base-100 hover:bg-base-200 transition">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center">
                      <span className="text-success text-xl">🏆</span>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col">
                      <p className="text-xs uppercase tracking-wide opacity-60">
                        Marks
                      </p>

                      <p className="text-2xl font-bold leading-tight">
                        {mySubmission.marks ?? "—"}
                      </p>

                      {!mySubmission.marks && (
                        <span className="text-xs opacity-60">
                          Not graded yet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* FEEDBACK CARD */}
                  <div className="flex items-start gap-4 p-5 border border-base-300 bg-base-100 hover:bg-base-200 transition">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                      <span className="text-primary text-xl">💬</span>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col">
                      <p className="text-xs uppercase tracking-wide opacity-60">
                        Teacher Feedback
                      </p>

                      <p className="text-sm mt-1 leading-relaxed">
                        {mySubmission.feedback || "No feedback yet"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ===== PLAGIARISM CARD ===== */}
                {mySubmission?.plagiarism && (
                  <div className="border border-base-300 bg-base-200 p-4 shadow-sm hover:shadow-md transition-all">
                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className="w-11 h-11 rounded-2xl bg-warning/10 flex items-center justify-center text-warning text-lg">
                          <FaSearch fontSize={18} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-base">
                            Plagiarism Analysis
                          </h3>
                          <p className="text-xs opacity-60">
                            Automatic similarity detection
                          </p>
                        </div>
                      </div>

                      {/* STATUS BADGE */}
                      <span
                        className={`badge badge-lg font-medium ${
                          mySubmission.plagiarism.flagged
                            ? "badge-error"
                            : "badge-success"
                        }`}
                      >
                        {mySubmission.plagiarism.flagged ? "Flagged" : "Clean"}
                      </span>
                    </div>

                    {/* SCORE SECTION */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="opacity-70">Similarity Score</span>
                        <span className="font-semibold">
                          {mySubmission.plagiarism.score}%
                        </span>
                      </div>

                      {/* PROGRESS BAR */}
                      <progress
                        className={`progress w-full h-3 ${
                          mySubmission.plagiarism.flagged
                            ? "progress-error"
                            : "progress-success"
                        }`}
                        value={mySubmission.plagiarism.score}
                        max="100"
                      />

                      {/* MESSAGE */}
                      <div
                        className={`rounded-lg px-4 py-3 text-sm ${
                          mySubmission.plagiarism.flagged
                            ? "bg-error/10 text-error"
                            : "bg-success/10 text-success"
                        }`}
                      >
                        {mySubmission.plagiarism.flagged
                          ? "High similarity detected. Instructor review required."
                          : "Submission appears original with low similarity."}
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== RESUBMIT SECTION ===== */}
                {mySubmission.marks == null ? (
                  <div className="border-t border-base-300 pt-6 space-y-4">
                    <h3 className="font-semibold">Resubmit Assignment</h3>

                    <div className="border-2 border-dashed border-base-300 p-6 text-center hover:border-primary transition">
                      <input
                        type="file"
                        className="file-input file-input-bordered w-full"
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                      <p className="text-xs opacity-60 mt-2">
                        Upload updated file
                      </p>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={uploading}
                      className="btn btn-sm btn-warning"
                    >
                      {uploading && (
                        <span className="loading loading-spinner loading-sm"></span>
                      )}
                      {uploading ? "Resubmitting..." : "Resubmit Assignment"}
                    </button>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    🔒 Assignment graded — resubmission disabled.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* FIRST SUBMISSION */
            <div className="bg-base-100 border border-base-300 shadow-xl p-8 space-y-5">
              <h3 className="text-lg font-semibold">Submit Your Assignment</h3>

              <div className="border-2 border-dashed border-base-300 p-6 hover:border-primary transition">
                <input
                  type="file"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <p className="text-sm opacity-70 mt-2">
                  Upload PDF / DOC / Image
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="btn btn-sm btn-primary"
              >
                {uploading && (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
                {uploading ? "Submitting..." : "Submit Assignment"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Teacher View */}
      {user?.role === "teacher" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center justify-between">
            Student Submissions
            <div className="flex gap-2 ">
              <div className="lg:tooltip" data-tip="Export in Excel">
                <button
                  className="btn btn-success btn-sm btn-circle text-white"
                  onClick={exportExcel}
                >
                  <RiFileExcel2Line fontSize={18} />
                </button>
              </div>

              <div className="lg:tooltip" data-tip="Export in PDF">
                <button
                  className="btn btn-error btn-sm btn-circle text-white"
                  onClick={exportPDF}
                >
                  <FaFilePdf fontSize={18} />
                </button>
              </div>
            </div>
          </h2>

          {allSubmissions.length === 0 ? (
            <p className="opacity-70">No students have submitted yet</p>
          ) : (
            <div className="overflow-x-auto border border-base-300">
              <table className="table table-zebra min-w-225">
                <thead className="bg-base-200">
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>File</th>
                    <th>Status</th>
                    <th>Marks</th>
                    <th>Feedback</th>
                    <th>Action</th>
                    <th>Current</th>
                    <th>Plagiarism</th>
                  </tr>
                </thead>

                <tbody>
                  {allSubmissions.map((s) => (
                    <tr key={s._id} className="hover">
                      {/* Student */}
                      <td className="font-semibold whitespace-nowrap">
                        {s.student.name}
                      </td>

                      <td className="text-sm opacity-70 whitespace-nowrap">
                        {s.student.email}
                      </td>

                      {/* File */}
                      <td className="whitespace-nowrap">
                        {s.file ? (
                          <a
                            href={s.file}
                            target="_blank"
                            rel="noreferrer"
                            className="link link-primary text-sm"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-xs opacity-60">No File</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap">
                        {s.isLate ? (
                          <span className="badge badge-error badge-sm">
                            Late
                          </span>
                        ) : (
                          <span className="badge badge-success badge-sm">
                            On Time
                          </span>
                        )}
                      </td>

                      {/* Marks Input */}
                      <td>
                        <input
                          type="number"
                          placeholder="Marks"
                          className="input input-bordered input-sm w-20"
                          value={s.marksInput}
                          onChange={(e) =>
                            setAllSubmissions((prev) =>
                              prev.map((sub) =>
                                sub._id === s._id
                                  ? { ...sub, marksInput: e.target.value }
                                  : sub
                              )
                            )
                          }
                        />
                      </td>

                      {/* Feedback Input */}
                      <td>
                        <input
                          type="text"
                          placeholder="Feedback"
                          className="input input-bordered input-sm w-40"
                          value={s.feedbackInput}
                          onChange={(e) =>
                            setAllSubmissions((prev) =>
                              prev.map((sub) =>
                                sub._id === s._id
                                  ? {
                                      ...sub,
                                      feedbackInput: e.target.value,
                                    }
                                  : sub
                              )
                            )
                          }
                        />
                      </td>

                      {/* Save */}
                      <td className="whitespace-nowrap">
                        <button
                          className="btn btn-info btn-xs"
                          disabled={s.plagiarism?.flagged}
                          onClick={() =>
                            handleGrade(
                              s._id,
                              s.marksInput,
                              s.feedbackInput,
                              s.plagiarism
                            )
                          }
                        >
                          Save
                        </button>
                      </td>

                      {/* Current Marks */}
                      <td className="font-semibold text-center">
                        {s.marks ?? "—"}
                      </td>

                      {/* Plagiarism status */}
                      <td className="whitespace-nowrap">
                        {s.plagiarism ? (
                          <button
                            className={`btn btn-xs ${
                              s.plagiarism.flagged ? "btn-error" : "btn-success"
                            }`}
                            onClick={() => {
                              setActivePlagiarism({
                                score: s.plagiarism.score,
                                flagged: s.plagiarism.flagged,
                                matches: s.plagiarism.matchedWith || [],
                              });
                              setShowPlagModal(true);
                            }}
                          >
                            {s.plagiarism.score}% Match
                          </button>
                        ) : (
                          <span className="opacity-50 text-xs">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showPlagModal && activePlagiarism && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60">
              <div
                className="
                          bg-base-100
                          w-full h-full
                          sm:h-auto sm:max-h-150
                          sm:max-w-4xl
                          rounded-none lg:rounded-3xl
                          shadow-2xl
                          border-0 sm:border border-base-300
                          overflow-hidden
                          flex flex-col
                        "
              >
                {/* ===== HEADER ===== */}
                <div
                  className="
                        flex items-center justify-between
                        px-3 py-4
                        border-b border-base-300
                        bg-base-200
                        sticky top-0 z-10
                      "
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-xl">
                      <FaSearch />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold">
                        Plagiarism Report
                      </h3>
                      <p className="text-xs opacity-60">
                        Automatic similarity comparison analysis
                      </p>
                    </div>
                  </div>

                  <button
                    className="btn btn-sm btn-circle btn-ghost"
                    onClick={() => setShowPlagModal(false)}
                  >
                    <FaX />
                  </button>
                </div>

                <div className="py-4 px-2 space-y-4 overflow-y-scroll">
                  {/* ===== SUMMARY CARDS ===== */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* SCORE */}
                    <div className="bg-base-200 border border-base-300 p-5 text-center">
                      <p className="text-xs opacity-60 mb-2">
                        Similarity Score
                      </p>

                      <p
                        className={`text-5xl font-bold ${
                          activePlagiarism.score > 40
                            ? "text-error"
                            : activePlagiarism.score > 20
                            ? "text-warning"
                            : "text-success"
                        }`}
                      >
                        {activePlagiarism.score}%
                      </p>

                      <progress
                        className={`progress mt-3 h-2 ${
                          activePlagiarism.score > 40
                            ? "progress-error"
                            : activePlagiarism.score > 20
                            ? "progress-warning"
                            : "progress-success"
                        }`}
                        value={activePlagiarism.score}
                        max="100"
                      />
                    </div>

                    {/* RISK LEVEL */}
                    <div className="bg-base-200 border border-base-300 p-5 text-center">
                      <p className="text-xs opacity-60">Risk Level</p>

                      <span
                        className={`badge badge-lg mt-3 ${
                          activePlagiarism.score > 40
                            ? "badge-error"
                            : activePlagiarism.score > 20
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {activePlagiarism.score > 40
                          ? "High Risk"
                          : activePlagiarism.score > 20
                          ? "Medium Risk"
                          : "Low Risk"}
                      </span>

                      <p className="text-xs opacity-60 mt-3">
                        Based on similarity percentage
                      </p>
                    </div>

                    {/* MATCH COUNT */}
                    <div className="bg-base-200 border border-base-300 p-5 text-center">
                      <p className="text-xs opacity-60">Compared Submissions</p>

                      <p className="text-5xl font-bold mt-2">
                        {activePlagiarism.matches.length}
                      </p>

                      <p className="text-xs opacity-60 mt-1">
                        Students matched
                      </p>
                    </div>
                  </div>

                  {/* ===== WARNING MESSAGE ===== */}
                  {activePlagiarism.flagged && (
                    <div className="rounded-xl bg-error/10 text-error px-4 py-3 text-sm flex items-center gap-2">
                      ⚠ similarity detected. Instructor review recommended
                      before grading.
                    </div>
                  )}

                  {/* ===== MATCHED LIST ===== */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">
                      Matched Submissions
                    </h4>

                    {activePlagiarism.matches.length === 0 ? (
                      <div className="rounded-xl bg-success/10 text-success p-4 text-sm">
                        No similar submissions detected.
                      </div>
                    ) : (
                      <div className="border border-base-300 overflow-hidden max-h-80 overflow-y-auto">
                        {activePlagiarism.matches.map((match, index) => {
                          const similarity =
                            match.similarity ?? activePlagiarism.score;

                          return (
                            <div
                              key={match._id || index}
                              className="flex items-center justify-between px-4 py-4 border-b border-base-300 last:border-none hover:bg-base-200 transition"
                            >
                              {/* STUDENT INFO */}
                              <div>
                                <p className="font-medium">
                                  {match.student?.name ?? "Unknown Student"}
                                </p>
                                <p className="text-xs opacity-60">
                                  {match.student?.email ?? "—"}
                                </p>
                              </div>

                              {/* SCORE */}
                              <div className="flex items-center gap-3 w-56">
                                <span
                                  className={`badge ${
                                    similarity > 40
                                      ? "badge-error"
                                      : similarity > 20
                                      ? "badge-warning"
                                      : "badge-success"
                                  }`}
                                >
                                  {similarity}%
                                </span>

                                <progress
                                  className={`progress flex-1 h-2 ${
                                    similarity > 40
                                      ? "progress-error"
                                      : similarity > 20
                                      ? "progress-warning"
                                      : "progress-success"
                                  }`}
                                  value={similarity}
                                  max="100"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
