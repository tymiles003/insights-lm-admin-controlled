import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import Logo from '@/components/ui/Logo';

const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 legal-gradient relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Logo size="lg" variant="light" className="legal-glow" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-amber-400/20 rounded-xl blur-xl -z-10"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight legal-text-shadow font-crimson">Legal Insights</h1>
          <p className="text-slate-100 text-xl font-semibold mb-2">AI-Powered Legal Research Platform</p>
          <p className="text-slate-200 text-base font-medium leading-relaxed max-w-sm mx-auto">Streamline your legal research with intelligent document analysis and AI-driven insights</p>
        </div>
        <div className="animate-scale-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Auth;