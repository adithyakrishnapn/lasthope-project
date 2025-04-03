import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../Firebase/Authentication/AuthContext/AuthContext';
import './MessageList.css';
import Chat from '../Chat/Chat';

function MessageList() {
  const [messages, setMessages] = useState([]); // Store all messages for the user
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null); // Track the selected message
  const [itemNames, setItemNames] = useState({}); // Store item names by itemId
  const navigate = useNavigate();
  const { user, isLoading } = useContext(AuthContext); // Get user and loading state from context

  useEffect(() => {
    if (isLoading) {
      return; // Don't run the logic if auth state is still loading
    }

    if (!user) {
      console.log('User not logged in, redirecting to login...');
    } else {
      fetchUserData(user.email); // Fetch the user data from the backend using email
    }
  }, [user, isLoading, navigate]);

  const fetchUserData = async (email) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_FETCH_USER}`, {
        params: { email }, // Pass the email to the backend
      });

      console.log('Fetched user data:', response.data); // Log user data for debugging
      fetchMessages(response.data); // Fetch messages for the logged-in user
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchMessages = async (userData) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/messages`);
      console.log('Fetched messages:', response.data); // Log all fetched messages

      const allMessages = response.data;

      // Create a Set to keep track of unique message IDs
      const uniqueMessages = new Map();

      // Fetch item names and filter messages where the user is involved
      const itemNamePromises = allMessages.map(async (message) => {
        if (
          (message.senderEmail === userData.email || message.receiverEmail === userData.email) &&
          !uniqueMessages.has(message.itemId)
        ) {
          uniqueMessages.set(message.itemId, message);

          // Fetch the item details using itemId
          try {
            const itemResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/get-lost-item`, {
              params: { itemId: message.itemId },
            });
            const itemName = itemResponse.data.item?.name || 'Unknown Item'; // Default if no name found
            setItemNames((prev) => ({ ...prev, [message.itemId]: itemName }));
          } catch (error) {
            console.error('Error fetching item details:', error);
            setItemNames((prev) => ({ ...prev, [message.itemId]: 'Unknown Item' }));
          }
        }
      });

      // Wait for all item details to be fetched
      await Promise.all(itemNamePromises);

      console.log('Unique messages for user:', Array.from(uniqueMessages.values())); // Log filtered messages
      setMessages(Array.from(uniqueMessages.values())); // Update state with the filtered messages
      setLoading(false); // Set loading state to false once messages are fetched
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false); // Stop loading on error
    }
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
  
    // Ensure message is set before accessing its properties
    console.log("Sender : ", message.senderEmail);
    console.log("Receiver : ", message.receiverEmail);
  };
  

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="message-list">
      <div className="messages">
        <h1>Messages</h1>
        {messages.length === 0 ? (
          <p>No messages available.</p> // If no messages for the user
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className="message-item"
              onClick={() => handleMessageClick(message)} // Trigger chat with the selected message
            >
              <h3>{itemNames[message.itemId] || 'Untitled Message'}</h3> {/* Show item name or default */}
              <p>Sender: {message.senderEmail}</p>
              <p>Receiver: {message.receiverEmail}</p>
            </div>
          ))
        )}
      </div>

      {selectedMessage && (
        <div className="chat-container">
          <Chat
            itemId={selectedMessage.itemId}
            senderEmail={selectedMessage.senderEmail}
            receiverEmail={selectedMessage.receiverEmail}
            messages={messages.filter(
              (message) =>
                message.senderEmail === selectedMessage.senderEmail ||
                message.receiverEmail === selectedMessage.receiverEmail
            )}
          />
        </div>
      )}
    </div>
  );
}

export default MessageList;
