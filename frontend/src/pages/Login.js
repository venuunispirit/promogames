import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // 🔥 important for Enter key

    // ✅ Validation
    if (!email || !password) {
      return setError("Please enter email and password");
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post("http://localhost:5050/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");

    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-950 to-purple-950 px-4">

      {/* 🔥 CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-full max-w-4xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
      >

        {/* 🔥 LEFT IMAGE SIDE */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-purple-600 to-blue-500 items-center justify-center p-6">
          <img
            src="https://images.unsplash.com/photo-1588776814546-ec7e7c0c6d63"
            alt="Healthcare"
            className="rounded-xl shadow-lg object-cover h-full"
          />
        </div>

        {/* 🔥 RIGHT FORM SIDE */}
        <div className="w-full md:w-1/2 p-10 text-white">

          <h2 className="text-3xl font-bold mb-2">Empwell</h2>
          <p className="text-gray-300 mb-6 text-sm">
            Healthcare Dashboard Login
          </p>

          {/* 🔥 FORM */}
          <form onSubmit={handleLogin}>

            <input
              className="w-full p-3 mb-4 rounded-lg bg-white/20 border border-white/30 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full p-3 mb-4 rounded-lg bg-white/20 border border-white/30 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* 🔥 ERROR */}
            {error && (
              <p className="text-red-400 text-sm mb-3">{error}</p>
            )}

            {/* 🔥 BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-all duration-300 font-semibold flex items-center justify-center"
            >
              {loading ? (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
              ) : (
                "Login"
              )}
            </button>

          </form>
        </div>

      </motion.div>
    </div>
  );
}

export default Login;