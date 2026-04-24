import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import joinRequestService from "../services/joinRequestService";

export default function JoinRequestButton() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const { data } = await joinRequestService.getPendingCount();
        setCount(data?.count || 0);
      } catch (err) {
        console.error("Join request count error:", err);
      }
    };

    loadCount();
  }, []);

  const handleRedirect = () => {
    navigate(`/join-requests`);
  };

  return (
    <button
      onClick={handleRedirect}
      className="relative btn btn-circle btn-md hover:bg-base-300 btn-ghost"
    >
      <UserPlus size={18} />

      {count > 0 && (
        <span
          className="
          absolute -top-1 -right-1
          min-w-4.5 h-4.5
          px-1
          flex items-center justify-center
          text-[10px] font-bold
          rounded-full
          bg-primary text-white
          shadow
        "
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
