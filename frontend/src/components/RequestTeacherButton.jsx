import { useEffect, useState } from "react";
import roleRequestService from "../services/roleRequestService";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { UserPlus } from "lucide-react";

export default function RequestTeacherButton() {
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [requestStatus, setRequestStatus] = useState(null);

  /* ================= FETCH REQUEST STATUS ================= */

  const fetchStatus = async () => {
    try {
      const { data } = await roleRequestService.getMyRequest();

      if (data) setRequestStatus(data.status);
    } catch {
      console.log("No request found");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  /* ================= SEND REQUEST ================= */

  const sendRequest = async () => {
    try {
      setLoading(true);

      await roleRequestService.sendRequest();

      toast.success("Request sent to admin");

      setRequestStatus("pending");
      refreshUser?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= BUTTON STATE ================= */

  const disabled =
    loading ||
    checking ||
    requestStatus === "pending" ||
    user?.role === "teacher";

  /* ================= LABEL ================= */

  // const label =
  //   user?.role === "teacher"
  //     ? "You are a Teacher"
  //     : requestStatus === "pending"
  //     ? "Request Pending"
  //     : requestStatus === "rejected"
  //     ? "Request Rejected"
  //     : "Become Teacher";

  if (checking)
    return (
      <button className="btn btn-disabled btn-circle btn-md">
        <span className="loading loading-spinner"></span>
      </button>
    );
  return (
    <button
      onClick={sendRequest}
      disabled={disabled}
      className={`btn btn-circle btn-md hover:bg-base-300 btn-ghost ${
        disabled ? "btn-disabled" : "btn-ghost"
      }`}
    >
      {loading ? (
        <span className="loading loading-spinner"></span>
      ) : (
        <>
          <UserPlus size={18} />
          {/* <span className="hidden md:inline ml-2">{label}</span> */}
        </>
      )}
    </button>
  );
}
