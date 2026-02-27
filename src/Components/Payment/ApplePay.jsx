import {
  useStripe,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";

export const ApplePay = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: "IN",
      currency: "inr",
      total: {
        label: "Total",
        amount: amount * 100,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      console.log("Apple Pay support:", result);
      if (result?.applePay) {
        setPaymentRequest(pr);
      }
    });
    

    pr.on("paymentmethod", async (e) => {
      // Normally yahan backend call hoti hai
      // abhi demo success
      e.complete("success");
      onSuccess();
    });
  }, [stripe, amount]);

  if (!paymentRequest) return null;

  return (
    <PaymentRequestButtonElement
      options={{ paymentRequest }}
      className="w-full"
    />
  );
};
