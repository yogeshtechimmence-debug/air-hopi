import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Star,
  Wifi,
  Snowflake,
  Refrigerator,
  ParkingSquare,
  Flame,
  MapPin,
  StarHalf,
  Utensils,
  Tv,
  WashingMachine,
  Droplets,
  ArrowBigLeftIcon,
  Heart,
} from "lucide-react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL } from "../Base Url/ApiUrl";
import {
  GoogleMap,
  Marker,
  MarkerF,
  useLoadScript,
} from "@react-google-maps/api";
import { SyncLoader } from "react-spinners";
import Login from "./Login";
import SignUp from "./SignUp";

const ShowHotel = () => {
  const navigate = useNavigate();

  // -------------------- Get Place Ditails -------------------------------------------------------------------------------

  const [placeDitails, setPlaceDitails] = useState({});
  // console.log(placeDitails.places_image);
  const images = placeDitails?.places_image || [];
  const maxGuests = placeDitails?.maximum_guest || 1;

  const { place_id } = useParams();
  const user_id = localStorage.getItem("user_id");

  useEffect(() => {
    if (!place_id) return;
    axios
      .get(`${BASE_URL}/get_place_details`, {
        params: {
          place_id: place_id,
          ...(user_id && { user_id: user_id }),
        },
      })
      .then((res) => {
        setPlaceDitails(res.data.result);
      })
      .catch((err) => {
        console.error(err);
      });

    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        // close dropdown
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [place_id, user_id]);

  const dropdownRef = useRef(null);

  // -------------------- Get Booked Date  -------------------------------------------------------------------------------

  const [startDate, setstartDate] = useState("");
  const [endDate, setendDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [BookDate, setBookDate] = useState([]);
  // console.log(BookDate);

  useEffect(() => {
    if (!placeDitails?.id) return;

    axios
      .get(`${BASE_URL}/get_booked_date_by_place`, {
        params: {
          place_id: placeDitails.id,
        },
      })
      .then((res) => {
        // console.log("API RESPONSE:", res);
        setBookDate(res.data);
      })
      .catch((err) => {
        console.error("API ERROR:", err.response || err);
      });
  }, [placeDitails]);

  const disabledDates = (BookDate?.result || [])
    .filter((item) => item.availability_status === "No")
    .map((item) => new Date(item.booked_date));

  const isDateDisabled = (date) => {
    return disabledDates.some(
      (disabled) => disabled.toDateString() === date.toDateString(),
    );
  };
  const rating = Number(placeDitails?.rating || 0);

  // -------------------- amenitis -------------------------------------------------------------------------------

  const [showAll, setShowAll] = useState(false);
  const services =
    placeDitails?.place_offer_service_name?.split(",")?.map((s) => s.trim()) ||
    [];
  const visibleServices = showAll ? services : services.slice(0, 4);

  const serviceIconMap = {
    Wifi: <Wifi size={18} />,
    "Free parking on premises": <ParkingSquare size={18} />,
    "Air Conditioning": <Snowflake size={18} />,
    Kitchen: <Utensils size={18} />,
    TV: <Tv size={18} />,
    Washer: <WashingMachine size={18} />,
    "Private pool": <Droplets size={18} />,
  };

  // -------------------- Review -------------------------------------------------------------------------------

  const [visibleCount, setVisibleCount] = useState(3);
  const [showRatingModal, setRatingShowModal] = useState(false);

  const reviews = placeDitails?.rating_review || [];
  const visibleReviews = reviews.slice(0, visibleCount);

  // -------------------- Map Location Ditails -------------------------------------------------------------------------------

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyB4kw_LEdrl0TxT1xesth1StJ2pQRGDMrA",
    libraries: ["places"],
  });

  const mapCenter = useMemo(() => {
    if (!placeDitails?.lat || !placeDitails?.lon) return null;

    return {
      lat: Number(placeDitails.lat),
      lng: Number(placeDitails.lon),
    };
  }, [placeDitails]);

  // console.log(mapCenter);

  // -------------------- Login Model -------------------------------------------------------------------------------

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [uid, setUid] = useState("");

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    setUid(user_id);
    const pageRoute = localStorage.getItem("pageRoute");
    // console.log(pageRoute);
  });

  //   ------------------------------------------- Add Favorites ----------------------------------------------------

  const AddFavorite = async (place_id) => {
    const user_id = localStorage.getItem("user_id");

    setPlaceDitails((prev) => ({
      ...prev,
      fav_place: prev.fav_place === "YES" ? "NO" : "YES",
    }));

    try {
      const formData = new URLSearchParams();
      formData.append("user_id", user_id);
      formData.append("place_id", place_id);

      await axios.post(`${BASE_URL}/add_remove_fav_place`, formData);
    } catch (error) {
      console.error(error);
    }
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
    <div>
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* Title */}
        <div className="flex justify-between items-center pt-3 mb-4">
          <h1 className="text-2xl font-semibold">Mar Azul 1bhk in Candolim</h1>

          {uid && (
            <div className="pt-3 cursor-pointer flex">
              <button
                onClick={() => AddFavorite(placeDitails.id)}
                className="flex gap-2"
              >
                <Heart
                  className={
                    placeDitails?.fav_place === "YES"
                      ? "w-6 h-6 text-red-500 fill-red-500 stroke-red-500"
                      : "w-6 h-6 text-black stroke-black"
                  }
                />
                <p>Save</p>
              </button>
            </div>
          )}
        </div>

        {/* Gallery */}
        {!placeDitails?.places_image ||
        placeDitails.places_image.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden animate-pulse">
            {/* LEFT BIG SKELETON */}
            <div className="h-[420px] bg-gray-300 rounded-lg"></div>

            {/* RIGHT SIDE SKELETON */}
            <div className="grid grid-cols-2 gap-2">
              <div className="h-[204px] bg-gray-300 rounded-lg"></div>
              <div className="h-[204px] bg-gray-300 rounded-lg"></div>
              <div className="h-[204px] bg-gray-300 rounded-lg"></div>
              <div className="h-[204px] bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden">
            {/* LEFT BIG IMAGE */}
            {images[0] && (
              <div className="h-[420px]">
                <img
                  src={images[0].image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* RIGHT SIDE */}
            {images.length > 1 && (
              <div
                className={`relative ${
                  images.length >= 4
                    ? "grid grid-cols-2 gap-2"
                    : "flex flex-col gap-2"
                }`}
              >
                {/* ===== 2 IMAGES ===== */}
                {images.length === 2 && (
                  <div className="h-[420px]">
                    <img
                      src={images[1].image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* ===== 3 IMAGES ===== */}
                {images.length === 3 && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-[180px] sm:h-[210px] md:h-[420px]">
                        <img
                          src={images[1].image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="h-[180px] sm:h-[210px] md:h-[420px]">
                        <img
                          src={images[2].image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* ===== 4 IMAGES ===== */}
                {images.length === 4 && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-[204px]">
                        <img
                          src={images[1].image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="h-[204px]">
                        <img
                          src={images[2].image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Third image full width below */}
                    <div className="h-[204px]">
                      <img
                        src={images[2].image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </>
                )}

                {/* ===== 4 OR MORE IMAGES ===== */}
                {images.length >= 4 &&
                  images.slice(1, 5).map((img, index) => (
                    <div key={index} className="h-[209px]">
                      <img
                        src={img.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}

                {/* Show All Button */}
                {/* {images.length > 4 && ( */}
                <button
                  onClick={() =>
                    navigate("/hotel_images", { state: placeDitails })
                  }
                  className="absolute bottom-4 right-4 bg-white text-sm font-medium px-4 py-2 rounded-lg shadow"
                >
                  Show all photos
                </button>
                {/* )} */}
              </div>
            )}
          </div>
        )}

        <div>
          <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* LEFT */}
            <div className="lg:col-span-2">
              {/* Rating */}
              <div className="border rounded-xl shadow-sm p-6 mb-6 flex justify-between items-center">
                <div className="text-center">
                  <p className="text-lg font-semibold">{rating}</p>

                  <div className="flex gap-1 justify-center">
                    {[1, 2, 3, 4, 5].map((i) => {
                      if (rating >= i) {
                        return (
                          <Star
                            key={i}
                            size={14}
                            className="text-yellow-400 fill-yellow-400"
                          />
                        );
                      } else if (rating >= i - 0.5) {
                        return (
                          <StarHalf
                            key={i}
                            size={14}
                            className="text-yellow-400 fill-yellow-400"
                          />
                        );
                      } else {
                        return (
                          <Star key={i} size={14} className="text-gray-300" />
                        );
                      }
                    })}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-lg font-semibold">
                    {placeDitails?.rating_review?.length}
                  </p>
                  <p className="text-sm">Reviews</p>
                </div>
              </div>

              {/* Host */}
              <div className="border-b pb-6 mb-6 flex gap-4">
                <img
                  src={placeDitails?.provider_details?.image}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <p className="font-semibold">
                    Hosted By {placeDitails?.provider_details?.first_name}{" "}
                    {placeDitails?.provider_details?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Hosting since {placeDitails?.date_time}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <h3 className="text-xl font-semibold mb-4">
                What this place offers
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleServices.map((service, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {serviceIconMap[service] || <Flame size={18} />}
                    <span>{service}</span>
                  </div>
                ))}
              </div>

              {services.length > 4 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="mt-6 bg-gray-200 px-6 py-3 rounded-lg text-sm"
                >
                  {showAll ? "Show less amenities" : "Show all amenities"}
                </button>
              )}
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 border rounded-2xl shadow-lg p-6">
                <div className="mb-4">
                  <span className="text-2xl underline font-semibold">
                    {getCurrencySymbol(placeDitails.currency)}
                    {placeDitails.rent_per_night?.toLocaleString()}
                  </span>
                  for
                  <span className=" font-bold  ml-1">
                    {placeDitails.rental_type === "per_night"
                      ? "1 night"
                      : "1 month"}
                  </span>
                </div>
                <div className="border-2  border-zinc-600 rounded-xl">
                  <div className="relative grid grid-cols-2 gap-4 border-b-2 border-zinc-600  p-1">
                    {/* Vertical Line */}
                    <div className="absolute left-1/2 top-0.5 bottom-4 h-[50px] w-[2px] bg-zinc-700"></div>

                    {/* Check-in */}
                    <div className="pr-4">
                      <p className="text-sm text-black">Check-in</p>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => {
                          setstartDate(date);
                          setendDate(null);
                        }}
                        minDate={new Date()}
                        filterDate={(date) => !isDateDisabled(date)}
                        placeholderText="DD/MM/YY"
                        className="w-full text-sm font-medium outline-none cursor-pointer"
                      />
                    </div>

                    {/* Check-out */}
                    <div className="pl-4">
                      <p className="text-sm text-black">Check-out</p>
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setendDate(date)}
                        minDate={startDate}
                        filterDate={(date) => {
                          if (!startDate) return false;

                          let current = new Date(startDate);
                          while (current <= date) {
                            if (isDateDisabled(current)) return false;
                            current.setDate(current.getDate() + 1);
                          }
                          return true;
                        }}
                        placeholderText="DD/MM/YY"
                        className="w-full text-sm font-medium outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* GUESTS */}
                  <div className=" rounded-xloverflow-hidden ">
                    <div className="p-1">
                      <p className="text-black text-sm ">Guests</p>

                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {guests} {guests === 1 ? "guest" : "guests"}
                        </span>

                        <div className="flex items-center gap-3">
                          {/* MINUS */}
                          <button
                            onClick={() =>
                              setGuests((prev) => Math.max(1, prev - 1))
                            }
                            disabled={guests === 1}
                            className="w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-40"
                          >
                            −
                          </button>

                          {/* PLUS */}
                          <button
                            onClick={() =>
                              setGuests((prev) => Math.min(maxGuests, prev + 1))
                            }
                            disabled={guests >= maxGuests}
                            className="w-8 h-8 flex items-center justify-center border rounded-full disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!uid) {
                      localStorage.setItem(
                        "pageRoute",
                        `showhotel/${placeDitails.id}`,
                      );
                      setShowModal(true);
                      return;
                    }

                    navigate("/confirmation", {
                      state: {
                        placeDitails,
                        startDate,
                        endDate,
                        guests,
                      },
                    });
                  }}
                  className="w-full mt-3 bg-green-800 hover:bg-green-700 text-white py-3 rounded-full font-semibold"
                >
                  Reserve
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="max-w-6xl mx-auto px-4">
          {/* Heading */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-6 text-3xl font-semibold">
              {/* Left Patti */}
              <div className="mt-4">
                <img
                  src="https://i.ibb.co/vxcpZKbt/78b7687c-5acf-4ef8-a5ea-eda732ae3b2f.avif"
                  className="w-16 h-28"
                  alt=""
                />
              </div>

              {/* Rating */}
              <span className="tracking-wide">{placeDitails?.rating}</span>

              {/* Right Patti */}
              <div className="mt-4">
                <img
                  src="https://i.ibb.co/pvWTwypX/b4005b30-79ff-4287-860c-67829ecd7412.avif"
                  className="w-16 h-28"
                  alt=""
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold mt-2">Guest Reviews</h2>
            <p className="text-gray-500 text-sm mt-1">
              This home is highly rated based on ratings & reviews
            </p>
          </div>

          {/* Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleReviews.map((item, index) => {
              const rating = Number(item?.rating || 0);

              return (
                <div
                  key={index}
                  className="border rounded-xl p-4 bg-white shadow-sm"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={item?.user_details?.image}
                      alt=""
                      className="w-12 h-12 rounded-full"
                    />

                    <div>
                      <h4 className="font-medium">
                        {item?.user_details?.first_name}{" "}
                        {item?.user_details?.last_name}
                      </h4>
                      <p className="text-sm">{item?.user_details?.date_time}</p>

                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500">
                          {item.rating}
                        </span>

                        {[1, 2, 3, 4, 5].map((i) => {
                          if (rating >= i) {
                            return (
                              <Star
                                key={i}
                                size={14}
                                className="text-yellow-400 fill-yellow-400"
                              />
                            );
                          } else if (rating >= i - 0.5) {
                            return (
                              <StarHalf
                                key={i}
                                size={14}
                                className="text-yellow-400 fill-yellow-400"
                              />
                            );
                          } else {
                            return (
                              <Star
                                key={i}
                                size={14}
                                className="text-gray-300"
                              />
                            );
                          }
                        })}
                      </div>
                    </div>

                    <span className="ml-auto text-xs text-gray-400">
                      {item?.date}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700">{item?.feedback}</p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 mt-8">
            {/* Toggle More / Cancel More */}
            {reviews.length > 3 && (
              <button
                onClick={() => setVisibleCount((prev) => (prev === 3 ? 6 : 3))}
                className="px-6 py-2 bg-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
              >
                {visibleCount === 3 ? "More reviews" : "Cancel more"}
              </button>
            )}

            {/* All Reviews Button */}
            {reviews.length > 0 && (
              <button
                onClick={() => setRatingShowModal(true)}
                className="px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
              >
                All reviews
              </button>
            )}
          </div>

          {/* Location */}
          <div className="mt-10 border-t pt-6 pb-4">
            <h3 className="font-semibold mb-2">See Location on Map</h3>
            <p className="flex  pb-4 pt-2 items-center gap-2 text-gray-600 text-sm">
              <MapPin size={16} />
              {placeDitails.address}
            </p>
            <div className="h-[300px] w-full">
              {!isLoaded ? (
                <div className="h-full w-full bg-gray-200 animate-pulse rounded-lg" />
              ) : mapCenter ? (
                <GoogleMap
                  zoom={17}
                  center={mapCenter}
                  mapContainerClassName="w-full h-full"
                >
                  <MarkerF position={mapCenter} />
                </GoogleMap>
              ) : (
                <p className="text-sm text-gray-500">Location not available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] md:w-[70%] max-h-[80vh] overflow-y-auto rounded-2xl p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setRatingShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              {" "}
              ✕{" "}
            </button>

            {/* Heading */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-6 text-3xl font-semibold">
                {/* Left Patti */}
                <div className="mt-4">
                  <img
                    src="https://i.ibb.co/vxcpZKbt/78b7687c-5acf-4ef8-a5ea-eda732ae3b2f.avif"
                    className="w-16 h-28"
                    alt=""
                  />
                </div>

                {/* Rating */}
                <span className="tracking-wide">{placeDitails?.rating}</span>

                {/* Right Patti */}
                <div className="mt-4">
                  <img
                    src="https://i.ibb.co/pvWTwypX/b4005b30-79ff-4287-860c-67829ecd7412.avif"
                    className="w-16 h-28"
                    alt=""
                  />
                </div>
              </div>

              <h2 className="text-xl font-semibold ">Guest Reviews</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((item, index) => {
                const rating = Number(item?.rating || 0);

                return (
                  <div
                    key={index}
                    className="border rounded-xl p-3 bg-white shadow-sm"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {/* User Image */}
                      <img
                        src={item?.user_details?.image}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />

                      <div>
                        <h4 className="font-medium">
                          {item?.user_details?.first_name}{" "}
                          {item?.user_details?.last_name}
                        </h4>
                        <p className="text-sm">{item?.date_time}</p>
                        {/* Rating + Stars */}
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">
                            {item?.rating}
                          </span>

                          {[1, 2, 3, 4, 5].map((i) => {
                            if (rating >= i) {
                              return (
                                <Star
                                  key={i}
                                  size={14}
                                  className="text-yellow-400 fill-yellow-400"
                                />
                              );
                            } else if (rating >= i - 0.5) {
                              return (
                                <StarHalf
                                  key={i}
                                  size={14}
                                  className="text-yellow-400 fill-yellow-400"
                                />
                              );
                            } else {
                              return (
                                <Star
                                  key={i}
                                  size={14}
                                  className="text-gray-300"
                                />
                              );
                            }
                          })}
                        </div>
                      </div>

                      {/* Date */}
                      <span className="ml-auto text-xs text-gray-400">
                        {item?.date}
                      </span>
                    </div>

                    {/* Feedback */}
                    <p className="text-sm text-gray-700">{item?.feedback}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white rounded-md p-6 w-[90%] max-w-sm">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-lg font-bold"
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-2">Login Required</h2>

            <p className="text-sm text-gray-600 mb-6">
              Please Login to Continue
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setLoginOpen(true);
                  setShowModal(false);
                }}
                className="px-5 py-2 bg-green-800 hover:bg-green-700 text-white rounded-md text-sm"
              >
                Login
              </button>

              <button
                onClick={() => {
                  setSignupOpen(true);
                  setShowModal(false);
                }}
                className="px-5 py-2 bg-green-800 hover:bg-green-700 text-white rounded-md text-sm"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default ShowHotel;
