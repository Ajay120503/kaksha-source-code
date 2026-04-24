import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import AdminMobileBottomNav from "./AdminMobileBottomNav";

export default function AdminLayout() {
  return (
    <div className="bg-base-200">
      {/* Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full z-50">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col">
        <AdminNavbar />
        <AdminMobileBottomNav />
        <main className="md:ml-64 flex-1 overflow-y-auto pb-18 p-3 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
