// src/utils/auth.ts
import { useEffect } from "react";
import Cookies from "js-cookie";

export function getClaimsFromToken() {
  const token = Cookies.get("authToken");
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    // Xử lý padding cho base64 nếu thiếu
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    return decoded;
  } catch {
    return null;
  }
}