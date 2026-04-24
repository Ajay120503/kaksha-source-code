import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import postService from "../../services/postService";
import api from "../../services/api";
import { toast } from "react-hot-toast";

export default function CreatePost() {
  const { classId } = useParams();
  const { user } = useAuth();

  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const MAX_LENGTH = 500;

  // Upload attachment
  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setAttachments((prev) => [
        ...prev,
        { url: res.data.url, filename: file.name },
      ]);
      toast.success("File uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("File upload failed");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!text.trim()) return toast.error("Post cannot be empty");

    try {
      setLoading(true);
      await postService.createPost(classId, { text, attachments });
      toast.success("Post created successfully!");
      setText("");
      setAttachments([]);
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Failed to create post");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-base-300 shadow-lg rounded-xl border p-6">
        <h3 className="font-semibold mb-4">
          {user?.role === "teacher" ? "Create Announcement" : "Create Post"}
        </h3>

        <form onSubmit={handleCreate} className="space-y-3">
          <textarea
            className="textarea textarea-bordered w-full min-h-28"
            placeholder="Write something..."
            value={text}
            maxLength={MAX_LENGTH}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Attachments */}
          <div className="flex justify-between items-center">
            <input
              type="file"
              className="file-input file-input-bordered file-input-sm"
              onChange={uploadFile}
            />
            {attachments.length > 0 && (
              <span className="text-sm opacity-70">
                {attachments.length} file(s) attached
              </span>
            )}
          </div>

          <div className="flex justify-end text-sm text-gray-500">
            {text.length}/{MAX_LENGTH}
          </div>

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="btn btn-primary flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
            {loading ? "Posting..." : "Publish"}
          </button>
        </form>
      </div>
    </div>
  );
}
