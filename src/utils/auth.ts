// src/utils/auth.ts
import Cookies from "js-cookie";

// Hàm giải mã base64url an toàn với Unicode
export function b64DecodeUnicode(str: string) {
  // Chuyển base64url -> base64
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  // Thêm padding nếu thiếu
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  // Giải mã base64 thành chuỗi UTF-8
  return decodeURIComponent(
    atob(padded)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

export function getClaimsFromToken(token?: string) {
  if (!token) {
    token = Cookies.get("authToken");
  }

  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(b64DecodeUnicode(payload));
    return decoded;
  } catch {
    return null;
  }
}

// Hàm mã hóa SHA256 trả về hex string
export async function sha256(message: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    // Client-side
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } else {
    // Server-side (Node.js)
    const { createHash } = await import("crypto");
    return createHash("sha256").update(message).digest("hex");
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
