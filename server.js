const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router(); 
const verifyToken = require("./middlewares/verifyToken"); // Import middleware
const WebSocket = require('ws');
const http = require('http'); // Import HTTP module

require('dotenv').config();

// Create an Express app
const app = express();
const server = http.createServer(app); // Create an HTTP server
const PORT = process.env.PORT || 3000;
const User = require("./userModel");
app.use(express.static('public'));

// Middleware
app.use(express.json());
//app.use(cors({ origin: 'http://127.0.0.1:3003' }));
app.use(cors({ origin: '*' }));
app.use(express.json());



// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fruit_ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Fruit Schema
const fruitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    imageURL: { type: String, required: true },
    quantity: { type: Number, required: true },
    
  },
  { timestamps: true }
);
const Fruit = mongoose.model('Fruit', fruitSchema);


// Order Schema
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // Make sure "User" matches your User model name
    required: true,
  },
  items: [
    {
      name: String,  // Ensure each item has a name
      quantity: Number,
      price: Number,
    }
  ],
  totalAmount: Number,
  address: { type: String, required: true },
  phone: { type: String, required: true }, // Add phoneNumber field
  status: {
    type: String,
    default: "Pending",
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Routes

// Get all fruits or search by name
app.get('/admin/fruits', async (req, res) => {
  const searchQuery = req.query.search || '';

  try {
    const fruits = await Fruit.find({
      name: { $regex: searchQuery, $options: 'i' },
    });
    res.json(fruits);
  } catch (error) {
    console.error('Error fetching fruits:', error);
    res.status(500).json({ message: 'Error fetching fruits', error });
  }
});

// Add a new fruit
app.post('/admin/add-fruit', upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, quantity } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const imageURL = `/uploads/${req.file.filename}`;

    const newFruit = new Fruit({
      name,
      price,
      description,
      imageURL,
      quantity: parseFloat(quantity),
    });

    await newFruit.save();
    res.status(201).json({ message: 'Fruit added successfully', fruit: newFruit });
  } catch (error) {
    console.error('Error adding fruit:', error);
    res.status(500).json({ message: 'Error adding fruit', error });
  }
});

// Update a fruit
app.put('/admin/update-fruit/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, price, description, quantity } = req.body;

  try {
    const fruit = await Fruit.findById(id);
    if (!fruit) {
      return res.status(404).json({ message: 'Fruit not found' });
    }

    fruit.name = name;
    fruit.price = price;
    fruit.description = description;
    fruit.quantity = parseFloat(quantity);

    if (req.file) {
      fruit.imageURL = `/uploads/${req.file.filename}`;
    }

    await fruit.save();
    res.json({ message: 'Fruit updated successfully', fruit });
  } catch (error) {
    console.error('Error updating fruit:', error);
    res.status(500).json({ message: 'Error updating fruit', error });
  }
});

// Delete a fruit
app.delete('/admin/delete-fruit/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFruit = await Fruit.findByIdAndDelete(id);
    if (deletedFruit) {
      res.json({ message: 'Fruit deleted successfully' });
    } else {
      res.status(404).json({ message: 'Fruit not found' });
    }
  } catch (error) {
    console.error('Error deleting fruit:', error);
    res.status(500).json({ message: 'Error deleting fruit', error });
  }
});




// Get all orders (Admin)
app.get("/admin/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name phone address ") // Ensure "userId" is populated correctly
      .exec();

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});




//signup user 
app.post("/signup", async (req, res) => {
  try {
      const { name, email, phone, password ,address} = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: "User already exists!" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({ name, email, phone, password: hashedPassword ,address});
      await newUser.save();

      // Generate JWT token
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.status(201).json({
          message: "Signup successful!",
          token,
          user: { id: newUser._id, name: newUser.name, email: newUser.email, address }
      });

  } catch (error) {
      console.error("Signup Error:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
});



// Login Route
// Login Route
app.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;

      console.log("Login Attempt:", email, password);

      // Find user by email (converted to lowercase)
      const user = await User.findOne({ email: email.toLowerCase().trim() });

      console.log("User Found in DB:", user);

      if (!user) return res.status(400).json({ message: "Invalid email or password" });

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password Match Result:", isMatch);

      if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

      // Include user data in response
      res.status(200).json({ 
          message: "Login successful!", 
          token, 
          user: { id: user._id, name: user.name, email: user.email }  // 👈 Send user details
      });

  } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Server error" });
  }
});


