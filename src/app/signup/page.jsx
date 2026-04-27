"use client";

import { useState, useEffect } from "react";
import {
  signup,
  signInWithGoogle,
  setupRecaptcha,
  requestOtp,
  updateDisplayName,
  sendVerificationEmail,
  logout,
} from "@/lib/auth";
import Link from "next/link";
import styles from "./signup.module.css";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [defaultCountry, setDefaultCountry] = useState("IN");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("email"); // 'email' or 'phone'
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

  const handleSignup = async () => {
    if (!name.trim()) return alert("Please enter your full name");
    setLoading(true);
    try {
      const userCredential = await signup(email, password);
      await updateDisplayName(name.trim());
      await sendVerificationEmail(userCredential.user);
      await logout();
      alert("Registration successful! Please check your email to verify your account.");
      router.push("/login");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter your full name first");
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
      await updateDisplayName(name.trim());
      const searchParams = new URLSearchParams(window.location.search);
      router.push(searchParams.get("redirect") || "/profile");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Create Account</h2>
      <p className={styles.subtitle}>Join the Ishta Crafts family</p>

      {/* ── Step 1: Name (always visible) ── */}
      <div className={styles.stepSection}>
        <p className={styles.stepLabel}>Step 1 — Your Info</p>
        <div className={styles.inputGroup}>
          <input
            className={styles.input}
            type="text"
            placeholder="Your Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      {/* ── Step 2: Method Tabs ── */}
      <div className={styles.stepSection}>
        <p className={styles.stepLabel}>Step 2 — Choose Sign Up Method</p>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${method === "email" ? styles.tabActive : ""}`}
            onClick={() => setMethod("email")}
          >
            📧 Email
          </button>
          <button
            className={`${styles.tab} ${method === "phone" ? styles.tabActive : ""}`}
            onClick={() => setMethod("phone")}
          >
            📱 Phone
          </button>
        </div>

        {/* Email Fields */}
        {method === "email" && (
          <div className={styles.methodSection}>
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
                  placeholder="Create Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>
            <button className={styles.button} onClick={handleSignup}>
              Create Account
            </button>
          </div>
        )}

        {/* Phone Fields */}
        {method === "phone" && (
          <div className={styles.methodSection}>
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
                  className={styles.button}
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
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
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </button>
                <button
                  className={styles.resendBtn}
                  onClick={() => setConfirmationResult(null)}
                >
                  ← Change Number
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invisible reCAPTCHA */}
      <div id="recaptcha-container"></div>

      {/* ── Social ── */}
      <div className={styles.divider}>
        <span className={styles.dividerText}>or</span>
      </div>

      <button
        className={`${styles.button} ${styles.buttonGoogle}`}
        onClick={handleGoogleSignup}
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
        href={`/login${typeof window !== "undefined" && window.location.search ? window.location.search : ""}`}
      >
        Already have an account? <strong>Login</strong>
      </Link>
    </div>
  );
}
