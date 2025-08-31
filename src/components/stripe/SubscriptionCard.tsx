import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Calendar, CreditCard } from 'lucide-react';
import { useStripe } from '@/hooks/useStripe';
import { stripeProducts } from '@/stripe-config';

export function SubscriptionCard() {
  const { subscription, isLoadingSubscription } = useStripe();

  if (isLoadingSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription || !subscription.subscription_id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            No active subscription found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You don't have an active subscription. Upgrade to access premium features.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Find the product name from our config
  const product = stripeProducts.find(p => p.priceId === subscription.price_id);
  const productName = product?.name || 'Unknown Plan';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trialing':
        return 'default';
      case 'past_due':
        return 'warning';
      case 'canceled':
      case 'unpaid':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Current Subscription
        </CardTitle>
        <CardDescription>
          Your subscription details and billing information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Plan:</span>
          <Badge variant="outline" className="font-semibold">
            {productName}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          <Badge variant={getStatusColor(subscription.subscription_status)}>
            {subscription.subscription_status}
          </Badge>
        </div>

        {subscription.current_period_end && (
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Next billing:
            </span>
            <span className="text-sm">
              {formatDate(subscription.current_period_end)}
            </span>
          </div>
        )}

        {subscription.payment_method_brand && subscription.payment_method_last4 && (
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment method:
            </span>
            <span className="text-sm">
              {subscription.payment_method_brand.toUpperCase()} •••• {subscription.payment_method_last4}
            </span>
          </div>
        )}

        {subscription.cancel_at_period_end && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Your subscription will cancel at the end of the current billing period.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}