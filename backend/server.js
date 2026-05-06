const express = require('express');
const cors = require('cors');
const postRoutes = require('./routes/postRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
const errorHandler = require('./middlewares/errorHandler.js');

// Load environment variables (needed for FIREBASE_API_KEY)
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON payloads

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Global Error Handler Middleware
// Must be mounted at the bottom after all routes
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
