import React, { useEffect, useState } from "react";
import { ArrowBigLeftIcon, Heart, MapPin, Star } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../Base Url/ApiUrl";
import { SyncLoader } from "react-spinners";
const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setfavorite] = useState([]);
  const user_id = localStorage.getItem("user_id");
  // console.log(favorites);

  // ---------------------------------------------- Get favorites place ------------------------------

  useEffect(() => {
    axios
      .get(`${BASE_URL}/get_nearest_place`, {
        params: {
          user_id: user_id,
          lat: 22.7196,
          lon: 75.8577,
        },
      })
      .then((res) => {
        const favfavorites = res.data.result.filter(
          (item) => item.fav_place === "YES",
        );

        setfavorite(favfavorites);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // ---------------------------------------------- Remove Favorites place ------------------------------

  const removeFavorite = async (place_id) => {
    const user_id = localStorage.getItem("user_id");

    setfavorite((prev) => prev.filter((item) => item.id !== place_id));

    try {
      const formData = new URLSearchParams();
      formData.append("user_id", user_id);
      formData.append("place_id", place_id);

      await axios.post(`${BASE_URL}/add_remove_fav_place`, formData);
    } catch (error) {
      console.error(error);
    }
  };

  const ShowHotel = (place_id) => {
    navigate(`/showhotel/${place_id}`);
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold">Your Favorites</h1>
          <p className="text-gray-500 mt-2">
            Save time, stay where your heart feels at home.
          </p>
        </div>

        {!favorites || favorites.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md animate-pulse"
              >
                {/* Image Skeleton */}
                <div className="h-44 bg-gray-300 rounded-t-2xl"></div>

                {/* Content Skeleton */}
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>

                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>

                  <div className="flex justify-between items-center mt-3">
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((item) => (
              <div
                key={item.id}
                className="bg-white cursor-pointer rounded-2xl shadow-md hover:shadow-lg transition"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    onClick={() => ShowHotel(item.id)}
                    src={item?.places_image[0]?.image}
                    alt=""
                    className="w-full h-44 object-cover rounded-t-2xl"
                  />

                  {/* Heart */}
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="absolute top-3 right-3 p-2 rounded-full 
             bg-gradient-to-br from-black/0 to-black/30"
                  >
                    <Heart className="text-red-500 fill-red-500 stroke-white stroke-[1.5]" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm">{item.place_name}</h3>

                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={12} />
                    {item.address}
                  </p>

                  <div className="flex justify-between items-center mt-3">
                    <p className="text-green-700 font-semibold text-sm">
                      ₹{item.rent_per_night}
                      <span className="text-gray-500 font-normal">
                        {" "}
                        / {item.rental_type} / {item.room_type}
                      </span>
                    </p>

                    <div className="flex items-center gap-1 text-sm">
                      <Star
                        size={14}
                        className="text-yellow-400 fill-yellow-400"
                      />
                      {item.rating}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Cards */}
      </div>
    </div>
  );
};

export default Favorites;
