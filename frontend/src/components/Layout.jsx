import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileBottomNav from "./MobileBottomNav";
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
  const { user } = useAuth();

  return (
    <div className="bg-base-200">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed h-full z-60">
        <Sidebar />
      </div>

      {/* ----------- MAIN CONTENT ----------- */}
      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* Mobile Bottom Nav */}
        {user && <MobileBottomNav role={user.role} />}

        <main className="md:ml-64 flex-1 overflow-y-auto pb-16 p-3 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
