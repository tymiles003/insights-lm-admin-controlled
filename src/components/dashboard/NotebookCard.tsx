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
      className={`rounded-xl border ${borderClass} ${backgroundClass} p-6 hover:legal-shadow-lg transition-all duration-200 cursor-pointer relative h-52 flex flex-col legal-shadow`}
    >
      {isAdmin && (
        <div className="absolute top-3 right-3" data-delete-action="true">
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <button onClick={handleDeleteClick} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors delete-button" disabled={isDeleting} data-delete-action="true">
                <Trash2 className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this research notebook?</AlertDialogTitle>
                <AlertDialogDescription>
                  You're about to delete this legal research notebook and all of its content. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      
      <div className="w-14 h-14 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center mb-4 legal-shadow">
        <span className="text-3xl">{notebook.icon}</span>
      </div>
      
      <h3 className="text-slate-800 mb-3 pr-6 line-clamp-2 text-xl font-semibold flex-grow leading-tight">
        {notebook.title}
      </h3>
      
      <div className="flex items-center justify-between text-sm text-slate-500 mt-auto font-medium">
        <span>{notebook.date} • {notebook.sources} document{notebook.sources !== 1 ? 's' : ''}</span>
      </div>
    </div>;
};

export default NotebookCard;
