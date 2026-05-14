/**
 * Utility functions to manage and verify token storage in localStorage
 * These functions help debug and verify that authentication tokens are properly stored
 */

const TOKEN_KEY = "sb-token";

/**
 * Get the stored token from localStorage
 */
export function getStoredToken() {
  try {
    const tokenStr = localStorage.getItem(TOKEN_KEY);
    if (!tokenStr) return null;
    return JSON.parse(tokenStr);
  } catch (error) {
    console.error("Error parsing stored token:", error);
    return null;
  }
}

/**
 * Check if a valid token exists in localStorage
 */
export function hasValidToken() {
  const token = getStoredToken();
  return !!token?.access_token;
}

/**
 * Get the access token from localStorage
 */
export function getAccessToken() {
  const token = getStoredToken();
  return token?.access_token || null;
}

/**
 * Get the refresh token from localStorage
 */
export function getRefreshToken() {
  const token = getStoredToken();
  return token?.refresh_token || null;
}

/**
 * Get the user info from localStorage
 */
export function getStoredUser() {
  const token = getStoredToken();
  return token?.user || null;
}

/**
 * Clear the stored token from localStorage
 */
export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Log token information to console (for debugging)
 */
export function debugLogToken() {
  const token = getStoredToken();
  if (!token) {
    console.log("No token stored in localStorage");
  } else {
    console.log("Token Info:", {
      hasAccessToken: !!token.access_token,
      hasRefreshToken: !!token.refresh_token,
      user: token.user,
      accessTokenLength: token.access_token?.length,
      refreshTokenLength: token.refresh_token?.length,
    });
  }
}

/**
 * Check all localStorage items related to auth
 */
export function debugLogAllAuthStorage() {
  console.log("=== All Auth Storage ===");
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes("token") || key.includes("session") || key.includes("auth"))) {
      const value = localStorage.getItem(key);
      if (value && value.length < 500) {
        console.log(`${key}:`, value);
      } else {
        console.log(`${key}: [Long value - ${value?.length} chars]`);
      }
    }
  }
  console.log("===================");
}
