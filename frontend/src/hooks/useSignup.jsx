import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useAuthContext();

  const signup = async (email, password, accountType) => {
    setIsLoading(true);
    setError(null);
    try {
      // First attempt signup
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, accountType }),
      });
      const json = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setError(json.error);
        return { success: false, error: json.error };
      }

      // Don't store user data or dispatch LOGIN action yet
      // Wait until OTP verification is successful
      setIsLoading(false);
      return { success: true, userData: json };
    } catch (error) {
      setIsLoading(false);
      setError("An error occurred during signup");
      return { success: false, error: "An error occurred during signup" };
    }
  };

  const completeSignup = (userData) => {
    // Store user data and dispatch LOGIN action after OTP verification
    localStorage.setItem("user", JSON.stringify(userData));
    dispatch({ type: "LOGIN", payload: userData });
  };

  return { signup, completeSignup, isLoading, error };
};
