import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClassroom } from "../../hooks/useClassroom";
import { toast } from "react-hot-toast";
import { FaChalkboardTeacher } from "react-icons/fa";

export default function CreateClass() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { createClassroom } = useClassroom();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      return toast.error("Class name and description are required");
    }

    setLoading(true);
    try {
      await createClassroom({
        name: name.trim(),
        description: description.trim() || "",
      });

      toast.success("Classroom created successfully 🎉");
      navigate("/classrooms");
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Failed to create classroom");
      console.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center bg-base-200 px-4 pt-10">
      <div className="w-full max-w-md bg-base-100 shadow-lg rounded-xl border border-base-300">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              <FaChalkboardTeacher className="text-4xl text-primary" />
            </div>
            <h2 className="text-3xl font-bold">Create a Classroom</h2>
            <p className="text-base-content/60 text-sm">
              Set up a new class for your students
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="flex items-center border border-base-300 rounded px-3">
              <FaChalkboardTeacher className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Classroom name"
                className="flex-1 py-2 outline-none bg-transparent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center border border-base-300 rounded px-3">
              <textarea
                placeholder="Classroom description"
                className="flex-1 py-2 outline-none bg-transparent resize-none"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-sm btn-primary flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="loading loading-spinner loading-sm"></span>
              )}
              {loading ? "Creating..." : "Create Classroom"}
            </button>
          </form>

          <p className="text-center text-sm mt-5 text-base-content/70">
            Students will join using the generated class code.
          </p>
        </div>
      </div>
    </div>
  );
}
