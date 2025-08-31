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
        // If profile doesn't exist, return null instead of throwing
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
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