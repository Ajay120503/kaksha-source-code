import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import materialService from "../../services/materialService";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { MdDelete, MdClose } from "react-icons/md";
import { useMaterial } from "../../context/MaterialContext";
import { FaDownload, FaEye, FaSearch } from "react-icons/fa";
import { MoreVertical } from "lucide-react";

export default function MaterialList() {
  const { classId } = useParams();
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  const { materialsByClass, setMaterialsByClass } = useMaterial();
  const materials = materialsByClass[classId] || [];

  const [loading, setLoading] = useState(true);

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    materialId: null,
    title: "",
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

  // 🔍 UI States
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("new");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setLoading(true);
        const res = await materialService.getMaterials(classId);
        setMaterialsByClass((prev) => ({ ...prev, [classId]: res || [] }));
      } catch {
        toast.error("Failed to fetch materials");
      } finally {
        setLoading(false);
      }
    };

    if (materialsByClass[classId] != null) {
      setLoading(false);
      return;
    }
    loadMaterials();
  }, [classId, materialsByClass, setMaterialsByClass]);

  // const handleDelete = async (id) => {
  //   if (!confirm("Delete this material?")) return;

  //   try {
  //     await materialService.deleteMaterial(id);
  //     toast.success("Material deleted");

  //     // Update context immediately
  //     setMaterialsByClass((prev) => {
  //       const updated = { ...prev };
  //       if (updated[classId]) {
  //         updated[classId] = updated[classId].filter((m) => m._id !== id);
  //       }
  //       return updated;
  //     });
  //   } catch {
  //     toast.error("Delete failed");
  //   }
  // };

  const confirmDeleteMaterial = async () => {
    try {
      await materialService.deleteMaterial(deleteDialog.materialId);

      toast.success("Material deleted");

      setMaterialsByClass((prev) => {
        const updated = { ...prev };

        if (updated[classId]) {
          updated[classId] = updated[classId].filter(
            (m) => m._id !== deleteDialog.materialId
          );
        }

        return updated;
      });
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteDialog({ open: false, materialId: null, title: "" });
    }
  };

  const getFileType = (url = "") => {
    if (url.includes(".pdf")) return "pdf";
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "image";
    if (url.match(/\.(mp4|webm|mov)$/)) return "video";
    return "other";
  };

  // 🧠 Filter + Search + Sort
  const filteredMaterials = useMemo(() => {
    let data = [...materials];

    const searchTerm = search.toLowerCase().trim();

    // 🔎 ADVANCED SEARCH
    if (searchTerm) {
      data = data.filter((m) => {
        const titleMatch = m.title?.toLowerCase().includes(searchTerm);

        const classroomMatch = m.classroomName
          ?.toLowerCase()
          .includes(searchTerm);

        const typeMatch = getFileType(m.file)
          .toLowerCase()
          .includes(searchTerm);

        const createdDate = m.createdAt ? new Date(m.createdAt) : null;

        const dateMatch = createdDate
          ? createdDate.toLocaleDateString().toLowerCase().includes(searchTerm)
          : false;

        const monthMatch = createdDate
          ? createdDate
              .toLocaleString("default", { month: "long" })
              .toLowerCase()
              .includes(searchTerm)
          : false;

        const yearMatch = createdDate
          ? createdDate.getFullYear().toString().includes(searchTerm)
          : false;

        const pinnedMatch = searchTerm === "pinned" && m.isPinned;

        const recentMatch =
          searchTerm === "recent" &&
          createdDate &&
          new Date() - createdDate < 7 * 24 * 60 * 60 * 1000;

        const mostViewedMatch = searchTerm === "popular" && m.views > 10;

        return (
          titleMatch ||
          classroomMatch ||
          typeMatch ||
          dateMatch ||
          monthMatch ||
          yearMatch ||
          pinnedMatch ||
          recentMatch ||
          mostViewedMatch
        );
      });
    }

    // 📂 FILE TYPE FILTER
    if (filter !== "all") {
      data = data.filter((m) => getFileType(m.file) === filter);
    }

    // ⏳ SORT
    data.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      return sort === "new" ? dateB - dateA : dateA - dateB;
    });

    return data;
  }, [materials, search, filter, sort]);

  if (loading)
    return <div className="p-6 text-center">Loading materials...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Class Materials</h1>
          <p className="text-sm opacity-70">
            Notes, PDFs, videos & learning resources
          </p>
        </div>

        {isTeacher && (
          <Link
            to={`/materials/upload/${classId}`}
            className="btn btn-primary btn-sm"
          >
            Upload Material
          </Link>
        )}
      </div>

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-3 mb-8">
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search materials..."
            className="input input-bordered pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter */}
        <select
          className="select select-bordered"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Files</option>
          <option value="pdf">PDF</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>

        {/* Sort */}
        <select
          className="select select-bordered"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="new">Newest First</option>
          <option value="old">Oldest First</option>
        </select>
      </div>

      {/* GALLERY */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-1 space-y-1">
        {filteredMaterials.map((m, index) => {
          return (
            <div
              key={m._id}
              onClick={() => setPreview(m)}
              className="
          group relative cursor-pointer
          break-inside-avoid
           overflow-hidden
          bg-base-100 border border-base-300
          shadow-md hover:shadow-2xl
          transition-all duration-300
        "
            >
              {/* IMAGE / PREVIEW */}
              <div className="relative">
                <div className="relative overflow-hidden">
                  <img
                    src={m?.file}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        classroomImages[index % classroomImages.length];
                    }}
                    alt="Material"
                    className="
              w-full object-cover
              transition-transform duration-200
              group-hover:scale-105
            "
                  />
                </div>

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
                  {user?.role === "student" && (
                    <a
                      href={m.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="
        btn btn-xs btn-circle
        bg-white/90 text-black
        hover:bg-white
      "
                    >
                      <FaDownload />
                    </a>
                  )}

                  {/* {isTeacher && (
                    <button
                      // onClick={(e) => {
                      //   e.stopPropagation();
                      //   handleDelete(m._id);
                      // }}
                      onClick={(e) => {
                        e.stopPropagation();

                        setDeleteDialog({
                          open: true,
                          materialId: m._id,
                          title: m.title,
                        });
                      }}
                      className="btn btn-xs btn-error btn-circle"
                    >
                      <MdDelete size={16} />
                    </button>
                  )} */}
                  {isTeacher && (
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
                        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36 border border-base-300 z-50"
                      >
                        <li>
                          <button
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                materialId: m._id,
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
          );
        })}
      </div>

      {/* PREVIEW MODAL */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 z-70 flex items-center justify-center sm:p-4">
          <div className="bg-base-100 sm:rounded-xl max-w-5xl w-full relative border border-base-300">
            <button
              onClick={() => setPreview(null)}
              className="absolute top-3 right-3 btn btn-sm btn-circle"
            >
              <MdClose />
            </button>

            <div className="p-5">
              <h2 className="font-bold mb-4">{preview.title}</h2>

              {getFileType(preview.file) === "pdf" && (
                <iframe src={preview.file} className="w-full h-[70vh]" />
              )}

              {getFileType(preview.file) === "image" && (
                <img src={preview.file} className="max-h-[70vh] mx-auto" />
              )}

              {getFileType(preview.file) === "video" && (
                <video
                  src={preview.file}
                  controls
                  className="w-full max-h-[70vh]"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE MATERIAL MODAL ================= */}

      {deleteDialog.open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error flex items-center gap-2">
              <MdDelete size={20} />
              Delete Material
            </h3>

            <p className="py-4">
              Are you sure you want to delete{" "}
              <b>{deleteDialog.title || "this material"}</b> ?
              <br />
              This action cannot be undone.
            </p>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() =>
                  setDeleteDialog({ open: false, materialId: null, title: "" })
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
    </div>
  );
}
