-- Create tags table for categorizing content
CREATE TABLE public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT CHECK (type IN ('client', 'brand', 'topic', 'time_period', 'other')),
  description TEXT,
  color TEXT DEFAULT '#gray',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Create notebook_tags junction table
CREATE TABLE public.notebook_tags (
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (notebook_id, tag_id)
);

-- Create user_permissions table for access control
CREATE TABLE public.user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, tag_id)
);

-- Create source_tags junction table (for direct source tagging if needed)
CREATE TABLE public.source_tags (
  source_id UUID REFERENCES public.sources(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (source_id, tag_id)
);

-- Add is_public column to notebooks for admin-created public content
ALTER TABLE public.notebooks ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notebook_tags_notebook_id ON public.notebook_tags(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notebook_tags_tag_id ON public.notebook_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_tag_id ON public.user_permissions(tag_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_is_public ON public.notebooks(is_public);

-- RLS Policies for tags table
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tags" ON public.tags
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view tags they have permission for" ON public.tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_permissions
      WHERE user_permissions.user_id = auth.uid()
      AND user_permissions.tag_id = tags.id
      AND (user_permissions.expires_at IS NULL OR user_permissions.expires_at > now())
    )
    OR public.is_admin()
  );

-- RLS Policies for notebook_tags
ALTER TABLE public.notebook_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notebook tags" ON public.notebook_tags
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view notebook tags for accessible notebooks" ON public.notebook_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.notebooks n
      WHERE n.id = notebook_tags.notebook_id
      AND (
        n.user_id = auth.uid()
        OR n.is_public = true
        OR EXISTS (
          SELECT 1 FROM public.user_permissions up
          WHERE up.user_id = auth.uid()
          AND up.tag_id = notebook_tags.tag_id
          AND (up.expires_at IS NULL OR up.expires_at > now())
        )
      )
    )
    OR public.is_admin()
  );

-- RLS Policies for user_permissions
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage user permissions" ON public.user_permissions
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view their own permissions" ON public.user_permissions
  FOR SELECT USING (user_id = auth.uid());

-- Function to get user's accessible notebooks
CREATE OR REPLACE FUNCTION public.get_accessible_notebooks()
RETURNS SETOF public.notebooks AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT n.*
  FROM public.notebooks n
  WHERE 
    -- User's own notebooks
    n.user_id = auth.uid()
    -- Public notebooks
    OR n.is_public = true
    -- Notebooks with tags the user has permission for
    OR EXISTS (
      SELECT 1 
      FROM public.notebook_tags nt
      JOIN public.user_permissions up ON up.tag_id = nt.tag_id
      WHERE nt.notebook_id = n.id
      AND up.user_id = auth.uid()
      AND (up.expires_at IS NULL OR up.expires_at > now())
    )
    -- Admin can see all
    OR public.is_admin()
  ORDER BY n.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_accessible_notebooks() TO authenticated;