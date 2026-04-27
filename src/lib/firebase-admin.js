import admin from 'firebase-admin';

// 🛡️ Bulletproof Initialization:
// We only attempt to start Firebase if the credentials actually exist.
if (!admin.apps.length) {
  try {
    const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    let serviceAccount = null;

    if (key) {
      serviceAccount = JSON.parse(key);
    } else if (path) {
      const fs = require('fs');
      if (fs.existsSync(path)) {
        serviceAccount = JSON.parse(fs.readFileSync(path, 'utf8'));
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase Admin: Active');
    } else {
      console.log('ℹ️ Firebase Admin: Skipped (No Credentials)');
    }
  } catch (error) {
    console.warn('⚠️ Firebase Admin: Initialization Failed', error.message);
  }
}

// 🛡️ Anti-Crash Wrapper: 
// We use a lazy wrapper to prevent the server from crashing if Firebase 
// is slow to initialize or missing on the VPS.
export const adminAuth = {
  verifyIdToken: async (token) => {
    try {
      // Only attempt Firebase if it actually initialized
      if (admin.apps.length > 0) {
        return await admin.auth().verifyIdToken(token);
      }
      throw new Error("Firebase Admin not initialized");
    } catch (error) {
      // Re-throw so callers (like requireAdmin) can handle it
      throw error;
    }
  },
  // Add other methods if needed by the app
  getUser: async (uid) => {
    if (admin.apps.length > 0) return await admin.auth().getUser(uid);
    throw new Error("Firebase Admin not initialized");
  }
};
