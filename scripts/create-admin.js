const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with the key we just created
const serviceAccount = require('../firebase.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function createAdmin(email, password) {
  try {
    const user = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: true
    });
    console.log('Successfully created new admin user:', user.email);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('Admin user already exists:', email);
      // Update password anyway
      const user = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(user.uid, { password: password });
      console.log('Updated password for existing user:', email);
    } else {
      console.error('Error creating admin user:', error);
    }
  }
}

// Create both versions to be safe
async function run() {
  await createAdmin('Admin@ishtacrafts.in', 'ishta@crafts');
  // await createAdmin('Admin@shtacrafts.in', 'ishta@crafts');
  process.exit(0);
}

run();
