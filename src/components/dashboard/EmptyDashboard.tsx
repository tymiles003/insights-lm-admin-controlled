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
        <h2 className="text-3xl font-semibold text-slate-800 mb-4 tracking-tight">
          {isAdmin ? 'Create your first legal research notebook' : 'Welcome to Legal Insights'}
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
          {isAdmin 
            ? 'Legal Insights is an AI-powered legal research platform that analyzes your documents, case law, and legal materials to provide intelligent insights'
            : 'Browse available research notebooks to explore AI-powered legal analysis and insights'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center legal-shadow hover:legal-shadow-lg transition-all duration-200">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center legal-shadow">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Legal Documents</h3>
          <p className="text-slate-600">Upload contracts, case law, legal briefs, and court documents</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center legal-shadow hover:legal-shadow-lg transition-all duration-200">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mx-auto mb-4 flex items-center justify-center legal-shadow">
            <Globe className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Legal Resources</h3>
          <p className="text-slate-600">Import legal databases, court websites, and regulatory sources</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center legal-shadow hover:legal-shadow-lg transition-all duration-200">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center legal-shadow">
            <Video className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Depositions & Audio</h3>
          <p className="text-slate-600">Analyze depositions, hearings, and legal proceedings</p>
        </div>
      </div>

      {isAdmin && (
        <Button 
          onClick={handleCreateNotebook} 
          size="lg" 
          className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-4 text-lg legal-shadow-lg transition-all duration-200" 
          disabled={isCreating}
        >
          <Upload className="h-5 w-5 mr-2" />
          {isCreating ? 'Creating research notebook...' : 'Create legal research notebook'}
        </Button>
      )}
      {!isAdmin && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 legal-shadow max-w-md mx-auto">
          <p className="text-slate-600 font-medium">Contact your administrator to request access to specific legal research notebooks.</p>
        </div>
      )}
    </div>;
};
export default EmptyDashboard;