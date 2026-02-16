import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import axios from "axios";
import { CreditCard } from "lucide-react";
import { BASE_URL } from "../Base Url/ApiUrl";
import { SyncLoader } from "react-spinners";

const CARD_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#32325d",
      "::placeholder": { color: "#aab7c4" },
    },
  },
};

const StripeCheckout = ({
  finalPrice,
  userId,
  providerId,
  placeId,
  onPaymentSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const { token, error } = await stripe.createToken(
        elements.getElement(CardNumberElement),
      );

      console.log("TOKEN ", token);

      if (error) {
        alert(error.message);
        return;
      }

      const payload = new URLSearchParams();
      payload.append("user_id", userId);
      payload.append("provider_id", providerId);
      payload.append("total_amount", finalPrice);
      payload.append("request_id", placeId);
      payload.append("payment_method", "CARD");
      payload.append("token", token.id);
      payload.append("currency", "INR");

      const res = await axios.post(`${BASE_URL}/strip_payment`, payload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      console.log("API RESPONSE ", res.data);

      if (res.data?.status === "1" || res.data) {
        onPaymentSuccess(token.id);
      } else {
        alert("Payment failed");
      }
    } catch (err) {
      console.error("STRIPE ERROR ", err);
      alert("Payment error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative space-y-4">
      {/* PROCESSING OVERLAY */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 z-20 flex flex-col items-center justify-center rounded-2xl">
          <SyncLoader color="#00c76a" size={10} speedMultiplier={0.6} />
          <p className="mt-4 text-sm text-gray-600 font-medium">
            Processing payment, please wait...
          </p>
        </div>
      )}

      {/* CARD NUMBER */}
      <div className="border rounded-lg p-3">
        <label className="text-sm text-gray-600">Card Number</label>
        <CardNumberElement options={CARD_OPTIONS} />
      </div>

      {/* EXPIRY + CVC */}
      <div className="flex gap-4">
        <div className="flex-1 border rounded-lg p-3">
          <label className="text-sm text-gray-600">Expiry</label>
          <CardExpiryElement options={CARD_OPTIONS} />
        </div>

        <div className="flex-1 border rounded-lg p-3">
          <label className="text-sm text-gray-600">CVC</label>
          <CardCvcElement options={CARD_OPTIONS} />
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-green-700 text-white py-3 rounded-xl disabled:opacity-60"
      >
        {loading ? "Processing..." : `Pay ₹${finalPrice}`}
      </button>
    </div>
  );
};

export default StripeCheckout;
