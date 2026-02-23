import React, { useEffect, useMemo, useState } from "react";
import { GoogleMap, OverlayView, useLoadScript } from "@react-google-maps/api";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowBigLeftIcon, Heart, Star } from "lucide-react";
import { BASE_URL } from "../Base Url/ApiUrl";

const Location = () => {
  const location = useLocation();
  const { lat, lon, check_in, check_out, guest } = location.state || {};
  const Navigate = useNavigate();
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const [hotels, setHotel] = useState([]);
  const [uid, setUid] = useState("");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyAN3Lz2pT2ItRTkQ1MHCwHynGjmpDHhnt8",
  });

  const mapCenter = useMemo(() => ({ lat: lat, lng: lon }), []);

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    setUid(user_id);
  });

  //   ---------------------------------------- Get Nearest Place --------------------------------------------------------

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");

    axios
      .get(`${BASE_URL}/get_nearest_place`, {
        params: {
          user_id,
          lat,
          lon,
        },
      })
      .then((res) => {
        // console.log("Nearest places:", res.data.result);
        setHotel(res.data.result);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  //   ---------------------------------------- Add Favorites --------------------------------------------------------

  const AddFavorite = async (place_id) => {
    const user_id = localStorage.getItem("user_id");

    setHotel((prev) =>
      prev.map((hotel) =>
        hotel.id === place_id
          ? {
              ...hotel,
              fav_place: hotel.fav_place === "YES" ? "NO" : "YES",
            }
          : hotel,
      ),
    );

    try {
      const formData = new URLSearchParams();
      formData.append("user_id", user_id);
      formData.append("place_id", place_id);

      const res = await axios.post(
        `${BASE_URL}/add_remove_fav_place`,
        formData,
      );

      // console.log("Fav API:", res.data);
    } catch (error) {
      console.error(error);

      setHotel((prev) =>
        prev.map((hotel) =>
          hotel.id === place_id
            ? {
                ...hotel,
                fav_place: hotel.fav_place === "YES" ? "NO" : "YES",
              }
            : hotel,
        ),
      );
    }
  };

  const handlePriceClick = (e, hotel) => {
    e.stopPropagation();
    e.preventDefault();

    setSelectedHotel((prev) => (prev?.id === hotel.id ? null : hotel));
  };

  return (
    <div>
      <div className=" ml-5 cursor-pointer pt-2 flex pb-3">
        <div
          onClick={() => Navigate("/")}
          className="flex items-center gap-1 cursor-pointer"
        >
          <ArrowBigLeftIcon />
          <span>Back</span>
        </div>
      </div>
      <div className="h-screen flex flex-col lg:flex-row">
        <div
          className="
               w-full lg:w-[60%]
               overflow-y-auto
               p-4 sm:p-6
               space-y-6
               order-2 lg:order-1
             "
        >
          <h2 className="text-lg sm:text-xl font-semibold">
            Over {hotels.length}+ homes within map area
          </h2>

          <div
            className="
               grid gap-6
               grid-cols-2
               sm:grid-cols-2
               lg:grid-cols-3 
             "
          >
            {hotels.map((hotel) => (
              <div key={hotel.id} className="cursor-pointer group">
                {/* IMAGE */}
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    onClick={() => Navigate(`/showhotel/${hotel.id}`)}
                    src={hotel.places_image?.[0]?.image}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition"
                    alt={hotel.place_name}
                  />
                  {uid && (
                    <button
                      onClick={() => AddFavorite(hotel.id)}
                      className="absolute top-3 right-3 p-2 rounded-full 
                                        bg-gradient-to-br from-black/0 to-black/30"
                    >
                      <Heart
                        className={
                          hotel.fav_place === "YES"
                            ? "text-red-500 fill-red-500  stroke-white stroke-[1.5]"
                            : "text-white"
                        }
                      />
                    </button>
                  )}
                </div>

                <div className="mt-2 space-y-1">
                  {/* Title + Rating */}
                  <div className="">
                    <h3 className="font-medium truncate text-sm sm:text-base">
                      {hotel.place_name}
                    </h3>
                  </div>
                  {/* Price */}
                  <p className="font-semibold flex text-sm sm:text-base">
                    ₹{hotel.rent_per_night?.toLocaleString()}
                    <span className="font-normal text-gray-500 text-xs sm:text-sm ml-1">
                      for
                      {hotel.rental_type === "per_night"
                        ? "1 night ."
                        : "1 month"}
                    </span>
                    <span className="text-xs flex ml-2 gap-1 sm:text-sm">
                      <Star className="w-4 h-4" /> {hotel.rating}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="
              w-full lg:w-[40%]
             h-[700px] sm:h-[420px] lg:h-full
              p-2 sm:p-3 lg:p-4
              sticky top-0 z-40
              order-1 lg:order-2
              bg-white
            "
        >
          {!isLoaded ? (
            <div className="flex items-center justify-center h-full">
              Loading Map...
            </div>
          ) : (
            <GoogleMap
              zoom={11}
              center={mapCenter}
              mapContainerClassName="w-full h-full rounded-2xl"
              onTilesLoaded={() => setTilesLoaded(true)}
              onClick={() => setSelectedHotel(null)}
            >
              {tilesLoaded &&
                hotels.map((hotel) => (
                  <OverlayView
                    key={hotel.id}
                    position={{ lat: hotel.lat, lng: hotel.lon }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div className="relative">
                      {/* PRICE */}
                      <div
                        onClick={(e) => handlePriceClick(e, hotel)}
                        className=" pr-14 pl-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg cursor-pointer bg-white text-black -translate-x-1/2 -translate-y-1/2 "
                      >
                        ₹{hotel.rent_per_night}
                      </div>
                      {/* MINI MODAL */}
                      {selectedHotel?.id === hotel.id && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            Navigate(`/showhotel/${hotel.id}`);
                          }}
                          className=" absolute cursor-pointer
                              left-1/2 bottom-full mb-2
                              w-36 sm:w-56
                              -translate-x-1/2
                              bg-white rounded-xl shadow-xl z-50
                            "
                        >
                          <img
                            src={hotel.places_image[0].image}
                            className="w-full h-24 object-cover rounded-sm"
                          />

                          <div className="mt-2 p-1">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-semibold line-clamp-1">
                                {hotel.place_name}
                              </h4>
                              <span className="text-xs">⭐ {hotel.rating}</span>
                            </div>

                            <p className="text-sm font-semibold mt-1">
                              ₹{hotel.rent_per_night}
                              <span className="text-xs text-gray-500">
                                {" "}
                                {hotel.rental_type}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </OverlayView>
                ))}
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  );
};

export default Location;
