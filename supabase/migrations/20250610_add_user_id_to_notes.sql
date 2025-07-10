-- Add user_id to notes table
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Set user_id for existing notes to the notebook owner
UPDATE public.notes 
SET user_id = notebooks.user_id
FROM public.notebooks
WHERE notes.notebook_id = notebooks.id
AND notes.user_id IS NULL;

-- Make user_id NOT NULL after setting values
ALTER TABLE public.notes ALTER COLUMN user_id SET NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);

-- Update notes relationships in the notes table
ALTER TABLE public.notes ADD CONSTRAINT notes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;