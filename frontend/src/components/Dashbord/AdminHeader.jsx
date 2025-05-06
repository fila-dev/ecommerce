import React from "react";
import { FiMessageSquare, FiBell, FiHome } from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";
import { Link } from "react-router-dom";

const AdminHeader = () => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#0e0e0e] shadow-sm">
      {/* Logo/Brand */}
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-2xl font-bold text-white hover:text-indigo-400 transition duration-200">
          E-Shop
        </Link>
        <Link 
          to="/"
          className="px-4 py-2 text-sm rounded-md text-white hover:text-indigo-400 flex items-center transition duration-200"
        >
          <FiHome className="mr-2" size={18} />
          Home
        </Link>
      </div>

      {/* Admin Dashboard Text */}
      <div className="flex-1 max-w-xl mx-12 text-center">
        <h2 className="text-xl font-semibold text-white">Admin Dashboard</h2>
      </div>

      {/* Right Icons */}
      <div className="flex items-center space-x-4">
        <Link to="/admin/sms" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
          <FiMessageSquare size={20} />
        </Link>
        <Link to="/notifications" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
          <FiBell size={20} />
        </Link>
        <Link to="/profile" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
          <AiOutlineUser size={20} /> 
        </Link>
      </div>
    </div>
  );
};

export default AdminHeader;
