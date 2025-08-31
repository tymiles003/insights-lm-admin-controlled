
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLogout } from '@/services/authService';
import Logo from '@/components/ui/Logo';

interface DashboardHeaderProps {
  userEmail?: string;
}

const DashboardHeader = ({ userEmail }: DashboardHeaderProps) => {
  const { logout } = useLogout();

  return (
    <header className="bg-white px-6 py-5 border-b border-slate-200 legal-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Logo />
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Legal Insights</h1>
            <p className="text-xs text-slate-500 font-medium">Research Platform</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0">
                <div className="w-9 h-9 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:from-slate-700 hover:to-slate-800 transition-all duration-200 legal-shadow">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 legal-shadow">
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-slate-700 hover:text-slate-900">
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
