import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import materialService from "../../services/materialService";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { useMaterial } from "../../context/MaterialContext";

export default function UploadMaterial() {
  const { classId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const { setMaterialsByClass } = useMaterial();

  if (user?.role !== "teacher") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-red-500 text-xl font-bold">
          🚫 You are not allowed to upload materials
        </div>
      </div>
    );
  }

  // const handleUpload = async (e) => {
  //   e.preventDefault();
  //   if (!file) return toast.error("Select a file first");
  //   if (!title.trim()) return toast.error("Enter material title");

  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append("classId", classId);
  //   formData.append("title", title);

  //   try {
  //     setUploading(true);
  //     await materialService.uploadMaterial(formData);
  //     toast.success("Material uploaded successfully!");
  //     navigate(`/materials/${classId}`);
  //   } catch (error) {
  //     toast.error("Upload failed");
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Select a file first");
    if (!title.trim()) return toast.error("Enter material title");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("classId", classId);
    formData.append("title", title);

    try {
      setUploading(true);
      await materialService.uploadMaterial(formData);

      setMaterialsByClass((prev) => ({
        ...prev,
        [classId]: undefined,
      }));

      toast.success("Material uploaded successfully!");
      navigate(`/materials/${classId}`);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex justify-center items-center">
      <div className="w-full max-w-lg bg-base-100 shadow-xl rounded-2xl p-7 border border-base-300">
        <h1 className="text-2xl font-bold mb-2 text-center">
          📤 Upload Classroom Material
        </h1>
        <p className="text-center mb-6 text-sm opacity-70">
          Share learning materials with your students
        </p>

        <form onSubmit={handleUpload} className="space-y-5">
          {/* Title */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Material Title</span>
            </label>
            <input
              type="text"
              placeholder="Enter material title"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Select File</span>
            </label>

            <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-base-300 transition cursor-pointer">
              <input
                type="file"
                className="file-input file-input-bordered w-full"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <p className="text-sm mt-2 opacity-70">
                Supported: PDF, PPT, Images, Docs, Videos
              </p>
            </div>

            {file && (
              <div className="mt-3 p-3 bg-base-300 rounded-lg text-sm">
                <span className="font-semibold">Selected:</span> {file.name}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="btn btn-sm btn-primary flex items-center justify-center gap-2"
          >
            {uploading && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
            {uploading ? "Uploading..." : "Upload Material"}
          </button>
        </form>
      </div>
    </div>
  );
}
