import React, { useContext, useEffect, useState } from 'react';
import { data, useLocation, useNavigate } from 'react-router-dom';
import './View.css'; // Keep the existing CSS
import { AuthContext } from '../../Firebase/Authentication/AuthContext/AuthContext';
import Chat from '../Chat/Chat'; // Import the Chat component

function View() {
    const { user } = useContext(AuthContext); // Access the logged-in user context
    const location = useLocation();
    const navigate = useNavigate();
    const [receiverName, setReceiverName] = useState('');
    const [senderEmail, setSenderEmail] = useState(user?.email); // Current user's email
    const [receiverEmail, setReceiverEmail] = useState(''); // Receiver's email
    const [showChat, setShowChat] = useState(false); // State to control chat visibility
    const item = location.state?.item;

    // Fetch receiver name using the item.userid (the receiver's email)
    useEffect(() => {
        const fetchReceiverName = async () => {
            if (item?.userid) {
                try {
                    console.log('Fetching receiver name for userId:', item.userid);
                    console.log('item id is : ', item._id);
                    // Use fetch instead of axios to get the user info
                    const response = await fetch(`${process.env.REACT_APP_FETCH_USERID}?userId=${item.userid}`);
                    const data = await response.json();

                    console.log('User fetched from DB:', data); // Log the fetched user
                    console.log('User Email:', data.email);
                    console.log("The username is:", data.username);
                    setReceiverName(data.username);  // Assuming API returns the username
                    setReceiverEmail(data.email);
                    console.log("Dude check this out :", receiverEmail);
                } catch (error) {
                    console.error('Error fetching receiver name:', error);
                }
            }
        };

        if (item?.userid) {
            fetchReceiverName();
        }

        if (user?.email) {
            setSenderEmail(user.email);
            console.log("Sender email is:", user.email);
        }

        console.log("The sender email:", senderEmail);
        console.log("The receiver email:", receiverEmail);
        console.log("The item ID:", item._id);

    }, [item, user,receiverEmail]); // Re-run this effect when item or user changes

    if (!item) {
        return <p className="text-center text-gray-500">Item details not available.</p>;
    }

    const itemImageURL = item.image
        ? `${process.env.REACT_APP_API_BASE_URL.replace(/\/$/, '')}/${item.image.replace(/^\//, '')}`
        : '/path/to/default/image.jpg';

    // Corrected location handling
    let placeName = 'Location not available';
    if (item.location) {
        try {
            // If item.location is a string, parse it as a JSON object
            if (typeof item.location === 'string') {
                const locationObj = JSON.parse(item.location); // Parse the string into an object
                placeName = locationObj.placeName || 'Location not available';
            } else if (typeof item.location === 'object' && item.location.placeName) {
                // If item.location is already an object, directly use placeName
                placeName = item.location.placeName;
            }
        } catch (error) {
            console.error('Error parsing location:', error);
            placeName = 'Invalid location data';
        }
    }

    const handleMessageClick = () => {
        if (!user) {
            // If user is not logged in, show an alert or redirect to login page
            alert('Please log in to start a conversation.');
            navigate('/login'); // Redirect to login page
            return;
        }

        // Show chat interface for everyone, not just sender or receiver
        setShowChat(true);
    };

    // Conditionally render either item details or chat
    return (
        <div className="view-container max-w-screen-lg mx-auto p-6">
            {showChat ? (
                // Render Chat component when showChat is true
                <>
                {console.log('Chat Component Data:', { itemId: item._id, senderEmail, receiverEmail, receiverName })}
                <Chat 
                    itemId={item._id}
                    senderEmail={senderEmail} 
                    receiverEmail={receiverEmail} 
                    receiverName={receiverName} 
                />
            </>
            ) : (
                <div className="item-details-container bg-white rounded-lg shadow-lg p-6">
                    <div className="row">
                        <div className="item-image mb-6 col-12 col-md-6">
                            <img
                                src={itemImageURL}
                                alt={item.name}
                                className="w-full h-80 object-cover rounded-lg shadow-md"
                            />
                        </div>
                        <div className="item-info col-12 col-md-6">
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{item.name}</h1>
                            <p className="text-lg text-gray-700 mb-4">
                                <strong>Status:</strong> {item.found ? "Successfully Founded" : 'No Data'}
                            </p>
                            <p className="text-lg text-gray-700 mb-4">
                                <strong>Place:</strong> {placeName}
                            </p>
                            <p className="text-lg text-gray-700 mb-6">
                                <strong>Description:</strong> {item.description || 'No description available'}
                            </p>
                            <button
                                className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                                onClick={handleMessageClick}
                            >
                                Message Owner
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default View;
