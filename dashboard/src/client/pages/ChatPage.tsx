import { useParams, useNavigate, useSearchParams } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import { useConversations } from '../hooks/useConversations';
import { useChat } from '../hooks/useChat';
import { ConversationSidebar } from '../components/chat/ConversationSidebar';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { EmptyState } from '../components/chat/EmptyState';
import { useToast } from '../contexts/ToastContext';

export function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { conversations, create, remove, rename, toggleShare, refresh } = useConversations();
  const { messages, streaming, loadingHistory, sendMessage } = useChat(conversationId);
  const creatingRef = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { addToast } = useToast();

  const activeConv = conversations.find((c) => c.id === conversationId);

  // Handle ?agent=slug query param → auto-create conversation
  useEffect(() => {
    const agentSlug = searchParams.get('agent');
    if (agentSlug && !conversationId && !creatingRef.current) {
      creatingRef.current = true;
      create(agentSlug).then((result) => {
        navigate(`/chat/${result.id}`, { replace: true });
      }).catch(() => {
        addToast('Failed to create conversation', 'error');
      }).finally(() => { creatingRef.current = false; });
    }
  }, [searchParams, conversationId]);

  const handleNewChat = async (agentSlug: string) => {
    try {
      const result = await create(agentSlug);
      navigate(`/chat/${result.id}`);
    } catch {
      addToast('Failed to create conversation', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      if (id === conversationId) navigate('/chat');
    } catch {
      addToast('Failed to delete conversation', 'error');
    }
  };

  const handleSend = (text: string) => {
    sendMessage(text);
    // Refresh sidebar after a delay to pick up title change
    setTimeout(refresh, 1000);
  };

  const handleToggleShare = () => {
    if (conversationId) toggleShare(conversationId);
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <ConversationSidebar
        conversations={conversations}
        activeId={conversationId}
        onNewChat={handleNewChat}
        onDelete={handleDelete}
        onRename={rename}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {activeConv ? (
          <>
            <div className="relative">
              <button
                className="lg:hidden absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu size={20} />
              </button>
              <ChatHeader
                agentSlug={activeConv.agent_slug}
                shared={!!activeConv.shared_at}
                onToggleShare={handleToggleShare}
              />
            </div>
            <MessageList messages={messages} streaming={streaming} loading={loadingHistory} />
            <ChatInput onSend={handleSend} streaming={streaming} />
          </>
        ) : (
          <>
            <button
              className="lg:hidden absolute left-3 top-4 z-10 p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <EmptyState onSelectAgent={handleNewChat} />
          </>
        )}
      </div>
    </div>
  );
}
