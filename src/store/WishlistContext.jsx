"use client";

import { createContext, useContext, useReducer, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { auth } from "@/lib/firebase";

const WishlistContext = createContext(null);

function wishlistReducer(state, action) {
  switch (action.type) {
    case "ADD":
      if (state.items.find((i) => i.id === action.item.id)) return state;
      return { items: [...state.items, action.item] };
    case "REMOVE":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "TOGGLE": {
      const exists = state.items.find((i) => i.id === action.item.id);
      if (exists)
        return { items: state.items.filter((i) => i.id !== action.item.id) };
      return { items: [...state.items, action.item] };
    }
    case "HYDRATE":
      return { items: action.items };
    default:
      return state;
  }
}

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });
  const hydrated = useRef(false);

  // 1. Initially load from Local Storage
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const saved = localStorage.getItem("ishta_wishlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: "HYDRATE", items: parsed });
        }
      }
    } catch {}
  }, []);

  // 2. Persist to localStorage ALWAYS on change
  useEffect(() => {
    if (!hydrated.current) return; // wait until first mount finishes
    try {
      localStorage.setItem("ishta_wishlist", JSON.stringify(state.items));
    } catch {}
  }, [state.items]);

  const addItem = (item) => dispatch({ type: "ADD", item });
  const removeItem = (id) => dispatch({ type: "REMOVE", id });
  const toggleItem = (item) => dispatch({ type: "TOGGLE", item });
  const isInWishlist = (id) => state.items.some((i) => i.id === id);

  return (
    <WishlistContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        toggleItem,
        isInWishlist,
        count: state.items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
