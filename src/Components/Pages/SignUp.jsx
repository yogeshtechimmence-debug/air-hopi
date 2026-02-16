import axios from "axios";
import { X } from "lucide-react";
import { useState } from "react";
import { BASE_URL } from "../Base Url/ApiUrl";

const SignUp = ({ isOpen, onClose, openLogin }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    mobile: "",
    email: "",
    address: "",
    lat: "22.45645",
    lon: "27.25342",
    password: "",
    type: "USER",
    ios_register_id: "",
    register_id: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();

      data.append("first_name", formData.firstName);
      data.append("last_name", formData.lastName);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("mobile", formData.mobile);
      data.append("mobile_with_code", `+91${formData.mobile}`);
      data.append("dob", formData.dob);
      data.append("address", formData.address);
      data.append("lat", formData.lat);
      data.append("lon", formData.lon);
      data.append("type", formData.type);
      data.append("ios_register_id", formData.ios_register_id);
      data.append("register_id", formData.register_id);

      if (profilePhoto) {
        data.append("image", profilePhoto);
      }

      const res = await axios.post(
        `${BASE_URL}/signup`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      // console.log(res.data.status);
      if (res.data.status === "1") {
        onClose();
        openLogin();
      }
    } catch (error) {
      console.error(error);
      alert("Signup failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative bg-white w-full max-w-xl rounded-3xl p-3 z-50">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X />
        </button>

        <h2 className="text-2xl font-semibold text-center">Sign Up</h2>

        <div className="">
          {/* NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="flex gap-3">
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="border rounded-lg p-2 w-full"
              />

              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="border rounded-lg p-2 w-full"
              />
            </div>
          </div>

          {/* DOB & mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Details
            </label>
            <div className="flex gap-3">
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="border rounded-lg p-2 w-full"
              />

              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="mobile Number"
                className="border rounded-lg p-2 w-full"
              />
            </div>
          </div>

          {/* PROFILE PHOTO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Photo
            </label>
            <input
              type="file"
              onChange={(e) => setProfilePhoto(e.target.files[0])}
              className="border rounded-lg p-2 w-full text-sm"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className="border rounded-lg p-2 w-full"
            />
          </div>

          {/* LOCATION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="City, Country"
              className="border rounded-lg p-2 w-full"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="border rounded-lg p-2 w-full"
            />
          </div>

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            className="w-full mt-2 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg"
          >
            Create Account
          </button>

          {/* FOOTER */}
          <p className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => {
                onClose();
                openLogin();
              }}
              className="text-green-700 font-medium cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
          <div>
            <div className="flex mt-2 justify-center gap-4">
              <button className="w-10 h-10 border rounded-full flex items-center justify-center">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
