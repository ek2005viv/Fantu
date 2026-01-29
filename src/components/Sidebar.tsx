import { Video, Plus, LogOut, MessageSquare, Trash2, Loader2, Building2, Edit2, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { deleteConversation, updateConversationTitle, updateCompanyName } from '../services/firestore';
import { Conversation, Company } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  companies: Company[];
  activeConversationId: string | null;
  activeCompanyId: string | null;
  onSelectConversation: (id: string | null) => void;
  onSelectCompany: (id: string | null) => void;
  onNewChat: () => void;
  onNewCompany: () => void;
  onNewVirtualEyes: () => void;
  creatingChat: boolean;
  creatingCompany: boolean;
  creatingVirtualEyes: boolean;
}

export default function Sidebar({
  conversations,
  companies,
  activeConversationId,
  activeCompanyId,
  onSelectConversation,
  onSelectCompany,
  onNewChat,
  onNewCompany,
  onNewVirtualEyes,
  creatingChat,
  creatingCompany,
  creatingVirtualEyes
}: SidebarProps) {
  const { currentUser, logout } = useAuth();

  async function handleDelete(e: React.MouseEvent, convId: string) {
    e.stopPropagation();

    try {
      await deleteConversation(convId);
      if (activeConversationId === convId) {
        onSelectConversation(null);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }

  async function handleRenameConversation(e: React.MouseEvent, convId: string, currentTitle: string) {
    e.stopPropagation();

    const newTitle = prompt('Enter new name:', currentTitle);
    if (newTitle && newTitle.trim() !== currentTitle) {
      try {
        await updateConversationTitle(convId, newTitle.trim());
      } catch (error) {
        console.error('Failed to rename conversation:', error);
        alert('Failed to rename conversation');
      }
    }
  }

  async function handleRenameCompany(e: React.MouseEvent, companyId: string, currentName: string) {
    e.stopPropagation();

    const newName = prompt('Enter new company name:', currentName);
    if (newName && newName.trim() !== currentName) {
      try {
        await updateCompanyName(companyId, newName.trim());
      } catch (error) {
        console.error('Failed to rename company:', error);
        alert('Failed to rename company');
      }
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }

  return (
    <div className="w-72 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col h-full shadow-lg">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-4 animate-slide-in">
          <div className="relative">
            <Video className="w-7 h-7 text-gray-900" />
            <div className="absolute inset-0 bg-gray-900/20 rounded-full blur-md"></div>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 text-gradient">
            Persona Video AI
          </span>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={onNewChat}
            disabled={creatingChat}
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] ripple font-medium"
          >
            {creatingChat ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            New Chat
          </button>

          <button
            onClick={onNewVirtualEyes}
            disabled={creatingVirtualEyes}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] ripple font-medium"
          >
            {creatingVirtualEyes ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            Virtual Eyes
          </button>

          <button
            onClick={onNewCompany}
            disabled={creatingCompany}
            className="w-full py-3 px-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 hover:border-gray-400 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] ripple font-medium"
          >
            {creatingCompany ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Building2 className="w-4 h-4" />
            )}
            Add Company
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <div className="mb-5">
          <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 px-2">
            Chats
          </div>
          {conversations.filter(c => !c.type || c.type === 'normal').length === 0 ? (
            <div className="text-center py-4">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No chats yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.filter(c => !c.type || c.type === 'normal').map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onSelectCompany(null);
                  }}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeConversationId === conv.id && !activeCompanyId
                      ? 'bg-gradient-to-r from-gray-200 to-gray-100 text-gray-900 shadow-sm'
                      : 'hover:bg-gray-100 text-gray-700 hover:translate-x-1'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate text-sm">{conv.title}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => handleRenameConversation(e, conv.id, conv.title)}
                      className="p-1 hover:bg-gray-300 rounded"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="p-1 hover:bg-gray-300 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-5">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 px-2">
            Virtual Eyes
          </div>
          {conversations.filter(c => c.type === 'virtual-eyes').length === 0 ? (
            <div className="text-center py-4">
              <Eye className="w-8 h-8 text-blue-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No virtual eyes yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.filter(c => c.type === 'virtual-eyes').map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onSelectCompany(null);
                  }}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeConversationId === conv.id && !activeCompanyId
                      ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-900 shadow-sm'
                      : 'hover:bg-blue-50 text-gray-700 hover:translate-x-1'
                  }`}
                >
                  <Eye className="w-4 h-4 flex-shrink-0 text-blue-600" />
                  <span className="flex-1 truncate text-sm">{conv.title}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => handleRenameConversation(e, conv.id, conv.title)}
                      className="p-1 hover:bg-blue-200 rounded"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="p-1 hover:bg-blue-200 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 px-2">
            Companies
          </div>
          {companies.length === 0 ? (
            <div className="text-center py-4">
              <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No companies yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {companies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => {
                    onSelectCompany(company.id!);
                    onSelectConversation(null);
                  }}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeCompanyId === company.id
                      ? 'bg-gradient-to-r from-gray-200 to-gray-100 text-gray-900 shadow-sm'
                      : 'hover:bg-gray-100 text-gray-700 hover:translate-x-1'
                  }`}
                >
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate text-sm">{company.name}</span>
                  <button
                    onClick={(e) => handleRenameCompany(e, company.id!, company.name)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 rounded transition-all"
                    title="Rename"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-xs text-gray-600 mb-3 truncate font-medium px-2">
          {currentUser?.email}
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium hover:scale-[1.02] ripple"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
