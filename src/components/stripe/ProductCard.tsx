import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Loader2 } from 'lucide-react';
import { StripeProduct } from '@/stripe-config';
import { useStripe } from '@/hooks/useStripe';

interface ProductCardProps {
  product: StripeProduct;
  isPopular?: boolean;
}

export function ProductCard({ product, isPopular = false }: ProductCardProps) {
  const { createCheckoutSession, isCreatingCheckout } = useStripe();

  const handlePurchase = () => {
    const successUrl = `${window.location.origin}/success`;
    const cancelUrl = `${window.location.origin}/pricing`;

    createCheckoutSession({
      priceId: product.priceId,
      mode: product.mode,
      successUrl,
      cancelUrl,
    });
  };

  return (
    <Card className={`relative ${isPopular ? 'border-primary shadow-lg' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Crown className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
        <CardDescription className="text-base">
          {product.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            $25.00
          </div>
          <p className="text-sm text-muted-foreground">
            {product.mode === 'subscription' ? 'per month' : 'one-time'}
          </p>
        </div>

        <Button 
          onClick={handlePurchase}
          disabled={isCreatingCheckout}
          className="w-full"
          size="lg"
        >
          {isCreatingCheckout ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Get ${product.name}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}