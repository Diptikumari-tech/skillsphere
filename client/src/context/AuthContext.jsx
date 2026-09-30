import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user profile on app startup if JWT token exists
  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("skillsphere_token");
      if (!token) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        if (response.data && response.data.success) {
          setCurrentUser(response.data.user);
          connectSocket(response.data.user);
        } else {
          localStorage.removeItem("skillsphere_token");
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Failed to authenticate with token:", error);
        localStorage.removeItem("skillsphere_token");
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data && response.data.success) {
      localStorage.setItem("skillsphere_token", response.data.token);
      setCurrentUser(response.data.user);
      connectSocket(response.data.user);
      return response.data.user;
    }
    throw new Error(response.data?.message || "Login failed");
  };

  const register = async (name, email, password, college = "", course = "", year = "") => {
    const response = await api.post("/auth/register", { name, email, password, college, course, year });
    if (response.data && response.data.success) {
      localStorage.setItem("skillsphere_token", response.data.token);
      setCurrentUser(response.data.user);
      connectSocket(response.data.user);
      return response.data.user;
    }
    throw new Error(response.data?.message || "Registration failed");
  };

  const logout = () => {
    localStorage.removeItem("skillsphere_token");
    setCurrentUser(null);
    disconnectSocket();
  };

  const updateUser = (updatedUserData) => {
    setCurrentUser((prev) => ({ ...prev, ...updatedUserData }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        register,
        logout,
        updateUser,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}