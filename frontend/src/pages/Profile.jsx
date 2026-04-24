import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import authService from "../services/authService";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passwordDialog, setPasswordDialog] = useState(false);

  // Password fields
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await authService.me();
      setUser(data);
      setName(data.name);
      setEmail(data.email);
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /* ================= UPDATE PROFILE ================= */
  const handleProfileUpdate = async () => {
    try {
      const updated = await authService.updateProfile({ name, email });
      setUser(updated);
      setEdit(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Update failed");
    }
  };

  /* ================= UPDATE PASSWORD ================= */
  // const handlePasswordUpdate = async () => {
  //   if (newPassword !== confirmPassword)
  //     return toast.error("Passwords do not match");

  //   try {
  //     await authService.updatePassword({
  //       currentPassword,
  //       newPassword,
  //     });

  //     setCurrentPassword("");
  //     setNewPassword("");
  //     setConfirmPassword("");
  //     setShowPassword(false);

  //     toast.success("Password updated securely");
  //   } catch {
  //     toast.error("Password update failed");
  //   }
  // };
  const confirmPasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setUpdating(true);

      await authService.updatePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setPasswordDialog(false);

      toast.success("Password updated securely");
    } catch {
      toast.error("Password update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="border border-base-300 shadow-xl bg-base-100 overflow-hidden">
        {/* ================= HEADER ================= */}
        <div className="relative">
          <div className="h-44 bg-linear-to-r from-primary via-secondary to-accent"></div>

          {/* Avatar */}
          <div className="absolute left-1/2 md:left-12 -bottom-14 transform -translate-x-1/2 md:translate-x-0">
            <div
              className="w-32 h-32 rounded-full bg-primary text-white
                          flex items-center justify-center
                          text-4xl font-bold shadow-xl
                          ring-4 ring-base-100"
            >
              {(() => {
                const name = user?.name || "";
                const parts = name.trim().split(" ").filter(Boolean);

                if (!parts.length) return "U";
                if (parts.length === 1) return parts[0][0].toUpperCase();

                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
              })()}
            </div>
          </div>
        </div>

        {/* ================= PROFILE INFO ================= */}
        <div className="mt-20 px-6 pb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            {/* LEFT INFO */}
            <div className="space-y-3">
              {edit ? (
                <div className="space-y-3">
                  <input
                    className="input input-bordered w-full md:w-96"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                  />

                  <input
                    className="input input-bordered w-full md:w-96"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {user.name}
                  </h1>

                  <p className="text-base opacity-70">{user.email}</p>
                </>
              )}

              <span className="badge badge-primary badge-lg capitalize">
                {user.role}
              </span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2">
              {edit ? (
                <>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={handleProfileUpdate}
                  >
                    Save Changes
                  </button>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setEdit(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setEdit(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= SECURITY SECTION ================= */}
        <div className="px-6 pb-8">
          <div className="rounded-2xl border border-base-300 bg-base-200/60 p-6 max-w-md">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Security</h3>

              <button
                className="btn btn-warning btn-sm"
                onClick={() => setShowPassword(!showPassword)}
              >
                Change Password
              </button>
            </div>

            {showPassword && (
              <div className="mt-5 space-y-3">
                <input
                  type="password"
                  placeholder="Current Password"
                  className="input input-bordered w-full"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="New Password"
                  className="input input-bordered w-full"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="input input-bordered w-full"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <div className="flex gap-2 pt-2">
                  {/* <button
                    disabled={updating}
                    className="btn btn-primary btn-sm flex items-center gap-2"
                    onClick={handlePasswordUpdate}
                  >
                    {updating && (
                      <span className="loading loading-spinner loading-sm"></span>
                    )}
                    {updating ? "Updating..." : "Update Password"}
                  </button> */}

                  <button
                    disabled={updating}
                    className="btn btn-primary btn-sm flex items-center gap-2"
                    onClick={() => setPasswordDialog(true)}
                  >
                    {updating && (
                      <span className="loading loading-spinner loading-sm"></span>
                    )}
                    {updating ? "Updating..." : "Update Password"}
                  </button>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowPassword(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="bg-base-200 border-t border-base-300 py-4 text-center text-sm opacity-70">
          Kaksha Classroom — Secure Profile Settings
        </div>
      </div>
      {/* ================= PASSWORD CONFIRM MODAL ================= */}

      {passwordDialog && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-warning">
              Confirm Password Change
            </h3>

            <p className="py-4">
              Are you sure you want to change your password?
              <br />
              You will need to use the new password next time you log in.
            </p>

            <div className="modal-action">
              <button className="btn" onClick={() => setPasswordDialog(false)}>
                Cancel
              </button>

              <button
                className="btn btn-warning"
                onClick={confirmPasswordUpdate}
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
