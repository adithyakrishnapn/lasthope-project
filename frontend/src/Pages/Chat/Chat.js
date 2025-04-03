import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import "./Chat.css"

function Chat({ itemId, senderEmail, receiverEmail }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const [itemName, setItemName] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);
    const socket = useRef(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const sentMessagesRef = useRef(new Set());

    // Add this to determine if current user is receiver
    const isReceiver = currentUser?.email === receiverEmail;

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (itemId && currentUser?.email) {
            initializeSocket();
            fetchItemDetails();
            fetchMessages();
        }
        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [itemId, currentUser?.email]);

    const initializeSocket = () => {
        if (!process.env.REACT_APP_API_BASE_URL) {
            console.error('API Base URL not configured');
            return;
        }
    
        socket.current = io(process.env.REACT_APP_API_BASE_URL, {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnectionAttempts: 5,
        });
    
        socket.current.on('connect', () => {
            console.log('Socket connected:', socket.current.id);
            setSocketConnected(true);
    
            // Create room ID using both emails regardless of who is sender/receiver
            const participants = [senderEmail, receiverEmail].sort();
            const roomId = `${itemId}-${participants[0]}-${participants[1]}`;
            console.log('Joining room:', roomId);
            socket.current.emit('joinRoom', { roomId });
        });
    
        socket.current.on('receiveMessage', (newMessage) => {
            const messageKey = `${newMessage.timestamp}-${newMessage.senderEmail}`;
            if (!sentMessagesRef.current.has(messageKey)) {
                setMessages(prevMessages => {
                    const messageExists = prevMessages.some(msg => 
                        msg.timestamp === newMessage.timestamp && 
                        msg.senderEmail === newMessage.senderEmail
                    );
                    return messageExists ? prevMessages : [...prevMessages, newMessage];
                });
            }
        });
    
        socket.current.on('disconnect', () => {
            console.log('Socket disconnected');
            setSocketConnected(false);
        });
    
        socket.current.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setSocketConnected(false);
            setError('Connection error. Please check your internet connection.');
        });
    };

    const fetchMessages = async () => {
        try {
            // Use both sender and receiver emails in both orders to get all messages
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/get-messages`, {
                params: { 
                    itemId,
                    // If current user is receiver, swap the order
                    senderEmail: isReceiver ? receiverEmail : senderEmail,
                    receiverEmail: isReceiver ? senderEmail : receiverEmail
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data.messages) {
                setMessages(response.data.messages);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Error loading messages. Please try again.');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketConnected) return;

        const participants = [senderEmail, receiverEmail].sort();
        const roomId = `${itemId}-${participants[0]}-${participants[1]}`;
        const timestamp = new Date().toISOString();

        const messageData = {
            // Use correct sender/receiver based on current user
            senderEmail: currentUser.email,
            receiverEmail: isReceiver ? senderEmail : receiverEmail,
            itemId: itemId.toString(),
            message: newMessage.trim(),
            timestamp,
            roomId
        };

        const messageKey = `${timestamp}-${currentUser.email}`;
        sentMessagesRef.current.add(messageKey);

        try {
            setError('');
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/create-chat`,
                messageData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.status === 201) {
                setMessages(prevMessages => [...prevMessages, messageData]);
                setNewMessage('');
                socket.current.emit('sendMessage', messageData);
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message. Please try again.');
            sentMessagesRef.current.delete(messageKey);
        }
    };

    const fetchItemDetails = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/get-lost-item`, {
                params: { itemId },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setItemName(response.data.item?.name || 'Unknown Item');
        } catch (err) {
            setError('Error fetching item details');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };
    // Rest of the component remains the same...

    return (
        <div className="chat-container">
            <h1 className="text-xl font-bold mb-4">Chat regarding item: {itemName}</h1>
            
            {!socketConnected && (
                <div className="bg-yellow-100 p-2 mb-4 rounded text-yellow-800">
                    Real-time updates unavailable. Messages may be delayed.
                </div>
            )}
            
            {error && (
                <div className="bg-red-100 p-2 mb-4 rounded text-red-800">
                    {error}
                </div>
            )}

            <div className="chat-history" ref={messagesContainerRef}>
                {messages.length === 0 ? (
                    <p className="text-center text-gray-500 my-4">
                        No messages yet. Start the conversation.
                    </p>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={`${msg.timestamp}-${index}`}
                            className={`message ${msg.senderEmail === currentUser.email ? 'sent' : 'received'}`}
                        >
                            <p>{msg.message}</p>
                            <small>{new Date(msg.timestamp).toLocaleString()}</small>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-container">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="chat-input"
                    placeholder="Type your message..."
                    rows="2"
                />
                <button 
                    type="submit" 
                    className={`send-button ${!newMessage.trim() || !socketConnected ? 'disabled' : 'active'}`}
                    disabled={!newMessage.trim() || !socketConnected}
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default Chat;