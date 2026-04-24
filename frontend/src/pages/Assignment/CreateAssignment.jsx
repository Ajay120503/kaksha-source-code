import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import assignmentService from "../../services/assignmentService";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { useAssignment } from "../../context/AssignmentContext";

export default function CreateAssignment() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [uploadingFile] = useState(false);

  const { setAssignmentsByClass } = useAssignment();

  if (user?.role !== "teacher") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="px-6 py-4 bg-red-100 text-red-500 font-bold rounded-lg">
          You are not allowed to create assignments
        </div>
      </div>
    );
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setAttachment(file);
  };

  const removeFile = () => {
    setAttachment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !deadline) {
      return toast.error("Fill required fields");
    }

    setLoading(true);

    try {
      let fileUrl = null;

      if (attachment) {
        const formData = new FormData();
        formData.append("file", attachment);

        const res = await api.post("/upload/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user?.token}`,
          },
        });

        fileUrl = res.data.fileUrl;
      }

      const newAssignment = await assignmentService.createAssignment({
        classId,
        title: title.trim(),
        description: description?.trim(),
        deadline,
        endTime,
        ...(maxMarks !== "" && { maxMarks: Number(maxMarks) }),
        ...(fileUrl && { attachments: [fileUrl] }),
      });

      setAssignmentsByClass((prev) => ({
        ...prev,
        [classId]: [newAssignment, ...(prev[classId] || [])],
      }));

      toast.success("Assignment created successfully!");
      navigate(`/assignments/${classId}`);
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex justify-center items-center">
      <div className="w-full max-w-2xl card bg-base-100 border border-base-300 shadow-xl rounded-2xl">
        <div className="card-body p-8">
          <h1 className="text-3xl font-bold text-center">Create Assignment</h1>
          <p className="text-center opacity-70 mb-4">
            Fill the details below to create a new assignment
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Assignment Title <span className="text-error">*</span>
                </span>
              </label>
              <input
                className="input input-bordered w-full"
                placeholder="Enter assignment title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                placeholder="Write assignment instructions"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Deadline + Marks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Deadline <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Max Marks</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="100"
                  min="1"
                  max="100"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                />
              </div>

              {/* End Time */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    End Time <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="time"
                  className="input input-bordered w-full"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Attachment Upload */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Attach File (Optional)
                </span>
              </label>

              <input
                type="file"
                className="file-input file-input-bordered w-full"
                onChange={handleFileSelect}
              />

              {uploadingFile && (
                <div className="mt-2 text-sm text-primary flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  Uploading file...
                </div>
              )}
            </div>

            {/* Attachment Preview */}
            {attachment && (
              <div className="bg-base-200 rounded-xl p-4">
                <h3 className="font-semibold mb-3">Selected File</h3>

                <div className="flex items-center justify-between bg-base-100 border border-base-300 rounded-lg px-3 py-2">
                  <span className="text-sm truncate">{attachment.name}</span>

                  <button
                    type="button"
                    onClick={removeFile}
                    className="btn btn-xs btn-error"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-sm btn-outline"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-sm btn-primary flex items-center justify-center gap-2"
              >
                {loading && (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
                {loading ? "Creating..." : "Create Assignment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
