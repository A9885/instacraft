"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useRef
} from "react";
import { useAuth } from "./AuthContext";
import { auth } from "@/lib/firebase";

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.item.id
              ? { ...i, qty: i.qty + (action.qty || 1) }
              : i,
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, qty: action.qty || 1 }],
      };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "REMOVE_BY_SLUG":
      return { ...state, items: state.items.filter((i) => i.slug !== action.slug) };
    case "UPDATE_QTY":
      if (action.qty <= 0)
        return {
          ...state,
          items: state.items.filter((i) => i.id !== action.id),
        };
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: action.qty } : i,
        ),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "HYDRATE":
      return { ...state, items: action.items };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const hydrated = useRef(false);

  // 1. Initially load from Local Storage on mount
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const saved = localStorage.getItem("ishta_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: "HYDRATE", items: parsed });
        }
      }
    } catch {
      // ignore corrupt data
    }
  }, []);

  // 2. Persist to localStorage ALWAYS on change
  useEffect(() => {
    if (!hydrated.current) return; // wait until first mount finishes
    try {
      localStorage.setItem("ishta_cart", JSON.stringify(state.items));
    } catch {
      // ignore private browsing or storage full limit
    }
  }, [state.items]);

  const addItem = (item, qty = 1) => dispatch({ type: "ADD_ITEM", item, qty });
  const removeItem = (id) => dispatch({ type: "REMOVE_ITEM", id });
  const removeItemBySlug = (slug) => dispatch({ type: "REMOVE_BY_SLUG", slug });
  const updateQty = (id, qty) => dispatch({ type: "UPDATE_QTY", id, qty });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const itemCount = state.items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = state.items.reduce(
    (sum, i) => sum + (i.salePrice || i.price) * i.qty,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        removeItemBySlug,
        updateQty,
        clearCart,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
