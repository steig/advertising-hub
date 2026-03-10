import { useParams, Link, Navigate } from 'react-router';
import { ArrowLeft, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAgent } from '../hooks/useAgents';
import { AgentChat } from '../components/agents/AgentChat';
import { AGENT_CATEGORY_COLORS } from '../lib/constants';

export function AgentDetailPage() {
  const { slug } = useParams();
  const { agent, loading, error } = useAgent(slug ?? '');

  if (!slug) return <Navigate to="/agents" replace />;

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-slate-700 rounded w-48" />
        <div className="h-4 bg-slate-700 rounded w-32" />
        <div className="h-64 bg-slate-800 rounded-xl mt-6" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div>
        <Link to="/agents" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4">
          <ArrowLeft size={16} /> Back to Agents
        </Link>
        <p className="text-red-400">Agent not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Link to="/agents" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft size={16} /> Back to Agents
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-72 shrink-0 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Bot size={24} className="text-slate-400" />
              <h2 className="text-xl font-bold text-white">{agent.name}</h2>
            </div>

            <p className="text-sm text-slate-400 mb-4">{agent.description}</p>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500">Category</span>
                <div className="mt-1">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${AGENT_CATEGORY_COLORS[agent.category] || ''}`}>
                    {agent.category}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500">Author</span>
                <p className="text-slate-300 mt-1">{agent.author}</p>
              </div>

              <div>
                <span className="text-slate-500">Tools</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {agent.tools.map(tool => (
                    <span key={tool} className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Link
              to={`/chat?agent=${agent.slug}`}
              className="block w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors text-center"
            >
              Chat with this agent
            </Link>
          </div>
        </div>

        {/* Markdown body */}
        <div className="flex-1 min-w-0 space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className={[
              '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-6 [&_h1]:mb-3',
              '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-5 [&_h2]:mb-2',
              '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-200 [&_h3]:mt-4 [&_h3]:mb-2',
              '[&_p]:text-slate-300 [&_p]:mb-3 [&_p]:leading-relaxed',
              '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ul]:text-slate-300',
              '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_ol]:text-slate-300',
              '[&_li]:mb-1',
              '[&_a]:text-blue-400 [&_a]:underline [&_a]:hover:text-blue-300',
              '[&_code]:bg-slate-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:text-emerald-400',
              '[&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-3',
              '[&_pre_code]:bg-transparent [&_pre_code]:px-0 [&_pre_code]:py-0',
              '[&_blockquote]:border-l-4 [&_blockquote]:border-slate-600 [&_blockquote]:pl-4 [&_blockquote]:text-slate-400 [&_blockquote]:mb-3',
              '[&_table]:w-full [&_table]:text-sm [&_table]:mb-3',
              '[&_th]:text-left [&_th]:py-2 [&_th]:px-3 [&_th]:border-b [&_th]:border-slate-700 [&_th]:text-slate-300',
              '[&_td]:py-2 [&_td]:px-3 [&_td]:border-b [&_td]:border-slate-800 [&_td]:text-slate-400',
              '[&_hr]:border-slate-700 [&_hr]:my-6',
            ].join(' ')}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {agent.body}
              </ReactMarkdown>
            </div>
          </div>

          {/* Chat */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Chat with {agent.name}</h2>
            <AgentChat agentSlug={agent.slug} agentName={agent.name} />
          </section>
        </div>
      </div>
    </div>
  );
}
