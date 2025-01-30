import React from 'react';
import ReactDOM from 'react-dom'; // Change this import
import App from './App';
import { AuthProvider } from './Firebase/Authentication/AuthContext/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';


const root = ReactDOM.createRoot(document.getElementById('root')); // Create a root

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root') // Pass the root element as the second argument
);
