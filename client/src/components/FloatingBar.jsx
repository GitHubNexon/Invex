import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaCog,
  FaUserShield,
  FaCogs,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaBook,
  FaChartBar,
} from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../utils/toastNotifications";
import { useLoading } from "../contexts/LoadingContext";

const FloatingBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showLoading, hideLoading, setRefresh } = useLoading();
  const [tooltip, setTooltip] = useState(null);

  const handleLogout = async () => {
    try {
      showLoading(2000);
      await logout();
      setRefresh(true);
      hideLoading(2000);
      showToast("Logout successful!", "success");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const hasAccess = (requiredRole) => {
    return user?.access?.includes(requiredRole);
  };

  const menuItems = [
    {
      path: "/monitoring",
      icon: <FaMagnifyingGlass />,
      label: "Monitoring",
      role: "mr",
    },
    { path: "/admin", icon: <FaUserShield />, label: "Admin", role: "ad" },
    { path: "/reports", icon: <FaChartBar />, label: "Reports", role: "rp" },
    { path: "/activities", icon: <FaBook />, label: "Activities", role: "ac" },
  ];

  const handleTouchStart = (label) => {
    setTooltip(label);
  };

  const handleTouchEnd = () => {
    setTooltip(null);
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto w-fit bg-blue-500 text-white p-3 rounded-full shadow-lg flex space-x-6 md:hidden z-50">
      {menuItems.map(
        ({ path, icon, label, role }) =>
          (!role || hasAccess(role)) && (
            <div key={path} className="relative">
              <Link
                to={path}
                className={`flex items-center p-2 rounded-full hover:bg-blue-600 ${
                  location.pathname === path ? "bg-blue-300 text-gray-800" : ""
                }`}
                onTouchStart={() => handleTouchStart(label)}
                onTouchEnd={handleTouchEnd}
                onMouseEnter={() => setTooltip(label)}
                onMouseLeave={() => setTooltip(null)}
              >
                {icon}
              </Link>
              {tooltip === label && (
                <span className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  {label}
                </span>
              )}
            </div>
          )
      )}
      <button
        className={`flex items-center p-2 rounded-full hover:bg-blue-600 bg-blue-500 text-white`}
        onClick={handleLogout}
        onTouchStart={() => handleTouchStart("Logout")}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setTooltip("Logout")}
        onMouseLeave={() => setTooltip(null)}
      >
        <FaSignOutAlt />
        {tooltip === "Logout" && (
          <span className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Logout
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingBar;
