import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLogin } from "../hooks/useLogin";

export function LoginForm() { 
       
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const {login, isLoading, error} = useLogin()
  

const handleSubmit = async (e) =>{
    e.preventDefault()
    
    try {
        const result = await login(email, password)
        if (!result.success) {
            console.error('Login failed:', result.error)
        }
    } catch (err) {
        console.error('Form submission error:', err)
    }
}



  const images = [   


    "https://i.ibb.co/zhtz2LX4/card1.jpg",
    "https://i.ibb.co/pjJDDqJN/card2.jpg",
    "https://i.ibb.co/HTHwdwwT/card3.jpg",
    "https://i.ibb.co/ZbkBQdc/card4.jpg",
    "https://i.ibb.co/9kYPcZrB/card5.jpg",
 
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Cleanup interval
  }, [images.length]);

  return (
    <div className="w-full max-w-4xl mx-auto border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-green-500 dark:text-green-400 mb-2">Welcome back</h1>
            <p className="text-blue-600 dark:text-blue-400">Login to your E-SHOP account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-green-500 dark:text-green-400 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                onChange={(e => setEmail(e.target.value))}
                value={email}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-green-500 dark:text-green-400"
                >
                  Password
                </label>
                <Link to="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>  
            {error && (
                <div className="p-2 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded">
                    {error}
                </div>
            )}
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        <div className="w-full md:w-1/2 relative hidden md:block">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
