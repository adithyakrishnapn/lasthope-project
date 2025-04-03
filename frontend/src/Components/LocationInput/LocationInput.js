import React, { useState, useEffect } from 'react';

const LocationInput = ({ setLocation }) => {
  const [locationValue, setLocationValue] = useState('');

  useEffect(() => {
    let searchBox;
    let map;

    const initMap = () => {
      map = new google.maps.Map(document.createElement('div'), {
        center: { lat: 0, lng: 0 },
        zoom: 15,
      });

      const input = document.getElementById('location-input');
      searchBox = new google.maps.places.SearchBox(input);

      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;

        const place = places[0];
        const location = place.geometry.location;
        const name = place.formatted_address;

        setLocation({
          lat: location.lat(),
          lng: location.lng(),
          placeName: name,
        });
        setLocationValue(name);
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            map.setCenter(userLocation);
            new google.maps.Marker({
              position: userLocation,
              map: map,
            });
          },
          (error) => {
            console.error('Geolocation error:', error.message);
          }
        );
      }
    };

    const loadGoogleMapsScript = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.onload = initMap;
        document.body.appendChild(script);
      } else {
        initMap();
      }
    };

    loadGoogleMapsScript();

    // Cleanup resources on unmount
    return () => {
      if (searchBox) {
        google.maps.event.clearInstanceListeners(searchBox);
      }
    };
  }, [setLocation]);

  return (
    <div>
      <label htmlFor="location">Location:</label>
      <input
        type="text"
        id="location-input"
        value={locationValue}
        onChange={(e) => setLocationValue(e.target.value)}
        placeholder="Search for a location"
        required
      />
    </div>
  );
};

export default LocationInput;
