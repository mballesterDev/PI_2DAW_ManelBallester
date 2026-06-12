import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Función para verificar el token
  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  // Verificar autenticación cuando el componente se monta y cuando la ruta cambia
  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]); // 👈 Se ejecuta cada vez que cambia la ruta

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowMenu(false);
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 shadow-lg">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center space-x-2 w-1/3">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent group-hover:from-gray-200 group-hover:to-blue-300 transition-all duration-300 hover:scale-105">
              Test yourself
            </span>
          </Link>
        </div>

        {/* MENÚ ESCRITORIO */}
        <nav className="hidden sm:flex justify-center space-x-10 w-1/3">
          {[
            { label: "Home", to: "/" },
            ...(isLoggedIn ? [{ label: "Groups", to: "/create-group" }] : []),
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className={`transition-all duration-300 text-lg font-medium pb-1 border-b-2 hover:scale-105 ${
                isActive(to) 
                  ? "text-white border-white hover:text-white hover:border-white" 
                  : "text-white/50 border-transparent hover:text-white/70 hover:border-white/30"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* LOGIN / REGISTER / PERFIL - Escritorio */}
        <div className="hidden sm:flex items-center space-x-4 justify-end w-1/3 text-sm relative">
          {isLoggedIn ? (
            <>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  title="Profile"
                  className="ml-2 rounded-full p-1.5 hover:bg-gray-700 transition-all duration-300 hover:scale-110 active:scale-95"
                  aria-label="User Profile"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-9 w-9 text-white hover:text-gray-300 transition-colors duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM4 20c0-4 4-6 8-6s8 2 8 6"
                    />
                  </svg>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl animate-fadeIn z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        navigate("/profile");
                      }}
                      className="block w-full text-left px-5 py-3 text-white hover:bg-gray-700 hover:text-gray-200 transition-all duration-300 hover:scale-105 hover:pl-6"
                    >
                      👤 My Account
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        navigate("/my_scores");
                      }}
                      className="block w-full text-left px-5 py-3 text-white hover:bg-gray-700 hover:text-gray-200 transition-all duration-300 hover:scale-105 hover:pl-6"
                    >
                      📊 My Scores
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-5 py-3 text-red-400 hover:bg-red-900/50 hover:text-red-300 font-semibold transition-all duration-300 hover:scale-105 hover:pl-6"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`transition-all duration-300 text-base font-medium pb-1 border-b-2 hover:scale-105 ${
                  isActive("/login")
                    ? "text-white border-white hover:text-white hover:border-white"
                    : "text-white/50 border-transparent hover:text-white/70 hover:border-white/30"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 font-semibold text-base hover:scale-105 active:scale-95 ${
                  isActive("/register")
                    ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                }`}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* BOTÓN HAMBURGUESA (móvil) */}
        <button
          id="menu-toggle"
          className="sm:hidden text-white hover:text-gray-300 focus:outline-none transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Open mobile menu"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* MENÚ MÓVIL */}
      {mobileMenuOpen && (
        <nav className="sm:hidden bg-gray-800 border-t border-gray-700 shadow-xl">
          <div className="flex flex-col py-4 px-6">
            {[
              { label: "Home", to: "/" },
              ...(isLoggedIn ? [{ label: "Groups", to: "/create-group" }] : []),
            ].map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-3 transition-all duration-300 text-base font-medium border-l-2 hover:scale-105 hover:pl-4 ${
                  isActive(to)
                    ? "text-white border-white hover:text-white hover:border-white"
                    : "text-white/50 border-transparent hover:text-white/70 hover:border-white/30 pl-3"
                } pl-3`}
              >
                {label}
              </Link>
            ))}

            {/* PERFIL EN MÓVIL */}
            {isLoggedIn && (
              <div className="border-t border-gray-700 mt-2 pt-2">
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  title="Profile"
                  className="flex items-center justify-between w-full py-3 text-white hover:text-gray-300 transition-all duration-300 text-base font-medium pl-3 hover:scale-105 hover:pl-4"
                >
                  <span>Profile</span>
                  <span className="text-gray-400 text-lg transition-transform duration-300" style={{ transform: showMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </span>
                </button>

                {showMenu && (
                  <div className="mt-1 ml-4 space-y-1 pb-2">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setMobileMenuOpen(false);
                        navigate("/profile");
                      }}
                      className="block w-full text-left py-2 text-gray-300 hover:text-white transition-all duration-300 text-sm pl-2 hover:scale-105 hover:pl-4"
                    >
                      👤 My Account
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setMobileMenuOpen(false);
                        navigate("/my_scores");
                      }}
                      className="block w-full text-left py-2 text-gray-300 hover:text-white transition-all duration-300 text-sm pl-2 hover:scale-105 hover:pl-4"
                    >
                      📊 My Scores
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left py-2 text-red-400 hover:text-red-300 transition-all duration-300 text-sm pl-2 hover:scale-105 hover:pl-4"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* LOGIN / REGISTER - MÓVIL */}
            {!isLoggedIn && (
              <div className="mt-4 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 transition-all duration-300 text-base font-medium border-l-2 hover:scale-105 hover:pl-4 ${
                    isActive("/login")
                      ? "text-white border-white hover:text-white hover:border-white"
                      : "text-white/50 border-transparent hover:text-white/70 hover:border-white/30"
                  } pl-3`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block mt-3 py-3 rounded-xl hover:shadow-lg font-semibold text-center transition-all duration-300 text-base hover:scale-105 active:scale-95 ${
                    isActive("/register")
                      ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                  }`}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;