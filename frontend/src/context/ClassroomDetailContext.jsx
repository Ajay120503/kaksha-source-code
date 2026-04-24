// import { createContext, useContext, useState } from "react";

// const ClassroomDetailContext = createContext();

// export const ClassroomDetailProvider = ({ children }) => {
//   const [classroomsById, setClassroomsById] = useState({});

//   return (
//     <ClassroomDetailContext.Provider
//       value={{ classroomsById, setClassroomsById }}
//     >
//       {children}
//     </ClassroomDetailContext.Provider>
//   );
// };

// export const useClassroom = () => {
//   const ctx = useContext(ClassroomDetailContext);
//   if (!ctx) {
//     throw new Error("useClassroom must be used inside ClassroomProvider");
//   }
//   return ctx;
// };

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const ClassroomDetailContext = createContext();

export const ClassroomDetailProvider = ({ children }) => {
  const { user } = useAuth();
  const [classroomsById, setClassroomsById] = useState({});

  useEffect(() => {
    setClassroomsById({});
  }, [user]);

  return (
    <ClassroomDetailContext.Provider
      value={{ classroomsById, setClassroomsById }}
    >
      {children}
    </ClassroomDetailContext.Provider>
  );
};

export const useClassroom = () => {
  const ctx = useContext(ClassroomDetailContext);
  if (!ctx) {
    throw new Error("useClassroom must be used inside ClassroomProvider");
  }
  return ctx;
};
