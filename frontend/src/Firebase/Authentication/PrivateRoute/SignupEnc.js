import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../AuthContext/AuthContext";

const SignupEnc = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);
  const location = useLocation(); // Get the current route
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (user) {
      if (location.pathname === "/signup") {
        // Wait for 2 minutes before redirecting on signup
        const timer = setTimeout(() => {
          setShouldRedirect(true);
        }, 2 * 60 * 1000); // 2 minutes in milliseconds

        // Cleanup the timer on unmount
        return () => clearTimeout(timer);
      } else {
        // Redirect immediately on login
        setShouldRedirect(true);
      }
    }
  }, [user, location.pathname]);

  if (isLoading) return <Navigate to="/login" />;

  // Redirect to home if the conditions are met
  if (user && shouldRedirect) {
    return <Navigate to="/" />;
  }

  return children; // Render children if no redirection happens
};

export default SignupEnc;
