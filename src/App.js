import { Routes, Route, useLocation } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Location from "./Components/Pages/Location";
import HomePage from "./Components/Pages/HomePage";
import ShowHotel from "./Components/Pages/ShowHotel";
import Footer from "./Components/Pages/Footer";
import Navbar from "./Components/Pages/Navbar";
import Bookings from "./Components/Pages/Bookings";
import Favorites from "./Components/Pages/Favorites";
import ProfilePage from "./Components/Pages/ProfilePage";
import AboutUs from "./Components/Pages/AboutUs";
import Confirmation from "./Components/Pages/Confirmation";
import PrivateRoute from "./PrivateRoute/PrivateRoute";
import PaymentSuccess from "./Components/Pages/PaymentSuccess";
import PaymentCancel from "./Components/Pages/PaymentCancel";
import ShowHoteLImage from "./Components/Pages/ShowHoteLImage";

const stripePromise = loadStripe(
  "pk_test_51Sng0N9dSsEpDSwkwI6w7w4vliA3nJlzTBNxGhuq0vwDkxUXKprz1sBcZxpu2MhkBHfsX1IgQB0Q49Jn1qUX5nsG00rJayTX0t",
);

const App = () => {
  const location = useLocation();

  const hideFooterRoutes = [
    "/booking",
    "/myfavorites",
    "/profile",
    "/confirmation",
  ];

  const hideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <Elements stripe={stripePromise}>
      <Navbar className="" />

      <div className="pt-14">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/location" element={<Location />} />
          <Route path="/showhotel/:place_id" element={<ShowHotel />} />
          <Route path="/payment_done" element={<PaymentSuccess />} />
          <Route path="/hotel_images" element={<ShowHoteLImage />} />

          <Route path="/paypal_cancel" element={<PaymentCancel />} />

          {/* Protected Routes */}
          <Route
            path="/booking"
            element={
              <PrivateRoute>
                <Bookings />
              </PrivateRoute>
            }
          />

          <Route
            path="/about"
            element={
              <PrivateRoute>
                <AboutUs />
              </PrivateRoute>
            }
          />
          <Route
            path="/myfavorites"
            element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/confirmation"
            element={
              <PrivateRoute>
                <Confirmation />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>

      {!hideFooter && <Footer />}
    </Elements>
  );
};

export default App;