// user schema 
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String, // This is hashed
  address: { type: String, required: true }, 
  registrationDate: { type: Date, default: Date.now }
});

const Users = mongoose.model("Users", userSchema);

// API endpoint to fetch all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await Users.find(); // Use the correct model name
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

//Delete user
// Delete User Route

app.delete("/admin/delete-users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Delete request received for user ID:", id); // Debugging log

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await User.findByIdAndDelete(id);
    console.log("User deleted successfully"); // Debugging log

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error); // Debugging log
    res.status(500).json({ error: "Failed to delete user" });
  }
});




// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).json({ error: "Token missing" });
  }
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification Failed:", error.message);
    console.log("Headers Received:", req.headers.authorization);

    return res.status(401).json({ error: "Invalid token" });
  }
}

// Use the middleware for the route
app.post('/place-order', authenticateToken, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized. Please log in again." });
    }

      // Fetch user details from the database
      const user = await Users.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

    // Validate order data
    if (!items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ message: "Invalid order data. Cart cannot be empty." });
    }

    // Create a new order
    const newOrder = new Order({
      userId: req.user.id,  // Ensure user ID is stored
      items,
      totalAmount,
      address: user.address, // Use user's stored address
      phone: user.phone,  // ✅ Add phone number from user data
      status: "Pending",
      date: new Date()
    });

    // Save to MongoDB
    await newOrder.save();
    console.log("Order saved:", newOrder);

    res.status(201).json({ message: "Order placed successfully", order: newOrder });

  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/api/orders", verifyToken, async (req, res) => {

  try {
    const userId = req.user.id; // Extract user ID from token
    console.log("Fetching orders for user:", userId); // Debugging log

    const orders = await Order.find({ userId }).sort({ date: -1 }).limit(3);
    
    console.log("Orders fetched:", orders);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders." });
  }
});

module.exports = app;

app.put("/admin/update-order-status/:orderId", async (req, res) =>{
  try {
      const orderId = req.params.orderId;
      const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: "success" }, { new: true });

      if (!updatedOrder) {
          return res.status(404).json({ success: false, message: "Order not found" });
      }

      res.json({ success: true });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
  }
});



app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure `address` is returned
    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address || "Address Not Available",
    };

    res.json(userProfile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//update profile 
app.put("/api/profile/update", authenticateToken, async (req, res) => {
  try {
      const { name, address } = req.body;

      // Debugging Logs
      console.log("Received profile update request:", req.body);
      console.log("User ID from token:", req.user.id);

      if (!name || !address) {
          return res.status(400).json({ message: "Name and address are required" });
      }

      // Update user in database
      const updatedUser = await Users.findByIdAndUpdate(
          req.user.id,
          { name, address },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
      }

      console.log("Profile updated successfully:", updatedUser);

      res.json({ message: "Profile updated successfully", user: updatedUser });

  } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  rating: { type: Number, required: true },
  comments: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

// Route to Submit Feedback (Using verifyToken middleware)
app.post("/submit-feedback", verifyToken, async (req, res) => {
  try {
    const { rating, comments } = req.body;
    if (!rating) return res.status(400).json({ message: "Rating is required" });

    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newFeedback = new Feedback({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      rating,
      comments,
    });

    await newFeedback.save();
    res.status(201).json({ message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Feedback Submission Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route to Fetch All Feedback (For Admin Panel)
app.get("/admin/feedbacks", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }); // Get all feedback sorted by newest first
    res.json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});


//Route to Delete Feedback
app.delete("/admin/delete-feedback/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.findByIdAndDelete(id);
    res.json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ error: "Failed to delete feedback" });
  }
});

//websocket
const wss = new WebSocket.Server({ server }); // Attach WebSocket to HTTP server

wss.on('connection', (ws) => {
    console.log("Admin connected to WebSocket");
    
    ws.on('message', (message) => {
        console.log("Received message from admin:", message);
    });

    ws.send(JSON.stringify({ type: "welcome", message: "Connected to WebSocket server" }));
});

// Example: Notify admins when a new order is placed
function notifyNewOrder() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "new_order", message: "A new order has been placed!" }));
        }
    });
}

// Call `notifyNewOrder()` inside your order placement route
app.post('/place-order', async (req, res) => {
    const newOrder = await Order.create(req.body);
    notifyNewOrder(); // Notify all admins via WebSocket
    res.status(201).json(newOrder);
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});






