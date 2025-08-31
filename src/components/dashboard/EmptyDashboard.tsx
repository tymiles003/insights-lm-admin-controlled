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
      <div className="mb-16 animate-fade-in-up">
        <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight font-crimson">
          {isAdmin ? 'Create your first legal research notebook' : 'Welcome to Legal Insights'}
        </h2>
        <p className="text-xl text-slate-700 max-w-3xl mx-auto font-semibold leading-relaxed">
          {isAdmin 
            ? 'Legal Insights is an advanced AI-powered legal research platform that analyzes your documents, case law, and legal materials to provide intelligent insights and comprehensive analysis'
            : 'Browse available research notebooks to explore AI-powered legal analysis and comprehensive insights'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <div className="bg-white rounded-2xl border border-slate-200/60 p-8 text-center legal-shadow-lg legal-hover-lift group">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center legal-shadow-lg group-hover:legal-glow transition-all duration-300">
            <FileText className="h-8 w-8 text-white drop-shadow-sm" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Legal Documents</h3>
          <p className="text-slate-600 font-medium leading-relaxed">Upload contracts, case law, legal briefs, and court documents for comprehensive AI analysis</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-8 text-center legal-shadow-lg legal-hover-lift group">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mx-auto mb-6 flex items-center justify-center legal-shadow-lg group-hover:legal-glow transition-all duration-300">
            <Globe className="h-8 w-8 text-white drop-shadow-sm" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Legal Resources</h3>
          <p className="text-slate-600 font-medium leading-relaxed">Import legal databases, court websites, and regulatory sources for enhanced research</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-8 text-center legal-shadow-lg legal-hover-lift group">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center legal-shadow-lg group-hover:legal-glow transition-all duration-300">
            <Video className="h-8 w-8 text-white drop-shadow-sm" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Depositions & Audio</h3>
          <p className="text-slate-600 font-medium leading-relaxed">Analyze depositions, hearings, and legal proceedings with AI transcription</p>
        </div>
      </div>

      {isAdmin && (
        <Button 
          onClick={handleCreateNotebook} 
          className="legal-button-primary text-white font-bold px-12 py-5 text-xl rounded-2xl legal-hover-lift animate-fade-in-up" 
          style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          disabled={isCreating}
        >
          <Upload className="h-6 w-6 mr-3" />
          {isCreating ? 'Creating research notebook...' : 'Create Legal Research Notebook'}
        </Button>
      )}
      {!isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200/60 p-8 legal-shadow-lg max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <p className="text-slate-700 font-semibold text-lg leading-relaxed">Contact your administrator to request access to specific legal research notebooks and begin your AI-powered legal analysis.</p>
        </div>
      )}
    </div>;
};
export default EmptyDashboard;