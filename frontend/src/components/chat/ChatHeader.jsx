import { User } from "lucide-react";

const ChatHeader = ({ onlineUsers }) => {
  return (
    <div className="p-4 border-b border-base-300 bg-base-100 rounded-t-2xl flex items-center justify-between">
      {/* LEFT SIDE */}
      <div className="flex flex-col">
        <h2 className="font-extrabold text-lg sm:text-xl text-base-content">
          Class Chat
        </h2>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/60">
          <span className="w-2 h-2 bg-success rounded-full"></span>
          <span>{onlineUsers.length} online</span>
        </div>
      </div>

      {/* RIGHT SIDE AVATARS */}
      <div className="flex items-center">
        <div className="avatar-group -space-x-3">
          {onlineUsers.slice(0, 3).map((u, i) => (
            <div key={i} className="avatar placeholder">
              <div className="bg-base-300 text-base-content justify-center items-center flex w-9 ring-2 ring-base-100">
                <User />
              </div>
            </div>
          ))}
        </div>

        {/* EXTRA COUNT */}
        {onlineUsers.length > 3 && (
          <div className="ml-2 text-xs ring rounded-full px-2 font-extrabold text-base-content/60">
            +{onlineUsers.length - 3}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
