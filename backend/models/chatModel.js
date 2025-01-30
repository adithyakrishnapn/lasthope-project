const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  senderEmail: { type: String, required: true }, // Email of the sender
  receiverEmail: { type: String, required: true }, // Email of the receiver
  itemId: { type: String, required: true }, // The ID of the item being discussed
  messages: [
    {
      senderEmail: { type: String, required: true }, // Email of the message sender
      message: { type: String, required: true }, // Message content
      timestamp: { type: Date, default: Date.now }, // Timestamp of the message
    },
  ],
});

// Create the Mongoose model
const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat; // Export the model
