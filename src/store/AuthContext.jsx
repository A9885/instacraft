"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext({
  user: null,
  isAdmin: false,
  loading: true,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleInternalSession = () => {
      const internalSession =
        typeof window !== "undefined"
          ? localStorage.getItem("ishta_admin_session")
          : null;
      if (internalSession) {
        const parsed = JSON.parse(internalSession);
        // 🔥 RE-ATTACH THE MOCK FUNCTION (Lost during stringify)
        if (parsed.uid === "internal-admin-001") {
          parsed.getIdToken = async () =>
            "INTERNAL_ADMIN_TOKEN_SECURE_BYPASS_2026";
        }
        setUser(parsed);
        setIsAdmin(true);
        setLoading(false);
      } else {
        // If session was cleared but user state was internal admin, clear it
        setUser((prevUser) =>
          prevUser?.uid === "internal-admin-001" ? null : prevUser,
        );
        setIsAdmin(false);
      }
    };

    // Run on mount
    handleInternalSession();

    // Listen for custom event from login/logout
    if (typeof window !== "undefined") {
      window.addEventListener(
        "ishta_admin_session_changed",
        handleInternalSession,
      );
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // If we have an internal session, it takes precedence for Admin
      if (
        typeof window !== "undefined" &&
        localStorage.getItem("ishta_admin_session")
      ) {
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      // Perform the silent Handshake Sync if user is logged in
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const res = await fetch("/api/customers/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              firebaseUid: firebaseUser.uid,
              name: firebaseUser.displayName || "",
              email: firebaseUser.email || "",
              phone: firebaseUser.phoneNumber || "",
            }),
          });
          const data = await res.json();
          if (data.isAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Handshake sync failed:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      // Mark loading as false ONLY after role validation is complete
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "ishta_admin_session_changed",
          handleInternalSession,
        );
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
