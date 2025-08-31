import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from '@/components/stripe/ProductCard';
import { stripeProducts } from '@/stripe-config';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    'AI-powered legal document analysis',
    'Unlimited document uploads',
    'Advanced search capabilities',
    'Citation tracking and verification',
    'Audio overview generation',
    'Research note management',
    'Priority support',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
      <DashboardHeader userEmail={user?.email} />
      
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6 tracking-tight font-crimson">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto font-semibold leading-relaxed">
            Unlock the full power of AI-driven legal research with our premium subscription
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {stripeProducts.map((product, index) => (
            <ProductCard 
              key={product.priceId} 
              product={product} 
              isPopular={index === 0} 
            />
          ))}
        </div>

        {/* Features Section */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">What's Included</CardTitle>
            <CardDescription>
              Everything you need for comprehensive legal research
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Pricing;