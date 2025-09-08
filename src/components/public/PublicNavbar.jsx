import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../assets/logo.jpeg";

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center p-5">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden">
              <img src={Logo} className="w-full h-full object-containe" />
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`transition-colors duration-200 ${
                isActive("/")
                  ? "text-primary-600 font-semibold"
                  : "text-gray-600 hover:text-primary-500"
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`transition-colors duration-200 ${
                isActive("/products")
                  ? "text-primary-600 font-semibold"
                  : "text-gray-600 hover:text-primary-500"
              }`}
            >
              Products
            </Link>
            <Link
              to="/about"
              className={`transition-colors duration-200 ${
                isActive("/about")
                  ? "text-primary-600 font-semibold"
                  : "text-gray-600 hover:text-primary-500"
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`transition-colors duration-200 ${
                isActive("/contact")
                  ? "text-primary-600 font-semibold"
                  : "text-gray-600 hover:text-primary-500"
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-2 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-600 hover:text-primary-500 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block px-3 py-2 text-gray-600 hover:text-primary-500 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-gray-600 hover:text-primary-500 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-gray-600 hover:text-primary-500 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;
