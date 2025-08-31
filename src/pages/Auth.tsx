import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import Logo from '@/components/ui/Logo';

const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 legal-gradient">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Legal Insights</h1>
          <p className="text-slate-200 text-lg font-medium">AI-powered legal research platform</p>
          <p className="text-slate-300 text-sm mt-2">Streamline your legal research with intelligent document analysis</p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;