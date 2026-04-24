import { useEffect, useState, useMemo } from "react";
import classroomService from "../../services/classroomService";
import materialService from "../../services/materialService";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { FaEye, FaThumbtack, FaSearch, FaDownload } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useMaterial } from "../../context/MaterialContext";
import { MoreVertical } from "lucide-react";

export default function AllMaterialList() {
  const { user } = useAuth();

  const { materials, setMaterials } = useMaterial();
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
    title: "",
  });

  const [pinDialog, setPinDialog] = useState({
    open: false,
    id: null,
    title: "",
    isPinned: false,
  });

  const classroomImages = [
    "/images/1.jpg",
    "/images/2.jpg",
    "/images/3.jpg",
    "/images/4.jpg",
    "/images/5.jpg",
    "/images/6.jpg",
    "/images/7.jpg",
  ];

  /* ---------------- FILE TYPE ---------------- */
  const getFileType = (file) => {
    if (!file) return "other";
    if (file.includes(".pdf")) return "pdf";
    if (file.match(/\.(jpg|jpeg|png|webp)/)) return "image";
    if (file.match(/\.(doc|docx)/)) return "doc";
    return "other";
  };

  /* ---------------- LOAD ---------------- */
  const loadMaterials = async () => {
    try {
      setLoading(true);

      const classes = await classroomService.myClassrooms();

      const materialPromises = classes.map(async (cls) => {
        const mats = await materialService.getMaterials(cls._id);

        return mats.map((m) => ({
          ...m,
          classroomName: cls.name,
        }));
      });

      const materialsArray = await Promise.all(materialPromises);

      return materialsArray.flat();
    } catch (error) {
      toast.error("Failed to load materials");
      console.log(error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const refreshMaterials = async () => {
    const result = await loadMaterials();
    setMaterials(result);
  };

  /* ---------------- ACTIONS ---------------- */
  const handleView = async (material) => {
    window.open(material.file, "_blank");

    // increment views (backend should support)
    await materialService.incrementView(material._id);
    refreshMaterials();
  };

  // const togglePin = async (id) => {
  //   try {
  //     await materialService.togglePin(id);
  //     refreshMaterials();
  //   } catch {
  //     toast.error("Failed to update pin");
  //   }
  // };

  const confirmTogglePin = async () => {
    try {
      await materialService.togglePin(pinDialog.id);
      refreshMaterials();
    } catch {
      toast.error("Failed to update pin");
    } finally {
      setPinDialog({ open: false, id: null, title: "", isPinned: false });
    }
  };

  // const deleteMaterial = async (id) => {
  //   if (!confirm("Delete this material?")) return;
  //   await materialService.deleteMaterial(id);
  //   toast.success("Deleted");
  //   refreshMaterials();
  // };

  const confirmDeleteMaterial = async () => {
    try {
      await materialService.deleteMaterial(deleteDialog.id);
      toast.success("Material deleted");

      refreshMaterials();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteDialog({ open: false, id: null, title: "" });
    }
  };

  useEffect(() => {
    if (!materials) {
      loadMaterials().then((result) => {
        setMaterials(result);
      });
    } else {
      setLoading(false);
    }
  }, []);

  /* ---------------- FILTERED DATA ---------------- */
  const filtered = useMemo(() => {
    if (!materials) return [];

    return materials
      .filter((m) => {
        const searchTerm = search.toLowerCase();

        const titleMatch = m.title?.toLowerCase().includes(searchTerm);

        const classroomMatch = m.classroomName
          ?.toLowerCase()
          .includes(searchTerm);

        const typeMatch = getFileType(m.file)
          .toLowerCase()
          .includes(searchTerm);

        const dateMatch = new Date(m.createdAt)
          .toLocaleDateString()
          .includes(searchTerm);

        const pinnedMatch = searchTerm === "pinned" ? m.isPinned : false;

        return (
          titleMatch || classroomMatch || typeMatch || dateMatch || pinnedMatch
        );
      })
      .filter((m) => (filter === "all" ? true : getFileType(m.file) === filter))
      .sort((a, b) => b.isPinned - a.isPinned);
  }, [materials, search, filter]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-72">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="pb-5">
        <h1 className="text-2xl font-bold">
          {user.role === "student" ? "My Material" : "Material Overview"}
        </h1>
        <p className="text-sm opacity-70 mt-1">
          {user.role === "student"
            ? "Track your study and material"
            : "Monitor material"}
        </p>
      </div>

      {/* 🔍 Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-3 opacity-50" />
          <input
            type="text"
            placeholder="Search material..."
            className="input input-bordered pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select select-bordered sm:w-40"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pdf">PDF</option>
          <option value="image">Images</option>
          <option value="doc">Documents</option>
        </select>
      </div>

      {/* Empty State */}
      {materials.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-2xl">
          <h2 className="text-xl font-semibold mb-2">No Material Found</h2>
          <p className="opacity-70">Materials will appear here once created.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-1 space-y-1">
          {filtered.map((m, index) => (
            <div
              key={m._id}
              className="
        group relative cursor-pointer
        break-inside-avoid
        overflow-hidden
        bg-base-100 border border-base-300
        shadow-md hover:shadow-2xl
        transition-all duration-300
      "
              onClick={() => handleView(m)}
            >
              {/* IMAGE / PREVIEW */}
              <div className="relative">
                <div className="relative overflow-hidden">
                  <img
                    src={m?.file}
                    alt="Material"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        classroomImages[index % classroomImages.length];
                    }}
                    className="
                          w-full object-cover
                          transition-transform duration-300
                          group-hover:scale-105
                        "
                  />
                </div>

                {/* PIN BADGE */}
                {m.isPinned && (
                  <span className="absolute top-3 z-10 left-3 bg-warning text-black p-2 rounded-full shadow">
                    <FaThumbtack size={14} />
                  </span>
                )}

                {/* ACTION OVERLAY */}
                <div
                  className="
            absolute inset-0
            bg-black/40
            flex items-end justify-end gap-3 p-3
            opacity-100
            md:opacity-0 md:group-hover:opacity-100
            transition-opacity duration-300
          "
                >
                  {/* Student Download */}
                  {user?.role === "student" && (
                    <a
                      href={m.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="
                btn btn-sm btn-circle
                bg-white/90 text-black
                hover:bg-white
              "
                    >
                      <FaDownload />
                    </a>
                  )}

                  {/* Teacher Actions */}
                  {/* {user?.role === "teacher" && (
                    <>
                      <button
                        // onClick={(e) => {
                        //   e.stopPropagation();
                        //   togglePin(m._id);
                        // }}

                        onClick={(e) => {
                          e.stopPropagation();

                          setPinDialog({
                            open: true,
                            id: m._id,
                            title: m.title,
                            isPinned: m.isPinned,
                          });
                        }}
                        className="btn btn-xs btn-warning btn-circle"
                      >
                        <FaThumbtack size={14} />
                      </button>

                      <button
                        // onClick={(e) => {
                        //   e.stopPropagation();
                        //   deleteMaterial(m._id);
                        // }}
                        onClick={(e) => {
                          e.stopPropagation();

                          setDeleteDialog({
                            open: true,
                            id: m._id,
                            title: m.title,
                          });
                        }}
                        className="btn btn-xs btn-error btn-circle"
                      >
                        <MdDelete size={16} />
                      </button>
                    </>
                  )} */}
                  {user?.role === "teacher" && (
                    <div
                      className="dropdown dropdown-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* 3-dot button */}
                      <label
                        tabIndex={0}
                        className="btn btn-ghost btn-sm btn-circle"
                      >
                        <MoreVertical size={20} />
                      </label>

                      {/* Dropdown menu */}
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 border border-base-300 z-50"
                      >
                        {/* Pin / Unpin */}
                        <li>
                          <button
                            onClick={() =>
                              setPinDialog({
                                open: true,
                                id: m._id,
                                title: m.title,
                                isPinned: m.isPinned,
                              })
                            }
                            className="flex items-center gap-2"
                          >
                            <FaThumbtack size={14} />
                            {m.isPinned ? "Unpin" : "Pin"}
                          </button>
                        </li>

                        {/* Delete */}
                        <li>
                          <button
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                id: m._id,
                                title: m.title,
                              })
                            }
                            className="flex items-center gap-2 text-error"
                          >
                            <MdDelete size={16} />
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-4 flex flex-col justify-between h-32">
                {/* TOP */}
                <div>
                  <h2 className="text-sm font-semibold leading-snug line-clamp-2">
                    {m.title || "Untitled Material"}
                  </h2>

                  <p className="text-xs text-base-content/60 mt-1">
                    {m.classroom?.name || "—"}
                  </p>
                </div>

                {/* BOTTOM META */}
                <div className="flex items-center justify-between mt-3 text-xs text-base-content/60">
                  <span>{new Date(m.createdAt).toLocaleDateString()}</span>

                  <div className="flex items-center gap-1">
                    <FaEye className="opacity-70" size={12} />
                    <span>{m.views || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteDialog.open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error flex items-center gap-2">
              <MdDelete /> Delete Material
            </h3>

            <p className="py-4">
              Are you sure you want to delete
              <br />
              <b>{deleteDialog.title || "this material"}</b> ?
            </p>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() =>
                  setDeleteDialog({ open: false, id: null, title: "" })
                }
              >
                Cancel
              </button>

              <button className="btn btn-error" onClick={confirmDeleteMaterial}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {pinDialog.open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-warning flex items-center gap-2">
              <FaThumbtack />{" "}
              {pinDialog.isPinned ? "Unpin Material" : "Pin Material"}
            </h3>

            <p className="py-4">
              {pinDialog.isPinned
                ? "Remove this material from pinned list?"
                : "Pin this material so it appears first?"}
              <br />
              <b>{pinDialog.title}</b>
            </p>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() =>
                  setPinDialog({
                    open: false,
                    id: null,
                    title: "",
                    isPinned: false,
                  })
                }
              >
                Cancel
              </button>

              <button className="btn btn-warning" onClick={confirmTogglePin}>
                {pinDialog.isPinned ? "Unpin" : "Pin"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

