import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useProfile() {
  const { user } = useAuth();

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116' && user) {
          console.log('Profile not found, creating new profile for user:', user.email);
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || null,
              role: 'user' // Default role
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating profile:', createError);
            throw createError;
          }
          
          return newProfile;
        } else {
          return null;
        }
      }
      
      return data;
    },
    enabled: !!user,
    retry: false, // Don't retry on profile fetch errors
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isAdmin: profileQuery.data?.role === 'admin',
    isUser: profileQuery.data?.role === 'user',
  };
}