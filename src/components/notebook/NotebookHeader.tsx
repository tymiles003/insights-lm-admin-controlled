import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, LogOut, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotebookUpdate } from '@/hooks/useNotebookUpdate';
import { useProfile } from '@/hooks/useProfile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/services/authService';
import Logo from '@/components/ui/Logo';

interface NotebookHeaderProps {
  title: string;
  notebookId?: string;
}

const NotebookHeader = ({ title, notebookId }: NotebookHeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const { updateNotebook, isUpdating } = useNotebookUpdate();
  const { isAdmin } = useProfile();

  const handleTitleClick = () => {
    // Only allow editing if user is admin
    if (notebookId && isAdmin && !isUpdating && !isEditing) {
      setIsEditing(true);
      setEditedTitle(title);
    }
  };

  const handleTitleSubmit = () => {
    if (notebookId && editedTitle.trim() && editedTitle !== title && isAdmin) {
      updateNotebook({
        id: notebookId,
        updates: { title: editedTitle.trim() }
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditedTitle(title);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleTitleSubmit();
  };

  const handleIconClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 px-6 py-6 legal-shadow sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleIconClick}
              className="hover:bg-slate-50 rounded-xl transition-all duration-200 p-2 legal-hover-lift"
            >
              <Logo size="md" />
            </button>
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="text-2xl font-bold text-slate-900 border-none shadow-none p-0 h-auto focus-visible:ring-0 min-w-[300px] w-auto tracking-tight font-crimson"
                autoFocus
                disabled={isUpdating}
              />
            ) : (
              <span 
                className={`text-2xl font-bold text-slate-900 rounded-xl px-4 py-3 transition-all duration-200 tracking-tight font-crimson ${isAdmin ? 'cursor-pointer hover:bg-slate-50 legal-hover-lift' : ''}`}
                onClick={handleTitleClick}
              >
                {title}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
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
      </div>
    </header>
  );
};

export default NotebookHeader;
