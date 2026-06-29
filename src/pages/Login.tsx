import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { mangaService } from "../api/mangaService";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const data = await mangaService.login({ email, password });
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_name", data.user.name);

      navigate("/");
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl mt-12">
      <h2 className="text-2xl font-bold text-indigo-400 mb-6 text-center">
        Artist & Staff Login
      </h2>

      {error && (
        <div className="bg-red-950 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-indigo-500 focus:outline-none"
            placeholder="oda@mangaverse.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-indigo-500 focus:outline-none"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white font-bold py-3 px-4 rounded transition duration-200 mt-2"
        >
          {loading ? "Authenticating..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
