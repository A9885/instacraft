import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";

const provider = new GoogleAuthProvider();

export const updateDisplayName = async (name) => {
  if (auth.currentUser) {
    return await updateProfile(auth.currentUser, { displayName: name });
  }
};

export const signInWithGoogle = async () => {
  return await signInWithPopup(auth, provider);
};

// 🔐 SIGNUP
export const signup = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// 🔐 LOGIN
export const login = async (email, password) => {
  // 🛡️ SECURE ADMIN BYPASS (SERVER-SIDE)
  try {
    const verifyRes = await fetch("/api/auth/admin-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const verifyData = await verifyRes.json();
    
    if (verifyData.isAdmin) {
      return {
        user: {
          uid: 'internal-admin-001',
          email: email,
          emailVerified: true,
          displayName: 'Ishta Administrator',
          getIdToken: async () => 'INTERNAL_ADMIN_TOKEN_SECURE_BYPASS_2026'
        }
      };
    }
  } catch (e) {
    console.error("Admin bypass check failed:", e);
  }

  return await signInWithEmailAndPassword(auth, email, password);
};

// 📧 EMAIL VERIFICATION
export const sendVerificationEmail = async (user) => {
  return await sendEmailVerification(user);
};

// 🔑 PASSWORD RESET
export const resetPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};

// 🔐 PHONE AUTH
export const setupRecaptcha = (containerId) => {
  // If an old verifier exists, we clear it first to avoid "element removed" errors
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.log("Error clearing recaptcha:", e);
    }
    window.recaptchaVerifier = null;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    containerId,
    {
      size: "invisible",
    }
  );
};

export const requestOtp = async (phoneNumber) => {
  const appVerifier = window.recaptchaVerifier;
  return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

// 🚪 LOGOUT
export const logout = async () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ishta_admin_session');
    window.dispatchEvent(new Event('ishta_admin_session_changed'));
  }
  return await signOut(auth);
};

