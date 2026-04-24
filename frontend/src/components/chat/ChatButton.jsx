import { useNavigate } from "react-router-dom";
import { IoChatbubbleEllipses } from "react-icons/io5";

const ChatButton = ({ classId }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/chat/${classId}`);
  };

  return (
    <button
      onClick={handleClick}
      className="btn btn-primary btn-circle shadow-lg z-50"
    >
      <div className="tooltip tooltip-left" data-tip="Open Chat">
        <IoChatbubbleEllipses size={22} />
      </div>
    </button>
  );
};

export default ChatButton;
