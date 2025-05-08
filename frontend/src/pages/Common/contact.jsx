import { useAuthContext } from "../../hooks/useAuthContext";
import { useState, useEffect } from "react";

const Contact = () => {
  const { user } = useAuthContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = { name, email, message };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
         Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Message sent successfully!");
        setMessage(""); // Clear message field
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Contact Us
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Get in Touch
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                  placeholder="your@email.com"
                  required
                />
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
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <p className="text-gray-600 dark:text-gray-300">
                    123 Business Street<br />
                    Mekele, Tigray 12345
                  </p>
                </div>
                <div className="flex items-start">
                  <p className="text-gray-600 dark:text-gray-300">
                    support@eshop.com
                  </p>
                </div>
                <div className="flex items-start">
                  <p className="text-gray-600 dark:text-gray-300">
                    +251 900000000
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Business Hours
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">
                  Monday - Friday: 9:00 AM - 6:00 PM
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Saturday: 10:00 AM - 4:00 PM
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
