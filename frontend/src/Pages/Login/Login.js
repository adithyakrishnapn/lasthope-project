import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword, provider, signInWithPopup } from '../../Firebase/firebase-config';
import { useNavigate } from 'react-router-dom';  // For redirecting after login
import './Login.css';  // Import the CSS for styling

// Import FontAwesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Hook to navigate

  // Handle Normal Login with Firebase
  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('Normal Login User Info:', user);

        // Save user data to localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Fetch user data from MongoDB to verify session
        fetch(`${process.env.REACT_APP_FETCH_USER}?email=${user.email}`)
          .then((response) => response.json())
          .then((data) => {
            console.log('User fetched from DB:', data);
            // Redirect to MessageList after successful login
          })
          .catch((error) => console.error('Error fetching user:', error));
      })
      .catch((error) => {
        console.error('Error during login:', error.message);
      });
  };

  // Handle Google Login
  const handleGoogleSignIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log('Google Login User Info:', user);

        // Save user data to localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Fetch user data from MongoDB
        fetch(`${process.env.REACT_APP_FETCH_USER}?email=${user.email}`)
          .then((response) => response.json())
          .then((data) => {
            console.log('User fetched from DB:', data);
            // Redirect to MessageList after successful login
            navigate('/');
          })
          .catch((error) => console.error('Error fetching user:', error));
      })
      .catch((error) => {
        console.error('Error during Google login:', error);
      });
  };

  return (
    <div className="signupPage">
      <div className="loginForm">
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter your email Id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <input type="submit" value="Login" />
        </form>
        <hr />
        {/* Google Login button styled like the signup form */}
        <button className="google-login" onClick={handleGoogleSignIn}>
          <FontAwesomeIcon icon={faGoogle} className="google-icon" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
