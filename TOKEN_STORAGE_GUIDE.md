# Token Storage Guide - Grade Compass

## How Tokens Are Stored

When a user logs in, the authentication token is automatically stored in the browser's **localStorage** under the key `sb-token`. This allows the user to remain logged in even after closing and reopening the browser.

## Token Storage Flow

### 1. **Login Process**
```
User clicks "Sign In" 
    ↓
useAuth.signIn() called with email & password
    ↓
Supabase authenticates user
    ↓
Token + User info returned
    ↓
Token stored in localStorage (key: 'sb-token')
    ↓
User redirected to dashboard
```

### 2. **Session Persistence**
- When the page loads, the app checks if a token exists in localStorage
- If token is valid, user is automatically logged in
- User doesn't need to login again unless they logout or token expires

### 3. **Token Refresh**
- Tokens automatically refresh when expired
- The new token is stored back in localStorage
- This is handled transparently by Supabase

### 4. **Logout Process**
- When user clicks "Logout", the token is removed from localStorage
- User is redirected to login page
- Session cache is cleared

## Verifying Token Storage

### Method 1: Browser DevTools (Recommended)

1. **Open DevTools**: Press `F12` or `Ctrl+Shift+I`
2. **Go to Application Tab**: 
   - Chrome/Edge: Application > Local Storage > http://localhost:8081
   - Firefox: Storage > Local Storage > http://localhost:8081
3. **Look for `sb-token`**: You should see an entry with the key `sb-token`
4. **View the Token**: Click on it to see the contents:
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
     "refresh_token": "your_refresh_token",
     "user": {
       "id": "user-uuid",
       "email": "user@example.com",
       ...
     }
   }
   ```

### Method 2: Browser Console

Open DevTools and run these commands in the Console tab:

```javascript
// Check if token exists
localStorage.getItem('sb-token')

// Parse and view token
JSON.parse(localStorage.getItem('sb-token'))

// Get just the user email
JSON.parse(localStorage.getItem('sb-token')).user.email

// Get access token
JSON.parse(localStorage.getItem('sb-token')).access_token
```

### Method 3: Using Helper Functions

The app provides debugging utilities in `src/lib/token-storage.ts`:

```typescript
import { 
  getStoredToken, 
  hasValidToken, 
  getAccessToken, 
  debugLogToken 
} from '@/lib/token-storage';

// In your component or browser console:
debugLogToken(); // Logs token info to console

// Check if user is logged in
if (hasValidToken()) {
  console.log('User is authenticated');
}

// Get the access token for API calls
const token = getAccessToken();
```

## Token Structure

When stored, the token object contains:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "your_refresh_token_here",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "email_confirmed_at": "2026-05-14T17:00:00Z",
    "app_metadata": {},
    "user_metadata": {},
    "created_at": "2026-05-14T17:00:00Z",
    "updated_at": "2026-05-14T17:00:00Z"
  }
}
```

## Security Considerations

### ✅ What's Safe
- **localStorage**: Safe for non-sensitive data in secure contexts (HTTPS)
- **Access Token**: Short-lived (usually 1 hour)
- **Refresh Token**: Used only to get new access tokens

### ⚠️ Best Practices
1. **Always use HTTPS** in production (not http://)
2. **Never commit tokens** to version control
3. **Use environment variables** for sensitive config
4. **Implement token expiration** - done automatically by Supabase
5. **Enable CORS** only for trusted origins

### 🔒 Server-Side Security
For sensitive operations:
- Never use the Anon Key on the server
- Use the Service Role Key only on the server
- Never expose the Service Role Key in client code

## Troubleshooting

### Token Not Storing
**Problem**: Token doesn't appear in localStorage after login

**Solutions**:
1. Check if localStorage is enabled (DevTools > Application > Cookies)
2. Check browser console for errors
3. Verify SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are correct
4. Clear localStorage and try again:
   ```javascript
   localStorage.clear()
   ```

### Token Not Persisting
**Problem**: User gets logged out after refresh

**Solutions**:
1. Check if token exists in localStorage
2. Verify the token hasn't expired (tokens expire after ~1 hour)
3. Clear browser cache and try again
4. Check that `persistSession: true` is set in Supabase client

### Tokens Being Cleared Unexpectedly
**Problem**: Token disappears from localStorage

**Solutions**:
1. Check for JavaScript errors in console
2. Verify no other scripts are clearing localStorage
3. Check browser security settings aren't blocking storage
4. Disable browser extensions that might interfere

## Monitoring Token Activity

### Log Token Events
Add this to your app to monitor auth events:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Auth event: ${event}`);
  console.log('Session:', session);
  
  if (event === 'SIGNED_IN') {
    console.log('User logged in, token stored');
  } else if (event === 'SIGNED_OUT') {
    console.log('User logged out, token cleared');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed');
  }
});
```

## Related Files
- Token storage implementation: [src/lib/token-storage.ts](../src/lib/token-storage.ts)
- Auth hook: [src/hooks/use-auth.tsx](../src/hooks/use-auth.tsx)
- Supabase client config: [src/integrations/supabase/client.ts](../src/integrations/supabase/client.ts)
- Login page: [src/routes/login.tsx](../src/routes/login.tsx)
