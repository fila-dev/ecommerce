import { useState, useEffect } from "react";
import { useSignup } from "../hooks/useSignup";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { OTPInput } from "./OTPInput";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("signup"); // 'signup' or 'otp' or 'profile'
  const [userData, setUserData] = useState(null);
  const { signup, completeSignup, error, isLoading } = useSignup();
  const navigate = useNavigate();

  // Profile fields
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [
    "https://i.ibb.co/zhtz2LX4/card1.jpg",
    "https://i.ibb.co/pjJDDqJN/card2.jpg",
    "https://i.ibb.co/HTHwdwwT/card3.jpg",
    "https://i.ibb.co/ZbkBQdc/card4.jpg",
    "https://i.ibb.co/9kYPcZrB/card5.jpg",

   ,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {
        const response = await fetch("${import.meta.env.VITE_API_BASE_URL}/api/user/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({
                email,
                password,
                accountType
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Signup initiated, waiting for OTP verification");
            setStep("otp");
        } else {
            throw new Error(data.error || "Signup failed");
        }
    } catch (error) {
        console.error("Signup error:", error);
        alert(error.message || "An error occurred during signup");
    }
  };

  const handleOtpComplete = (value) => {
    console.log("OTP completed:", value);
    setOtp(value);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp) {
        alert("Please enter the verification code");
        return;
    }

    try {
        const response = await fetch("${import.meta.env.VITE_API_BASE_URL}/api/otp/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({
                email,
                otp
            }),
        });

        const data = await response.json();
        
        if (response.ok && data.userData) {
            console.log("OTP verification successful");
            setUserData(data.userData);
            setStep("profile");
        } else {
            throw new Error(data.message || "Invalid OTP");
        }
    } catch (error) {
        console.error("OTP verification error:", error);
        alert(error.message || "Failed to verify OTP");
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!userData || !userData.token) {
        console.error("Profile submission - userData:", userData);
        alert("Authentication token missing. Please try again.");
        return;
    }

    try {
        const response = await fetch("${import.meta.env.VITE_API_BASE_URL}/api/user/update-details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userData.token}`
            },
            credentials: 'include',
            body: JSON.stringify({
                name,
                fatherName,
                phone,
                address
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to update profile");
        }

        // Update the complete user data with the new profile
        const updatedUserData = {
            ...userData,
            profile: data.user.profile
        };

        // Store updated user data and complete signup
        completeSignup(updatedUserData);

        // Navigate based on account type
        navigate(accountType === "provider" ? "/provider/dashboard" : "/dashboard");
    } catch (error) {
        console.error("Profile update error:", error);
        alert(error.message || "Failed to update profile");
    }
  };

  // Add debugging useEffect
  useEffect(() => {
    console.log("Current step:", step);
    console.log("Current userData:", userData);
  }, [step, userData]);

  if (step === "profile") {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white border-gray-200 dark:border-gray-700 dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <form className="w-full max-w-md mx-auto" onSubmit={handleProfileSubmit}>
          <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">
            Complete Your Profile
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-500 mb-1">
                Father's Name
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-500 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  // Only allow numbers and + symbol
                  const value = e.target.value.replace(/[^\d+]/g, '');
                  // Limit length to 15 characters (international standard)
                  if (value.length <= 15) {
                    setPhone(value);
                  }
                }}
                pattern="^\+?[0-9]{10,15}$"
                title="Please enter a valid phone number (10-15 digits, optionally starting with +)"
                placeholder="+2519 4567890"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a valid phone number (10-15 digits, optionally starting with +)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-500 mb-1">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                rows="3"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-6"
          >
            Complete Profile
          </button>
        </form>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white border-gray-200 dark:border-gray-700 dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <form className="w-full max-w-md mx-auto" onSubmit={handleVerifyOTP}>
          <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">
            Verify Your Email
          </h2>
          <div className="mb-6">
            <p className="text-gray-100 mb-4 text-center">
              Please enter the verification code sent to:
            </p>
            <p className="text-blue-400 font-medium text-center mb-6">
              {email}
            </p>

            <OTPInput length={6} onComplete={handleOtpComplete} />
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Verify Email
            </button>

            <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                className="text-blue-500 hover:text-blue-800"
                onClick={() => setStep("signup")}
              >
                Back to Signup
              </button>

              <button
                type="button"
                className="text-blue-500 hover:text-blue-800"
                onClick={async () => {
                  try {
                    const response = await fetch(
                      "${import.meta.env.VITE_API_BASE_URL}/api/otp/request-otp",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: 'include',
                        body: JSON.stringify({
                          email,
                          subject: "OTP Resend - Email Verification",
                          message: "Here is your new verification code:",
                          type: "SIGNUP",
                        }),
                      }
                    );
                    const data = await response.json();
                    if (data.status === "SUCCESS") {
                      alert("New verification code sent successfully");
                    }
                  } catch (error) {
                    alert("Failed to resend verification code");
                  }
                }}
              >
                Resend Code
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            <h1 className="text-2xl font-bold text-green-500 mb-2">Join Us</h1>
            <p className="text-blue-600">Create your E-SHOP account</p>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-green-500 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-green-500 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            <div className="relative">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-green-500 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <label className="block text-sm font-medium text-green-500 mb-1">
                Account Type:
              </label>
              <div className="flex items-center">
                <input
                  id="provider"
                  name="account-type"
                  type="radio"
                  value="provider"
                  checked={accountType === "provider"}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor="provider"
                  className="ml-2 block text-sm text-green-700"
                >
                  Provider
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="buyer"
                  name="account-type"
                  type="radio"
                  value="buyer"
                  checked={accountType === "buyer"}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor="buyer"
                  className="ml-2 block text-sm text-green-700"
                >
                  Buyer
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign Up
            </button>
            {error && (
              <div
                className="text-red-500 border border-red-400 px-1 py-2 rounded relative flex items-center gap-2"
                role="alert"
              >
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="text-red-500"
                />
                <span>{error}</span>
              </div>
            )}
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
        <div className="w-full md:w-1/2 relative hidden md:block">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="absolute inset-0 h-full w-full object-fill"
          />
        </div>
      </div>
    </div>
  );
}
