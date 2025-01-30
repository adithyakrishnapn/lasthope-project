import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './Chat.css';

function Chat({ itemId, senderEmail, receiverEmail }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const [itemName, setItemName] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);
    const socket = useRef(null);
    const messagesEndRef = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        socket.current = io(process.env.REACT_APP_API_BASE_URL, {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnectionAttempts: 5,
        });

        socket.current.on('connect', () => {
            console.log('✅ Socket connected:', socket.current.id);
            setSocketConnected(true);

            // Create a unique room ID that will be the same for both sender and receiver
            const participants = [currentUser.email, currentUser.email === senderEmail ? receiverEmail : senderEmail].sort();
            const roomId = `${itemId}-${participants[0]}-${participants[1]}`;
            
            socket.current.emit('joinRoom', { roomId });
            console.log(`📌 Joining room: ${roomId}`);
        });

        socket.current.on('receiveMessage', (newMessage) => {
            console.log('📩 New message received:', newMessage);
            setMessages(prevMessages => {
                // Check if message already exists to prevent duplicates
                const messageExists = prevMessages.some(msg => 
                    msg.timestamp === newMessage.timestamp && 
                    msg.senderEmail === newMessage.senderEmail
                );
                
                if (!messageExists) {
                    return [...prevMessages, newMessage];
                }
                return prevMessages;
            });
        });

        socket.current.on('disconnect', (reason) => {
            console.log('⚠️ Socket disconnected:', reason);
            setSocketConnected(false);
        });

        socket.current.on('connect_error', (err) => {
            console.error('❌ Connection error:', err.message);
            setSocketConnected(false);
        });
    };

    const fetchItemDetails = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/get-lost-item`, { params: { itemId } });
            setItemName(response.data.item?.name || 'Unknown Item');
        } catch (err) {
            console.error('Error fetching item details:', err);
            setError('Error fetching item details');
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/get-messages`, {
                params: { 
                    itemId,
                    senderEmail: currentUser.email,
                    receiverEmail: currentUser.email === senderEmail ? receiverEmail : senderEmail
                }
            });
            setMessages(response.data.messages || []);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Error loading messages. Please try again.');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketConnected) return;

        const participants = [currentUser.email, currentUser.email === senderEmail ? receiverEmail : senderEmail].sort();
        const roomId = `${itemId}-${participants[0]}-${participants[1]}`;

        const messageData = {
            senderEmail: currentUser.email,
            receiverEmail: currentUser.email === senderEmail ? receiverEmail : senderEmail,
            itemId: itemId.toString(),
            message: newMessage.trim(),
            timestamp: new Date().toISOString(),
            roomId
        };

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/create-chat`, messageData);
            if (response.status === 201) {
                socket.current.emit('sendMessage', messageData);
                setNewMessage('');
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message. Please try again.');
        }
    };

    return (
        <div className="chat-container">
            <h1>Chat regarding item: {itemName}</h1>
            {!socketConnected && <div className="connection-status">Real-time updates unavailable. Messages may be delayed.</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="chat-history">
                <div className="messages">
                    {messages.length ? (
                        messages.map((msg, index) => (
                            <div key={`${msg.timestamp}-${index}`} className={`message ${msg.senderEmail === currentUser.email ? 'sent' : 'received'}`}>
                                <p>{msg.message}</p>
                                <small>{new Date(msg.timestamp).toLocaleString()}</small>
                            </div>
                        ))
                    ) : (
                        <p className="no-messages">No messages yet. Start the conversation.</p>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-container">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="chat-input"
                    placeholder="Type your message..."
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