// import { createContext, useContext, useState } from "react";

// const AssignmentContext = createContext();

// export const AssignmentProvider = ({ children }) => {
//   const [assignments, setAssignments] = useState(null); // for AllAssignmentList
//   const [assignmentsByClass, setAssignmentsByClass] = useState({}); // per class

//   return (
//     <AssignmentContext.Provider
//       value={{
//         assignments,
//         setAssignments,
//         assignmentsByClass,
//         setAssignmentsByClass,
//       }}
//     >
//       {children}
//     </AssignmentContext.Provider>
//   );
// };

// export const useAssignment = () => {
//   const context = useContext(AssignmentContext);
//   if (!context) {
//     throw new Error("useAssignment must be used inside AssignmentProvider");
//   }
//   return context;
// };

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const AssignmentContext = createContext();

export const AssignmentProvider = ({ children }) => {
  const { user } = useAuth();

  const [assignments, setAssignments] = useState(null);
  const [assignmentsByClass, setAssignmentsByClass] = useState({});

  useEffect(() => {
    setAssignments(null);
    setAssignmentsByClass({});
  }, [user]);

  return (
    <AssignmentContext.Provider
      value={{
        assignments,
        setAssignments,
        assignmentsByClass,
        setAssignmentsByClass,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
};

export const useAssignment = () => {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error("useAssignment must be used inside AssignmentProvider");
  }
  return context;
};
