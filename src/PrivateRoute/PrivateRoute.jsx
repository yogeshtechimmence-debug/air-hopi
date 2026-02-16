import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const user_id = localStorage.getItem("user_id");

  if (!user_id) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
