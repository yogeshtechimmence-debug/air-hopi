import axios from "axios";
import { MapPin, Calendar, ArrowBigLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { BASE_URL } from "../Base Url/ApiUrl";
import { useNavigate } from "react-router-dom";
import { SyncLoader } from "react-spinners";

const Bookings = () => {
  const Navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");
  const [booking, setBooking] = useState([]);
  const [completed, setCompleted] = useState([]);

  const dataToShow = activeTab === "bookings" ? booking : completed;

  useEffect(() => {
    if (activeTab === "bookings") {
      fetchBookings();
    } else if (activeTab === "completed") {
      fetchCompleteBooking();
    }
  }, [activeTab]);

  // ------------------------------- BOOKING ---------------------------------------------------

  const fetchBookings = () => {
    const user_id = localStorage.getItem("user_id");

    axios
      .get(`${BASE_URL}/get_user_book_place_list`, {
        params: {
          user_id: user_id,
        },
      })
      .then((res) => {
        // console.log(res.data.result);
        setBooking(res.data.result || []);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // ------------------------------- complete ---------------------------------------------------

  const fetchCompleteBooking = () => {
    const user_id = localStorage.getItem("user_id");

    axios
      .get(`${BASE_URL}/get_user_book_place_history_list`, {
        params: {
          user_id: user_id,
        },
      })
      .then((res) => {
        // console.log(res.data);
        setCompleted(res.data.result || []);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // ------------------------------- Cancel Booking ---------------------------------------------------

  const CancelBooking = (item) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!isConfirmed) return;

    axios
      .get(`${BASE_URL}/change_book_place_request_status`, {
        params: {
          provider_id: item.provider_details.id,
          place_booking_id: item.id,
          status: "Cancel",
        },
      })
      .then((res) => {
        if (activeTab === "bookings") {
          fetchBookings();
        } else if (activeTab === "completed") {
          fetchCompleteBooking();
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div>
      <div className="ml-5 cursor-pointer pt-2 flex pb-3">
        <div
          onClick={() => Navigate(-1)}
          className="flex items-center gap-1 cursor-pointer"
        >
          <ArrowBigLeftIcon />
          <span>Back</span>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex-1 py-3 rounded-full font-medium ${
              activeTab === "bookings"
                ? "bg-green-700 text-white"
                : "bg-gray-100"
            }`}
          >
            Bookings
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-3 rounded-full font-medium ${
              activeTab === "completed"
                ? "bg-green-700 text-white"
                : "bg-gray-100"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Cards */}
        {!dataToShow || dataToShow.length === 0 ? (
          <div className="flex justify-center items-center py-10">
            <SyncLoader color="#00c76a" size={10} speedMultiplier={0.6} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataToShow.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-md p-5">
                {/* Header */}
                <div className="flex gap-4">
                  <img
                    src={item?.place_details?.places_image[0]?.image}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">
                      {item.place_details.place_name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={14} />
                      {item.place_details.address}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-gray-400">Check in</p>
                    <p className="flex items-center gap-1 font-medium">
                      <Calendar size={14} className="text-green-600" />
                      {item.start_date.slice(0, 15)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Check out</p>
                    <p className="flex items-center gap-1 font-medium">
                      <Calendar size={14} className="text-green-600" />
                      {item.end_date.slice(0, 15)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Payment</p>
                    <p className="font-medium text-green-700">
                      {item.payment_type}
                    </p>
                  </div>
                </div>

                {activeTab === "completed" && (
                  <div>
                    <p
                      className={`font-medium mt-2 ${
                        item.status === "Complete"
                          ? "text-green-700"
                          : item.status === "Cancel"
                            ? "text-red-600"
                            : "text-gray-500"
                      }`}
                    >
                      {item.status}
                    </p>
                  </div>
                )}

                {/* Button */}
                {activeTab === "bookings" && (
                  <div className="mt-5 text-right">
                    <button
                      onClick={() => CancelBooking(item)}
                      className="px-5 py-2 border border-green-700 text-green-700 rounded-full text-sm hover:bg-green-700 hover:text-white transition"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
