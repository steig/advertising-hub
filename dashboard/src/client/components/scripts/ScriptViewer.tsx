import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { Copy, CheckCheck } from 'lucide-react';

interface ScriptViewerProps {
  source: string;
  filename: string;
}

export function ScriptViewer({ source, filename }: ScriptViewerProps) {
  const [copied, setCopied] = useState(false);

  const language = filename.endsWith('.py') ? 'python'
    : filename.endsWith('.sh') ? 'bash'
    : filename.endsWith('.ts') ? 'typescript'
    : 'bash';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
        <span className="text-sm font-medium text-slate-300">{filename}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <Highlight theme={themes.nightOwl} code={source.trimEnd()} language={language}>
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre style={{ ...style, margin: 0, padding: '1rem', background: 'transparent' }} className="text-sm">
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  <span className="inline-block w-10 text-right mr-4 text-slate-600 select-none">
                    {i + 1}
                  </span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
