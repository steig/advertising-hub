import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { Bot, Share2 } from 'lucide-react';
import { getSharedConversation, type Conversation } from '../lib/api';
import { MessageList } from '../components/chat/MessageList';

export function SharedConversationPage() {
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;
    getSharedConversation(conversationId)
      .then((data) => {
        setConversation(data.conversation as Conversation);
        setMessages(
          data.messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
        );
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [conversationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-slate-100">
        <p className="text-xl font-semibold mb-2">Conversation not found</p>
        <p className="text-sm text-slate-400">This conversation may not be shared or may have been deleted.</p>
        <a href="/" className="mt-4 text-sm text-blue-400 hover:text-blue-300">Go to Dashboard</a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <Bot size={20} className="text-slate-400" />
          <div>
            <h2 className="text-sm font-medium text-white">{conversation.title}</h2>
            <p className="text-xs text-slate-500">Shared conversation</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Share2 size={12} />
          Read-only
        </div>
      </div>

      <MessageList messages={messages} streaming={false} />

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 text-center">
        <p className="text-xs text-slate-500">
          This is a shared conversation.{' '}
          <a href="/chat" className="text-blue-400 hover:text-blue-300">Start your own chat</a>
        </p>
      </div>
    </div>
  );
}
