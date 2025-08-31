import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface StripeSubscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export const useStripe = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's subscription data
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['stripe-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }
      
      return data as StripeSubscription | null;
    },
    enabled: !!user,
  });

  // Create checkout session
  const createCheckoutSession = useMutation({
    mutationFn: async ({
      priceId,
      mode,
      successUrl,
      cancelUrl,
    }: {
      priceId: string;
      mode: 'payment' | 'subscription';
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          mode,
          success_url: successUrl,
          cancel_url: cancelUrl,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error('Checkout failed:', error);
      toast({
        title: 'Checkout Failed',
        description: error.message || 'Failed to start checkout process',
        variant: 'destructive',
      });
    },
  });

  return {
    subscription,
    isLoadingSubscription,
    createCheckoutSession: createCheckoutSession.mutate,
    isCreatingCheckout: createCheckoutSession.isPending,
  };
};