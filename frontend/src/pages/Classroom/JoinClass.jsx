import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClassroom } from "../../hooks/useClassroom";
import { toast } from "react-hot-toast";
import { FaDoorOpen } from "react-icons/fa";

export default function JoinClass() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  const navigate = useNavigate();
  const { joinClassroom } = useClassroom();

  const handleJoin = async (e) => {
    e.preventDefault();

    if (!code.trim()) return toast.error("Class code is required");

    try {
      setLoading(true);

      const res = await joinClassroom(code.trim());

      /* ===============================
         BACKEND RESPONSE HANDLING
      =============================== */

      if (res?.msg === "Join request already pending") {
        toast("Request already sent ⏳", { icon: "ℹ️" });
        setRequested(true);
        return;
      }

      if (res?.msg === "Join request sent") {
        toast.success("Request sent to teacher");
        setRequested(true);
        return;
      }

      if (res?.msg === "Already joined this classroom") {
        toast("You already joined this classroom 👍", {
          icon: "ℹ️",
        });
        navigate("/classrooms");
        return;
      }

      if (res?.msg) {
        toast(res.msg);
      }
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Invalid classroom code");
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || requested;

  return (
    <div className="flex items-center justify-center bg-base-200 px-4 pt-10">
      <div className="w-full max-w-md bg-base-100 shadow-lg rounded-xl border border-base-300">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              <FaDoorOpen className="text-4xl text-primary" />
            </div>

            <h2 className="text-3xl font-bold">Join a Classroom</h2>

            <p className="text-base-content/60 text-sm">
              Enter the class code to send request to teacher
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleJoin} className="space-y-5">
            <div className="flex items-center border border-base-300 rounded px-3">
              <FaDoorOpen className="text-gray-400 mr-2" />

              <input
                type="text"
                placeholder="Enter classroom code"
                className="flex-1 py-2 outline-none bg-transparent"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={disabled}
              />
            </div>

            <button
              type="submit"
              disabled={disabled}
              className={`btn w-full flex items-center justify-center gap-2 ${
                disabled ? "btn-disabled" : "btn-primary"
              }`}
            >
              {loading && (
                <span className="loading loading-spinner loading-sm"></span>
              )}

              {requested
                ? "Request Pending"
                : loading
                ? "Sending Request..."
                : "Send Join Request"}
            </button>
          </form>

          <p className="text-center text-sm mt-5 text-base-content/70">
            Teacher must approve your request before joining.
          </p>
        </div>
      </div>
    </div>
  );
}
