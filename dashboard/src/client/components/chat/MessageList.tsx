import { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MessageListProps {
  messages: Message[];
  streaming: boolean;
  loading?: boolean;
}

const markdownClasses = [
  '[&_p]:mb-2 [&_p]:leading-relaxed',
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2',
  '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2',
  '[&_li]:mb-0.5',
  '[&_code]:bg-slate-600 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs',
  '[&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-2 [&_pre]:text-xs',
  '[&_pre_code]:bg-transparent [&_pre_code]:px-0',
  '[&_strong]:font-semibold',
  '[&_a]:text-blue-400 [&_a]:underline',
].join(' ');

const skeletonWidths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-1/3'];

function Skeletons() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`${skeletonWidths[i]} h-10 rounded-2xl bg-slate-700 animate-pulse`} />
        </div>
      ))}
    </>
  );
}

export function MessageList({ messages, streaming, loading }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
      {loading && messages.length === 0 ? (
        <Skeletons />
      ) : (
        messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              } ${msg.role === 'assistant' ? markdownClasses : ''}`}
            >
              {msg.role === 'assistant' ? (
                msg.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                ) : streaming && i === messages.length - 1 ? (
                  <Loader2 size={16} className="animate-spin text-slate-400" />
                ) : null
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))
      )}
      <div ref={endRef} />
    </div>
  );
}
