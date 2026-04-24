import { useState } from "react";
import { deleteMessage, editMessage } from "../../services/messageService";
import { IoIosArrowDown } from "react-icons/io";

const MessageBubble = ({ msg, user, socket }) => {
  const isMe = msg.sender?._id === user._id || msg.sender === user._id;

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(msg.text);

  const getAvatarColor = (id) => {
    const colors = [
      "bg-red-300",
      "bg-green-300",
      "bg-blue-400",
      "bg-yellow-300",
      "bg-pink-400",
      "bg-teal-400",
    ];

    if (!id) return colors[0];

    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const getBubbleColor = (id) => {
    const colors = [
      "chat-bubble-error",
      "chat-bubble-success",
      "chat-bubble-secondary",
      "chat-bubble-warning",
      "chat-bubble-primary",
      "chat-bubble-success",
    ];

    if (!id) return colors[0];

    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const handleDelete = async () => {
    await deleteMessage(msg._id);

    socket.emit("deleteMessage", {
      messageId: msg._id,
      classId: msg.classId,
    });
  };

  const handleEdit = async () => {
    if (!text.trim()) return;

    await editMessage(msg._id, text);

    socket.emit("editMessage", {
      messageId: msg._id,
      newText: text,
      classId: msg.classId,
    });

    setEditing(false);
  };

  return (
    <div className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
      {/* AVATAR */}
      <div className="chat-image avatar placeholder">
        <div
          className={`${
            isMe ? "bg-primary" : getAvatarColor(msg.sender?._id)
          } text-primary-content rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-md`}
        >
          {(() => {
            const name = msg.sender?.name || "";
            const parts = name.trim().split(" ").filter(Boolean);

            if (parts.length === 0) return "U";
            if (parts.length === 1) return parts[0][0].toUpperCase();

            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
          })()}
        </div>
      </div>

      {/* HEADER */}
      <div className="chat-header text-xs opacity-60">
        <div className="flex flex-col">
          <span className="font-medium">{msg.sender?.name}</span>
          <div>
            <time className="opacity-50">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>
        </div>
      </div>

      {/* BUBBLE */}
      {/* <div className="relative group w-fit text-sm max-w-[75%] sm:max-w-[60%]"> */}
      <div
        className={`chat-bubble relative  ${
          isMe ? "chat-bubble-primary" : getBubbleColor(msg.sender?._id)
        } shadow-md`}
      >
        {msg.isDeleted ? (
          <i>Message deleted</i>
        ) : editing ? (
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEdit();
            }}
            className="input input-sm w-full text-base-content outline-none"
            autoFocus
          />
        ) : (
          <>
            {/* TEXT */}
            {msg.type === "text" && (
              <p>
                {msg.text}{" "}
                {msg.isEdited && (
                  <span className="italic text-xs">(edited)</span>
                )}
              </p>
            )}

            {/* IMAGE */}
            {msg.type === "image" && msg.fileUrl && (
              <div className="mt-1 overflow-hidden rounded-lg">
                <img
                  src={msg.fileUrl}
                  alt="sent"
                  onClick={() => window.open(msg.fileUrl, "_blank")}
                  className="w-full h-auto max-h-64 object-cover cursor-pointer"
                />
              </div>
            )}

            {/* FILE */}
            {msg.type === "file" && msg.fileUrl && (
              <>
                {msg.fileType?.startsWith("image/") ? (
                  <img
                    src={msg.fileUrl}
                    alt="preview"
                    className="w-full h-auto max-h-64 object-cover rounded-lg"
                  />
                ) : (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 bg-base-200 px-4 py-3 rounded-xl"
                  >
                    <span className="truncate text-base-content">
                      {msg.fileUrl.split("/").pop()}
                    </span>
                  </a>
                )}
              </>
            )}
          </>
        )}
        {/* ACTION MENU */}
        {isMe && !msg.isDeleted && (
          <div className="absolute -top-5 right-0 transition">
            <div className="dropdown dropdown-left">
              <label tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
                <IoIosArrowDown className="text-base-content" size={18} />
              </label>

              <ul className="dropdown-content z-20 menu p-2 border border-base-300 text-base-content shadow-lg bg-base-100 rounded-box">
                {!editing ? (
                  <>
                    <li>
                      <button onClick={() => setEditing(true)}>Edit</button>
                    </li>
                    <li>
                      <button onClick={handleDelete} className="text-error">
                        Delete
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <button onClick={handleEdit} className="text-success">
                      Save
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* </div> */}
    </div>
  );
};

export default MessageBubble;
