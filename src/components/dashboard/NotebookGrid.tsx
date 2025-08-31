
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import NotebookCard from './NotebookCard';
import { Check, Grid3X3, List, ChevronDown } from 'lucide-react';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NotebookGrid = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('Most recent');
  const {
    notebooks,
    isLoading,
    createNotebook,
    isCreating
  } = useNotebooks();
  const navigate = useNavigate();
  const { isAdmin } = useProfile();

  const sortedNotebooks = useMemo(() => {
    if (!notebooks) return [];
    
    const sorted = [...notebooks];
    
    if (sortBy === 'Most recent') {
      return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    } else if (sortBy === 'Title') {
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return sorted;
  }, [notebooks, sortBy]);

  const handleCreateNotebook = () => {
    if (!isAdmin) {
      console.error('Only admins can create notebooks');
      return;
    }

    createNotebook({
      title: 'Untitled notebook',
      description: ''
    });
  };

  const handleNotebookClick = (notebookId: string, e: React.MouseEvent) => {
    // Check if the click is coming from a delete action or other interactive element
    const target = e.target as HTMLElement;
    const isDeleteAction = target.closest('[data-delete-action="true"]') || target.closest('.delete-button') || target.closest('[role="dialog"]');
    if (isDeleteAction) {
      console.log('Click prevented due to delete action');
      return;
    }
    navigate(`/notebook/${notebookId}`);
  };

  if (isLoading) {
    return <div className="text-center py-16">
        <p className="text-gray-600">Loading notebooks...</p>
      </div>;
  }

  return <div>
      <div className="flex items-center justify-between mb-10 animate-fade-in-up">
        {isAdmin && (
          <Button 
            className="legal-button-primary text-white rounded-2xl px-10 py-4 font-bold text-lg legal-hover-lift" 
            onClick={handleCreateNotebook} 
            disabled={isCreating}
          >
            {isCreating ? 'Creating research notebook...' : '+ Create New Notebook'}
          </Button>
        )}
        {!isAdmin && <div />}
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2 bg-white rounded-xl border border-slate-200/60 px-5 py-3 cursor-pointer hover:bg-slate-50 transition-all duration-200 legal-shadow legal-hover-lift">
                <span className="text-sm text-slate-800 font-semibold">{sortBy}</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 legal-shadow-lg border-slate-200/60">
              <DropdownMenuItem onClick={() => setSortBy('Most recent')} className="flex items-center justify-between text-slate-700 font-medium">
                Most recent
                {sortBy === 'Most recent' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('Title')} className="flex items-center justify-between text-slate-700 font-medium">
                Title
                {sortBy === 'Title' && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        {sortedNotebooks.map(notebook => <div key={notebook.id} onClick={e => handleNotebookClick(notebook.id, e)}>
            <NotebookCard notebook={{
          id: notebook.id,
          title: notebook.title,
          date: new Date(notebook.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          sources: notebook.sources?.[0]?.count || 0,
          icon: notebook.icon || '📝',
          color: notebook.color || 'bg-gray-100'
        }} />
          </div>)}
      </div>
    </div>;
};

export default NotebookGrid;
