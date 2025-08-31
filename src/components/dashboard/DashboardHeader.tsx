
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut, CreditCard } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '@/services/authService';
import Logo from '@/components/ui/Logo';

interface DashboardHeaderProps {
  userEmail?: string;
}

const DashboardHeader = ({ userEmail }: DashboardHeaderProps) => {
  const { logout } = useLogout();
  const navigate = useNavigate();

  return (
    <header className="bg-white/95 backdrop-blur-xl px-6 py-6 border-b border-slate-200/60 legal-shadow sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Logo size="md" className="legal-hover-lift" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-crimson">Legal Insights</h1>
            <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">AI Research Platform</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center cursor-pointer hover:from-slate-800 hover:to-slate-900 transition-all duration-300 legal-shadow-lg legal-hover-lift border border-white/10">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 legal-shadow-lg border-slate-200/60">
              <DropdownMenuItem onClick={() => navigate('/pricing')} className="cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
                <CreditCard className="h-4 w-4 mr-2" />
                Subscription
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
