-- Update RLS policies for notebooks table
DROP POLICY IF EXISTS "Users can view own notebooks" ON public.notebooks;
DROP POLICY IF EXISTS "Users can insert own notebooks" ON public.notebooks;
DROP POLICY IF EXISTS "Users can update own notebooks" ON public.notebooks;
DROP POLICY IF EXISTS "Users can delete own notebooks" ON public.notebooks;

-- New notebook policies with role and permission awareness
CREATE POLICY "Users can view accessible notebooks" ON public.notebooks
  FOR SELECT USING (
    -- Own notebooks
    user_id = auth.uid()
    -- Public notebooks
    OR is_public = true
    -- Notebooks with permitted tags
    OR EXISTS (
      SELECT 1 
      FROM public.notebook_tags nt
      JOIN public.user_permissions up ON up.tag_id = nt.tag_id
      WHERE nt.notebook_id = notebooks.id
      AND up.user_id = auth.uid()
      AND (up.expires_at IS NULL OR up.expires_at > now())
    )
    -- Admins can see all
    OR public.is_admin()
  );

CREATE POLICY "Only admins can create notebooks" ON public.notebooks
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update notebooks" ON public.notebooks
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Only admins can delete notebooks" ON public.notebooks
  FOR DELETE USING (public.is_admin());

-- Update RLS policies for sources table
DROP POLICY IF EXISTS "Users can view sources in their notebooks" ON public.sources;
DROP POLICY IF EXISTS "Users can insert sources in their notebooks" ON public.sources;
DROP POLICY IF EXISTS "Users can update sources in their notebooks" ON public.sources;
DROP POLICY IF EXISTS "Users can delete sources in their notebooks" ON public.sources;

-- New source policies with role and permission awareness
CREATE POLICY "Users can view sources in accessible notebooks" ON public.sources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.notebooks n
      WHERE n.id = sources.notebook_id
      AND (
        n.user_id = auth.uid()
        OR n.is_public = true
        OR EXISTS (
          SELECT 1 
          FROM public.notebook_tags nt
          JOIN public.user_permissions up ON up.tag_id = nt.tag_id
          WHERE nt.notebook_id = n.id
          AND up.user_id = auth.uid()
          AND (up.expires_at IS NULL OR up.expires_at > now())
        )
        OR public.is_admin()
      )
    )
  );

CREATE POLICY "Only admins can create sources" ON public.sources
  FOR INSERT WITH CHECK (
    public.is_admin()
    AND EXISTS (
      SELECT 1 FROM public.notebooks
      WHERE id = sources.notebook_id
    )
  );

CREATE POLICY "Only admins can update sources" ON public.sources
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Only admins can delete sources" ON public.sources
  FOR DELETE USING (public.is_admin());

-- Update RLS policies for notes table
DROP POLICY IF EXISTS "Users can view notes in their notebooks" ON public.notes;
DROP POLICY IF EXISTS "Users can create notes in their notebooks" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

-- New notes policies - users can still create notes in accessible notebooks
CREATE POLICY "Users can view notes in accessible notebooks" ON public.notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.notebooks n
      WHERE n.id = notes.notebook_id
      AND (
        n.user_id = auth.uid()
        OR n.is_public = true
        OR EXISTS (
          SELECT 1 
          FROM public.notebook_tags nt
          JOIN public.user_permissions up ON up.tag_id = nt.tag_id
          WHERE nt.notebook_id = n.id
          AND up.user_id = auth.uid()
          AND (up.expires_at IS NULL OR up.expires_at > now())
        )
        OR public.is_admin()
      )
    )
  );

CREATE POLICY "Users can create notes in accessible notebooks" ON public.notes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.notebooks n
      WHERE n.id = notes.notebook_id
      AND (
        n.is_public = true
        OR EXISTS (
          SELECT 1 
          FROM public.notebook_tags nt
          JOIN public.user_permissions up ON up.tag_id = nt.tag_id
          WHERE nt.notebook_id = n.id
          AND up.user_id = auth.uid()
          AND (up.expires_at IS NULL OR up.expires_at > now())
        )
        OR public.is_admin()
      )
    )
  );

CREATE POLICY "Users can update their own notes" ON public.notes
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can delete their own notes" ON public.notes
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- Update RLS policies for n8n_chat_histories table
DROP POLICY IF EXISTS "Users can view their own chat histories" ON public.n8n_chat_histories;
DROP POLICY IF EXISTS "Chat histories are automatically deleted after 7 days" ON public.n8n_chat_histories;

-- Keep chat histories accessible based on notebook permissions
CREATE POLICY "Users can view chat histories for accessible notebooks" ON public.n8n_chat_histories
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_admin()
  );

-- Function to check if user has access to notebook
CREATE OR REPLACE FUNCTION public.user_has_notebook_access(notebook_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.notebooks n
    WHERE n.id = notebook_id
    AND (
      n.user_id = user_id
      OR n.is_public = true
      OR EXISTS (
        SELECT 1 
        FROM public.notebook_tags nt
        JOIN public.user_permissions up ON up.tag_id = nt.tag_id
        WHERE nt.notebook_id = n.id
        AND up.user_id = user_id
        AND (up.expires_at IS NULL OR up.expires_at > now())
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'admin'
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.user_has_notebook_access(UUID, UUID) TO authenticated;