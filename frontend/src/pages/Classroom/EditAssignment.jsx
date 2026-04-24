import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import assignmentService from "../../services/assignmentService";
import toast from "react-hot-toast";
import { useAssignment } from "../../context/AssignmentContext";

export default function EditAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { setAssignmentsByClass } = useAssignment();

  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    endTime: "",
    maxMarks: "",
  });

  // useEffect(() => {
  //   loadAssignment();
  //   // eslint-disable-next-line
  // }, []);

  // const loadAssignment = async () => {
  //   try {
  //     const res = await assignmentService.getAssignmentById(assignmentId);
  //     setForm({
  //       title: res.title || "",
  //       description: res.description || "",
  //       deadline: res.deadline ? res.deadline.split("T")[0] : "",
  //       maxMarks: res.maxMarks || "",
  //     });
  //   } catch (err) {
  //     toast.error("Failed to load assignment");
  //     navigate(-1);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        setLoading(true);

        const res = await assignmentService.getAssignmentById(assignmentId);

        setForm({
          title: res?.title || "",
          description: res?.description || "",
          deadline: res?.deadline ? res.deadline.split("T")[0] : "",
          endTime: res?.endTime || "",
          maxMarks: res?.maxMarks ?? "",
        });
      } catch (err) {
        toast.error("Failed to load assignment");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadAssignment();
  }, [assignmentId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const updated = await assignmentService.updateAssignment(
        assignmentId,
        form
      );

      setAssignmentsByClass((prev) => {
        const updatedClass = { ...prev };

        Object.keys(updatedClass).forEach((cid) => {
          updatedClass[cid] = updatedClass[cid]?.map((a) =>
            a._id === assignmentId ? updated : a
          );
        });

        return updatedClass;
      });

      toast.success("Assignment updated successfully");
      navigate(-1);
    } catch {
      toast.error("Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <div className="min-h-[80vh] flex justify-center items-center p-4">
      <div className="w-full max-w-2xl card bg-base-100 border border-base-300 shadow-xl rounded-2xl">
        <div className="card-body p-8">
          <h1 className="text-3xl font-bold text-center mb-2">
            ✏️ Edit Assignment
          </h1>
          <p className="text-center opacity-70 mb-6">
            Update assignment details and save changes
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
                type="text"
                placeholder="Enter assignment title"
                className="input input-bordered w-full"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                rows={4}
                placeholder="Write assignment instructions"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
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
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Max Marks</span>
                </label>
                <input
                  type="number"
                  placeholder="100"
                  className="input input-bordered w-full"
                  value={form.maxMarks}
                  onChange={(e) =>
                    setForm({ ...form, maxMarks: e.target.value })
                  }
                  min="1"
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
                  value={form.endTime}
                  onChange={(e) =>
                    setForm({ ...form, endTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>

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
                disabled={submitting}
                className="btn btn-sm btn-primary flex items-center justify-center gap-2"
              >
                {submitting && (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
                {submitting ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
