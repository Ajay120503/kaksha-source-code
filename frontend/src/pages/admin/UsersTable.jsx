import adminService from "../../services/adminService";
import toast from "react-hot-toast";
import { MdDelete, MdBlock, MdMoreVert } from "react-icons/md";
import { useState } from "react";

export default function UsersTable({ users = [], setUsers, currentUserId }) {
  const [loadingId, setLoadingId] = useState(null);

  const [dialog, setDialog] = useState({
    open: false,
    type: null,
    user: null,
    newRole: null,
  });

  /* ================= CHANGE ROLE ================= */

  const confirmChangeRole = async () => {
    const { user, newRole } = dialog;

    try {
      setLoadingId(user._id);
      await adminService.changeRole(user._id, newRole);

      toast.success("Role updated");

      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
      );
    } catch {
      toast.error("Role update failed");
    } finally {
      setLoadingId(null);
      setDialog({ open: false });
    }
  };

  /* ================= BLOCK USER ================= */

  const confirmToggleBlock = async () => {
    const { user } = dialog;

    try {
      setLoadingId(user._id);
      await adminService.toggleBlock(user._id);

      toast.success("User updated");

      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u
        )
      );
    } catch {
      toast.error("Action failed");
    } finally {
      setLoadingId(null);
      setDialog({ open: false });
    }
  };

  /* ================= DELETE USER ================= */

  const confirmDelete = async () => {
    const { user } = dialog;

    try {
      setLoadingId(user._id);
      await adminService.deleteUser(user._id);

      toast.success("User deleted");

      setUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch {
      toast.error("Delete failed");
    } finally {
      setLoadingId(null);
      setDialog({ open: false });
    }
  };

  return (
    <>
      <div className="overflow-x-auto bg-base-100 shadow-xl border border-base-300 max-h-90">
        <table className="table table-zebra">
          <thead className="bg-base-200 sticky top-0 z-10">
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-base-content/60"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = u._id === currentUserId;

                return (
                  <tr key={u._id} className="hover">
                    {/* EMAIL */}
                    <td className="font-medium">{u.email}</td>

                    {/* ROLE */}
                    <td>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs font-medium text-gray-500">
                          Student
                        </span>

                        <input
                          type="checkbox"
                          className="toggle toggle-sm toggle-primary"
                          checked={u.role === "teacher"}
                          disabled={isSelf || loadingId === u._id}
                          onChange={(e) =>
                            setDialog({
                              open: true,
                              type: "role",
                              user: u,
                              newRole: e.target.checked ? "teacher" : "student",
                            })
                          }
                        />

                        <span className="text-xs font-medium text-gray-500">
                          Teacher
                        </span>
                      </label>
                    </td>

                    {/* STATUS */}
                    <td>
                      {u.isBlocked ? (
                        <span className="badge badge-error badge-outline">
                          Blocked
                        </span>
                      ) : (
                        <span className="badge badge-success badge-outline">
                          Active
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="flex justify-end">
                      <div className="dropdown dropdown-end">
                        <label
                          tabIndex={0}
                          className="btn btn-ghost btn-sm btn-circle"
                        >
                          <MdMoreVert size={20} />
                        </label>

                        <ul
                          tabIndex={0}
                          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36 border border-base-300"
                        >
                          <li>
                            <button
                              disabled={isSelf || loadingId === u._id}
                              onClick={() =>
                                setDialog({
                                  open: true,
                                  type: "block",
                                  user: u,
                                })
                              }
                              className="text-warning"
                            >
                              <MdBlock size={16} />
                              {u.isBlocked ? "Unblock" : "Block"}
                            </button>
                          </li>

                          <li>
                            <button
                              disabled={isSelf || loadingId === u._id}
                              onClick={() =>
                                setDialog({
                                  open: true,
                                  type: "delete",
                                  user: u,
                                })
                              }
                              className="text-error"
                            >
                              <MdDelete size={16} />
                              Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================= DIALOG ================= */}

      {dialog.open && (
        <div className="modal modal-open">
          <div className="modal-box">
            {dialog.type === "role" && (
              <>
                <h3 className="font-bold text-lg">Confirm Role Change</h3>

                <p className="py-4">
                  Change role of <b>{dialog.user.email}</b> to{" "}
                  <b>{dialog.newRole}</b>?
                </p>

                <div className="modal-action">
                  <button
                    className="btn"
                    onClick={() => setDialog({ open: false })}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={confirmChangeRole}
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}

            {dialog.type === "block" && (
              <>
                <h3 className="font-bold text-lg">
                  {dialog.user.isBlocked ? "Unblock User" : "Block User"}
                </h3>

                <p className="py-4">
                  Are you sure you want to{" "}
                  <b>{dialog.user.isBlocked ? "unblock" : "block"}</b> this
                  user?
                </p>

                <div className="modal-action">
                  <button
                    className="btn"
                    onClick={() => setDialog({ open: false })}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-warning"
                    onClick={confirmToggleBlock}
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}

            {dialog.type === "delete" && (
              <>
                <h3 className="font-bold text-lg text-error">Delete User</h3>

                <p className="py-4">
                  This action cannot be undone. Delete user{" "}
                  <b>{dialog.user.email}</b> permanently?
                </p>

                <div className="modal-action">
                  <button
                    className="btn"
                    onClick={() => setDialog({ open: false })}
                  >
                    Cancel
                  </button>

                  <button className="btn btn-error" onClick={confirmDelete}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
