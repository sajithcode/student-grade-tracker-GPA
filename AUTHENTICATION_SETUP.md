# Supabase Authentication Setup Guide

This guide walks you through setting up Supabase authentication for the Grade Compass application.

## Step 1: Create a Supabase Account

1. Visit [Supabase.com](https://supabase.com)
2. Click "Start your project" or sign in if you have an account
3. Sign up with GitHub, Google, or email
4. Create a new organization if prompted

## Step 2: Create a New Project

1. In the Supabase dashboard, click "New Project"
2. Fill in the project details:
   - **Name**: e.g., "Grade Compass"
   - **Database Password**: Create a secure password
   - **Region**: Choose the region closest to you
3. Click "Create New Project" and wait for it to initialize (2-3 minutes)

## Step 3: Retrieve Your Credentials

Once the project is ready:

1. Go to **Settings > API** in your project dashboard
2. Copy the following values:
   - **Project URL**: This is your `SUPABASE_URL`
   - **Anon Key**: This is your `SUPABASE_PUBLISHABLE_KEY`
   - **Service Role Key**: Keep this safe (server-side only)

## Step 4: Update Environment Variables

Create or update your `.env` file in the project root:

```env
# Get these from Settings > API
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_PROJECT_ID="your-project-id"
```

## Step 5: Apply Database Migrations

### Using Supabase Dashboard (Recommended for beginners):

1. Go to **SQL Editor** in your Supabase project
2. Click "New Query"
3. Open `supabase/migrations/20260509133850_278d6fdb-f35d-4f5a-8361-11b18dd7c6e1.sql` in your project
4. Copy all the SQL content
5. Paste it into the Supabase SQL Editor
6. Click "Run"

### Using Supabase CLI (Advanced):

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Step 6: Enable Authentication

1. In your Supabase project, go to **Authentication > Providers**
2. Verify that **Email** is enabled (it's enabled by default)
3. (Optional) Configure other providers:
   - **Google**: Follow the prompts to connect your Google OAuth app
   - **GitHub**: Follow the prompts to connect your GitHub OAuth app
   - **Discord, Microsoft, Apple**: Configure as needed

## Step 7: Test the Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser
4. You should be redirected to the login page
5. Click "Sign Up" and create a test account with any email

## Troubleshooting

### "Missing Supabase environment variable"

- Ensure your `.env` file is in the root of your project
- Check that `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are correctly copied
- Restart your development server after updating `.env`

### Authentication doesn't work

- Verify Email provider is enabled in Settings > Authentication > Providers
- Check browser console for error messages
- Ensure database migrations have been applied

### Can't create account

- Check the email format (must be a valid email)
- Ensure passwords are at least 6 characters
- Check Supabase project logs for detailed errors

## Security Best Practices

1. **Never commit `.env` to Git**: Add `.env` to your `.gitignore`
2. **Use different keys for production**: Create a separate Supabase project for production
3. **Keep Service Role Key secret**: Never expose it in client-side code
4. **Enable Row Level Security (RLS)**: In Supabase, go to Authentication > Policies
5. **Set strong password requirements**: Go to Authentication > Password & Signups

## Advanced: Row Level Security (RLS)

To secure your database tables:

1. In Supabase, go to **Authentication > Policies**
2. Enable RLS on your tables (students, courses, results)
3. Create policies that restrict access:

   ```sql
   -- Only authenticated users can read their own data
   CREATE POLICY "Users can read their own data"
   ON public.students
   FOR SELECT
   USING (auth.uid() = user_id);
   ```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Authentication Guide](https://supabase.com/docs/guides/auth)
- [Database Security](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/learn/auth-deep-dive/row-level-security)
