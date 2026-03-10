import { Link, useNavigate } from 'react-router';
import { Plus, Trash2, MessageSquare, Pencil, Search, X, CheckSquare, Square } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Conversation } from '../../lib/api';
import { AgentPicker } from './AgentPicker';
import { useToast } from '../../contexts/ToastContext';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId?: string;
  onNewChat: (agentSlug: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  open?: boolean;
  onClose?: () => void;
}

function groupByDate(conversations: Conversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);

  const groups: { label: string; items: Conversation[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Older', items: [] },
  ];

  for (const conv of conversations) {
    const d = new Date(conv.updated_at + 'Z');
    if (d >= today) groups[0].items.push(conv);
    else if (d >= yesterday) groups[1].items.push(conv);
    else groups[2].items.push(conv);
  }

  return groups.filter((g) => g.items.length > 0);
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-500/30 text-inherit rounded-sm">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function ConversationSidebar({
  conversations,
  activeId,
  onNewChat,
  onDelete,
  onRename,
  open,
  onClose,
}: ConversationSidebarProps) {
  const { addToast } = useToast();
  const [showPicker, setShowPicker] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const startEditing = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c.id)));
    }
  };

  const deleteSelected = async () => {
    setDeleting(true);
    const ids = Array.from(selected);
    const results = await Promise.allSettled(ids.map((id) => {
      onDelete(id);
      return Promise.resolve();
    }));
    const count = results.filter((r) => r.status === 'fulfilled').length;
    addToast(`${count} conversation${count !== 1 ? 's' : ''} deleted`, 'success');
    setSelected(new Set());
    setSelectionMode(false);
    setDeleting(false);
    if (ids.includes(activeId ?? '')) {
      navigate('/chat');
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelected(new Set());
  };

  const filtered = searchQuery
    ? conversations.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  const groups = groupByDate(filtered);

  const renderConversation = (conv: Conversation) => (
    <div
      key={conv.id}
      onMouseEnter={() => setHoveredId(conv.id)}
      onMouseLeave={() => setHoveredId(null)}
      className="relative group"
    >
      {editingId === conv.id ? (
        <div className="px-2 py-2">
          <input
            ref={editInputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            onBlur={saveEdit}
            className="w-full bg-slate-800 text-white text-sm rounded px-2 py-1 border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>
      ) : selectionMode ? (
        <button
          onClick={() => toggleSelect(conv.id)}
          className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm w-full transition-colors ${
            selected.has(conv.id)
              ? 'bg-blue-900/30 text-white'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          {selected.has(conv.id) ? <CheckSquare size={14} className="shrink-0 text-blue-400" /> : <Square size={14} className="shrink-0" />}
          <span className="truncate">{conv.title}</span>
        </button>
      ) : (
        <Link
          to={`/chat/${conv.id}`}
          onClick={() => onClose?.()}
          onDoubleClick={(e) => {
            e.preventDefault();
            startEditing(conv);
          }}
          className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors w-full ${
            conv.id === activeId
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
          }`}
        >
          <MessageSquare size={14} className="shrink-0" />
          <span className="truncate">{searchQuery ? highlightMatch(conv.title, searchQuery) : conv.title}</span>
        </Link>
      )}
      {!selectionMode && hoveredId === conv.id && editingId !== conv.id && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          <button
            onClick={(e) => { e.preventDefault(); startEditing(conv); }}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            title="Rename conversation"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(conv.id); }}
            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
            title="Delete conversation"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={onClose} />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 bg-slate-950 border-r border-slate-800 flex flex-col h-full shrink-0
        transform transition-transform duration-200
        ${open === undefined ? '' : open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="text-lg font-bold text-white">Ad Hub</Link>
            {conversations.length > 0 && (
              <button
                onClick={() => selectionMode ? exitSelectionMode() : setSelectionMode(true)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  selectionMode ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {selectionMode ? 'Cancel' : 'Select'}
              </button>
            )}
          </div>
          {!selectionMode && (
            showPicker ? (
              <div className="space-y-2">
                <AgentPicker onSelect={(slug) => { setShowPicker(false); onNewChat(slug); onClose?.(); }} />
                <button
                  onClick={() => setShowPicker(false)}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPicker(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Plus size={16} />
                New Chat
              </button>
            )
          )}

          {/* Search */}
          <div className="relative mt-3">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-slate-900 text-sm text-slate-300 rounded-lg pl-8 pr-8 py-1.5 border border-slate-800 focus:border-slate-600 focus:outline-none placeholder:text-slate-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-4">
          {searchQuery ? (
            // Flat list when searching
            filtered.length > 0 ? (
              <div>{filtered.map(renderConversation)}</div>
            ) : (
              <p className="text-xs text-slate-600 text-center mt-8 px-4">
                No matching conversations
              </p>
            )
          ) : (
            // Grouped view
            <>
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="px-2 py-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {group.label}
                  </p>
                  {group.items.map(renderConversation)}
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-xs text-slate-600 text-center mt-8 px-4">
                  No conversations yet. Start a new chat!
                </p>
              )}
            </>
          )}
        </nav>

        {selectionMode && selected.size > 0 && (
          <div className="p-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <button onClick={toggleSelectAll} className="text-xs text-slate-400 hover:text-white">
                {selected.size === filtered.length ? 'Deselect all' : 'Select all'}
              </button>
              <span className="text-xs text-slate-500">{selected.size} selected</span>
            </div>
            <button
              onClick={deleteSelected}
              disabled={deleting}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-sm text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
            >
              <Trash2 size={14} />
              {deleting ? 'Deleting...' : 'Delete selected'}
            </button>
          </div>
        )}

        {!selectionMode && (
          <div className="p-3 border-t border-slate-800">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
