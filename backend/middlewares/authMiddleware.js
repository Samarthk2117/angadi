const { admin } = require('../config/firebase');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the ID token using Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Attach decoded user data to req.user
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token', error: error.message });
  }
};

module.exports = authMiddleware;
