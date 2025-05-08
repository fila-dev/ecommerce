import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  UserCircle,
  Receipt,
  Settings,
  LayoutDashboard,
  Package,
  Sun,
  Moon
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setSuggestions(null);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/suggestions?query=${searchQuery}`);
        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleClick = () => {
    logout();
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleCartClick = (e) => {
    if (!user) {
      e.preventDefault();
      navigate("/login");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSuggestions(null);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 p-2 shadow-lg mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-indigo-400">
              E-Shop
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-900 dark:text-white hover:text-indigo-400">
                Home
              </Link>
              <Link to="/about" className="text-gray-900 dark:text-white hover:text-indigo-400">
                About
              </Link>
              <Link to="/contact" className="text-gray-900 dark:text-white hover:text-indigo-400">
                Contact
              </Link>
              {user && (
                <>
                  {user.accountType === "admin" && (
                    <Link
                      to="/admin"
                      className="text-gray-900 dark:text-white hover:text-indigo-400"
                    >
                      Dashboard
                    </Link>
                  )}
                  {user.accountType === "provider" && (
                    <Link
                      to="/provider/dashboard"
                      className="text-gray-900 dark:text-white hover:text-indigo-400"
                    >
                      Dashboard
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Cart - Always visible */}
            <Link
              to="/cart"
              onClick={handleCartClick}
              className="text-gray-900 dark:text-white hover:text-indigo-400 relative"
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cart.length}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="md:hidden"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Theme toggle and search - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-800 dark:text-white" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-800 dark:text-white" />
                )}
              </button>
              <div className="relative">
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-40 lg:w-60 pl-8 pr-2 py-1 rounded-full bg-white dark:bg-gray-700 
                             text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 
                             border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 
                             focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 
                             text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>

                {suggestions && searchQuery.length >= 2 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
                    {suggestions.categories.length > 0 && (
                      <div className="p-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Categories</div>
                        {suggestions.categories.map(cat => (
                          <div key={cat._id} 
                               onClick={() => {
                                 navigate(`/?category=${encodeURIComponent(cat.name)}`);
                                 setSuggestions(null);
                                 setSearchQuery('');
                               }}
                               className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer rounded">
                            {cat.name}
                          </div>
                        ))}
                      </div>
                    )}
                    {suggestions.products.length > 0 && (
                      <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Products</div>
                        {suggestions.products.map(product => (
                          <div key={product._id}
                               onClick={() => {
                                 navigate(`/card-info/${product._id}`);
                                 setSuggestions(null);
                                 setSearchQuery('');
                               }}
                               className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer rounded">
                            {product.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div
                      onClick={toggleUserMenu}
                      className="flex items-center space-x-2 hover:opacity-80 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {user.email}
                      </span>
                    </div>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-20">
                        <ul className="py-1">
                          <li>
                            <Link
                              to="/profile"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                            >
                              <UserCircle className="mr-2 w-5 h-5" /> Profile
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/order-history"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                            >
                              <Receipt className="mr-2 w-5 h-5" /> Purchase
                              History
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/settings"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                            >
                              <Settings className="mr-2 w-5 h-5" /> Settings
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/order-tracking"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                            >
                              <Package className="mr-2 w-5 h-5" /> Track Orders
                            </Link>
                          </li>
                          <li>
                            {user.accountType === 'admin' && (
                              <Link
                                to="/admin"
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                              >
                                <LayoutDashboard className="mr-2 w-5 h-5" /> Dashboard
                              </Link>
                            )}
                            {user.accountType === 'provider' && (
                              <Link
                                to="/provider/dashboard"
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                              >
                                <LayoutDashboard className="mr-2 w-5 h-5" /> Dashboard
                              </Link>
                            )}
                          </li>
                          <li>
                            <button
                              onClick={handleClick}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              Logout
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm rounded-md bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 text-white"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm rounded-md bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4">
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-900 dark:text-white hover:text-indigo-400">
                Home
              </Link>
              <Link to="/about" className="text-gray-900 dark:text-white hover:text-indigo-400">
                About
              </Link>
              <Link to="/contact" className="text-gray-900 dark:text-white hover:text-indigo-400">
                Contact
              </Link>
              <Link to="/cart" className="text-gray-900 dark:text-white hover:text-indigo-400">
                Cart
              </Link>
              {user && user.accountType === "admin" && (
                <Link to="/admin" className="text-gray-900 dark:text-white hover:text-indigo-400">
                  Admin
                </Link>
              )}
              {user && user.accountType === "provider" && (
                <Link
                  to="/provider"
                  className="text-gray-900 dark:text-white hover:text-indigo-400"
                >
                  Provider
                </Link>
              )}
            </nav>
            <div className="mt-4 space-y-2">
              {user ? (
                <>
                  <span className="block text-gray-500 dark:text-gray-300">{user.email}</span>
                  <button
                    onClick={handleClick}
                    className="w-full px-4 py-2 text-sm rounded-md bg-rose-600 dark:bg-rose-500 hover:bg-rose-700 text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block w-full px-4 py-2 text-sm rounded-md bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 text-white text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full px-4 py-2 text-sm rounded-md bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 text-white text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
