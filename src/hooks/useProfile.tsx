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
        // If profile doesn't exist yet, the database trigger will create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found yet, will retry...');
          throw new Error('Profile not ready yet');
        }
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
    retry: 3, // Retry up to 3 times for profile creation
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Exponential backoff
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isAdmin: profileQuery.data?.role === 'admin',
    isUser: profileQuery.data?.role === 'user',
  };
}