// UpdateLocation.js
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./UpdateLocation.css";
import { Navigate } from "react-router-dom";

function UpdateLocation({ userId }) {
  const [location, setLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const initMap = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 10.8505, lng: 76.2711 }, // Default location
        zoom: 10,
      });

      const input = document.getElementById("searchInput");
      const searchBox = new window.google.maps.places.SearchBox(input);

      map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(input);

      let marker = new window.google.maps.Marker({
        map,
        draggable: true,
      });

      searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;

        const place = places[0];
        const location = place.geometry.location;

        map.setCenter(location);
        map.setZoom(15);

        marker.setPosition(location);
        setLocation({
          lat: location.lat(),
          lng: location.lng(),
          address: place.formatted_address,
        });
      });

      marker.addListener("dragend", () => {
        const position = marker.getPosition();
        setLocation({
          lat: position.lat(),
          lng: position.lng(),
          address: null,
        });
      });
    };

    if (window.google) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    }
  }, []);

  const saveLocation = async () => {
    if (!userId || !location) {
      alert("User ID or location is missing.");
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_UPDATE_LOCATION}`, {
        userId,
        location,
      });
      alert(`Location saved successfully: ${JSON.stringify(location)}`);
      console.log("Response from server:", response.data);
      window.location.href="/dashboard";
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Failed to save location. Please try again.");
    }
  };

  return (
    <div>
      <div id="mapContainer">
        <input
          id="searchInput"
          type="text"
          placeholder="Search for a location"
        />
        <div
          ref={mapRef}
          style={{ width: "100%", height: "400px", marginTop: "10px" }}
        ></div>
        <button onClick={saveLocation}>Save Location</button>
      </div>
    </div>
  );
}

export default UpdateLocation;
