import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import TypingIndicator from "./TypingIndicator";
import { useAuth } from "../../hooks/useAuth";
import { getMessages } from "../../services/messageService";
import { useParams } from "react-router-dom";

const ChatWindow = () => {
  const { user } = useAuth();
  const { classId } = useParams();
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  /* ================= FETCH OLD MESSAGES ================= */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getMessages(classId);
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [classId]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_BACKEND_URL);
    const socket = socketRef.current;

    socket.on("connect", () => {
      socket.emit("joinClassroom", classId);
      socket.emit("userOnline", user._id);
    });

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("messageEdited", (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m))
      );
    });

    socket.on("messageDeleted", (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m))
      );
    });

    socket.on("typing", ({ userName }) => {
      if (userName !== user.name) {
        setTypingUser(userName);
      }
    });

    socket.on("stopTyping", () => {
      setTypingUser(null);
    });

    socket.on("onlineUsers", setOnlineUsers);

      socket.on("newNotification", (data) => {
        console.log("Notification:", data);

        // toast.success(data.message);
      });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageEdited");
      socket.off("messageDeleted");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("onlineUsers");
      socket.off("newNotification");
      socket.disconnect();
    };
  }, [classId, user]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="flex max-w-5xl m-auto flex-col h-[calc(100vh-160px)] sm:h-[85vh] 
    bg-base-200 rounded-2xl shadow-xl border border-base-300 overflow-hidden"
    >
      {/* 🔝 HEADER (STICKY) */}
      <div className="sticky top-0 z-10 bg-base-100">
        <ChatHeader onlineUsers={onlineUsers} />
      </div>

      {/* 💬 MESSAGES AREA */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-5 space-y-4
        bg-base-200 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-base-content/50 text-sm">
            No messages yet 👋 Start the conversation
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            msg={msg}
            user={user}
            socket={socketRef.current}
          />
        ))}

        {/* ✍️ Typing Indicator */}
        {typingUser && <TypingIndicator name={typingUser} />}
        <div ref={messagesEndRef} />
      </div>

      {/* 🔻 INPUT (STICKY BOTTOM) */}
      <div className="sticky bottom-0 bg-base-100 border-t border-base-300">
        <ChatInput socket={socketRef.current} classId={classId} user={user} />
      </div>
    </div>
  );
};

export default ChatWindow;
