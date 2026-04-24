// import { createContext, useState, useEffect } from "react";
// import authService from "../services/authService";
// import api from "../services/api";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(localStorage.getItem("token") || null);
//   const [loading, setLoading] = useState(true);

//   // Set Authorization header
//   const applyToken = (jwt) => {
//     if (jwt) api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
//     else delete api.defaults.headers.common["Authorization"];
//   };

//   // Check token on app start
//   useEffect(() => {
//     const init = async () => {
//       if (!token) {
//         setLoading(false);
//         return;
//       }

//       applyToken(token);

//       try {
//         const res = await authService.me();
//         setUser(res?.user || res);
//       } catch (err) {
//         console.warn("Token expired or invalid", err);
//         setUser(null);
//         localStorage.removeItem("token");
//         applyToken(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     init();
//   }, [token]);

//   // Login function
//   const login = async (data) => {
//     const res = await authService.login(data);
//     localStorage.setItem("token", res.token);
//     setToken(res.token);
//     applyToken(res.token);
//     setUser(res.user);
//   };

//   // Register function
//   const register = async (data) => {
//     const res = await authService.register(data);
//     localStorage.setItem("token", res.token);
//     setToken(res.token);
//     applyToken(res.token);
//     setUser(res.user);
//   };

//   // Logout function
//   const logout = () => {
//     localStorage.removeItem("token");
//     setToken(null);
//     applyToken(null);
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         loading,
//         isAuthenticated: !!user,
//         login,
//         register,
//         logout,
//         setUser,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

import { createContext, useState, useEffect } from "react";
import authService from "../services/authService";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  /* ================= APPLY TOKEN ================= */

  const applyToken = (jwt) => {
    if (jwt) {
      api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  };

  /* ================= INIT AUTH ================= */

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      applyToken(token);

      try {
        const res = await authService.me();
        setUser(res?.user || res);
      } catch (err) {
        console.warn("Token expired or invalid", err);

        setUser(null);
        setToken(null);

        localStorage.removeItem("token");
        applyToken(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [token]);

  /* ================= LOGIN ================= */

  const login = async (data) => {
    // Clear old session before login
    logout();

    const res = await authService.login(data);

    localStorage.setItem("token", res.token);

    setToken(res.token);
    applyToken(res.token);
    setUser(res.user);
  };

  /* ================= REGISTER ================= */

  const register = async (data) => {
    logout();

    const res = await authService.register(data);

    localStorage.setItem("token", res.token);

    setToken(res.token);
    applyToken(res.token);
    setUser(res.user);
  };

  /* ================= LOGOUT ================= */

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("token");
    sessionStorage.clear();

    applyToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
