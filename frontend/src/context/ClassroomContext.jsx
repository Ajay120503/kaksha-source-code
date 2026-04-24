// import { createContext, useState, useEffect } from "react";
// import classroomService from "../services/classroomService";

// export const ClassroomContext = createContext();

// export const ClassroomProvider = ({ children }) => {
//   const [classrooms, setClassrooms] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const loadMyClassrooms = async () => {
//     try {
//       const res = await classroomService.myClassrooms();
//       setClassrooms(res);
//     } catch (err) {
//       console.log("Class Fetch Error:", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadMyClassrooms();
//   }, []);

//   const createClassroom = async (data) => {
//     const res = await classroomService.createClassroom(data);
//     loadMyClassrooms();
//     return res;
//   };

//   const joinClassroom = async (code) => {
//     const res = await classroomService.joinClassroom(code);
//     loadMyClassrooms();
//     return res;
//   };

//   return (
//     <ClassroomContext.Provider
//       value={{
//         classrooms,
//         loading,
//         loadMyClassrooms,
//         createClassroom,
//         joinClassroom,
//       }}
//     >
//       {children}
//     </ClassroomContext.Provider>
//   );
// };

import { createContext, useState, useEffect } from "react";
import classroomService from "../services/classroomService";
import { useAuth } from "../hooks/useAuth";

export const ClassroomContext = createContext();

export const ClassroomProvider = ({ children }) => {
  const { user } = useAuth();

  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMyClassrooms = async () => {
    try {
      const res = await classroomService.myClassrooms();
      setClassrooms(res);
    } catch (err) {
      console.log("Class Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setClassrooms([]);
      return;
    }

    loadMyClassrooms();
  }, [user]);

  const createClassroom = async (data) => {
    const res = await classroomService.createClassroom(data);
    loadMyClassrooms();
    return res;
  };

  const joinClassroom = async (code) => {
    const res = await classroomService.joinClassroom(code);
    loadMyClassrooms();
    return res;
  };

  return (
    <ClassroomContext.Provider
      value={{
        classrooms,
        loading,
        loadMyClassrooms,
        createClassroom,
        joinClassroom,
      }}
    >
      {children}
    </ClassroomContext.Provider>
  );
};
