import { X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { BASE_URL } from "../Base Url/ApiUrl";

const Login = ({ isOpen, onClose, onLoginSuccess }) => {
  const Navigate = useNavigate();
  const [uid, setUid] = useState(localStorage.getItem("user_id"));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    lat: "",
    lon: "",
    register_id: "",
    type: "USER",
    ios_register_id: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //---------------------------------------- Get Current Location --------------------------------------------------------

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toString();
          const lon = position.coords.longitude.toString();

          // localStorage me save
          localStorage.setItem("lat", lat);
          localStorage.setItem("lon", lon);

          // state me set
          setLoginData((prev) => ({
            ...prev,
            lat,
            lon,
          }));

          resolve({ lat, lon });
        },
        (error) => {
          reject(error.message);
        },
      );
    });
  };

  //   ---------------------------------------- Login --------------------------------------------------------

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      alert("Email and password required");
      return;
    }

    try {
      setLoading(true);

      const location = await getCurrentLocation();

      const res = await axios.post(`${BASE_URL}/login`, null, {
        params: {
          email: loginData.email,
          password: loginData.password,
          lat: location.lat,
          lon: location.lon,
          register_id: loginData.register_id,
          type: loginData.type,
          ios_register_id: loginData.ios_register_id,
        },
      });

      // console.log(res);

      if (res.data.status === "1") {
        localStorage.setItem("user_id", res.data.result.id);
        setUid(res.data.result.id);

        toast.success("Login successful", {
          duration: 2000,
        });

        onClose();
        onLoginSuccess(res.data.result);

        setTimeout(() => {
          const pageRoute = localStorage.getItem("pageRoute");

          if (pageRoute) {
            Navigate(`/${pageRoute}`);
            localStorage.removeItem("pageRoute"); // optional but best practice
          } else {
            Navigate("/");
          }
        }, 2000);
      } else {
        toast.error(res.data.message || "Invalid credentials", {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error(error);
      alert("Login failed or location permission denied");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white w-full max-w-md rounded-2xl p-6 z-10">
          <button onClick={onClose} className="absolute top-4 right-4">
            <X />
          </button>

          <h2 className="text-xl font-semibold mb-6">Log in to Air Hopi</h2>

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            value={loginData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
          />

          {/* PASSWORD */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={loginData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="
            w-full bg-green-700 hover:bg-green-800
            text-white py-2 rounded-lg
            font-medium transition
            disabled:opacity-50
          "
          >
            {loading ? "Logging in..." : "Continue"}
          </button>

          {/* SOCIAL LOGIN */}
          <div className="flex mt-4 justify-center gap-4">
            <button className="w-10 h-10 border rounded-full flex items-center justify-center">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5"
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
