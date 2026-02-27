import axios from "axios";
import {
  Search,
  Minus,
  Plus,
  Heart,
  Navigation,
  ArrowBigRight,
  ArrowRight,
  Star,
  ArrowLeft,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../Base Url/ApiUrl";

const HomePage = () => {
  const navigate = useNavigate();
  const [uid, setUid] = useState("");

  const [whereOpen, setWhereOpen] = useState(false);
  const [whereValue, setWhereValue] = useState("");

  const [MostBookedhotels, setHotel] = useState([]);
  const [perNightHotels, setPerNightHotels] = useState([]);
  const [perMonthHotels, setPerMonthHotels] = useState([]);
  const [BedForLet, setBedForLet] = useState([]);

  const [Currentlat, setCurrentlat] = useState("");
  const [Currentlon, setCurrentlon] = useState("");
  const [CurrentCicyName, setCurrentCicyName] = useState("");

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  const dropdownRef = useRef(null);
  const popularScrollRef = useRef(null);
  const mostBookedScrollRef = useRef(null);
  const NearByHotel = useRef(null);
  const BedForLetRef = useRef(null);

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
          setHotel(res.data.result);
          const result = res.data.result || [];

          const perNight = result.filter(
            (item) => item.rental_type === "per_night",
          );

          const perMonth = result.filter(
            (item) =>
              item.rental_type === "per_month" &&
              item.room_type === "Single Room",
          );

          const bedForLet = result.filter(
            (item) =>
              item.rental_type === "per_month" &&
              item.room_type === "Bed for let",
          );

          setPerNightHotels(perNight);
          setPerMonthHotels(perMonth);
          setBedForLet(bedForLet);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          localStorage.setItem("lat", lat);
          localStorage.setItem("lon", lon);

          setCurrentlat(lat);
          setCurrentlon(lon);

          const cityName = await getCityFromLatLng(lat, lon);
          setCurrentCicyName(cityName);

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

  //   ----------------------------------------- get Location name -------------------------------------------------------

  const getCityFromLatLng = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      );

      const data = await res.json();

      const city =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.state;

      return city;
    } catch (error) {
      console.log("Reverse geocoding error:", error);
    }
  };

  //   ----------------------------------------- guest model -------------------------------------------------------

  const [selectoropen, Setselectoropen] = useState(false);

  const [guests, setGuests] = useState({
    adults: 0,
    children: 0,
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
    if (totalGuests > 0) text += `${totalGuests} `;
    return text;
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

    setPerNightHotels((prev) =>
      prev.map((hotel) =>
        hotel.id === place_id
          ? {
              ...hotel,
              fav_place: hotel.fav_place === "YES" ? "NO" : "YES",
            }
          : hotel,
      ),
    );

    setPerMonthHotels((prev) =>
      prev.map((hotel) =>
        hotel.id === place_id
          ? {
              ...hotel,
              fav_place: hotel.fav_place === "YES" ? "NO" : "YES",
            }
          : hotel,
      ),
    );
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
    }
  };

  //   ---------------------------------- location data --------------------------------------------------------------

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [SearchLat, setSearchLat] = useState("");
  const [SearchLon, setSearchLon] = useState("");
  const serviceRef = useRef(null);
  
  useEffect(() => {
    const checkGoogle = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        serviceRef.current =
          new window.google.maps.places.AutocompleteService();
        clearInterval(checkGoogle);
      }
    }, 300);

    return () => clearInterval(checkGoogle);
  }, []);

  const handleSearch = (value) => {
    setQuery(value);

    if (!value || !serviceRef.current) {
      setSuggestions([]);
      return;
    }

    serviceRef.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: "in" },
      },
      (predictions, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setSuggestions(predictions);
        } else {
          setSuggestions([]);
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

  //   ---------------------------------- Hot Deals --------------------------------------------------------------

  const hotDeals = [
    {
      id: 1,
      title: "Modern Stay",
      desc: "Stay close to city center • Free WiFi",
      discount: "25% OFF",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    },
    {
      id: 2,
      title: "Luxury Room",
      desc: "Premium stay • Breakfast included",
      discount: "10% OFF",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    },
    {
      id: 3,
      title: "Budget Friendly",
      desc: "Best for short stays",
      discount: "15% OFF",
      image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    },
  ];

  //   ---------------------------------- Card Scrolling --------------------------------------------------------------

  const scroll = (ref, direction = "right") => {
    if (!ref.current) return;

    const container = ref.current;
    const card = container.children[0];
    if (!card) return;

    const style = window.getComputedStyle(container);
    const gap = parseInt(style.gap || 16);

    const scrollAmount = card.offsetWidth + gap;

    container.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  //   ---------------------------------- hotel price icon manage  --------------------------------------------------------------

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case "GBP":
        return "£";
      case "CAD":
        return "C$";
      case "EUR":
        return "€";
      default:
        return "₹"; // fallback
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 overflow-hidden">
      <div className="min-h-screen bg-white items-start justify-center">
        <div
          className="text-center h-28 pt-4 text-4xl font-bold text-gray-600 
                bg-gradient-to-b from-black/30 to-bg-gray-100"
        >
          Find Your Perfect Stay
          <p className="text-sm mt-2">
            Book hotel, resorts, and more across the world
          </p>
        </div>

        {/* Search baar */}
        <div className="w-full mt-4 flex justify-center z-50">
          <div
            className="
                       relative bg-white shadow-lg border
                       rounded-2xl lg:rounded-full
                       w-full           
                       sm:w-[95vw]
                       lg:w-full
                       max-w-4xl
                       mx-auto
                       flex flex-row
                       divide-x
                     "
          >
            {/* WHERE */}
            <div
              className="flex-1 px-3 py-2 cursor-pointer"
              onClick={() => setWhereOpen(true)}
            >
              <p className="text-[9px] sm:text-xs font-semibold text-gray-800">
                Where
              </p>
              <input
                value={whereValue}
                readOnly
                placeholder="Search"
                className="
                     w-full
                     text-[9px] sm:text-xs
                     placeholder:text-[9px] sm:placeholder:text-[13px]
                     text-gray-700
                     placeholder:text-gray-800
                     focus:outline-none
                     cursor-pointer
                   "
              />
            </div>

            {/* WHEN */}
            <div className="flex  px-3 py-2">
              {/* Check-in */}
              <div className="">
                <p className="text-[9px] sm:text-xs font-semibold text-gray-800">
                  Check-in
                </p>

                <DatePicker
                  selected={checkIn}
                  onChange={(date) => setCheckIn(date)}
                  selectsStart
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={new Date()}
                  inputMode="none"
                  placeholderText="DD/MM/YY"
                  className="w-full text-[9px] sm:text-xs font-medium outline-none cursor-pointer"
                />
              </div>

              {/* Check-out */}
              <div className="ml-3">
                <p className="text-[9px] sm:text-xs font-semibold text-gray-800">
                  Check-out
                </p>
                <DatePicker
                  selected={checkOut}
                  onChange={(date) => setCheckOut(date)}
                  selectsEnd
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={checkIn}
                  inputMode="none"
                  placeholderText="DD/MM/YY"
                  className="w-full text-[9px] sm:text-xs font-medium outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* WHO */}
            <div className="flex-1  px-2 py-2">
              <p className="text-[9px] sm:text-xs font-semibold text-gray-800">
                Guests
              </p>
              <input
                readOnly
                onClick={() => Setselectoropen(true)}
                value={summary()}
                placeholder="Add"
                className="
                      w-full
                      text-[9px] sm:text-xs
                      placeholder:text-[9px] sm:placeholder:text-[13px]
                      text-gray-500
                      placeholder:text-gray-800
                      focus:outline-none
                      cursor-pointer
                    "
              />
            </div>

            {/* SEARCH BUTTON */}
            <button
              onClick={() => {
                navigate("/location", {
                  state: {
                    lat: SearchLat,
                    lon: SearchLon,
                    check_in: checkIn,
                    check_out: checkOut,
                    guest: guests,
                  },
                });
              }}
              className="
                      bg-green-700 hover:bg-green-600 text-white
                     p-2  rounded-full
                     mx-4 my-2 lg:mx-2 lg:my-0
                     self-end lg:self-auto
                   "
            >
              <Search size={20} />
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
                {/* Search input */}
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

                {/* Locations list */}
                {suggestions.length > 0 && (
                  <ul className="w-full border rounded-lg mt-2 shadow-sm max-h-60 overflow-y-auto">
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

        {/* Popular stays in indore */}
        <div className="mt-3 space-y-6 relative z-10">
          <div className="flex justify-between items-center gap-2 px-4 sm:px-0">
            <span className="text-xl font-bold pb-2">
              Popular stays in {CurrentCicyName}
            </span>
            <div className="flex  gap-2">
              <ArrowLeft onClick={() => scroll(popularScrollRef, "left")} />
              <ArrowRight onClick={() => scroll(popularScrollRef, "right")} />
            </div>
          </div>

          {!perNightHotels || perNightHotels.length === 0 ? (
            <div
              className="
                     flex gap-4 overflow-x-auto pb-4
                     -mx-4 px-4
                     scrollbar-hide
                   "
            >
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="
                      shrink-0
                      w-[48%]
                      sm:w-[30%]
                      md:w-[22%]
                      lg:w-[19%]
                      rounded-lg bg-white
                    "
                >
                  <div className="animate-pulse">
                    {/* Image Skeleton */}
                    <div className="aspect-square sm:aspect-[4/3] w-full bg-gray-300 rounded-xl"></div>

                    {/* Content Skeleton */}
                    <div className="p-2 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={popularScrollRef}
              className="
                           scroll-px-6  
                           flex gap-4 overflow-x-auto pb-4
                           -mx-4 px-4
                           snap-x snap-proximity
                           scrollbar-hide
                         "
            >
              {perNightHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="
                            scroll-px-6  
                            snap-start shrink-0
                            w-[48%]        
                            sm:w-[30%]
                            md:w-[22%]
                            lg:w-[19%]    
                            rounded-2xl bg-white cursor-pointer group
                          "
                >
                  {/* IMAGE */}
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      onClick={() => navigate(`/showhotel/${hotel.id}`)}
                      src={hotel.places_image?.[0]?.image}
                      className=" aspect-square sm:aspect-[4/3] h-auto w-full object-cover group-hover:scale-105 transition "
                      alt={hotel.place_name}
                    />
                    {uid && (
                      <button
                        onClick={() => AddFavorite(hotel.id)}
                        className=" absolute top-3 right-3 p-1 rounded-full bg-gradient-to-br from-black/0 to-black/30 z-[1] "
                      >
                        <Heart
                          className={
                            hotel?.fav_place === "YES"
                              ? "text-red-500 fill-red-500 stroke-white stroke-[1.5]"
                              : "text-white"
                          }
                        />
                      </button>
                    )}
                    {/* <button className=" absolute top-3 left-3 px-2 py-1 text-[11px] font-semibold text-white rounded-full bg-gradient-to-br from-black/0 to-black/80 z-[1] ">
                      Guest favourite
                    </button> */}
                  </div>
                  <div
                    onClick={() => navigate(`/showhotel/${hotel.id}`)}
                    className=" space-y-0.5 sm:space-y-1 p-2"
                  >
                    {/* Title + Rating */}
                    <div className="">
                      <h3 className="font-medium truncate text-sm sm:text-base">
                        {hotel.place_name}
                      </h3>
                    </div>
                    {/* Price */}
                    <p className="font-semibold flex text-sm sm:text-base">
                      <span>
                        {getCurrencySymbol(hotel.currency)}
                        {hotel.rent_per_night?.toLocaleString()}
                      </span>
                      <span className="font-normal mt-0.5 text-gray-500 text-xs sm:text-sm ml-1">
                        /
                        {hotel.rental_type === "per_night"
                          ? "1 night ."
                          : "1 month"}
                      </span>
                      <span className="text-xs mt-0.5 flex ml-2 gap-1 sm:text-sm">
                        <Star className="w-4 h-4 text-green-600 fill-green-600" />
                        {hotel.rating}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Near By Hotels */}
        <div className="mt-3 space-y-6">
          <div className="flex justify-between items-center px-4 sm:px-0">
            <span className="text-xl font-bold pb-2">Room For Rent</span>

            <div className="flex gap-2">
              <ArrowLeft
                onClick={() => scroll(NearByHotel, "left")}
                className="cursor-pointer hover:scale-110 transition"
              />
              <ArrowRight
                onClick={() => scroll(NearByHotel, "right")}
                className="cursor-pointer hover:scale-110 transition"
              />
            </div>
          </div>

          {!perMonthHotels || perMonthHotels.length === 0 ? (
            <div
              className="
                     flex gap-4 overflow-x-auto pb-4
                     -mx-4 px-4
                     scrollbar-hide
                   "
            >
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="
                      shrink-0
                      w-[48%]
                      sm:w-[30%]
                      md:w-[22%]
                      lg:w-[19%]
                      rounded-lg bg-white
                    "
                >
                  <div className="animate-pulse">
                    {/* Image Skeleton */}
                    <div className="aspect-square sm:aspect-[4/3] w-full bg-gray-300 rounded-xl"></div>

                    {/* Content Skeleton */}
                    <div className="p-2 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={NearByHotel}
              className="
                           scroll-px-6  
                           flex gap-4 overflow-x-auto pb-4
                           -mx-4 px-4
                           snap-x snap-proximity
                           scrollbar-hide
                         "
            >
              {perMonthHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="
                            scroll-px-6  
                            snap-start shrink-0
                            w-[48%]        
                            sm:w-[30%]
                            md:w-[22%]
                            lg:w-[19%]    
                            rounded-lg bg-white cursor-pointer group
                          "
                >
                  {/* IMAGE */}
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      onClick={() => navigate(`/showhotel/${hotel.id}`)}
                      src={hotel.places_image?.[0]?.image}
                      className="
                         aspect-square
                         sm:aspect-[4/3]
                         h-auto
                         w-full
                         object-cover
                         group-hover:scale-105
                         transition
                       "
                      alt={hotel.place_name}
                    />

                    {uid && (
                      <button
                        onClick={() => AddFavorite(hotel.id)}
                        className="
                              absolute top-3 right-3
                               p-1 rounded-full
                               bg-gradient-to-br from-black/0 to-black/30
                                z-10
                             "
                      >
                        <Heart
                          className={
                            hotel.fav_place === "YES"
                              ? "text-red-500 fill-red-500 stroke-white stroke-[1.5]"
                              : "text-white"
                          }
                        />
                      </button>
                    )}

                    <button
                      className="
                         absolute top-3 left-3
                         px-2 py-1
                         text-[11px] font-semibold
                         text-white
                         rounded-full
                         bg-gradient-to-br from-black/0 to-black/80
                         z-10
                       "
                    >
                      Guest favourite
                    </button>
                  </div>

                  <div
                    onClick={() => navigate(`/showhotel/${hotel.id}`)}
                    className=" space-y-0.5 sm:space-y-1 p-2"
                  >
                    {/* Title + Rating */}
                    <div className="">
                      <h3 className="font-medium truncate text-sm sm:text-base">
                        {hotel.place_name}
                      </h3>
                    </div>

                    {/* Price */}
                    <p className="font-semibold flex text-sm sm:text-base">
                      <span>
                        {getCurrencySymbol(hotel.currency)}
                        {hotel.rent_per_night?.toLocaleString()}
                      </span>
                      <span className="font-normal mt-0.5 text-gray-500 text-xs sm:text-sm ml-1">
                        /
                        {hotel.rental_type === "per_night"
                          ? "1 night ."
                          : "1 month"}
                      </span>
                      <span className="text-xs mt-0.5 flex ml-2 gap-1 sm:text-sm">
                        <Star className="w-4 h-4 text-green-600 fill-green-600" />
                        {hotel.rating}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bed For Let */}
        <div className="mt-3 space-y-6">
          <div className="flex justify-between items-center px-4 sm:px-0">
            <span className="text-xl font-bold pb-2">Bed For Let</span>

            <div className="flex gap-2">
              <ArrowLeft
                onClick={() => scroll(BedForLetRef, "left")}
                className="cursor-pointer hover:scale-110 transition"
              />
              <ArrowRight
                onClick={() => scroll(BedForLetRef, "right")}
                className="cursor-pointer hover:scale-110 transition"
              />
            </div>
          </div>

          {!BedForLet || BedForLet.length === 0 ? (
            <div
              className="
                     flex gap-4 overflow-x-auto pb-4
                     -mx-4 px-4
                     scrollbar-hide
                   "
            >
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="
                      shrink-0
                      w-[48%]
                      sm:w-[30%]
                      md:w-[22%]
                      lg:w-[19%]
                      rounded-lg bg-white
                    "
                >
                  <div className="animate-pulse">
                    {/* Image Skeleton */}
                    <div className="aspect-square sm:aspect-[4/3] w-full bg-gray-300 rounded-xl"></div>

                    {/* Content Skeleton */}
                    <div className="p-2 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={BedForLetRef}
              className="
                           scroll-px-6  
                           flex gap-4 overflow-x-auto pb-4
                           -mx-4 px-4
                           snap-x snap-proximity
                           scrollbar-hide
                         "
            >
              {BedForLet.map((hotel) => (
                <div
                  key={hotel.id}
                  className="
                            scroll-px-6  
                            snap-start shrink-0
                            w-[48%]        
                            sm:w-[30%]
                            md:w-[22%]
                            lg:w-[19%]    
                            rounded-lg bg-white cursor-pointer group
                          "
                >
                  {/* IMAGE */}
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      onClick={() => navigate(`/showhotel/${hotel.id}`)}
                      src={hotel.places_image?.[0]?.image}
                      className="
                         aspect-square
                         sm:aspect-[4/3]
                         h-auto
                         w-full
                         object-cover
                         group-hover:scale-105
                         transition
                       "
                      alt={hotel.place_name}
                    />

                    {uid && (
                      <button
                        onClick={() => AddFavorite(hotel.id)}
                        className="
                              absolute top-3 right-3
                               p-1 rounded-full
                               bg-gradient-to-br from-black/0 to-black/30
                                z-10
                             "
                      >
                        <Heart
                          className={
                            hotel.fav_place === "YES"
                              ? "text-red-500 fill-red-500 stroke-white stroke-[1.5]"
                              : "text-white"
                          }
                        />
                      </button>
                    )}

                    <button
                      className="
                         absolute top-3 left-3
                         px-2 py-1
                         text-[11px] font-semibold
                         text-white
                         rounded-full
                         bg-gradient-to-br from-black/0 to-black/80
                         z-10
                       "
                    >
                      Guest favourite
                    </button>
                  </div>

                  <div
                    onClick={() => navigate(`/showhotel/${hotel.id}`)}
                    className=" space-y-0.5 sm:space-y-1 p-2"
                  >
                    {/* Title + Rating */}
                    <div className="">
                      <h3 className="font-medium truncate text-sm sm:text-base">
                        {hotel.place_name}
                      </h3>
                    </div>

                    {/* Price */}
                    <p className="font-semibold flex text-sm sm:text-base">
                      <span>
                        {getCurrencySymbol(hotel.currency)}
                        {hotel.rent_per_night?.toLocaleString()}
                      </span>
                      <span className="font-normal mt-0.5 text-gray-500 text-xs sm:text-sm ml-1">
                        /
                        {hotel.rental_type === "per_night"
                          ? "1 night ."
                          : "1 month"}
                      </span>
                      <span className="text-xs mt-0.5 flex ml-2 gap-1 sm:text-sm">
                        <Star className="w-4 h-4 text-green-600 fill-green-600" />
                        {hotel.rating}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hot Deals */}
        <div className="pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl pl-4 font-bold pb-2">
              Hot Deals Near You
            </span>
          </div>
          <div
            className="
              flex gap-4 overflow-x-auto px-4
              mt-3 scrollbar-hide
              md:grid md:grid-cols-3 md:gap-6
              md:overflow-visible
            "
          >
            {hotDeals.map((deal) => (
              <div
                key={deal.id}
                className="
                   shrink-0
                   w-[85%]          
                   max-w-md
                   md:w-auto      
                   md:max-w-none
                   rounded-2xl
                   border
                   bg-green-700
                   shadow-sm
                 "
              >
                {/* Card Body */}
                <div className="flex gap-3 p-1">
                  {/* Image */}
                  <div className="w-24 shrink-0">
                    <div className="aspect-square rounded-xl ">
                      <img
                        src={deal.image}
                        alt={deal.title}
                        className="w-full h-32 rounded-2xl object-cover"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-sm text-white truncate">
                          {deal.title}
                        </h3>

                        <span className="shrink-0 text-[11px] font-semibold text-black bg-green-100 px-2 py-0.5 rounded-full">
                          {deal.discount}
                        </span>
                      </div>

                      <p className="text-xs text-white mt-1">{deal.desc}</p>
                    </div>
                    <div className="pt-2  flex justify-between">
                      <div className="mt-4 flex">
                        <Star className="w-4 h-4 mt-1 pr-1 text-white" />
                        <p className="text-white">4.3</p>
                      </div>

                      <div>
                        <button
                          className="
                        font-bold
                        mt-3
                        bg-white
                        px-3 py-2
                        w-fit
                        text-xs
                        font-semibold
                        text-green-700
                        rounded-tl-xl
                        rounded-br-xl
                      "
                        >
                          Grab Deal →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Booked */}
        <div className="mt-3 space-y-6 relative z-10">
          <div className="justify-between flex">
            <div className="flex items-center gap-2 px-4 sm:px-0">
              <span className="text-xl font-bold pb-2">Most Booked</span>
            </div>
            <div className="flex pr-4 gap-2">
              <ArrowLeft onClick={() => scroll(mostBookedScrollRef, "left")} />
              <ArrowRight
                onClick={() => scroll(mostBookedScrollRef, "right")}
              />
            </div>
          </div>

          {!MostBookedhotels || MostBookedhotels.length === 0 ? (
            <div
              className="
                   flex gap-4 overflow-x-auto pb-4
                   -mx-4 px-4
                   scrollbar-hide
                 "
            >
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="
                     shrink-0
                     w-[78%]           
                     sm:w-[calc(25%-12px)] 
                     rounded-lg bg-white
                   "
                >
                  <div className="animate-pulse">
                    {/* Image Skeleton */}
                    <div className="aspect-[3/2] sm:aspect-[4/3] w-full bg-gray-300 rounded-xl"></div>

                    {/* Optional bottom text skeleton */}
                    <div className="p-3">
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              ref={mostBookedScrollRef}
              className="
                           flex gap-4 overflow-x-auto pb-4
                            scroll-px-6  
                           -mx-4 px-4
                          snap-x snap-proximity  

                           scrollbar-hide
                         "
            >
              {MostBookedhotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="
                             snap-start shrink-0
                             
                             w-[78%]          /* mobile */
                             sm:w-[calc(25%-12px)]  /* desktop: 4 cards */
                             rounded-lg bg-white cursor-pointer group
                           "
                >
                  {/* IMAGE */}
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      onClick={() => navigate(`/showhotel/${hotel.id}`)}
                      src={hotel.places_image?.[0]?.image}
                      className="
                          w-full object-cover
                          aspect-[3/2]        /*  mobile → height kam */
                          sm:aspect-[4/3]    /*  desktop */
                          transition
                          group-hover:scale-105
                        "
                      alt={hotel.place_name}
                    />

                    {/*  Heart (top-right) */}
                    {uid && (
                      <button
                        onClick={() => AddFavorite(hotel.id)}
                        className="
                       absolute top-3 right-3
                       p-1 rounded-full
                       bg-black/40
                       z-10
                     "
                      >
                        <Heart
                          className={
                            hotel.fav_place === "YES"
                              ? "text-red-500 fill-red-500 stroke-white stroke-[1.5]"
                              : "text-white"
                          }
                        />
                      </button>
                    )}

                    {/*  Hello text (bottom-left) */}
                    <span
                      className="
                     absolute bottom-3 left-3
                     text-xl font-semibold
                     text-white
                     px-2 py-1
                     rounded-md
                    
                    "
                    >
                      Room in {CurrentCicyName}
                    </span>
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
