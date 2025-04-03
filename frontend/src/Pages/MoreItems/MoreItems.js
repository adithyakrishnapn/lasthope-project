import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './moreItems.css';

function MoreItems() {
    const [lostItems, setLostItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLostItems = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_GET_LOSTITEMS}`);
                setLostItems(response.data);
            } catch (error) {
                console.error('Error fetching lost items:', error);
                alert('Something went wrong while fetching the lost items.');
            }
        };

        fetchLostItems();
    }, []);

    return (
        <div className="more-items-container">
            <h2>More Lost Items</h2>
            <div className="row">
                {lostItems.length > 0 ? (
                    lostItems.map((item, index) => {
                        // Ensure that the image is a valid string before calling replace()
                        let imageURL = '/path/to/default-image.jpg'; // Default image path

                        if (item.image && typeof item.image === 'string') {
                            imageURL = `${process.env.REACT_APP_API_BASE_URL.replace(/\/$/, '')}/${item.image.replace(/^\//, '')}`;
                        }

                        // Parse the location string to access lat, lng, and placeName
                        let placeName = 'Location not available';
                        if (item.location) {
                            try {
                                // Check if location is a valid stringified JSON object
                                const locationObj = typeof item.location === 'string' ? JSON.parse(item.location) : item.location;
                                
                                // Ensure that placeName exists in the parsed location object
                                placeName = locationObj?.placeName || 'Location not available';
                            } catch (error) {
                                console.error('Error parsing location:', error);
                                placeName = 'Invalid location data';
                            }
                        }

                        return (
                            <div key={index} className="card">
                                <img
                                    src={imageURL} // Use imageURL with fallback to default image
                                    alt={item.name}
                                    className="card-img-top"
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{item.name}</h5>
                                    <p className="card-text">{placeName}</p> {/* Display location place name */}
                                    <div className="d-flex justify-content-between">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() =>
                                                navigate('/view', { state: { item } })
                                            } >
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center">No lost items found.</p>
                )}
            </div>
            <div className="back-to-top">
                <a href="#top">Back to Top</a>
            </div>
        </div>
    );
}

export default MoreItems;
