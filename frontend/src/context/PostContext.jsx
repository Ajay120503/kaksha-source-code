// import { createContext, useContext, useState } from "react";

// const PostContext = createContext(null);

// export function PostProvider({ children }) {
//   const [postsByClass, setPostsByClass] = useState({});

//   return (
//     <PostContext.Provider value={{ postsByClass, setPostsByClass }}>
//       {children}
//     </PostContext.Provider>
//   );
// }

// export function usePost() {
//   const context = useContext(PostContext);
//   if (!context) {
//     throw new Error("usePost must be used inside PostProvider");
//   }
//   return context;
// }

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const PostContext = createContext(null);

export function PostProvider({ children }) {
  const { user } = useAuth();

  const [postsByClass, setPostsByClass] = useState({});

  useEffect(() => {
    setPostsByClass({});
  }, [user]);

  return (
    <PostContext.Provider value={{ postsByClass, setPostsByClass }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePost() {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePost must be used inside PostProvider");
  }
  return context;
}
