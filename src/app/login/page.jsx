"use client";

import { useState, useEffect } from "react";
import {
  login,
  signInWithGoogle,
  setupRecaptcha,
  requestOtp,
  resetPassword,
  logout,
  sendVerificationEmail,
} from "@/lib/auth";
import Link from "next/link";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function LoginPage() {
  const [view, setView] = useState("login"); // 'login' | 'forgot'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [defaultCountry, setDefaultCountry] = useState("IN");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setupRecaptcha("recaptcha-container");
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.country_code) setDefaultCountry(data.country_code);
      })
      .catch(() => {});
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return alert("Please enter email and password");
    setLoading(true);
    try {
      const userCredential = await login(email, password);
      
      // 🛡️ INTERNAL ADMIN PERSISTENCE
      // We check the UID returned by our secure bypass in src/lib/auth.js
      if (userCredential.user.uid === 'internal-admin-001') {
        localStorage.setItem('ishta_admin_session', JSON.stringify(userCredential.user));
        window.dispatchEvent(new Event('ishta_admin_session_changed'));
      }

      // Security: Enforce Email Verification
      if (userCredential.user.uid !== 'internal-admin-001' && !userCredential.user.emailVerified) {
        try {
          await sendVerificationEmail(userCredential.user);
        } catch (e) {
          console.error("Could not send verification email", e);
        }
        await logout();
        throw new Error("Please verify your email before logging in. A new verification link has been sent to your inbox just in case.");
      }

      const searchParams = new URLSearchParams(window.location.search);
      router.push(searchParams.get("redirect") || "/profile");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) return alert("Please enter your email address");
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (err) {
      // Give a friendly message for common errors
      if (err.code === "auth/user-not-found") {
        alert("No account found with this email address.");
      } else {
        alert(err.message);
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return alert("Please enter a phone number");
    setLoading(true);
    try {
      const result = await requestOtp(phoneNumber);
      setConfirmationResult(result);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return alert("Please enter the OTP");
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      const searchParams = new URLSearchParams(window.location.search);
      router.push(searchParams.get("redirect") || "/profile");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      const searchParams = new URLSearchParams(window.location.search);
      router.push(searchParams.get("redirect") || "/profile");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        alert(err.message);
      }
    }
  };

  // ── Forgot Password View ──
  if (view === "forgot") {
    return (
      <div className={styles.container}>
        <button
          className={styles.backBtn}
          onClick={() => {
            setView("login");
            setResetSent(false);
            setResetEmail("");
          }}
        >
          ← Back to Login
        </button>

        {!resetSent ? (
          <>
            <div className={styles.resetIcon}>🔑</div>
            <h2 className={styles.title}>Reset Password</h2>
            <p className={styles.subtitle}>
              Enter your email and we'll send you a link to reset your password.
            </p>

            <div className={styles.inputGroup}>
              <input
                className={styles.input}
                type="email"
                placeholder="Your Email Address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
              />
            </div>

            <button
              className={styles.button}
              onClick={handleResetPassword}
              disabled={resetLoading}
            >
              {resetLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </>
        ) : (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.title}>Email Sent!</h2>
            <p className={styles.subtitle}>
              A password reset link has been sent to{" "}
              <strong>{resetEmail}</strong>. Check your inbox (and spam folder).
            </p>
            <button
              className={styles.button}
              onClick={() => {
                setView("login");
                setResetSent(false);
                setResetEmail("");
              }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Main Login View ──
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Welcome Back</h2>
      <p className={styles.subtitle}>Sign in to your account</p>

      <div className={styles.inputGroup}>
        <input
          className={styles.input}
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.passwordWrapper}>
          <input
            className={styles.input}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button className={styles.forgotLink} onClick={() => setView("forgot")}>
          Forgot password?
        </button>
      </div>

      <button
        className={styles.button}
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Signing in..." : "Login"}
      </button>

      <div className={styles.divider}>
        <span className={styles.dividerText}>or sign in with phone</span>
      </div>

      {!confirmationResult ? (
        <>
          <div className={`${styles.inputGroup} ${styles.phoneWrapper}`}>
            <PhoneInput
              international
              defaultCountry={defaultCountry}
              value={phoneNumber}
              onChange={setPhoneNumber}
              className={styles.phoneInput}
            />
          </div>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={handleSendOtp}
            disabled={loading}
          >
            {loading ? "Sending..." : "Login with Phone"}
          </button>
        </>
      ) : (
        <div className={styles.otpSection}>
          <p className={styles.otpHint}>OTP sent to {phoneNumber} ✅</p>
          <div className={styles.inputGroup}>
            <input
              className={styles.input}
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
          </div>
          <button
            className={styles.button}
            onClick={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <button
            className={styles.resendBtn}
            onClick={() => setConfirmationResult(null)}
          >
            ← Change Number
          </button>
        </div>
      )}

      <div id="recaptcha-container"></div>

      <div className={styles.divider}>
        <span className={styles.dividerText}>or</span>
      </div>

      <button
        className={`${styles.button} ${styles.buttonGoogle}`}
        onClick={handleGoogleLogin}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      <Link
        className={styles.link}
        href={`/signup${typeof window !== "undefined" && window.location.search ? window.location.search : ""}`}
      >
        Don't have an account? <strong>Sign up</strong>
      </Link>
    </div>
  );
}
