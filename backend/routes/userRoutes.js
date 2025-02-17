const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const upload = require('../upload');
const bodyParser = require('body-parser');
const ObjectId = mongoose.Types.ObjectId;
const nodemailer = require('nodemailer');
const Chat = require('../models/chatModel'); // Import Chat model
const { io } = require('../App'); // Import io from app.js

// Middleware to parse request bodies
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
});

const User = mongoose.model('User', userSchema);

// Lost Item Schema
const lostItemSchema = new mongoose.Schema(
  {
    name: String,
    userid: String,
    location: {
      lat: Number,
      lng: Number,
      placeName: String,
    }, // Store location as an object
    description: String,
    image: String, // Store image file path
    found: { type: Boolean, default: false }, // Status if the item is found
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const LostItem = mongoose.model('LostItem', lostItemSchema);



// Route to save a user
router.post('/save-user', async (req, res) => {
  const { username, email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ username, email });
    await user.save();

    res.status(200).json({ message: 'User saved successfully', userId: user._id });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to fetch a user by email
router.get('/fetch-user', async (req, res) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to fetch a user by ID
router.get('/fetch-userid', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to update user location
router.post('/update-location', async (req, res) => {
  const { userId, location } = req.body;

  if (!userId || !location) {
    return res.status(400).json({ error: 'User ID and location are required.' });
  }

  try {
    const user = await User.findById(userId);

    if (user) {
      user.location = location; // Update the location field
      await user.save();
      return res.status(200).json({ message: 'Location updated successfully.', user });
    } else {
      return res.status(404).json({ error: 'User not found.' });
    }
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});




// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD  // Changed from EMAIL_APP_PASSWORD to match your .env
  },
  debug: true, // Enable debugging
  logger: true  // Log to console
});

// Let's add a debug check to see if environment variables are loaded
console.log('Environment variables check:', {
  EMAIL_USER_SET: !!process.env.EMAIL_USER,
  EMAIL_PASSWORD_SET: !!process.env.EMAIL_PASSWORD,
  EMAIL_USER_LENGTH: process.env.EMAIL_USER?.length,
  EMAIL_PASSWORD_LENGTH: process.env.EMAIL_PASSWORD?.length
});

// Verify the transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log('Transporter verification error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

router.post('/submit', upload.single('image'), async (req, res) => {
  try {
    const { name, userid, location, description } = req.body;
    const imagePath = req.file ? `/assets/images/${req.file.filename}` : null;
    const parsedLocation = location ? JSON.parse(location) : null;
    
    console.log('Parsed values:', { name, userid, location, description });

    // Create and save the lost item
    const lostItem = new LostItem({
      name,
      userid,
      location: parsedLocation,
      description,
      image: imagePath,
    });
    await lostItem.save();

    // Find users within 100km radius
    const allUsers = await User.find({});
    const nearbyUsers = allUsers.filter(user => {
      if (!user.location || !user.location.lat || !user.location.lng) return false;
      
      const distance = calculateDistance(
        parsedLocation.lat,
        parsedLocation.lng,
        user.location.lat,
        user.location.lng
      );
      
      return distance <= 100;
    });

    // Send emails to nearby users with better error handling
    const emailPromises = nearbyUsers.map(async (user) => {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Lost Item Reported Near You',
          html: `
            <h2>A Lost Item Was Recently Reported Near You</h2>
            <p><strong>Item:</strong> ${name}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Location:</strong> ${parsedLocation.placeName}</p>
            ${imagePath ? `<img src="${process.env.BASE_URL}${imagePath}" alt="Lost Item" style="max-width: 300px;">` : ''}
            <p>If you have any information about this item, please contact us through the platform.</p>
          `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${user.email}:`, info.messageId);
        return true;
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        return false;
      }
    });

    // Wait for all emails to be sent
    const emailResults = await Promise.all(emailPromises);
    const successfulEmails = emailResults.filter(Boolean).length;

    res.status(201).json({
      message: 'Item submitted successfully!',
      lostItem,
      emailsSent: successfulEmails,
      totalNearbyUsers: nearbyUsers.length
    });

  } catch (err) {
    console.error('Error submitting item:', err);
    res.status(500).json({ 
      message: 'Something went wrong',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});



// Route to fetch all lost items
router.get('/lost-items', async (req, res) => {
  try {
    const lostItems = await LostItem.find().sort({ createdAt: -1 });
    res.status(200).json(lostItems);
  } catch (error) {
    console.error('Error fetching lost items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch all lost items for a specific user
router.get('/lost', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const items = await LostItem.find({ userid: userId });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update item details
router.put('/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const { description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ error: 'Invalid item ID' });
  }

  if (!description) {
    return res.status(400).json({ error: 'Description is required to update the item' });
  }

  try {
    await LostItem.updateOne(
      { _id: new mongoose.Types.ObjectId(itemId) },
      { $set: { description } }
    );
    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete an item
router.delete('/:itemId', async (req, res) => {
  const { itemId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ error: 'Invalid item ID' });
  }

  try {
    await LostItem.deleteOne({ _id: new mongoose.Types.ObjectId(itemId) });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Mark an item as found
router.put('/:itemId/mark-as-found', async (req, res) => {
  const { itemId } = req.params;

  console.log(`Received request to mark item as found. Item ID: ${itemId}`);

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    console.error(`Invalid item ID: ${itemId}`);
    return res.status(400).json({ error: 'Invalid item ID' });
  }

  try {
    const result = await LostItem.updateOne(
      { _id: new mongoose.Types.ObjectId(itemId) },
      { $set: { found: true } }
    );

    console.log(`Update result for item ID ${itemId}:`, result);

    if (result.modifiedCount === 0) {
      console.warn(`Item not found or already marked as found. Item ID: ${itemId}`);
      return res.status(404).json({ error: 'Item not found or already marked as found' });
    }

    console.log(`Item successfully marked as found. Item ID: ${itemId}`);
    res.json({ message: 'Item marked as found' });
  } catch (error) {
    console.error('Error marking item as found:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new message (Create Chat)
router.post("/create-chat", async (req, res) => {
  const { senderEmail, receiverEmail, itemId, message } = req.body;
  
  try {
      // Validate required fields
      if (!senderEmail || !receiverEmail || !itemId || !message) {
          return res.status(400).json({ 
              message: "Missing required fields",
              received: { senderEmail, receiverEmail, itemId, message }
          });
      }

      // Check if a chat already exists
      const existingChat = await Chat.findOne({
          itemId,
          $or: [
              { senderEmail, receiverEmail },
              { senderEmail: receiverEmail, receiverEmail: senderEmail }
          ]
      });

      if (existingChat) {
          // Add new message to existing chat
          const newMessage = {
              senderEmail,
              message,
              timestamp: new Date()
          };
          
          existingChat.messages.push(newMessage);
          await existingChat.save();
          return res.status(201).json({ 
              message: "Message added", 
              chat: existingChat 
          });
      }

      // Create new chat if none exists
      const newChat = new Chat({
          senderEmail,
          receiverEmail,
          itemId,
          messages: [{
              senderEmail,
              message,
              timestamp: new Date()
          }]
      });

      const savedChat = await newChat.save();
      res.status(201).json({ 
          message: "Chat created successfully", 
          chat: savedChat 
      });


  } catch (error) {
      console.error("Error in chat operation:", error);
      res.status(500).json({ 
          message: "Internal server error",
          error: error.message
      });
  }
});


// Fetch messages for a specific item
router.get('/get-messages', async (req, res) => {
  const { itemId, senderEmail, receiverEmail } = req.query;
  
  try {
      const chats = await Chat.find({
          itemId,
          $or: [
              { senderEmail, receiverEmail },
              { senderEmail: receiverEmail, receiverEmail: senderEmail }
          ]
      });
      
      const messages = chats.flatMap(chat => chat.messages)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          
      res.status(200).json({ messages });
  } catch (error) {
      res.status(500).json({ 
          message: 'Error fetching messages',
          error: error.message 
      });
  }
});




// Fetch messages for sender/receiver
router.get('/messages', (req, res) => {
  const { receiverEmail, senderEmail } = req.query;

  let filter = {};
  if (receiverEmail) {
    filter.receiverEmail = receiverEmail;
  } else if (senderEmail) {
    filter.senderEmail = senderEmail;
  }

  Chat.find(filter)
    .then(chats => res.json(chats))
    .catch(error => {
      console.error('Error fetching chats:', error);
      res.status(500).json({ error: 'Error fetching chats' });
    });
});

// Route to fetch lost item details by itemId
router.get('/get-lost-item', async (req, res) => {
  const { itemId } = req.query;

  try {
      const lostItem = await LostItem.findById(itemId); // Fetch the lost item using its ID
      if (!lostItem) {
          return res.status(404).json({ error: 'Item not found' });
      }
      res.status(200).json({ item: lostItem });
  } catch (err) {
      console.error('Error fetching lost item:', err);
      res.status(500).json({ error: 'Failed to fetch item details' });
  }
});



module.exports = router;
