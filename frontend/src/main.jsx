import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { AssignmentProvider } from "./context/AssignmentContext";
import { MaterialProvider } from "./context/MaterialContext";
import { AuthProvider } from "./context/AuthContext";
import { ClassroomProvider } from "./context/ClassroomContext";
import { PostProvider } from "./context/PostContext";
import { ClassroomDetailProvider } from "./context/ClassroomDetailContext";
import "highlight.js/styles/github-dark.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ClassroomProvider>
        <ClassroomDetailProvider>
          <AssignmentProvider>
            <MaterialProvider>
              <PostProvider>
                <App />
                <Toaster position="top-right" />
              </PostProvider>
            </MaterialProvider>
          </AssignmentProvider>
        </ClassroomDetailProvider>
      </ClassroomProvider>
    </AuthProvider>
  </StrictMode>
);