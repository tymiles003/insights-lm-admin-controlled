export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1RbOY8Rq6DMs2oQE5wBveHlE',
    name: 'Gold',
    description: 'Gold Package',
    mode: 'subscription',
  },
];