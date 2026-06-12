import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not logged in");
          setLoading(false);
          return;
        }

        const res = await fetch("https://manelgram112.pythonanywhere.com/user/profile/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log("📌 API devuelve:", data);
          setUser(data);
        } else {
          setError("Failed to fetch user data");
        }
      } catch {
        setError("Server error");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-gray-300 border-t-blue-600"></div>
          <p className="mt-2 text-gray-500 text-sm">Loading user info...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center max-w-md">
          <span className="text-3xl mb-2 block">⚠️</span>
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-3 px-5 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-sm hover:scale-105 active:scale-95"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[70vh] px-4">
      <div className="w-full max-w-md bg-white rounded-xl overflow-hidden">
        {/* Header con gradiente */}
        <div className="px-5 py-3 mb-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">👤</span>
            <h2 className="text-xl font-bold tracking-wide">
              My Profile
            </h2>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-3">
          {/* Username - con hover */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-xl">📛</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Username</p>
                <p className="text-base font-semibold text-gray-800">{user.username}</p>
              </div>
            </div>
          </div>

          {/* Email - con hover */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-gray-100 cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-xl">📧</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                <p className="text-base font-semibold text-gray-800">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Premium Status - SIN enlace, solo visual */}
          <div className={`rounded-lg p-3 border transition-all duration-300 hover:scale-105 hover:shadow-md ${user.is_premium ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 hover:from-yellow-100 hover:to-amber-100' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{user.is_premium ? "⭐" : "🔓"}</span>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Premium Status</p>
                <p className={`text-base font-semibold ${user.is_premium ? 'text-amber-700' : 'text-gray-600'}`}>
                  {user.is_premium ? "Active" : "Inactive"}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.is_premium ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-600'}`}>
                {user.is_premium ? "Yes" : "No"}
              </span>
            </div>
          </div>

          {/* Premium Until (si es premium) - SIN enlace */}
          {user.is_premium && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100 transition-all duration-300 hover:scale-105 hover:shadow-md hover:from-blue-100 hover:to-indigo-100">
              <div className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Premium Until</p>
                  <p className="text-base font-semibold text-blue-700">
                    {new Date(user.premium_until).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botón de volver - con hover más pronunciado */}
          <div className="mt-4 pt-1">
            <button
              onClick={() => navigate(-1)}
              className="w-full px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm hover:scale-102 active:scale-98"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}