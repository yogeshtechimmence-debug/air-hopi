import {
  Heart,
  Logs,
  User,
  Book,
  Phone,
  LogOut,
  BookAudioIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";

const Navbar = () => {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    setUid(user_id);
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");

    if (user_id) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="w-full border-b bg-white fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2  rounded-lg">
            <img
              src="https://i.ibb.co/pFsnjPb/Air-Hopi-Logo.png"
              alt="Logo"
              className="h-7 sm:h-9 md:h-10 cursor-pointer"
              onClick={() => navigate("/")}
            />

            <span
              onClick={() => navigate("/")}
              className="text-green-700 font-sans font-semibold text-lg sm:text-xl md:text-3xl cursor-pointer"
            >
              Airhopi
            </span>
          </div>

          {/* Right Side */}
          <div className="relative" ref={dropdownRef}>
            {!uid ? (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    localStorage.removeItem("pageRoute");
                    setLoginOpen(true);
                  }}
                  className="px-4 py-2 border rounded-full text-sm"
                >
                  Login
                </button>

                <button
                  onClick={() => setSignupOpen(true)}
                  className="px-4 py-2 border rounded-full text-sm"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 border rounded-full"
              >
                <Logs size={22} />
              </button>
            )}

            {/* Dropdown */}
            {menuOpen && uid && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border z-50">
                <ul className="py-2 text-sm">
                  <li
                    onClick={() => navigate("/profile")}
                    className="px-4 py-2 flex gap-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <User size={16} /> Profile
                  </li>

                  <li
                    onClick={() => navigate("/booking")}
                    className="px-4 py-2 flex gap-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <Book size={16} /> My Booking
                  </li>

                  <li
                    onClick={() => navigate("/myfavorites")}
                    className="px-4 py-2 flex gap-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <Heart size={16} /> My Favourite
                  </li>

                  {/* <li
                    onClick={() => navigate("/support")}
                    className="px-4 py-2 flex gap-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <Phone size={16} /> Contact Support
                  </li> */}

                  <li
                    onClick={() => navigate("/about")}
                    className="px-4 py-2 flex gap-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <BookAudioIcon size={16} /> About
                  </li>

                  <hr />

                  <li
                    onClick={() => {
                      localStorage.removeItem("user_id");
                      setUid(null);
                      setIsLoggedIn(false);
                      setMenuOpen(false);
                      navigate("/");
                    }}
                    className="px-4 py-2 flex gap-2 text-red-600 hover:bg-gray-100 cursor-pointer"
                  >
                    <LogOut size={16} /> Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <Login
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setLoginOpen(false);
        }}
      />

      {/* Signup Modal */}
      <SignUp
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
        openLogin={() => setLoginOpen(true)}
      />
    </>
  );
};

export default Navbar;
