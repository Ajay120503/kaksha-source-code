import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import postService from "../../services/postService";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import Comments from "../Comments/Comments";
import { FaPen } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { usePost } from "../../context/PostContext";
import hljs from "highlight.js";
import { FaCopy, FaCheck, FaRegCommentDots } from "react-icons/fa";
import { MoreVertical } from "lucide-react";

export default function PostList() {
  const { classId } = useParams();
  const { user } = useAuth();

  const { postsByClass, setPostsByClass } = usePost();
  const posts = postsByClass[classId] || [];
  const [loading, setLoading] = useState(false);

  const [newText, setNewText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [postLoading, setPostLoading] = useState(false);

  const [editPostId, setEditPostId] = useState(null);
  const [editText, setEditText] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [copiedPostId, setCopiedPostId] = useState(null);

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    postId: null,
  });

  const [openComments, setOpenComments] = useState(null);

  const fileInputRef = useRef(null);

  const MAX_LENGTH = 10000;

  const classroomImages = [
    "/images/1.jpg",
    "/images/4.jpg",
    "/images/5.jpg",
    "/images/6.jpg",
  ];

  const LANGUAGE_OPTIONS = [
    { label: "Plain Text", value: "plaintext" },
    { label: "JavaScript", value: "javascript" },
    { label: "TypeScript", value: "typescript" },
    { label: "Python", value: "python" },
    { label: "Java", value: "java" },
    { label: "C", value: "c" },
    { label: "C++", value: "cpp" },
    { label: "PHP", value: "php" },
    { label: "HTML", value: "html" },
    { label: "CSS", value: "css" },
    { label: "SQL", value: "sql" },
    { label: "Bash", value: "bash" },
  ];

  useEffect(() => {
    let isMounted = true;

    const loadPosts = async () => {
      if (postsByClass[classId]) return;

      try {
        setLoading(true);
        const res = await postService.getPostsByClass(classId);

        if (isMounted) {
          setPostsByClass((prev) => ({
            ...prev,
            [classId]: res.posts || [],
          }));
        }
      } catch (err) {
        toast.error("Failed to load posts");
      } finally {
        isMounted && setLoading(false);
      }
    };

    if (classId) {
      loadPosts();
    }

    return () => {
      isMounted = false;
    };
  }, [classId, postsByClass, setPostsByClass]);

  // Upload file for create post
  // const uploadFile = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   try {
  //     const res = await api.post("/upload/upload", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //         Authorization: `Bearer ${user?.token}`,
  //       },
  //     });
  //     setAttachments((prev) => [
  //       ...prev,
  //       {
  //         url: res.data.fileUrl,
  //         filename: res.data.fileUrl.split("/").pop(),
  //       },
  //     ]);
  //     console.log("UPLOAD RESPONSE:", res.data);

  //     toast.success("File uploaded successfully");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("File upload failed");
  //   }
  // };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!newText.trim()) return toast.error("Post cannot be empty");

    const isCode = language !== "plaintext";

    try {
      setPostLoading(true);

      // await postService.createPost(classId, {
      //   text: newText,
      //   attachments,
      //   isCode,
      //   language: isCode ? language : null,
      // });

      let uploadedFiles = [];

      for (const file of attachments) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/upload/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user?.token}`,
          },
        });

        uploadedFiles.push({
          url: res.data.fileUrl,
          filename: file.name,
        });
      }

      await postService.createPost(classId, {
        text: newText,
        attachments: uploadedFiles,
        isCode,
        language: isCode ? language : null,
      });

      setPostsByClass((prev) => ({
        ...prev,
        [classId]: null,
      }));

      toast.success("Post created!");
      setNewText("");
      setAttachments([]);
      setLanguage("plaintext");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      toast.error("Failed to create post");
      console.log(err);
    } finally {
      setPostLoading(false);
    }
  };

  const handleCopyCode = async (text, postId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPostId(postId);

      setTimeout(() => {
        setCopiedPostId(null);
      }, 1500);
    } catch (err) {
      toast.error("Failed to copy code");
      console.log(err);
    }
  };

  // Edit post
  const startEdit = (post) => {
    setEditPostId(post._id);
    setEditText(post.text);
  };
  const cancelEdit = () => {
    setEditPostId(null);
    setEditText("");
  };

  const handleUpdate = async (postId) => {
    if (!editText.trim()) return toast.error("Post cannot be empty");
    try {
      await postService.updatePost(postId, { text: editText });

      setPostsByClass((prev) => ({
        ...prev,
        [classId]: null,
      }));

      toast.success("Post updated!");
      cancelEdit();
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Failed to update post");
    }
  };

  // Delete post
  // const handleDelete = async (postId) => {
  //   if (!window.confirm("Are you sure you want to delete this post?")) return;
  //   try {
  //     await postService.deletePost(postId);

  //     setPostsByClass((prev) => ({
  //       ...prev,
  //       [classId]: null,
  //     }));

  //     toast.success("Post deleted!");
  //   } catch (err) {
  //     toast.error(err?.response?.data?.msg || "Failed to delete post");
  //   }
  // };
  const handleDelete = async () => {
    try {
      await postService.deletePost(deleteDialog.postId);

      setPostsByClass((prev) => ({
        ...prev,
        [classId]: null,
      }));

      toast.success("Post deleted!");

      setDeleteDialog({
        open: false,
        postId: null,
      });
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Failed to delete post");
    }
  };

  const toggleComments = (postId) => {
    setOpenComments((prev) => (prev === postId ? null : postId));
  };

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const timer = setTimeout(() => {
      document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [posts]);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      {/* Teacher Create Post */}
      {user.role === "teacher" && (
        <div className="bg-base-100 border border-base-300 p-6 mb-8 shadow">
          <h3 className="font-semibold text-lg mb-4">
            📢 Create Announcement or Post
          </h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <textarea
              className="textarea textarea-bordered w-full min-h-28"
              placeholder="Write something..."
              value={newText}
              maxLength={MAX_LENGTH}
              onChange={(e) => setNewText(e.target.value)}
            />

            <div className="flex items-center justify-between gap-3">
              <select
                className="select select-bordered select-sm w-48 "
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>

              <span className="text-xs text-gray-400">
                {language !== "plaintext"
                  ? "Code formatting enabled"
                  : "Plain text post"}
              </span>
            </div>

            {/* Attachments */}
            <div className="flex justify-between items-start flex-col">
              {/* <input
                type="file"
                ref={fileInputRef}
                className="file-input file-input-bordered file-input-sm"
                onChange={uploadFile}
              /> */}

              <input
                type="file"
                ref={fileInputRef}
                multiple
                className="file-input file-input-bordered file-input-sm"
                onChange={handleFileSelect}
              />

              {/* {attachments.length > 0 && (
                <span className="text-sm opacity-70">
                  {attachments.length} file(s) attached
                </span>
              )} */}

              {attachments.length > 0 && (
                <div className="bg-base-200 p-3 w-full max-h-50 overflow-y-scroll rounded-lg mt-2">
                  <p className="text-sm font-semibold mb-2">
                    Selected Files ({attachments.length})
                  </p>

                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-base-100 border border-base-300 px-3 py-2 rounded"
                      >
                        <span className="text-sm truncate">{file.name}</span>

                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="btn btn-xs btn-error"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end text-sm text-gray-500">
              {newText.length}/{MAX_LENGTH}
            </div>

            <button
              type="submit"
              disabled={postLoading || !newText.trim()}
              className="btn btn-sm btn-primary flex items-center justify-center gap-2"
            >
              {postLoading && (
                <span className="loading loading-spinner loading-sm"></span>
              )}
              {postLoading ? "Posting..." : "Publish"}
            </button>
          </form>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Posts</h2>

      {loading ? (
        <div className="flex justify-center items-center">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="flex justify-center items-center">No posts found</div>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            className="bg-base-100 border border-base-300 p-2 mb-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold">
                  {(() => {
                    const name = post?.author?.name || "";
                    const parts = name.trim().split(" ").filter(Boolean);

                    if (parts.length === 0) return "C";
                    if (parts.length === 1) return parts[0][0];

                    return parts[0][0] + parts[parts.length - 1][0];
                  })()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{post.author?.name}</span>
                    {post.author?.role === "teacher" && (
                      <span className="badge badge-warning badge-sm">
                        Teacher
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Teacher actions */}
              {/* {user.role === "teacher" && editPostId === null && (
                <div className="flex gap-2">
                  <button
                    className="btn btn-xs btn-outline btn-circle"
                    onClick={() => startEdit(post)}
                  >
                    <FaPen fontSize={14} />
                  </button>
                  <button
                    className="btn btn-xs btn-error btn-outline btn-circle"
                    onClick={() => handleDelete(post._id)}
                  >
                    <MdDelete fontSize={16} />
                  </button>
                </div>
              )} */}
              {user.role === "teacher" && editPostId === null && (
                <div
                  className="dropdown dropdown-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 3 Dot Button */}
                  <label
                    tabIndex={0}
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    <MoreVertical size={20} />
                  </label>

                  {/* Dropdown Menu */}
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36 border border-base-300 z-50"
                  >
                    {/* Edit */}
                    <li>
                      <button
                        onClick={() => startEdit(post)}
                        className="flex items-center gap-2"
                      >
                        <FaPen size={14} />
                        Edit
                      </button>
                    </li>

                    {/* Delete */}
                    <li>
                      {/* <button
                        onClick={() => handleDelete(post._id)}
                        className="flex items-center gap-2 text-error"
                      >
                        <MdDelete size={16} />
                        Delete
                      </button> */}
                      <button
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            postId: post._id,
                          })
                        }
                        className="flex items-center gap-2 text-error"
                      >
                        <MdDelete size={16} />
                        Delete
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Edit text */}
            {editPostId === post._id ? (
              <>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={editText}
                  maxLength={MAX_LENGTH}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleUpdate(post._id)}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="text-sm leading-relaxed whitespace-pre-line">
                {post.isCode ? (
                  <div className="relative mt-3 max-h-96 overflow-auto rounded-lg bg-[#0d1117] group">
                    {/* Sticky Header */}
                    <div className="sticky top-0 z-20 flex justify-between items-center px-3 py-2 bg-[#0d1117]/90 backdrop-blur border-b border-gray-700">
                      {/* Language Badge */}
                      <span className="badge badge-neutral text-xs">
                        {post.language?.toUpperCase()}
                      </span>

                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopyCode(post.text, post._id)}
                        className="btn btn-xs btn-ghost text-white hover:bg-white/10"
                        title="Copy code"
                      >
                        {copiedPostId === post._id ? (
                          <>
                            <FaCheck className="text-green-400 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <FaCopy className="mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    {/* Code */}
                    <pre className="p-4 text-sm overflow-x-auto">
                      <code className={`language-${post.language}`}>
                        {post.text}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm pl-13 leading-relaxed whitespace-pre-wrap">
                    {post.text}
                  </p>
                )}
              </div>
            )}
            {/* Attachments */}
            {post.attachments?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {post.attachments.map((file, idx) => {
                  const filename =
                    file?.filename || file?.url?.split("/").pop() || "";

                  const ext = filename.includes(".")
                    ? filename.split(".").pop().toLowerCase()
                    : "";

                  const isImage = [
                    "jpg",
                    "jpeg",
                    "png",
                    "gif",
                    "webp",
                  ].includes(ext);

                  return (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block relative group"
                    >
                      {isImage ? (
                        <img
                          src={file.url}
                          alt={file.filename}
                          className="rounded-lg border border-base-300 object-cover h-50 w-full transition group-hover:scale-[1.02]"
                        />
                      ) : (
                        <>
                          <img
                            src={classroomImages[idx % classroomImages.length]}
                            alt="file preview"
                            className="rounded-lg border border-base-300 object-cover h-50 w-full opacity-90"
                          />

                          {/* overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 rounded-b-lg truncate">
                            📄 {filename}
                          </div>
                        </>
                      )}
                    </a>
                  );
                })}
              </div>
            )}

            {post.attachments?.length > 0 && (
              <span className="badge badge-outline my-2">
                📎 {post.attachments.length} Attachment(s)
              </span>
            )}

            {/* Comments */}
            <div className="mt-3 flex justify-end items-center gap-2">
              <button
                onClick={() => toggleComments(post._id)}
                className={`btn btn-sm h-10 rounded-full border border-base-300  gap-2 transition-all
                          ${
                            openComments === post._id
                              ? "btn-primary"
                              : "btn-ghost hover:btn-primary"
                          }`}
              >
                <FaRegCommentDots size={16} />

                {/* Comment Count Badge */}
                <span className="font-semibold">{post.commentsCount}</span>
              </button>
            </div>

            {/* COMMENTS PANEL */}
            {openComments === post._id && (
              <div className="max-h-100 overflow-y-scroll">
                <Comments postId={post._id} />
              </div>
            )}
          </div>
        ))
      )}
      {/* DELETE CONFIRMATION MODAL */}
      {deleteDialog.open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Delete Post</h3>

            <p className="py-4">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>

            <div className="modal-action">
              <button
                className="btn btn-outline"
                onClick={() => setDeleteDialog({ open: false, postId: null })}
              >
                Cancel
              </button>

              <button className="btn btn-error" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
