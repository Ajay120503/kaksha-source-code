import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/* USER PAGES */
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";

/* USER FEATURES */
import ClassroomList from "../pages/Classroom/ClassroomList";
import ClassroomDetail from "../pages/Classroom/ClassroomDetail";
import JoinClass from "../pages/Classroom/JoinClass";
import CreateClass from "../pages/Classroom/CreateClass";

import PostList from "../pages/Post/PostList";
import CreatePost from "../pages/Post/CreatePost";

import AssignmentList from "../pages/Assignment/AssignmentList";
import CreateAssignment from "../pages/Assignment/CreateAssignment";
import AllAssignmentList from "../pages/Assignment/AllAssignmentList";
import Submission from "../pages/Assignment/Submission";
import EditAssignment from "../pages/Classroom/EditAssignment";

import MaterialList from "../pages/Material/MaterialList";
import UploadMaterial from "../pages/Material/UploadMaterial";
import AllMaterialList from "../pages/Material/AllMaterialList";

/* LAYOUTS */
import Layout from "../components/Layout";

/* ADMIN */
import AdminRoute from "./AdminRoute";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import AdminStats from "../pages/admin/AdminStats";
import AdminClassrooms from "../pages/admin/AdminClassrooms";
import AdminRoleRequests from "../pages/admin/AdminRoleRequests";

/* NOTIFICATIOSN */

import Notifications from "../pages/Notifications/Notifications";
import JoinRequests from "../pages/Classroom/JoinRequests";
// import VerifyOTP from "../pages/Auth/VerifyOTP";

/* AUTH GUARD */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

//  classroom chat

import ChatWindow from "../components/chat/ChatWindow";

/* ROLE GUARD */
const RoleRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user || user.role !== role) return <Navigate to="/" replace />;
  return children;
};

export default function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- AUTH ---------- */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" /> : <Register />}
        />

        {/* <Route
          path="/verify-otp"
          element={isAuthenticated ? <Navigate to="/" /> : <VerifyOTP />}
        /> */}

        {/* ---------- USER APP ---------- */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />

          <Route path="classrooms" element={<ClassroomList />} />
          <Route path="class/:classId" element={<ClassroomDetail />} />
          <Route path="join" element={<JoinClass />} />

          <Route
            path="create"
            element={
              <RoleRoute role="teacher">
                <CreateClass />
              </RoleRoute>
            }
          />

          <Route path="posts/:classId" element={<PostList />} />
          <Route
            path="posts/create/:classId"
            element={
              <RoleRoute role="teacher">
                <CreatePost />
              </RoleRoute>
            }
          />

          {/* chat route */}
          <Route path="chat/:classId" element={<ChatWindow />} />

          <Route path="assignments" element={<AllAssignmentList />} />
          <Route path="assignments/:classId" element={<AssignmentList />} />
          <Route
            path="assignments/create/:classId"
            element={
              <RoleRoute role="teacher">
                <CreateAssignment />
              </RoleRoute>
            }
          />
          <Route
            path="assignments/edit/:assignmentId"
            element={
              <RoleRoute role="teacher">
                <EditAssignment />
              </RoleRoute>
            }
          />
          <Route path="assignment/submission/:id" element={<Submission />} />

          <Route path="materials" element={<AllMaterialList />} />
          <Route path="materials/:classId" element={<MaterialList />} />
          <Route
            path="materials/upload/:classId"
            element={
              <RoleRoute role="teacher">
                <UploadMaterial />
              </RoleRoute>
            }
          />
          {/* Notifications */}
          <Route path="notifications" element={<Notifications />} />
          <Route path="join-requests" element={<JoinRequests />} />
        </Route>

        {/* ---------- ADMIN APP ---------- */}
        <Route path="/120503" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="stats" element={<AdminStats />} />
            <Route path="classrooms" element={<AdminClassrooms />} />
            <Route path="role-requests" element={<AdminRoleRequests />} />
          </Route>
        </Route>

        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
