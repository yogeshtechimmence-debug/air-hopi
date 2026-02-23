import { useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../Base Url/ApiUrl";

const PaymentSuccess = () => {
  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get("paymentId") || "PAYPAL_TXN";
  useEffect(() => {
    const booked = localStorage.getItem("paypal_booked");

    if (booked) return;

    confirmPaypalBooking();
    localStorage.setItem("paypal_booked", "true");
  }, []);

  const confirmPaypalBooking = () => {
    const user_id = localStorage.getItem("user_id");

    const payload = new URLSearchParams();

    payload.append("user_id", user_id);
    payload.append("provider_id", localStorage.getItem("provider_id"));
    payload.append("place_id", localStorage.getItem("place_id"));

    payload.append("start_date", localStorage.getItem("checkIn"));
    payload.append("end_date", localStorage.getItem("checkOut"));
    payload.append("total_day", localStorage.getItem("totalDays"));

    payload.append("total_amount", localStorage.getItem("finalPrice"));
    payload.append("per_day_rate", localStorage.getItem("per_day_rate"));
    payload.append("final_total", localStorage.getItem("finalPrice"));

    payload.append("no_of_guest", localStorage.getItem("guestCount"));

    payload.append("unique_code", "AIR" + Date.now());

    payload.append("payment_status", "Complete");
    payload.append("payment_type", "PayPal");
    payload.append("payment_id", paymentId); 

    payload.append("description", "Booking confirmed via PayPal");

    axios
      .post(`${BASE_URL}/add_place_booking`, payload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then(() => {
        console.log("PayPal booking confirmed");
        localStorage.removeItem("place_id");
        localStorage.removeItem("provider_id");
        localStorage.removeItem("checkIn");
        localStorage.removeItem("checkOut");
        localStorage.removeItem("totalDays");
        localStorage.removeItem("finalPrice");
        localStorage.removeItem("guestCount");
        localStorage.removeItem("per_day_rate");
        localStorage.removeItem("paypal_booked");
      })
      .catch((err) => console.error("PayPal booking error", err));
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-green-600">
        🎉 Payment Successful
      </h1>
      <p>Your booking has been confirmed</p>
    </div>
  );
};

export default PaymentSuccess;
