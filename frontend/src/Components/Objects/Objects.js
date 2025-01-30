import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import './object.css';

function Objects() {
  const [lostItems, setLostItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_GET_LOSTITEMS}`);
        console.log('Fetched lost items:', response.data);
        setLostItems(response.data.slice(0, 4)); // Limit to 4 items
      } catch (error) {
        console.error('Error fetching lost items:', error);
      }
    };

    fetchLostItems();
  }, []);

  return (
    <div className="objects-container">
      <div className="row">
        {lostItems.length > 0 ? (
          lostItems.map((item, index) => {
            // Check if image exists, otherwise use a default image
            const imageURL = item.image
              ? `${process.env.REACT_APP_API_BASE_URL.replace(/\/$/, '')}/${item.image.replace(/^\//, '')}`
              : '/path/to/default/image.jpg'; // Use a default image path

            // Parse the location string to access placeName if it's stored as a JSON string
            let placeName = 'Location not available'; // Default location
            if (item.location && typeof item.location === 'string') {
              try {
                const locationObj = JSON.parse(item.location); // Parse the string into an object
                placeName = locationObj.placeName || 'Location not available';
              } catch (error) {
                console.error('Error parsing location:', error);
                placeName = 'Invalid location data';
              }
            } else if (item.location && typeof item.location === 'object') {
              placeName = item.location.placeName || 'Location not available';
            }

            console.log(`Image URL for item "${item.name}":`, imageURL);

            return (
              <div key={index} className="col-12 col-md-4 col-lg-3 p-2">
                <div className="objects-card">
                  <img
                    src={imageURL}
                    alt={item.name}
                    className="objects-card-img"
                  />
                  <div className="objects-card-body">
                    <h5 className="objects-card-title">{item.name}</h5>
                    <p className="objects-card-text text-muted text-lowercase">{placeName}</p> {/* Display parsed location */}
                    <div className="objects-btn-container">
                      <button
                        className="btn objects-btn msgbtn"
                        onClick={() =>
                          navigate('/view', { state: { item } })
                        }
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center">No lost items found.</p>
        )}
      </div>
      <div className="objects-view-more">
        <NavLink to="/more-items" className="btn btn-primary">
          View More
        </NavLink>
      </div>
    </div>
  );
}

export default Objects;
