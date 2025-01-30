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
        const { itemId, senderEmail, receiverEmail, message, timestamp, roomId } = messageData;

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
                senderEmail,
                message,
                timestamp: new Date(timestamp)
            };
            
            chat.messages.push(newMessage);
            await chat.save();

            // Emit to the specific room instead of the itemId
            io.to(roomId).emit("receiveMessage", newMessage);
        } catch (error) {
            console.error("Error handling message:", error);
            socket.emit("error", "Failed to save message");
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
