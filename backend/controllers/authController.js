const { admin, db } = require('../config/firebase.js');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName
    });

    await db.collection('users').doc(userRecord.uid).set(
      {
        uid: userRecord.uid,
        email,
        displayName: displayName || '',
        alertsEnabled: true,
        alertInterval: '2min',
        createdAt: admin.firestore.Timestamp.now(),
      },
      { merge: true }
    );

    res.status(201).json({
      message: 'User created successfully',
      uid: userRecord.uid
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login a user and get token
// @route   POST /api/auth/signin
// @access  Public
const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Note: Firebase Admin SDK does not support signing in with password.
    // We use the Firebase Identity Toolkit REST API instead.
    // You must set FIREBASE_API_KEY in your .env file!
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        message: "FIREBASE_API_KEY is missing. Please add your Firebase Web API Key to a .env file." 
      });
    }

    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({ message: data.error.message });
    }

    // Return the ID token which can be used as the Bearer token for protected routes
    res.status(200).json({
      message: 'Login successful',
      token: data.idToken,
      uid: data.localId
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, signin };
