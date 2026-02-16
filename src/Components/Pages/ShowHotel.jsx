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
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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

const ShowHotel = () => {
  const navigate = useNavigate();

  // -------------------- Get Place Ditails -------------------------------------------------------------------------------

  const [placeDitails, setPlaceDitails] = useState([]);
  // console.log(placeDitails);
  const maxGuests = placeDitails?.maximum_guest || 1;

  const { place_id } = useParams();
  const user_id = localStorage.getItem("user_id");

  useEffect(() => {
    if (!place_id || !user_id) return;

    axios
      .get(`${BASE_URL}/get_place_details`, {
        params: {
          place_id: place_id,
          user_id: user_id,
        },
      })
      .then((res) => {
        // console.log("Place Details:", res.data.result);
        setPlaceDitails(res.data.result);
      })
      .catch((err) => {
        console.error(err);
      });

    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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

  const [showAllReviews, setShowAllReviews] = useState(false);

  const reviews = placeDitails?.rating_review || [];
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  // -------------------- Map Location Ditails -------------------------------------------------------------------------------

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyAN3Lz2pT2ItRTkQ1MHCwHynGjmpDHhnt8",
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

  return (
    <div>
      <div className="ml-5 cursor-pointer pt-2 flex pb-3">
        <div
          onClick={() => navigate(`/`)}
          className="flex items-center gap-1 cursor-pointer"
        >
          <ArrowBigLeftIcon />
          <span>Back</span>
        </div>
      </div>
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* Title */}
        <h1 className="text-2xl pt-3 font-semibold mb-4">
          Mar Azul 1bhk in Candolim
        </h1>

        {/* Gallery */}
        {!placeDitails || placeDitails.length === 0 ? (
          <div className="flex justify-center items-center py-10">
            <SyncLoader color="#00c76a" size={10} speedMultiplier={0.6} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden">
            {/* Left big image */}
            <div className="h-[420px]">
              <img
                src={placeDitails?.places_image?.[0]?.image}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right grid */}
            <div className="grid grid-cols-2 gap-2 relative">
              {placeDitails?.places_image?.slice(1, 5)?.map((img, index) => (
                <div key={index} className="h-[209px]">
                  <img
                    src={img.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              {/* Show all photos button */}
              {/* <button className="absolute bottom-4 right-4 bg-white text-sm font-medium px-4 py-2 rounded-lg shadow flex items-center gap-2">
              <span className="grid grid-cols-3 gap-[2px]">
                <span className="w-1.5 h-1.5 bg-black rounded-sm" />
                <span className="w-1.5 h-1.5 bg-black rounded-sm" />
                <span className="w-1.5 h-1.5 bg-black rounded-sm" />
                <span className="w-1.5 h-1.5 bg-black rounded-sm" />
                <span className="w-1.5 h-1.5 bg-black rounded-sm" />
                <span className="w-1.5 h-1.5 bg-black rounded-sm" />
              </span>
              Show all photos
            </button> */}
            </div>
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
              <div className=" border rounded-2xl shadow-lg p-6">
                <div className="mb-4">
                  <span className="text-2xl font-semibold">
                    ₹{placeDitails.rent_per_night}
                  </span>
                  <span className="text-gray-500 ml-1">
                    {placeDitails.rental_type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border rounded-xl p-4">
                  {/* Check-in */}
                  <div>
                    <p className="text-sm text-gray-500">Check-in</p>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => {
                        setstartDate(date);
                        setendDate(null);
                      }}
                      minDate={new Date()}
                      filterDate={(date) => !isDateDisabled(date)}
                      placeholderText="Select date"
                      className="w-full text-sm font-medium outline-none cursor-pointer"
                    />
                  </div>

                  {/* Check-out */}
                  <div>
                    <p className="text-sm text-gray-500">Check-out</p>
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
                      placeholderText="Select date"
                      className="w-full text-sm font-medium outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* GUESTS */}
                <div className="border rounded-lg mt-2 overflow-hidden mb-4">
                  <div className="p-3">
                    <p className="text-gray-500 text-sm mb-1">Guests</p>

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

                <button
                  onClick={() => {
                    navigate("/confirmation", {
                      state: {
                        placeDitails,
                        startDate,
                        endDate,
                        guests,
                      },
                    });
                  }}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold"
                >
                  Reserve
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          {/* Heading */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-2 text-3xl font-semibold">
              {placeDitails?.rating}
            </div>
            <h2 className="text-xl font-semibold mt-2">Guest Reviews</h2>
            <p className="text-gray-500 text-sm mt-1">
              This home is a highly rated based on ratings,reviews
            </p>
          </div>

          {/* Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleReviews.map((item, index) => {
              const rating = Number(item?.rating || 0);

              return (
                <div
                  key={index}
                  className="border rounded-xl p-5 bg-white shadow-sm"
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

          {/* Show all reviews */}
          {reviews.length > 3 && (
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="w-full mt-8 py-3 bg-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
            >
              {showAllReviews ? "Show less reviews" : "Show all reviews"}
            </button>
          )}

          {/* Location */}
          <div className="mt-10 border-t pt-6 pb-4">
            <h3 className="font-semibold mb-2">See Location on Map</h3>
            <p className="flex  pb-4 pt-2 items-center gap-2 text-gray-600 text-sm">
              <MapPin size={16} />
              {placeDitails.address}
            </p>
            <div className="h-[300px] w-full">
              {isLoaded && mapCenter && (
                <GoogleMap
                  zoom={17}
                  center={mapCenter}
                  mapContainerClassName="w-full h-full"
                >
                  <MarkerF
                    position={mapCenter}
                    size={50}
                    icon={{
                      url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    }}
                  />
                </GoogleMap>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowHotel;
