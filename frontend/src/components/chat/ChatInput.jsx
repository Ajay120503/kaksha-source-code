import { useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { FaImage, FaSmile, FaTimes } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import uploadService from "../../services/uploadService";

const ChatInput = ({ socket, classId, user }) => {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const typingTimeoutRef = useRef(null);

  /* ================= SEND TEXT ================= */
  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      classId,
      senderId: user._id,
      text,
      type: "text",
    });

    socket.emit("stopTyping", { classId });
    setText("");
  };

  /* ================= SELECT FILE ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    // Image preview
    if (file.type.startsWith("image")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  /* ================= SEND FILE ================= */
  const sendFile = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);

      const { fileUrl, fileType } = await uploadService.upload(selectedFile);

      socket.emit("sendMessage", {
        classId,
        senderId: user._id,
        fileUrl,
        fileType,
        type: fileType.startsWith("image") ? "image" : "file",
      });

      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  /* ================= EMOJI ================= */
  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="relative bg-base-100 border-t border-base-300">
      {/* FILE PREVIEW */}
      {selectedFile && (
        <div className="p-3 border-b border-base-300 flex items-center gap-3 bg-base-200">
          {/* IMAGE PREVIEW */}
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              className="w-20 h-20 object-cover rounded-lg border"
            />
          ) : (
            <div className="w-20 h-20 truncate flex items-center justify-center bg-base-300 rounded-lg text-xs text-center p-2">
              {selectedFile.name}
            </div>
          )}

          {/* FILE INFO */}
          <div className="flex-1 text-sm truncate">
            <p className="font-semibold truncate">{selectedFile.name}</p>
            <p className="text-xs opacity-70">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <FaTimes />
            </button>

            <button
              onClick={sendFile}
              className="btn btn-sm btn-primary btn-circle"
              disabled={uploading}
            >
              <IoSend />
            </button>
          </div>
        </div>
      )}

      {/* EMOJI PICKER */}
      {showEmoji && (
        <div className="absolute bottom-20 left-2 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* INPUT BAR */}
      <div className="p-2 flex items-center gap-1">
        {/* FILE BUTTON */}
        <label className="btn btn-circle btn-ghost">
          <FaImage size={18} />
          <input type="file" hidden onChange={handleFileChange} />
        </label>

        {/* INPUT */}
        <div className="flex-1 min-w-20 flex items-center bg-base-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-primary transition">
          <input
            type="text"
            placeholder="Type a message..."
            className="bg-transparent flex-1 outline-none text-sm sm:text-base"
            value={text}
            onChange={(e) => {
              setText(e.target.value);

              socket.emit("typing", {
                classId,
                userName: user.name,
              });

              // CLEAR OLD TIMER
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }

              // SET NEW TIMER (STOP AFTER 1.5s)
              typingTimeoutRef.current = setTimeout(() => {
                socket.emit("stopTyping", { classId });
              }, 1000);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
        </div>

        {/* EMOJI BUTTON */}
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="btn btn-circle btn-ghost"
        >
          <FaSmile size={18} />
        </button>

        {/* SEND TEXT */}
        <button
          onClick={sendMessage}
          disabled={!text.trim() || uploading}
          className="btn btn-primary btn-circle shadow-md 
          hover:scale-105 active:scale-95 transition"
        >
          <IoSend size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
