"use client";

/**
 * AdminContext — manages all admin-side state and persists to localStorage
 * so that changes are visible site-wide (single source of truth).
 */

import { createContext, useContext, useReducer, useEffect } from "react";
import {
  lsGetProducts,
  lsSetProducts,
  lsGetOffers,
  lsSetOffers,
  lsGetCoupons,
  lsSetCoupons,
} from "@/lib/dataStore";
import { getProducts, getOffers, getCoupons } from "@/lib/api";
import { useAuth } from "@/store/AuthContext";

const AdminContext = createContext(null);

function adminReducer(state, action) {
  switch (action.type) {
    // ── Products ──
    case "ADD_PRODUCT":
      return { ...state, products: [action.product, ...state.products] };
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) =>
          p._id === action.product._id ? action.product : p,
        ),
      };
    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p._id !== action.id),
      };
    case "UPDATE_STOCK": {
      const updatedProducts = state.products.map((p) =>
        p._id === action.id ? { ...p, stock: action.stock } : p,
      );
      lsSetProducts(updatedProducts);
      return {
        ...state,
        products: updatedProducts,
      };
    }
    case "SET_PRODUCTS":
      return { ...state, products: action.products };

    // ── Offers ──
    case "ADD_OFFER":
      return { ...state, offers: [action.offer, ...state.offers] };
    case "SET_OFFERS":
      return { ...state, offers: action.offers };
    case "UPDATE_OFFER":
      return {
        ...state,
        offers: state.offers.map((o) =>
          o._id === action.offer._id ? action.offer : o,
        ),
      };
    case "DELETE_OFFER":
      return {
        ...state,
        offers: state.offers.filter((o) => o._id !== action.id),
      };

    // ── Coupons ──
    case "ADD_COUPON":
      return { ...state, coupons: [action.coupon, ...state.coupons] };
    case "SET_COUPONS":
      return { ...state, coupons: action.coupons };
    case "UPDATE_COUPON":
      return {
        ...state,
        coupons: state.coupons.map((c) =>
          c._id === action.coupon._id ? action.coupon : c,
        ),
      };
    case "DELETE_COUPON":
      return {
        ...state,
        coupons: state.coupons.filter((c) => c._id !== action.id),
      };

    default:
      return state;
  }
}

export function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(adminReducer, {
    products: [], 
    offers:   [], 
    coupons:  [], 
  });

  const { user, isAdmin, loading } = useAuth();
  
  // Sync Everything from MongoDB to Admin Dashboard
  // Wait for auth to fully resolve (loading=false) AND confirm admin role (isAdmin=true)
  // This prevents the race condition where the effect fires before the handshake completes,
  // which causes the token to have email=undefined → 403 Insufficient Admin Permissions
  useEffect(() => {
    const syncWithDB = async () => {
      if (loading || !user || !isAdmin) return;
      try {
        const idToken = await user.getIdToken();
        // ALWAYS use forceFresh in Admin to ensure data accuracy
        // We sync a Large Subset (up to 1000 items) here for dropdowns and creators.
        // Paginated views manage their own local subsets for display.
        const [prodData, offerData, couponData] = await Promise.all([
          getProducts(true),
          getOffers(idToken, true, true), // Passing idToken, forceFresh, includeInactive
          getCoupons(idToken, true) // Passing idToken, forceFresh
        ]);

        if (prodData) {
          const productsArray = Array.isArray(prodData) ? prodData : (prodData.products || []);
          dispatch({ type: "SET_PRODUCTS", products: productsArray });
        }
        if (offerData)  dispatch({ type: "SET_OFFERS",   offers:   offerData });
        if (couponData) dispatch({ type: "SET_COUPONS",  coupons:  couponData });

      } catch (err) {
        console.error("Failed to sync Admin data with database:", err);
      }
    };
    syncWithDB();
  }, [user, isAdmin, loading]);

  return (
    <AdminContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
