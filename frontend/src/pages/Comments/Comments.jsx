import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import commentService from "../../services/commentService";
import { toast } from "react-hot-toast";
import { MdDelete } from "react-icons/md";
import { IoIosSend } from "react-icons/io";

export default function Comments({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadComments = async () => {
      try {
        const res = await commentService.getComments(postId);
        if (isMounted) {
          setComments(res || []);
        }
      } catch (err) {
        toast.error("Failed to load comments");
        console.log(err);
      }
    };

    if (postId) {
      loadComments();
    }

    return () => {
      isMounted = false;
    };
  }, [postId]);

  // const handleAdd = async () => {
  //   if (!text.trim()) return toast.error("Comment cannot be empty");

  //   try {
  //     const res = await commentService.addComment({ postId, text });

  //     const fixedComment = {
  //       ...res,
  //       author: {
  //         _id: user._id,
  //         name: user.name,
  //       },
  //     };

  //     setComments((prev) => [fixedComment, ...prev]);
  //     setText("");
  //   } catch (err) {
  //     toast.error(err?.response?.data?.msg || "Failed to add comment");
  //   }
  // };

  const handleAdd = async () => {
    if (!text.trim()) return toast.error("Comment cannot be empty");

    try {
      const res = await commentService.addComment({ postId, text });

      const newComment = res?.data ? res.data : res;

      const fixedComment = {
        _id: newComment._id,
        text: newComment.text || text,
        createdAt: newComment.createdAt || new Date().toISOString(),
        author: {
          _id: user._id,
          name: user.name,
        },
      };

      setComments((prev) => [fixedComment, ...prev]);
      setText("");
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Failed to add comment");
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Failed to delete comment");
    }
  };

  return (
    <div className="mt-3 pt-3">
      <h4 className="font-semibold mb-2 text-lg">Comments</h4>

      {/* Add Comment (Students only) */}
      {user.role !== "teacher" && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              className="input input-bordered rounded-3xl w-full pr-12 text-sm focus:outline-none"
              placeholder="Add a class comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 
                       btn btn-md btn-primary rounded-r-full"
              onClick={handleAdd}
            >
              <IoIosSend fontSize={20} />
            </button>
          </div>
        </div>
      )}

      {comments.length === 0 && (
        <p className="text-sm opacity-60 text-center">
          No comments yet. Be the first to comment ✨
        </p>
      )}

      {comments.map((c) => (
        <div
          key={c._id}
          className="mb-2 p-2 rounded flex justify-between items-start max-h-100"
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className="w-8 h-8 min-w-8 rounded-full bg-primary text-primary-content
                  flex items-center justify-center text-sm font-bold 
                  shrink-0"
            >
              {(() => {
                const name = c.author?.name || "";
                const parts = name.trim().split(" ").filter(Boolean);

                if (parts.length === 0) return "C";
                if (parts.length === 1) return parts[0][0];

                return parts[0][0] + parts[parts.length - 1][0];
              })()}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex-row flex-wrap items-center gap-2 text-xs opacity-60">
                <div className="font-semibold text-base-content">
                  {c.author?.name}
                </div>
                <div>{new Date(c.createdAt).toLocaleString()}</div>
              </div>

              <p className="mt-1 text-sm wrap-break-word whitespace-pre-wrap leading-relaxed">
                {c.text}
              </p>
            </div>
          </div>

          {/* Show delete button only if the logged-in user is the author */}
          <div>
            {user._id === c.author?._id && (
              <button
                className="btn btn-xs btn-outline btn-error btn-circle"
                onClick={() => handleDelete(c._id)}
              >
                <MdDelete fontSize={18} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
