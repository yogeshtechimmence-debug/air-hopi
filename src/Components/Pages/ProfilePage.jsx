import axios from "axios";
import { User, Edit, Lock, ArrowBigLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { BASE_URL } from "../Base Url/ApiUrl";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const Navigate = useNavigate();
  const user_id = localStorage.getItem("user_id");

  const [activeTab, setActiveTab] = useState("view");
  const [profileData, setProfileData] = useState([]);
  const [formData, setFormData] = useState({
    user_id: user_id,
    first_name: "",
    last_name: "",
    mobile: "",
    address: "",
    lat: "",
    lon: "",
    mobile_with_code: "",
    image: null,
  });
  const [passwordChanged, setChangePassword] = useState({
    old_password: "",
    password: "",
  });

  //  -------------------- UPDATE PROFILE ---------------------------------

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toString();
          const lon = position.coords.longitude.toString();

          setFormData((prev) => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { lat, lon } = await getCurrentLocation();

    const data = new FormData();
    data.append("user_id", formData.user_id);
    data.append("first_name", formData.first_name);
    data.append("last_name", formData.last_name);
    data.append("mobile", formData.mobile);
    data.append("mobile_with_code", formData.mobile_with_code);
    data.append("address", formData.address);
    data.append("lat", lat);
    data.append("lon", lon);
    data.append("image", formData.image);

    try {
      const res = await axios.post(`${BASE_URL}/user_update_profile`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // console.log(res.data);
      alert("Profile updated successfully");
      setActiveTab("view");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  //  -------------------- GET PROFILE ---------------------------------

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");

    axios
      .get(`${BASE_URL}/get_profile`, {
        params: {
          user_id: user_id,
        },
      })
      .then((res) => {
        // console.log(res.data.result);
        setProfileData(res.data.result);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  //  -------------------- upadet data  ---------------------------------

  useEffect(() => {
    if (profileData) {
      setFormData({
        user_id: user_id,
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        mobile: profileData.mobile || "",
        address: profileData.address || "",
        lat: profileData.lat || "",
        lon: profileData.lon || "",
        mobile_with_code: profileData.mobile_with_code || "",
        image: null,
      });
    }
  }, [profileData]);
  //  -------------------- CHANGED PASSWORD ---------------------------------

  const handleChangePassword = (e) => {
    const { name, value } = e.target;
    setChangePassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordChanged.old_password || !passwordChanged.password) {
      alert("All fields are required");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/change_password`, {
        user_id: user_id,
        old_password: passwordChanged.old_password,
        password: passwordChanged.password,
      });

      if (res.data.status === "1") {
        alert("Password changed successfully");
        setChangePassword({ old_password: "", password: "" });
      } else {
        alert(res.data.message || "Password change failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* LEFT TABS */}
          <div className="bg-white rounded-xl shadow p-4 space-y-2">
            <button
              onClick={() => setActiveTab("view")}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg ${
                activeTab === "view"
                  ? "bg-green-100 text-green-700"
                  : "hover:bg-gray-100"
              }`}
            >
              <User size={18} /> View Profile
            </button>

            <button
              onClick={() => setActiveTab("edit")}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg ${
                activeTab === "edit"
                  ? "bg-green-100 text-green-700"
                  : "hover:bg-gray-100"
              }`}
            >
              <Edit size={18} /> Update Profile
            </button>

            <button
              onClick={() => setActiveTab("password")}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg ${
                activeTab === "password"
                  ? "bg-green-100 text-green-700"
                  : "hover:bg-gray-100"
              }`}
            >
              <Lock size={18} /> Forget Password
            </button>
          </div>

          {/* RIGHT CONTENT */}
          <div className="md:col-span-3 bg-white rounded-xl shadow p-6">
            {/* VIEW PROFILE */}
            {activeTab === "view" && (
              <>
                <div className="bg-white rounded-2xl shadow p-6">
                  {/* Profile Image */}
                  <div className="flex justify-center mb-6">
                    <img
                      src={profileData.image}
                      alt=""
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                    />
                  </div>

                  {/* Profile Details */}
                  <div className="space-y-3">
                    <div className="flex items-center border-b pb-2">
                      <span className="w-28 text-gray-500">First Name</span>
                      <span className="mr-2">:</span>
                      <span className="font-medium">
                        {profileData.first_name}
                      </span>
                    </div>

                    <div className="flex items-center border-b pb-2">
                      <span className="w-28 text-gray-500">Last Name</span>
                      <span className="mr-2">:</span>
                      <span className="font-medium">
                        {profileData.last_name}
                      </span>
                    </div>

                    <div className="flex items-center border-b pb-2">
                      <span className="w-28 text-gray-500">Email</span>
                      <span className="mr-2">:</span>
                      <span className="font-medium">{profileData.email}</span>
                    </div>

                    <div className="flex items-center border-b pb-2">
                      <span className="w-28 text-gray-500">Mobile</span>
                      <span className="mr-2">:</span>
                      <span className="font-medium">{profileData.mobile}</span>
                    </div>

                    <div className="flex items-center">
                      <span className="w-28 text-gray-500">Address</span>
                      <span className="mr-2">:</span>
                      <span className="font-medium">{profileData.address}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* UPDATE PROFILE */}
            {activeTab === "edit" && (
              <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <label className="block text-sm mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Mobile</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Image</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-4 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg"
                >
                  Update Profile
                </button>
              </form>
            )}

            {/* FORGET PASSWORD */}
            {activeTab === "password" && (
              <form onSubmit={ChangePassword} className="space-y-4 max-w-md">
                {/* Current Password */}
                <div>
                  <label className="block text-sm mb-1">Current Password</label>
                  <input
                    type="password"
                    name="old_password"
                    value={formData.old_password}
                    onChange={handleChangePassword}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm mb-1">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChangePassword}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                >
                  Change Password
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
