import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  LogOut,
  Search,
  Menu,
  User
} from "lucide-react";
import { motion } from "framer-motion";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const searchRef = useRef(null);
  const addRef = useRef(null);
  const profileRef = useRef(null);

  const [collapsed, setCollapsed] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // 🔥 Auto focus search
  useEffect(() => {
    searchRef.current?.focus();
  }, [location]);

  // 🔥 Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addRef.current && !addRef.current.contains(e.target)) {
        setAddOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/app");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-indigo-950 to-purple-950 text-white">

      {/* 🔥 SIDEBAR */}
      <motion.div
        animate={{ width: collapsed ? 80 : 240 }}
        className="backdrop-blur-xl bg-white/10 border-r border-white/10 p-4 flex flex-col justify-between transition-all duration-300"
      >
        <div>
          {/* Logo + Toggle */}
          <div className="flex items-center justify-between mb-8">
            {!collapsed && <h2 className="text-xl font-bold">Empwell</h2>}
            <Menu onClick={() => setCollapsed(!collapsed)} className="cursor-pointer" />
          </div>

          {/* Navigation */}
          <nav className="space-y-3">
            <SidebarItem icon={<LayoutDashboard />} label="Dashboard" path="/dashboard" current={location.pathname} collapsed={collapsed} />
            <SidebarItem icon={<Users />} label="Clients" path="/clients" current={location.pathname} collapsed={collapsed} />
            <SidebarItem icon={<FileText />} label="Documents" path="/documents" current={location.pathname} collapsed={collapsed} />
            <SidebarItem icon={<Receipt />} label="Invoices" path="/invoices" current={location.pathname} collapsed={collapsed} />
          </nav>
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 bg-red-500/80 hover:bg-red-600 p-2 rounded-lg"
        >
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </motion.button>
      </motion.div>

      {/* 🔥 MAIN */}
      <div className="flex-1 flex flex-col">

        {/* 🔥 TOP BAR */}
        <div className="flex justify-center pt-6 px-6">
          <div className="flex items-center gap-4 w-full max-w-2xl">

            {/* Search */}
            <div className="relative flex-1 backdrop-blur-xl bg-white/10 border border-white/10 rounded-full h-12 flex items-center">
              <Search className="absolute left-4 text-gray-300" size={18} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search anything..."
                className="w-full pl-10 pr-4 bg-transparent outline-none text-sm placeholder-gray-300"
              />
            </div>

            {/* ➕ ADD BUTTON */}
            <div className="relative" ref={addRef}>
              <button
                onClick={() => setAddOpen(!addOpen)}
                className="h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-105 transition"
              >
                +
              </button>

              {addOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-14 right-0 z-50 w-48 backdrop-blur-xl bg-white/10 border border-white/10 rounded-lg p-2 shadow-lg"
                >
                  <p className="p-2 hover:bg-white/10 rounded cursor-pointer">+ Add Client</p>
                  <p className="p-2 hover:bg-white/10 rounded cursor-pointer">+ Add Document</p>
                  <p className="p-2 hover:bg-white/10 rounded cursor-pointer">+ Add Invoice</p>
                </motion.div>
              )}
            </div>

            {/* 👤 PROFILE */}
            <div className="relative" ref={profileRef}>
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                className="h-12 w-12 flex items-center justify-center bg-white/10 backdrop-blur-xl rounded-full hover:bg-white/20 transition cursor-pointer"
              >
                <User size={18} />
              </div>

              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-14 right-0 z-50 w-40 backdrop-blur-xl bg-white/10 border border-white/10 rounded-lg p-2 shadow-lg"
                >
                  <p className="p-2 hover:bg-white/10 rounded cursor-pointer">Profile</p>
                  <p className="p-2 hover:bg-white/10 rounded cursor-pointer">Settings</p>
                  <p
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-500/30 rounded cursor-pointer"
                  >
                    Logout
                  </p>
                </motion.div>
              )}
            </div>

          </div>
        </div>

        {/* 🔥 PAGE CONTENT */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 p-6 overflow-auto"
        >
          {children}
        </motion.div>

      </div>
    </div>
  );
}

function SidebarItem({ icon, label, path, current, collapsed }) {
  const navigate = useNavigate();
  const isActive = current === path;

  return (
    <div
      onClick={() => navigate(path)}
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition
        ${isActive ? "bg-white/20 text-purple-300" : "hover:bg-white/10"}
      `}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </div>
  );
}

export default Layout;