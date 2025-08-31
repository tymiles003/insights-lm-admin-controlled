import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Globe, Video, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useProfile } from '@/hooks/useProfile';

const EmptyDashboard = () => {
  const navigate = useNavigate();
  const {
    createNotebook,
    isCreating
  } = useNotebooks();
  const { isAdmin } = useProfile();

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

  // Listen for successful notebook creation to navigate
  React.useEffect(() => {
    // This will be handled by the mutation's onSuccess in useNotebooks
  }, []);

  return <div className="text-center py-16">
      <div className="mb-12">
        <h2 className="text-3xl font-medium text-gray-900 mb-4">
          {isAdmin ? 'Create your first notebook' : 'Welcome to InsightsLM'}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {isAdmin 
            ? 'InsightsLM is an AI-powered research and writing assistant that works best with the sources you upload'
            : 'Browse available notebooks to explore AI-powered research and insights'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">PDFs</h3>
          <p className="text-gray-600">Upload research papers, reports, and documents</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Globe className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Websites</h3>
          <p className="text-gray-600">Add web pages and online articles as sources</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Video className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Audio</h3>
          <p className="text-gray-600">Include multimedia content in your research</p>
        </div>
      </div>

      {isAdmin && (
        <Button onClick={handleCreateNotebook} size="lg" className="bg-blue-600 hover:bg-blue-700" disabled={isCreating}>
          <Upload className="h-5 w-5 mr-2" />
          {isCreating ? 'Creating...' : 'Create notebook'}
        </Button>
      )}
      {!isAdmin && (
        <p className="text-gray-600">Contact your administrator to request access to specific notebooks.</p>
      )}
    </div>;
};
export default EmptyDashboard;