import axios from "axios";
import {
  Search,
  Minus,
  Plus,
  Heart,
  Navigation,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../Base Url/ApiUrl";
import useGoogleMaps from "./useGoogleMaps";
import { SyncLoader } from "react-spinners";

const HomePage = () => {
  const navigate = useNavigate();
  const [uid, setUid] = useState("");

  const [whereOpen, setWhereOpen] = useState(false);
  const [whereValue, setWhereValue] = useState("");

  const [hotels, setHotel] = useState([]);

  const [Currentlat, setCurrentlat] = useState("");
  const [Currentlon, setCurrentlon] = useState("");

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    setUid(user_id);
  });

  //   -------------------------------------- Get Nearest Places----------------------------------------------------------

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    const fetchNearestPlace = (lat, lon) => {
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
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          // console.log(lat);
          // console.log(lon);

          localStorage.setItem("lat", lat);
          localStorage.setItem("lon", lon);

          setCurrentlat(lat);
          setCurrentlon(lon);

          fetchNearestPlace(lat, lon);
        },
        (error) => {
          console.log("Location error:", error.message);
          fetchNearestPlace(22.7196, 75.8577);
        },
      );
    } else {
      console.log("Geolocation not supported");
      fetchNearestPlace(22.7196, 75.8577);
    }

    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setWhereOpen(false);
        Setselectoropen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  //   ----------------------------------------- guest model -------------------------------------------------------

  const [selectoropen, Setselectoropen] = useState(false);

  const [guests, setGuests] = useState({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        Setselectoropen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updateCount = (type, value) => {
    setGuests((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] + value),
    }));
  };

  const summary = () => {
    const totalGuests = guests.adults + guests.children;
    let text = "";

    if (totalGuests > 0) text += `${totalGuests} Guests`;
    if (guests.infants > 0) text += ` · ${guests.infants} Infants`;
    if (guests.pets > 0) text += ` · ${guests.pets} Pets`;

    return text || "Add guests";
  };
  const Row = ({ label, sub, type }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="font-medium">{label}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button
          disabled={guests[type] === 0}
          onClick={() => updateCount(type, -1)}
          className="h-8 w-8 rounded-full border flex items-center justify-center disabled:opacity-40"
        >
          <Minus size={14} />
        </button>

        <span className="w-4 text-center">{guests[type]}</span>

        <button
          onClick={() => updateCount(type, 1)}
          className="h-8 w-8 rounded-full border flex items-center justify-center"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );

  //   ------------------------------------------- Add Favorites ----------------------------------------------------

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

  //   ---------------------------------- location data --------------------------------------------------------------

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [service, setService] = useState(null);
  const [SearchLat, setSearchLat] = useState("");
  const [SearchLon, setSearchLon] = useState("");
  useGoogleMaps();

  console.log(SearchLat);
  console.log(SearchLon);
  useEffect(() => {
    let interval = setInterval(() => {
      if (window.google && !service) {
        setService(new window.google.maps.places.AutocompleteService());
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [service]);

  const handleSearch = (value) => {
    setQuery(value);

    if (!value || !service) {
      setSuggestions([]);
      return;
    }

    service.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: "in" },
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setSuggestions(predictions || []);
        } else {
          setSuggestions([]);
          console.error("Autocomplete error:", status);
        }
      },
    );
  };

  const getLatLng = (placeId, description) => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ placeId }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;

        console.log("Location:", description);
        console.log("Latitude:", location.lat());
        console.log("Longitude:", location.lng());
        setSearchLat(location.lat());
        setSearchLon(location.lng());

        setQuery(description); // Search input update
        setWhereValue(description); // "Where" field update
        setSuggestions([]); // Dropdown hide
        setWhereOpen(false); // Dropdown close
      } else {
        console.error("Geocode failed:", status);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="min-h-screen bg-gray-100  items-start justify-center">
        <div
          className="text-center h-28 pt-4 text-4xl font-bold text-gray-600 
                bg-gradient-to-b from-black/30 to-bg-gray-100"
        >
          air hopi
        </div>

        <div className="w-full flex justify-center">
          <div
            className="
                        relative bg-white shadow-lg border
                        rounded-2xl lg:rounded-full sm:w-10
                        lg:w-full max-w-4xl mx-auto
                        flex flex-col lg:flex-row
                        divide-y lg:divide-y-0 lg:divide-x
                      "
          >
            {/* WHERE */}
            <div
              className="flex-1 mt-2 px-4 py-2 cursor-pointer"
              onClick={() => setWhereOpen(true)}
            >
              <p className="text-xs font-semibold text-gray-800">Where</p>
              <input
                value={whereValue}
                readOnly
                placeholder="Search destinations"
                className="w-full text-sm text-gray-500 focus:outline-none cursor-pointer"
              />
            </div>

            <div className="h-8 w-px bg-gray-300" />

            {/* WHEN */}
            <div className="flex  mt-2 px-4 py-2">
              {/* Check-in */}
              <div>
                <p className="text-xs font-semibold text-gray-800">Check-in</p>
                <DatePicker
                  selected={checkIn}
                  onChange={(date) => setCheckIn(date)}
                  selectsStart
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={new Date()}
                  inputMode="none"
                  placeholderText="Select date"
                  className="w-full  text-sm font-medium outline-none cursor-pointer"
                />
              </div>

              {/* Check-out */}
              <div>
                <p className="text-xs font-semibold text-gray-800">Check-out</p>
                <DatePicker
                  selected={checkOut}
                  onChange={(date) => setCheckOut(date)}
                  selectsEnd
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={checkIn}
                  inputMode="none"
                  placeholderText="Select date"
                  className="w-full  text-sm font-medium outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="h-8 w-px bg-gray-300" />

            {/* WHO */}
            <div className="flex-1  mt-2 px-4 py-2">
              <p className="text-xs font-semibold text-gray-800">Who</p>
              <input
                readOnly
                onClick={() => Setselectoropen(true)}
                value={summary()}
                placeholder="Add guests"
                className="w-full text-sm text-gray-500 focus:outline-none cursor-pointer"
              />
            </div>

            {/* SEARCH BUTTON */}
            <button
              onClick={() => {
                navigate("/location", {
                  state: {
                    lat: Currentlat,
                    lon: Currentlon,
                    check_in: checkIn,
                    check_out: checkOut,
                    guest: guests,
                  },
                });
              }}
              className="
                     bg-green-500 hover:bg-green-600 text-white
                     p-2 rounded-full
                     mx-4 my-3 lg:mx-2 lg:my-0
                     self-end lg:self-auto
                   "
            >
              <Search size={25} />
            </button>

            {/* location */}
            {whereOpen && (
              <div
                ref={dropdownRef}
                className="
                     absolute z-50 bg-white shadow-xl border
                     rounded-2xl p-4
                     w-[90vw] sm:w-[280px]
                     left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0
                     top-full mt-2
                   "
              >
                {/* Search input */}{" "}
                <input
                  type="text"
                  placeholder="Search location in India..."
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={() => {
                    navigate("/location", {
                      state: {
                        lat: Currentlat,
                        lon: Currentlon,
                      },
                    });
                  }}
                  className="w-full mt-3 border rounded-lg px-3 py-2 mb-3 text-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <Navigation size={16} /> Get Current Location
                </button>
                {/* Locations list */}{" "}
                <div className="max-h-60 overflow-y-auto">
                  {" "}
                  {suggestions.length > 0 && (
                    <ul className="absolute z-20 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
                      {suggestions.map((item) => (
                        <li
                          key={item.place_id}
                          onClick={() =>
                            getLatLng(item.place_id, item.description)
                          }
                          className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                        >
                          {item.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* selector */}
            {selectoropen && (
              <div
                ref={dropdownRef}
                className="
                      absolute z-50 bg-white shadow-xl rounded-2xl p-4
                      w-[90vw] sm:w-[310px]
                                        left-1/2 -translate-x-1/2 lg:right-0 lg:left-auto lg:translate-x-0
                      top-full mt-2
                    "
              >
                <Row label="Adults" sub="Ages 13+" type="adults" />
                <Row label="Children" sub="Ages 2–12" type="children" />
                <Row label="Infants" sub="Under 2" type="infants" />
                <Row
                  label="Pets"
                  sub="Bringing a service animal?"
                  type="pets"
                />

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => Setselectoropen(false)}
                    className="mt-3 text-sm text-rose-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 mt-3 space-y-6">
          <h2 className="text-xl font-semibold">Near By Hotels</h2>
          {!hotels || hotels.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <SyncLoader color="#00c76a" size={10} speedMultiplier={0.6} />
            </div>
          ) : (
            <div
              className="
               grid gap-6
               grid-cols-1
               sm:grid-cols-2
               md:grid-cols-3
               lg:grid-cols-4
               xl:grid-cols-6
               2xl:grid-cols-8
             "
            >
              {hotels.map((hotel) => (
                <div key={hotel.id} className="cursor-pointer group">
                  {/* IMAGE */}
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      onClick={() => navigate(`/showhotel/${hotel.id}`)}
                      src={hotel.places_image?.[0]?.image}
                      className="h-52 w-full object-cover group-hover:scale-105 transition"
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
                    <div className="flex justify-between">
                      <h3 className="font-medium truncate">
                        {hotel.place_name}
                      </h3>
                      <span className="text-sm">⭐ {hotel.rating}</span>
                    </div>

                    <p className="text-gray-500 text-sm">{hotel.room_type}</p>
                    <span className="flex">
                      Guest
                      <p className="font-bold ml-3 ">{hotel.maximum_guest}</p>
                    </span>

                    <p className="font-semibold">
                      ₹{hotel.rent_per_night.toLocaleString()}
                      <span className="font-normal text-gray-500">
                        {" "}
                        {hotel.rental_type}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
