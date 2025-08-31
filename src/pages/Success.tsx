import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';

const Success = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Invalidate subscription data when user lands on success page
  useEffect(() => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: ['stripe-subscription', user.id] });
    }
  }, [user, queryClient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
      <DashboardHeader userEmail={user?.email} />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-900 mb-4">
                Payment Successful!
              </CardTitle>
              <CardDescription className="text-lg text-slate-600">
                Thank you for your purchase. Your subscription is now active.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium text-center">
                  You now have access to all premium features of Legal Insights
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">What's next?</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Start uploading your legal documents</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Create your first research notebook</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Explore AI-powered legal analysis</span>
                  </li>
                </ul>
              </div>

              <Button 
                onClick={() => navigate('/')}
                className="w-full"
                size="lg"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Success;