import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../../Firebase/Authentication/AuthContext/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../Firebase/firebase-config";
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';

function Navbar() {
  const { user, setUser } = useContext(AuthContext);

  const handleLogOut = () => {
    signOut(auth)
      .then(() => {
        console.log("User Logged Out");
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = "/";
      })
      .catch((error) => {
        console.error("There occurred an error ", error);
      });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Lasthope</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink to="/about" className="nav-link" activeClassName="active">
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/lost" className="nav-link" activeClassName="active">
                Lost?
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/more-items" className="nav-link" activeClassName="active">
                View
              </NavLink>
            </li>
            {user ? (
              <>
                {/* Account Icon */}
                <li className="nav-item">
                  <NavLink to="/dashboard" className="nav-link" activeClassName="active">
                    <FontAwesomeIcon icon={faUser} size="lg" /> Account
                  </NavLink>
                </li>
                
                {/* Message List Icon */}
                <li className="nav-item">
                  <NavLink to="/messagelist" className="nav-link" activeClassName="active">
                    <FontAwesomeIcon icon={faEnvelope} size="lg" /> Messages
                  </NavLink>
                </li>

                {/* Logout */}
                <li className="nav-item">
                  <Link className="nav-link" to="" onClick={handleLogOut}>
                    LogOut
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/signup" className="nav-link" activeClassName="active">
                    Signup
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link" activeClassName="active">
                    Login
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
