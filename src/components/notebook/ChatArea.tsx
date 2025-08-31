import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Upload, FileText, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useSources } from '@/hooks/useSources';
import MarkdownRenderer from '@/components/chat/MarkdownRenderer';
import SaveToNoteButton from './SaveToNoteButton';
import AddSourcesDialog from './AddSourcesDialog';
import { useProfile } from '@/hooks/useProfile';
import { Citation } from '@/types/message';
import { useToast } from '@/hooks/use-toast';

interface ChatAreaProps {
  hasSource: boolean;
  notebookId?: string;
  notebook?: {
    id: string;
    title: string;
    description?: string;
    generation_status?: string;
    icon?: string;
    example_questions?: string[];
  } | null;
  onCitationClick?: (citation: Citation) => void;
}

const ChatArea = ({
  hasSource,
  notebookId,
  notebook,
  onCitationClick
}: ChatAreaProps) => {
  const [message, setMessage] = useState('');
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
  const [showAiLoading, setShowAiLoading] = useState(false);
  const [clickedQuestions, setClickedQuestions] = useState<Set<string>>(new Set());
  const [showAddSourcesDialog, setShowAddSourcesDialog] = useState(false);
  
  const isGenerating = notebook?.generation_status === 'generating';
  const { isAdmin } = useProfile();
  const { toast } = useToast();
  
  const {
    messages,
    sendMessage,
    isSending,
    deleteChatHistory,
    isDeletingChatHistory,
    error: chatError
  } = useChatMessages(notebookId);
  
  const {
    sources
  } = useSources(notebookId);
  
  const sourceCount = sources?.length || 0;

  // Check if at least one source has been successfully processed
  const hasProcessedSource = sources?.some(source => source.processing_status === 'completed') || false;

  // Chat should be disabled if there are no processed sources
  const isChatDisabled = !hasProcessedSource;

  // Track when we send a message to show loading state
  const [lastMessageCount, setLastMessageCount] = useState(0);

  // Ref for auto-scrolling to the most recent message
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // If we have new messages and we have a pending message, clear it
    if (messages.length > lastMessageCount && pendingUserMessage) {
      setPendingUserMessage(null);
      setShowAiLoading(false);
    }
    setLastMessageCount(messages.length);
  }, [messages.length, lastMessageCount, pendingUserMessage]);

  // Auto-scroll when pending message is set, when messages update, or when AI loading appears
  useEffect(() => {
    if (latestMessageRef.current && scrollAreaRef.current) {
      // Find the viewport within the ScrollArea
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        // Use a small delay to ensure the DOM has updated
        setTimeout(() => {
          latestMessageRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 50);
      }
    }
  }, [pendingUserMessage, messages.length, showAiLoading]);
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (textToSend && notebookId) {
      try {
        // Store the pending message to display immediately
        setPendingUserMessage(textToSend);
        await sendMessage({
          notebookId: notebookId,
          role: 'user',
          content: textToSend
        });
        setMessage('');

        // Show AI loading after user message is sent
        setShowAiLoading(true);
      } catch (error) {
        console.error('Failed to send message:', error);
        // Clear pending message on error
        setPendingUserMessage(null);
        setShowAiLoading(false);
        
        // Show error toast for permission issues
        if (error.message?.includes('permission') || error.message?.includes('Access denied')) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to chat with this notebook.",
            variant: "destructive",
          });
        }
      }
    }
  };
  const handleRefreshChat = () => {
    if (notebookId) {
      console.log('Refresh button clicked for notebook:', notebookId);
      deleteChatHistory(notebookId);
      // Reset clicked questions when chat is refreshed
      setClickedQuestions(new Set());
    }
  };
  const handleCitationClick = (citation: Citation) => {
    onCitationClick?.(citation);
  };
  const handleExampleQuestionClick = (question: string) => {
    // Add question to clicked set to remove it from display
    setClickedQuestions(prev => new Set(prev).add(question));
    setMessage(question);
    handleSendMessage(question);
  };

  // Helper function to determine if message is from user
  const isUserMessage = (msg: any) => {
    const messageType = msg.message?.type || msg.message?.role;
    return messageType === 'human' || messageType === 'user';
  };

  // Helper function to determine if message is from AI
  const isAiMessage = (msg: any) => {
    const messageType = msg.message?.type || msg.message?.role;
    return messageType === 'ai' || messageType === 'assistant';
  };

  // Get the index of the last message for auto-scrolling
  const shouldShowScrollTarget = () => {
    return messages.length > 0 || pendingUserMessage || showAiLoading;
  };

  // Show refresh button if there are any messages (including system messages)
  const shouldShowRefreshButton = messages.length > 0;

  // Get example questions from the notebook, filtering out clicked ones
  const exampleQuestions = notebook?.example_questions?.filter(q => !clickedQuestions.has(q)) || [];

  // Update placeholder text based on processing status
  const getPlaceholderText = () => {
    if (isChatDisabled) {
      if (sourceCount === 0) {
        return isAdmin ? "Upload a source to get started..." : "Contact admin to add sources...";
      } else {
        return "Please wait while your sources are being processed...";
      }
    }
    return "Start typing...";
  };
  return <div className="flex-1 flex flex-col h-full overflow-hidden">
      {hasSource ? <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Chat Header */}
          <div className="p-6 border-b border-slate-200/60 flex-shrink-0 bg-white/95 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Legal Research Assistant</h2>
              {shouldShowRefreshButton && <Button variant="ghost" size="sm" onClick={handleRefreshChat} disabled={isDeletingChatHistory || isChatDisabled} className="flex items-center space-x-2">
                  <RefreshCw className={`h-4 w-4 ${isDeletingChatHistory ? 'animate-spin' : ''}`} />
                  <span className="font-semibold">{isDeletingChatHistory ? 'Clearing...' : 'Clear Chat'}</span>
                </Button>}
            </div>
          </div>

          <ScrollArea className="flex-1 h-full" ref={scrollAreaRef}>
            {/* Document Summary */}
            <div className="p-10 border-b border-slate-200/60 bg-gradient-to-br from-slate-50/80 via-white to-blue-50/30">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-6 mb-8">
                  <div className="w-14 h-14 flex items-center justify-center bg-transparent">
                    {isGenerating ? <Loader2 className="text-slate-900 font-normal w-14 h-14 animate-spin" /> : <span className="text-[56px] leading-none drop-shadow-sm">{notebook?.icon || '⚖️'}</span>}
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight font-crimson legal-text-shadow">
                      {isGenerating ? 'Analyzing legal documents...' : notebook?.title || 'Untitled Legal Research'}
                    </h1>
                    <p className="text-base text-slate-700 font-semibold mt-2">{sourceCount} legal document{sourceCount !== 1 ? 's' : ''} • AI-powered analysis</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-8 mb-8 border border-slate-200/60 legal-shadow-lg legal-surface">
                  {isGenerating ? <div className="flex items-center space-x-2 text-gray-600">
                      
                      <p className="text-slate-700 font-semibold text-lg">AI is analyzing your legal documents and generating comprehensive insights...</p>
                    </div> : <MarkdownRenderer content={notebook?.description || 'No description available for this legal research notebook.'} className="prose prose-legal max-w-none text-slate-800 leading-relaxed text-lg" />}
                </div>

                {/* Chat Messages */}
                {(messages.length > 0 || pendingUserMessage || showAiLoading) && <div className="mb-6 space-y-4">
                    {messages.map((msg, index) => <div key={msg.id} className={`flex ${isUserMessage(msg) ? 'justify-end' : 'justify-start'}`}>
                        <div className={`${isUserMessage(msg) ? 'max-w-xs lg:max-w-md px-6 py-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl legal-shadow-lg' : 'w-full'}`}>
                          <div className={isUserMessage(msg) ? 'font-semibold' : 'prose prose-legal max-w-none text-slate-900'}>
                            <MarkdownRenderer content={msg.message.content} className={isUserMessage(msg) ? '' : ''} onCitationClick={handleCitationClick} isUserMessage={isUserMessage(msg)} />
                          </div>
                          {isAiMessage(msg) && <div className="mt-2 flex justify-start">
                              <SaveToNoteButton content={msg.message.content} notebookId={notebookId} />
                            </div>}
                        </div>
                      </div>)}
                    
                    {/* Pending user message */}
                    {pendingUserMessage && <div className="flex justify-end">
                        <div className="max-w-xs lg:max-w-md px-6 py-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl legal-shadow-lg font-semibold">
                          <MarkdownRenderer content={pendingUserMessage} className="" isUserMessage={true} />
                        </div>
                      </div>}
                    
                    {/* AI Loading Indicator */}
                    {showAiLoading && <div className="flex justify-start" ref={latestMessageRef}>
                        <div className="flex items-center space-x-3 px-6 py-4 bg-slate-100 rounded-2xl legal-shadow-lg">
                          <div className="w-2.5 h-2.5 bg-slate-600 rounded-full animate-bounce"></div>
                          <div className="w-2.5 h-2.5 bg-slate-600 rounded-full animate-bounce" style={{
                    animationDelay: '0.1s'
                  }}></div>
                          <div className="w-2.5 h-2.5 bg-slate-600 rounded-full animate-bounce" style={{
                    animationDelay: '0.2s'
                  }}></div>
                        </div>
                      </div>}
                    
                    {/* Scroll target for when no AI loading is shown */}
                    {!showAiLoading && shouldShowScrollTarget() && <div ref={latestMessageRef} />}
                  </div>}
              </div>
            </div>
          </ScrollArea>

          {/* Chat Input - Fixed at bottom */}
          <div className="p-6 border-t border-slate-200/60 flex-shrink-0 bg-white/95 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Input 
                    placeholder={getPlaceholderText()} 
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && !isChatDisabled && !isSending && !pendingUserMessage && handleSendMessage()} 
                    className="pr-16 h-14 border-slate-200/60 focus:border-slate-800 focus:ring-slate-800/20 rounded-2xl font-medium text-lg legal-input-focus" 
                    disabled={isChatDisabled || isSending || !!pendingUserMessage} 
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-slate-600 font-semibold">
                    {sourceCount} doc{sourceCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <Button 
                  onClick={() => handleSendMessage()} 
                  disabled={!message.trim() || isChatDisabled || isSending || !!pendingUserMessage}
                  className="h-14 px-8 legal-button-primary text-white font-semibold rounded-2xl"
                >
                  {isSending || pendingUserMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* Example Questions Carousel */}
              {!isChatDisabled && !pendingUserMessage && !showAiLoading && exampleQuestions.length > 0 && <div className="mt-4">
                  <Carousel className="w-full max-w-4xl">
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {exampleQuestions.map((question, index) => <CarouselItem key={index} className="pl-2 md:pl-4 basis-auto">
                          <Button
                            variant="outline" 
                            size="sm" 
                            className="text-left whitespace-nowrap h-auto py-4 px-6 text-sm border-slate-200/60 hover:bg-slate-50 hover:border-slate-300 rounded-2xl font-semibold transition-all duration-200 legal-shadow legal-hover-lift" 
                            onClick={() => handleExampleQuestionClick(question)}
                          >
                            {question}
                          </Button>
                        </CarouselItem>)}
                    </CarouselContent>
                    {exampleQuestions.length > 2 && <>
                        <CarouselPrevious className="left-0" />
                        <CarouselNext className="right-0" />
                      </>}
                  </Carousel>
                </div>}
            </div>
          </div>
        </div> :
    // Empty State
    <div className="flex-1 flex flex-col items-center justify-center p-10 overflow-hidden bg-gradient-to-br from-slate-50/80 via-white to-blue-50/30">
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 legal-shadow-lg border border-white/20">
              <Upload className="h-12 w-12 text-slate-700" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight font-crimson">Add legal documents to begin research</h2>
            {isAdmin ? (
              <Button 
                onClick={() => setShowAddSourcesDialog(true)}
                className="legal-button-primary text-white font-bold px-10 py-4 rounded-2xl text-lg legal-hover-lift"
              >
                <Upload className="h-5 w-5 mr-3" />
                Upload legal documents
              </Button>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/60 p-8 legal-shadow-lg max-w-lg">
                <p className="text-slate-700 font-semibold text-lg leading-relaxed">Contact your administrator to add legal documents to this research notebook.</p>
              </div>
            )}
          </div>

          {/* Bottom Input */}
          <div className="w-full max-w-3xl">
            <div className="flex space-x-4">
              <Input 
                placeholder="Upload legal documents to get started" 
                disabled 
                className="flex-1 h-14 border-slate-200/60 rounded-2xl font-medium text-lg" 
              />
              <div className="flex items-center text-sm text-slate-600 font-semibold">
                0 documents
              </div>
              <Button disabled className="h-14 px-8 rounded-2xl">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>}
      
      {/* Footer */}
      <div className="p-6 border-t border-slate-200/60 flex-shrink-0 bg-slate-50/80 backdrop-blur-xl">
        <p className="text-center text-sm text-slate-600 font-semibold">Legal Insights provides AI assistance; always verify legal information with qualified professionals.</p>
      </div>
      
      {/* Add Sources Dialog */}
      <AddSourcesDialog open={showAddSourcesDialog} onOpenChange={setShowAddSourcesDialog} notebookId={notebookId} />
    </div>;
};

export default ChatArea;
