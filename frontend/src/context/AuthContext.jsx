import { createContext, useReducer, useEffect } from "react";

export const AuthContext = createContext();

export const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      return { user: null };
    case "UPDATE_TOKEN":
      return { user: { ...state.user, token: action.payload } };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
  });

  useEffect(() => {
    // Check for stored user data on mount
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      // Verify token expiration
      const token = user.token;
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          // Token expired, logout user
          localStorage.removeItem("user");
          dispatch({ type: "LOGOUT" });
        } else {
          dispatch({ type: "LOGIN", payload: user });
        }
      }
    }
  }, []);

  // Optional: Add token refresh mechanism
  useEffect(() => {
    if (state.user?.token) {
      const payload = JSON.parse(atob(state.user.token.split(".")[1]));
      const timeUntilExpiry = payload.exp * 1000 - Date.now();

      // Refresh token 5 minutes before expiry
      const refreshTimeout = setTimeout(async () => {
        try {
          const response = await fetch("/api/auth/refresh", {
            headers: {
              Authorization: `Bearer ${state.user.token}`,
            },
          });
          if (response.ok) {
            const { token } = await response.json();
            dispatch({ type: "UPDATE_TOKEN", payload: token });
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...state.user,
                token,
              })
            );
          } else {
            dispatch({ type: "LOGOUT" });
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
          dispatch({ type: "LOGOUT" });
          localStorage.removeItem("user");
        }
      }, timeUntilExpiry - 5 * 60 * 1000);

      return () => clearTimeout(refreshTimeout);
    }
  }, [state.user?.token]);

  console.log("AuthContext state: ", state);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
