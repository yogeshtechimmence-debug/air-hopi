import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import axios from "axios";
import "../Css/datepicker.css";
import StripeCheckout from "../Payment/StripeCheckout";
import { BASE_URL } from "../Base Url/ApiUrl";
import { ArrowBigLeftIcon, CreditCard } from "lucide-react";
import { ApplePay } from "../Payment/ApplePay";

const Confirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { placeDitails, startDate, endDate, guests } = state || {};
  // console.log(placeDitails?.id);
  const maxGuests = placeDitails?.maximum_guest || 1;

  const [BookDate, setBookDate] = useState([]);
  const [guestCount, setGuestCount] = useState(guests || 1);

  const [checkIn, setCheckIn] = useState(
    startDate ? new Date(startDate) : null,
  );
  const [checkOut, setCheckOut] = useState(endDate ? new Date(endDate) : null);

  // ---------------------------------------------- Booking dates ------------------------------

  useEffect(() => {
    if (!placeDitails?.id) return;

    axios
      .get(`${BASE_URL}/get_booked_date_by_place`, {
        params: {
          place_id: placeDitails.id,
        },
      })
      .then((res) => {
        // console.log(res);
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

  const increaseGuests = () => {
    if (guestCount >= maxGuests) return;
    setGuestCount((prev) => prev + 1);
  };

  const decreaseGuests = () => {
    if (guestCount <= 1) return;
    setGuestCount((prev) => prev - 1);
  };

  const getTotalDays = () => {
    if (!checkIn || !checkOut) return 0;

    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalDays = getTotalDays();

  const pricePerNight = Number(placeDitails?.rent_per_night);
  const totalAmount = totalDays * pricePerNight;

  let discountPercent = 0;

  if (totalDays > 30 && Number(placeDitails?.month_off) > 0) {
    discountPercent = Number(placeDitails.month_off);
  } else if (totalDays > 7 && Number(placeDitails?.week_off) > 0) {
    discountPercent = Number(placeDitails.week_off);
  }

  const discountAmount = Math.round((totalAmount * discountPercent) / 100);
  const finalPrice = totalAmount - discountAmount;

  // ---------------------------------------------- Booking Confirm ------------------------------

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [paymentMethod, setPaymentMethod] = useState("paypal"); // paypal | card
  const [showStripe, setShowStripe] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // CARD BOOKING ----------------------------
  const BookingConfirm = (stripeToken) => {
    const user_id = localStorage.getItem("user_id");
    const payload = new URLSearchParams();

    payload.append("user_id", user_id);
    payload.append("provider_id", placeDitails.provider_details.id);
    payload.append("place_id", placeDitails.id);

    payload.append("start_date", formatDate(checkIn));
    payload.append("end_date", formatDate(checkOut));

    payload.append("total_day", totalDays);

    payload.append("total_amount", finalPrice);
    payload.append("per_day_rate", placeDitails.rent_per_night);
    payload.append("requesttotalamount", finalPrice);
    payload.append("final_total", finalPrice);

    payload.append("no_of_guest", guestCount);

    payload.append("unique_code", "AIR" + Date.now());
    payload.append("provider_amount", placeDitails.provider_amount || 0);
    payload.append("admin_commission", "0");

    payload.append("payment_status", "Complete");
    payload.append("payment_type", "Card");
    payload.append("payment_id", stripeToken);

    payload.append("description", "Booking confirmed via Stripe");
    payload.append("offer_code", "");
    payload.append("offer_id", "");

    payload.append(
      "date_time",
      new Date().toISOString().slice(0, 19).replace("T", " "),
    );

    axios
      .post(`${BASE_URL}/add_place_booking`, payload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((res) => {
        // console.log(res.data.result);

        setSuccessData({
          bookingId: res.data.result.id,
          totalAmount: res.data.result.total_amount,
        });

        setShowSuccessModal(true);
      })
      .catch((err) => console.error("BOOKING ERROR 👉", err));
  };

  const user_id = localStorage.getItem("user_id");

  return (
    <div>
      <div className="bg-gray-50">
        <div className="min-h-screen bg-gray-50 py-6 px-4">
          <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col lg:flex-row">
            {/* LEFT IMAGE */}
            <div className="w-full lg:w-1/2">
              <img
                src={placeDitails?.places_image[0]?.image}
                alt="Hotel"
                className="w-full h-64 lg:h-full object-cover"
              />
            </div>

            {/* RIGHT CONTENT */}
            <div className="w-full lg:w-1/2 p-6 lg:p-8 space-y-6">
              {/* Hotel Info */}
              <div>
                <h2 className="text-2xl font-semibold">Hotel Royal Palace</h2>
                <p className="text-gray-500">
                  Luxury stay in the heart of the city
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 border rounded-xl p-4">
                {/* Check-in */}
                <div>
                  <p className="text-sm text-gray-500">Check-in</p>

                  <DatePicker
                    selected={checkIn}
                    onChange={(date) => {
                      setCheckIn(date);
                      setCheckOut(null);
                    }}
                    minDate={new Date()} // aaj se pehle disable
                    filterDate={(date) => !isDateDisabled(date)}
                    placeholderText="Select date"
                    className="w-full font-medium outline-none cursor-pointer"
                  />
                </div>

                {/* Check-out */}
                <div>
                  <p className="text-sm text-gray-500">Check-out</p>

                  <DatePicker
                    selected={checkOut}
                    onChange={(date) => setCheckOut(date)}
                    minDate={checkIn}
                    filterDate={(date) => {
                      if (!checkIn) return false;

                      let current = new Date(checkIn);

                      while (current <= date) {
                        if (isDateDisabled(current)) return false;
                        current.setDate(current.getDate() + 1);
                      }
                      return true;
                    }}
                    placeholderText="Select date"
                    className="w-full font-medium outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="border rounded-xl p-4">
                <p className="text-sm text-gray-500">Guests</p>

                <div className="flex w-28 items-center justify-between mt-2">
                  {/* Decrement */}
                  <button
                    onClick={decreaseGuests}
                    className="w-8 h-8 rounded-full border flex items-center justify-center text-lg hover:bg-gray-100 disabled:opacity-40"
                    disabled={guestCount <= 1}
                  >
                    −
                  </button>

                  {/* Count */}
                  <p className="font-medium text-lg">{guestCount}</p>

                  {/* Increment */}
                  <button
                    onClick={increaseGuests}
                    disabled={guestCount >= maxGuests}
                    className="w-8 h-8 rounded-full border flex items-center justify-center text-lg hover:bg-gray-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Special Request */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Special Request</p>
                <textarea
                  placeholder="Add any special requests (optional)"
                  className="
                  w-full border rounded-xl p-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-600"
                  rows={3}
                />
              </div>

              {/* Price */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    ₹{pricePerNight} × {totalDays} nights
                  </span>
                  <span>₹{totalAmount}</span>
                </div>

                {discountPercent > 0 && discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>{discountPercent}% long stay discount</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>₹{finalPrice}</span>
                </div>
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
                {/* PayPal */}
                <div
                  onClick={() => setPaymentMethod("paypal")}
                  className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer
                            ${
                              paymentMethod === "paypal"
                                ? "border-green-600 bg-green-50"
                                : "border-gray-300"
                            }
                          `}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://i.ibb.co/FLJJrNPG/Pay-Pal-svg.png"
                      className="w-20 h-6"
                      alt="PayPal"
                    />
                  </div>

                  <input
                    type="radio"
                    checked={paymentMethod === "paypal"}
                    readOnly
                  />
                </div>

                {/* Card */}
                <div
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer
                           ${
                             paymentMethod === "card"
                               ? "border-green-600 bg-green-50"
                               : "border-gray-300"
                           }
                         `}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5" />
                    <span className="text-sm font-medium">Card</span>
                  </div>

                  <input
                    type="radio"
                    checked={paymentMethod === "card"}
                    readOnly
                  />
                </div>

                <div
                  onClick={() => setPaymentMethod("applepay")}
                  className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer
                      ${
                        paymentMethod === "applepay"
                          ? "border-black bg-gray-100"
                          : "border-gray-300"
                      }
                    `}
                >
                  <span className="flex">
                    <img
                      className="w-5 h-6"
                      src="https://i.ibb.co/Kp2s2Lpm/images.png"
                      alt=""
                    />{" "}
                    <p className="pl-2 pt-1 font-bold text-sm"> Apple Pay</p>
                  </span>
                  <input
                    type="radio"
                    checked={paymentMethod === "applepay"}
                    readOnly
                  />
                </div>
              </div>

              <button className="w-full bg-gray-300 text-black hover:bg-gray-400 hover:text-white py-3 rounded-xl font-semibold">
                <a
                  className="no-underline hover:no-underline hover:text-white"
                  href="https://techimmense.in/airhopi/cancelation_page.html"
                >
                  Cancelation Policy
                </a>
              </button>

              <button
                onClick={() => {
                  if (paymentMethod === "paypal") {
                    localStorage.setItem("place_id", placeDitails.id);
                    localStorage.setItem(
                      "provider_id",
                      placeDitails.provider_details.id,
                    );
                    localStorage.setItem("checkIn", checkIn.toDateString());
                    localStorage.setItem("checkOut", checkOut.toDateString());
                    localStorage.setItem("totalDays", totalDays);
                    localStorage.setItem("finalPrice", finalPrice);
                    localStorage.setItem("guestCount", guestCount);
                    localStorage.setItem(
                      "per_day_rate",
                      placeDitails.rent_per_night,
                    );

                    window.location.href = 
                    `https://techimmense.in/airhopi/webservice/paypalAPI?request_id=${placeDitails?.id}&total_amount=${totalAmount}&currency=GBP`;
                  }

                  if (paymentMethod === "card") {
                    setShowStripe(true);
                  }
                }}
                disabled={paymentMethod === "applepay"}
                className="w-full mt-3 bg-green-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold"
              >
                Continue & Pay
              </button>

              {paymentMethod === "applepay" && (
                <ApplePay
                  amount={finalPrice}
                  onSuccess={() => {
                    BookingConfirm();
                  }}
                />
              )}

              {/* Stripe Payment */}
              {showStripe && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  {/* Backdrop */}
                  <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setShowStripe(false)}
                  />

                  {/* Modal box */}
                  <div className="relative z-10 w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Pay with Card</h2>
                      <button
                        onClick={() => setShowStripe(false)}
                        className="text-gray-500 hover:text-black text-xl"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Stripe Checkout */}
                    <StripeCheckout
                      finalPrice={finalPrice}
                      userId={user_id}
                      providerId={placeDitails.provider_details.id}
                      placeId={placeDitails.id}
                      onPaymentSuccess={() => {
                        BookingConfirm();
                        setShowStripe(false);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {showSuccessModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
                <h2 className="text-2xl font-bold text-green-700">
                  🎉 Booking Successful
                </h2>

                <p className="mt-2 text-gray-600">
                  Your payment was successful via Stripe
                </p>

                <div className="mt-4 text-sm text-gray-700 space-y-1">
                  <p>
                    <b>Booking ID:</b> {successData?.bookingId}
                  </p>
                  <p>
                    <b>Paid Amount:</b> ₹{successData?.totalAmount}
                  </p>
                </div>

                <div className="mt-6 flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      navigate("/booking");
                    }}
                    className="bg-green-700 text-white px-6 py-2 rounded-lg"
                  >
                    View Bookings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
