import React, { useState } from "react";
import { auth, provider, createUserWithEmailAndPassword, signInWithPopup } from "../../Firebase/firebase-config";
import { useNavigate } from "react-router-dom";  // For redirecting after signup
import "./signup.css";
import UpdateLocation from "../../Components/UpdateLocataion/UpdateLocation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';


function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [gmap, setGmap] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate(); // Hook to navigate

  // Handle Normal Sign-Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      console.log("Normal Sign-Up User Info:", user);
  
      // Save user to MongoDB
      const response = await fetch(`${process.env.REACT_APP_CREATE_USER}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setUserId(data.userId); // Use MongoDB `_id`
        console.log("User saved in MongoDB:", data);
  
        // Store MongoDB user `_id` in localStorage
        localStorage.setItem("currentUser", JSON.stringify({ _id: data._id, email }));
  
        setGmap(true); // Proceed to UpdateLocation
      } else {
        console.log("Error saving user:", data.message);
      }
    } catch (error) {
      console.error("Error during normal sign-up:", error);
    }
  };
  

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Google Sign-In User Info:", user);
  
      // Save user to MongoDB
      const response = await fetch(`${process.env.REACT_APP_CREATE_USER}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user.displayName, email: user.email }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setUserId(data.userId); // Use MongoDB `_id`
        console.log("User saved in MongoDB:", data);
  
        // Store MongoDB user `_id` in localStorage
        localStorage.setItem("currentUser", JSON.stringify({ _id: data._id, email }));
  
        setGmap(true); // Proceed to UpdateLocation
      } else {
        console.log("Error saving user:", data.message);
      }
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  };
  

  return (
    <div className="signupPage">
      {gmap ? (
        <div className="gmpap">
          <UpdateLocation userId={userId} />
        </div>
      ) : (
        <div className="signupCard">
          <h2 className="signupHeading">Create Your Account</h2>
          <form className="signupForm" onSubmit={handleSignUp}>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email Id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary">Signup</button>
          </form>
          <div className="separator">
            <span>OR</span>
          </div>
          <button onClick={handleGoogleSignIn} className="btn btn-google">
            <FontAwesomeIcon icon={faGoogle} className="google-icon" /> Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
}

export default Signup;
