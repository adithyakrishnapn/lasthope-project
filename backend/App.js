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
        origin: "*",
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
// In your server.js
// In your socket.io handler (server.js)
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    
    socket.on("joinRoom", ({ roomId }) => {
        if (roomId) {
            console.log(`User ${socket.id} joined room: ${roomId}`);
            socket.join(roomId);
            socket.emit("roomJoined", { roomId });
        }
    });
    
    socket.on("sendMessage", async (messageData) => {
        const { roomId } = messageData;
        
        try {
            // Emit to room immediately - the message is already saved by the API
            io.to(roomId).emit("receiveMessage", messageData);
        } catch (error) {
            console.error("Error handling message:", error);
            socket.emit("error", "Failed to process message");
        }
    });
    
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
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
// At the end of your app.js, before module.exports
module.exports = { app, io };