# Optimitimer Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier available)

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (usually takes 2-3 minutes)
3. Go to Settings > API in your Supabase dashboard
4. Copy your project URL and anon key

### 3. Configure Environment
1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Update Supabase Client Configuration
Edit `src/config/supabase.js` and replace the placeholder values with your actual Supabase URL and key.

### 5. Run Database Migrations
In your Supabase dashboard:
1. Go to SQL Editor
2. Copy the contents of `supabase/migrations/20241201000001_initial_schema.sql`
3. Paste and run the SQL to create all tables and policies

### 6. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Database Schema

### Tables Created:
- `profiles` - User profiles (extends auth.users)
- `task_groups` - Project/group organization for tasks
- `tasks` - Enhanced tasks with priorities and group association
- `dividers` - Text dividers for organization
- `focus_sessions` - Pomodoro session tracking

### Features:
- Row Level Security (RLS) - Users only see their own data
- Real-time subscriptions ready
- Automatic profile creation on signup
- Proper indexing for performance

## Next Steps
After setup, you can:
1. Test user registration/login
2. Create task groups and tasks
3. Use the Pomodoro timer with task groups
4. Sync data across devices

## Troubleshooting
- Make sure your Supabase project is fully initialized
- Check that RLS policies are enabled
- Verify your API keys are correct
- Check browser console for any errors