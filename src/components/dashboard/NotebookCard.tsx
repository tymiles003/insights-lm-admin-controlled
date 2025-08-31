import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useNotebookDelete } from '@/hooks/useNotebookDelete';
import { useProfile } from '@/hooks/useProfile';

interface NotebookCardProps {
  notebook: {
    id: string;
    title: string;
    date: string;
    sources: number;
    icon: string;
    color: string;
    hasCollaborators?: boolean;
  };
}

const NotebookCard = ({
  notebook
}: NotebookCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const {
    deleteNotebook,
    isDeleting
  } = useNotebookDelete();
  const { isAdmin } = useProfile();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Delete button clicked for notebook:', notebook.id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Confirming delete for notebook:', notebook.id);
    deleteNotebook(notebook.id);
    setShowDeleteDialog(false);
  };

  // Generate CSS classes from color name
  const colorName = notebook.color || 'gray';
  const backgroundClass = `bg-${colorName}-100`;
  const borderClass = `border-${colorName}-200`;

  return <div 
      className={`rounded-2xl border ${borderClass} ${backgroundClass} p-8 hover:legal-shadow-xl transition-all duration-300 cursor-pointer relative h-60 flex flex-col legal-shadow-lg legal-hover-lift group overflow-hidden`}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/5 pointer-events-none"></div>
      
      {isAdmin && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" data-delete-action="true">
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <button onClick={handleDeleteClick} className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-all duration-200 delete-button legal-shadow" disabled={isDeleting} data-delete-action="true">
                <Trash2 className="h-5 w-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-bold text-slate-900">Delete this research notebook?</AlertDialogTitle>
                <AlertDialogDescription>
                  You're about to permanently delete this legal research notebook and all of its content. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-semibold">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 font-semibold" disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      
      <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center mb-6 legal-shadow-lg border border-white/20 relative z-10">
        <span className="text-4xl drop-shadow-sm">{notebook.icon}</span>
      </div>
      
      <h3 className="text-slate-900 mb-4 pr-8 line-clamp-2 text-2xl font-bold flex-grow leading-tight tracking-tight relative z-10">
        {notebook.title}
      </h3>
      
      <div className="flex items-center justify-between text-sm text-slate-600 mt-auto font-semibold relative z-10">
        <span>{notebook.date} • {notebook.sources} document{notebook.sources !== 1 ? 's' : ''}</span>
      </div>
    </div>;
};

export default NotebookCard;
