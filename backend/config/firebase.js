const admin = require('firebase-admin');

// Initialize the Firebase Admin SDK
// Make sure to add your serviceAccountKey.json in the config directory
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };
