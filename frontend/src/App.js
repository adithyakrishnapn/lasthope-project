import Home from "./Pages/Home/Home";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from "./Pages/Signup/Signup";
import React from "react"
import Login from "./Pages/Login/Login";
import Dashboard from "./Pages/Dashboard/Dashboard";
import PrivateRoute from "./Firebase/Authentication/PrivateRoute/PrivateRoute";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import SignupEnc from "./Firebase/Authentication/PrivateRoute/SignupEnc";
import Lost from "./Pages/Lost/Lost";
import MoreItems from "./Pages/MoreItems/MoreItems";
import View from "./Pages/View/View";
import Chat from "./Pages/Chat/Chat";
import MessageList from "./Pages/MessageList/MessageList";
import About from "./Pages/About/About";


function App() {
  return (
    <div>
      <Router>
        <div>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={
              <SignupEnc>
                <Signup />
              </SignupEnc>
            } />
            <Route path="/login" element={
              <SignupEnc>
                <Login />
              </SignupEnc>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/lost" element={
              <PrivateRoute>
                <Lost />
              </PrivateRoute>
              } />
            <Route path="/more-items" element={<MoreItems />} />
            <Route path="/view" element={
                <View />
              } />
            <Route path="/chat" element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
              } />
            <Route path="/messagelist" element={
              <PrivateRoute>
                <MessageList />
              </PrivateRoute>
              } />
            <Route path="/about" element={<About />} />


          </Routes>
          <Footer />
        </div>
      </Router>
    </div>
  );
}

export default App;
