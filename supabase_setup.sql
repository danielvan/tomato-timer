    -- COPY AND PASTE THIS INTO YOUR SUPABASE SQL EDITOR
    -- This creates all the tables and policies for Optimitimer

    -- Create custom types
    CREATE TYPE task_status AS ENUM ('not-started', 'in-progress', 'done', 'waiting');
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

    -- Create profiles table (extends auth.users)
    CREATE TABLE public.profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- Create task_groups table (replaces simple projects)
    CREATE TABLE public.task_groups (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#4CAF50',
        priority task_priority DEFAULT 'medium',
        is_active BOOLEAN DEFAULT false,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- Create tasks table (enhanced version)
    CREATE TABLE public.tasks (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
        group_id UUID REFERENCES public.task_groups(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        status task_status DEFAULT 'not-started',
        priority task_priority DEFAULT 'medium',
        deadline DATE,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- Create dividers table (separate from tasks for clarity)
    CREATE TABLE public.dividers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
        text TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );

    -- Create focus_sessions table (track Pomodoro sessions)
    CREATE TABLE public.focus_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
        group_id UUID REFERENCES public.task_groups(id) ON DELETE SET NULL,
        duration_minutes INTEGER NOT NULL,
        completed_tasks UUID[] DEFAULT '{}',
        notes TEXT,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE
    );

    -- Enable Row Level Security on all tables
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.task_groups ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.dividers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies

    -- Profiles: Users can only see and edit their own profile
    CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);

    CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);

    CREATE POLICY "Users can insert own profile" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);

    -- Task Groups: Users can only access their own groups
    CREATE POLICY "Users can view own task groups" ON public.task_groups
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can create own task groups" ON public.task_groups
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own task groups" ON public.task_groups
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own task groups" ON public.task_groups
        FOR DELETE USING (auth.uid() = user_id);

    -- Tasks: Users can only access their own tasks
    CREATE POLICY "Users can view own tasks" ON public.tasks
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can create own tasks" ON public.tasks
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own tasks" ON public.tasks
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own tasks" ON public.tasks
        FOR DELETE USING (auth.uid() = user_id);

    -- Dividers: Users can only access their own dividers
    CREATE POLICY "Users can view own dividers" ON public.dividers
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can create own dividers" ON public.dividers
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own dividers" ON public.dividers
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own dividers" ON public.dividers
        FOR DELETE USING (auth.uid() = user_id);

    -- Focus Sessions: Users can only access their own sessions
    CREATE POLICY "Users can view own focus sessions" ON public.focus_sessions
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can create own focus sessions" ON public.focus_sessions
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own focus sessions" ON public.focus_sessions
        FOR UPDATE USING (auth.uid() = user_id);

    -- Create indexes for better performance
    CREATE INDEX idx_task_groups_user_id ON public.task_groups(user_id);
    CREATE INDEX idx_task_groups_active ON public.task_groups(user_id, is_active);
    CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
    CREATE INDEX idx_tasks_group_id ON public.tasks(group_id);
    CREATE INDEX idx_tasks_status ON public.tasks(user_id, status);
    CREATE INDEX idx_dividers_user_id ON public.dividers(user_id);
    CREATE INDEX idx_focus_sessions_user_id ON public.focus_sessions(user_id);

    -- Function to automatically create profile on signup
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
        INSERT INTO public.profiles (id, email, full_name)
        VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
        RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Trigger to create profile when user signs up
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

    -- Function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS trigger AS $$
    BEGIN
        NEW.updated_at = timezone('utc'::text, now());
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Triggers for updated_at
    CREATE TRIGGER handle_updated_at_profiles
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

    CREATE TRIGGER handle_updated_at_task_groups
        BEFORE UPDATE ON public.task_groups
        FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

    CREATE TRIGGER handle_updated_at_tasks
        BEFORE UPDATE ON public.tasks
        FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();