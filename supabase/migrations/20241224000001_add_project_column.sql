-- Add project column to tasks table
ALTER TABLE public.tasks ADD COLUMN project TEXT;

-- Create index for better performance
CREATE INDEX idx_tasks_project ON public.tasks(project);