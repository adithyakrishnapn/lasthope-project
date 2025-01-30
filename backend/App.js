require('dotenv').config();

const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const userRouter = require("./routes/userRoutes");
const db = require("./config/connection");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");
const Chat = require('./models/chatModel');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Enable CORS
app.use(cors());

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust origin to be more specific in production for security
        methods: ["GET", "POST"],
    },
});

// Database connection
db.connect((err) => {
    if (err) {
        console.error("Error connecting to database:", err);
    } else {
        console.log("Connected to database");
    }
});

// Middleware
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/api", userRouter);



// Socket.IO functionality
// In your backend server.js
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinRoom", ({ itemId, senderEmail, receiverEmail }) => {
        if (itemId) {
            const roomId = itemId.toString();
            console.log(`User ${socket.id} joined room: ${roomId}`);
            socket.join(roomId);
        }
    });

    socket.on("sendMessage", async (messageData) => {
        const { itemId, senderEmail, receiverEmail, message, timestamp } = messageData;
    
        try {
            let chat = await Chat.findOne({
                itemId: itemId,
                $or: [
                    { senderEmail, receiverEmail },
                    { senderEmail: receiverEmail, receiverEmail: senderEmail }
                ]
            });
    
            if (!chat) {
                chat = new Chat({
                    senderEmail,
                    receiverEmail,
                    itemId,
                    messages: []
                });
            }
    
            const newMessage = {
                senderEmail, // Stores who sent the message
                message: message || messageData.initialMessage,
                timestamp: new Date(timestamp)
            };
            chat.messages.push(newMessage);
            await chat.save();
    
            // Correctly emit to both sender and receiver
            const roomId = `${itemId}-${senderEmail}-${receiverEmail}`;
            io.in(roomId).emit("receiveMessage", newMessage);
        } catch (error) {
            console.error("Error handling message:", error);
            socket.emit("error", "Failed to save message");
        }
    });
    
});



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something broke!',
        error: err.message 
    });
});





// Start the server
const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
