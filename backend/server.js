const express = require('express');
const cors = require('cors');
const postRoutes = require('./routes/postRoutes.js');
const courseRoutes = require('./routes/courseRoutes.js');
const learnRoutes = require('./routes/learnRoutes.js');
const safetyTipRoutes = require('./routes/safetyTipRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
const monitoringRoutes = require('./routes/monitoringRoutes.js');
const labRoutes = require('./routes/labRoutes.js');
const chatRoutes = require('./routes/chatRoutes.js');
const authMiddleware = require('./middlewares/authMiddleware.js');
const errorHandler = require('./middlewares/errorHandler.js');
const { startCronJobs } = require('./cronJobs.js');

// Load environment variables (needed for FIREBASE_API_KEY)
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON payloads

// Public auth routes
app.use('/api/auth', authRoutes);

// Protected feature routes
app.use('/api/posts', authMiddleware, postRoutes);
app.use('/api/courses', authMiddleware, courseRoutes);
app.use('/api/learn', authMiddleware, learnRoutes);
app.use('/api/safety-tips', authMiddleware, safetyTipRoutes);
app.use('/api/monitoring', authMiddleware, monitoringRoutes);
app.use('/api/labs', authMiddleware, labRoutes);
app.use('/api/chat', chatRoutes);

// Global Error Handler Middleware
// Must be mounted at the bottom after all routes
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startCronJobs();
});
