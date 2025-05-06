import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const ContactProvider = () => {
  const { email } = useParams();


  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if email is defined
  if (!email) {
    setError("Email parameter is required.");
    return <div>Email parameter is required.</div>;
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/contact-provider/${email}` } });
    }
  }, [user, navigate, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if email is defined
    if (!email) {
      setError("Email parameter is required.");
      return;
    }

    // Check if message is defined and not empty
    if (!message.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    setLoading(true);
    setError(null);

    if (!user) {
      setError("Please login to send a message");
      setLoading(false);
      navigate('/login', { state: { from: `/contact-provider/${email}` } });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/contact/${email}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            message: message.trim(),
            card: user.selectedCardId // Get the selected card ID from user context
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Success
      alert("Message sent successfully!");
      setMessage("");
      navigate(-1); // Go back to previous page
    } catch (err) {
      console.error("Error sending message:", err);
      if (err.message === "You must be logged in") {
        navigate('/login', { state: { from: `/contact-provider/${email}` } });
      }
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen py-12 bg-gray-100 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Please Login
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            You need to be logged in to contact providers.
          </p>
          <button
            onClick={() => navigate('/login', { state: { from: `/contact-provider/${email}` } })}
            className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Contact Provider
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Send Message
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    From
                  </label>
                  <input
                    type="text"
                    value={user?.email || ""}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700"
                    disabled
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    To
                  </label>
                  <input
                    type="text"
                    value={email || ""}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700"
                    disabled
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 resize-none"
                  placeholder="Your message"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Provider Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <p className="text-gray-600 dark:text-gray-300">
                    Sending message to: {email}
                  </p>
                </div>
                <div className="flex items-start">
                  <p className="text-gray-600 dark:text-gray-300">
                    Your message will be sent directly to the provider.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Note
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">
                  Please be respectful and professional in your communication.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  The provider will respond to your message as soon as possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactProvider;