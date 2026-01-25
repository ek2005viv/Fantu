import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { MessageSquare, Plus, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatView from '../components/ChatView';
import CompanyChat from '../components/CompanyChat';
import { Conversation, Company } from '../types';
import { subscribeToUserConversations, createConversation, subscribeToUserCompanies, createCompany } from '../services/firestore';

export default function Dashboard() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [creatingCompany, setCreatingCompany] = useState(false);

  const { currentUser, loading } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeConversations = subscribeToUserConversations(currentUser.uid, (convs) => {
      setConversations(convs);
    });

    const unsubscribeCompanies = subscribeToUserCompanies(currentUser.email || currentUser.uid, (comps) => {
      setCompanies(comps);
    });

    return () => {
      unsubscribeConversations();
      unsubscribeCompanies();
    };
  }, [currentUser]);

  async function handleNewChat() {
    if (!currentUser || creatingChat) return;

    setCreatingChat(true);
    try {
      const title = `Chat ${conversations.length + 1}`;
      const newId = await createConversation(currentUser.uid, title);
      setActiveConversationId(newId);
      setActiveCompanyId(null);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setCreatingChat(false);
    }
  }

  async function handleNewCompany() {
    if (!currentUser || creatingCompany) return;

    const companyName = prompt('Enter company name:');
    if (!companyName) return;

    setCreatingCompany(true);
    try {
      const newId = await createCompany(currentUser.email || currentUser.uid, companyName);
      setActiveCompanyId(newId);
      setActiveConversationId(null);
    } catch (error) {
      console.error('Failed to create company:', error);
    } finally {
      setCreatingCompany(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-sm text-gray-600 font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar
        conversations={conversations}
        companies={companies}
        activeConversationId={activeConversationId}
        activeCompanyId={activeCompanyId}
        onSelectConversation={setActiveConversationId}
        onSelectCompany={setActiveCompanyId}
        onNewChat={handleNewChat}
        onNewCompany={handleNewCompany}
        creatingChat={creatingChat}
        creatingCompany={creatingCompany}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeConversationId ? (
          <ChatView conversationId={activeConversationId} />
        ) : activeCompanyId ? (
          <CompanyChat companyId={activeCompanyId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 animate-scale-in">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-lg animate-float">
                <MessageSquare className="w-12 h-12 text-gray-600" />
              </div>
              <div className="absolute inset-0 bg-gray-300 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-900 to-gray-700 text-gradient">
              Start a New Conversation
            </h2>
            <p className="text-gray-600 max-w-md text-lg leading-relaxed">
              Start a new conversation to talk with the AI. Click "New Chat" or "Add Company" in the sidebar to begin.
            </p>
            <div className="mt-8 flex gap-3">
              <button
                onClick={handleNewChat}
                disabled={creatingChat}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-300 flex items-center gap-2 hover:scale-105 ripple font-medium disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
              <button
                onClick={handleNewCompany}
                disabled={creatingCompany}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-300 flex items-center gap-2 hover:scale-105 ripple font-medium disabled:opacity-50"
              >
                <Building2 className="w-4 h-4" />
                Add Company
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
