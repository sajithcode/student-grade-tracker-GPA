# Grade Compass

Grade Compass is a web application designed to manage and track student grades efficiently. Built with modern web technologies, it integrates with Supabase for backend services.

## Features

- Student grade tracking
- File uploads for grade data
- User authentication via Supabase
- Responsive design

## Prerequisites

Before setting up the project, ensure you have the following installed:

- Node.js (v16 or later)
- npm (v8 or later)
- Supabase account

## Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd grade-compass
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Create a Supabase Project**

   - Go to [Supabase](https://supabase.com/) and sign up for a free account.
   - Create a new project.
   - From the project dashboard, get your:
     - **Project URL** (from Settings > API)
     - **Anon Key** (from Settings > API)
     - **Service Role Key** (from Settings > API) - Keep this secret, use only on server-side

4. **Configure Environment Variables**

   Create a `.env` file in the root directory with your Supabase credentials:

   ```env
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   VITE_SUPABASE_PROJECT_ID="your-project"
   VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   ```

5. **Apply Supabase Migrations**

   Apply the database schema to your Supabase project:

   **Option A: Using Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the SQL from `supabase/migrations/20260509133850_278d6fdb-f35d-4f5a-8361-11b18dd7c6e1.sql`
   - Execute the query

   **Option B: Using Supabase CLI**
   ```bash
   npm install -g supabase
   supabase link --project-ref your-project-ref
   supabase db push
   ```

6. **Enable Authentication in Supabase**

   - Go to Authentication > Providers in your Supabase project
   - Enable Email/Password authentication (it's enabled by default)
   - Optionally configure other providers (Google, GitHub, etc.)

7. **Run the Development Server**

   ```bash
   npm run dev
   ```

8. **Access the Application**

   - Open your browser and navigate to `http://localhost:3000`
   - You'll be redirected to the login page
   - Click "Sign Up" to create a new account, or use existing credentials if you have an account

## Authentication Features

The application includes a complete authentication system with:

- **Sign Up**: Create new user accounts with email and password
- **Sign In**: Login with existing credentials
- **Sign Out**: Logout from the application
- **Token Storage**: Authentication tokens are automatically stored in localStorage
- **Protected Routes**: Only authenticated users can access the dashboard and other features
- **Session Management**: Automatic session persistence and token refresh

### Authentication Hooks and Components

#### `useAuth()` Hook

Use the `useAuth()` hook in any component to access authentication state and functions:

```typescript
import { useAuth } from "@/hooks/use-auth";

export function MyComponent() {
  const {
    user,           // Current user object
    session,        // Current session
    isLoading,      // Loading state
    isAuthenticated, // Boolean indicating if user is logged in
    signIn,         // Function to sign in
    signUp,         // Function to sign up
    signOut,        // Function to sign out
  } = useAuth();

  return (
    <div>
      {isAuthenticated && <p>Welcome, {user?.email}</p>}
    </div>
  );
}
```

#### `ProtectedRoute` Component

Wrap components with `ProtectedRoute` to ensure only authenticated users can access them:

```typescript
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export function AdminPanel() {
  return (
    <ProtectedRoute>
      <YourAdminContent />
    </ProtectedRoute>
  );
}
```

### User Account

- Users can sign up with any email address
- Passwords must be at least 6 characters
- Session tokens are automatically refreshed
- User logout clears all session data

## Documentation

For more detailed information:

- **[AUTHENTICATION_SETUP.md](AUTHENTICATION_SETUP.md)** - Step-by-step Supabase setup guide
- **[TOKEN_STORAGE_GUIDE.md](TOKEN_STORAGE_GUIDE.md)** - How tokens are stored and verified in localStorage

## Folder Structure

```
.
├── src/
│   ├── components/       # UI components
│   ├── hooks/            # Custom hooks
│   ├── integrations/     # Supabase integrations
│   ├── lib/              # Utility functions
│   ├── routes/           # Application routes
│   └── styles.css        # Global styles
├── supabase/             # Supabase configuration and migrations
├── .env                  # Environment variables
├── package.json          # Project dependencies
├── vite.config.ts        # Vite configuration
└── README.md             # Project documentation
```

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.
