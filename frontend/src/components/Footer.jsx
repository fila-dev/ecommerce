import React from "react";
import { FaFacebookF, FaGoogle, FaGithub, FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import { FaCreditCard, FaPaypal } from "react-icons/fa";
import { SiTelegram } from "react-icons/si";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-lg mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About Us</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Your trusted online marketplace for quality products and exceptional service.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h3>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300 flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                123 Business Street
              </p>
              <p className="text-gray-600 dark:text-gray-300">Mekele, Tigray 12345</p>
              <p className="text-gray-600 dark:text-gray-300 flex items-center">
                <FaEnvelope className="mr-2" />
                support@eshop.com
              </p>
              <p className="text-gray-600 dark:text-gray-300 flex items-center">
                <FaPhone className="mr-2" />
                +251 900000000
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connect With Us</h3>
            <ul className="space-y-2">
              <li>
                <a href="/auth/facebook" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                  <FaFacebookF className="mr-2" />
                  Facebook Login
                </a>
              </li>
              <li>
                <a href="/auth/google" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                  <FaGoogle className="mr-2" />
                  Google Login
                </a>
              </li>
              <li>
                <a href="/auth/github" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                  <FaGithub className="mr-2" />
                  GitHub Login
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 dark:text-gray-300 flex items-center">
                <FaCreditCard className="mr-2" />
                Credit/Debit Cards
              </li>
              <li className="text-gray-600 dark:text-gray-300 flex items-center">
                <FaPaypal className="mr-2" />
                PayPal
              </li>
              <li className="text-gray-600 dark:text-gray-300 flex items-center">
                <SiTelegram className="mr-2" />
                Telebirr
              </li>
              <li className="text-gray-600 dark:text-gray-300">CBE Birr</li>
              <li className="text-gray-600 dark:text-gray-300">Amole</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} E-Shop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
