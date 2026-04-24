import { useContext } from "react";
import { ClassroomContext } from "../context/ClassroomContext.jsx";

export const useClassroom = () => useContext(ClassroomContext);
