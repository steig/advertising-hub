import { Check, X } from 'lucide-react';

interface CredentialStatusProps {
  configured: boolean;
}

export function CredentialStatus({ configured }: CredentialStatusProps) {
  return (
    <span className="flex items-center gap-1.5 text-sm">
      {configured ? (
        <Check size={14} className="text-green-400" />
      ) : (
        <X size={14} className="text-slate-500" />
      )}
      <span className={configured ? 'text-green-400' : 'text-slate-400'}>
        {configured ? 'Connected' : 'Not configured'}
      </span>
    </span>
  );
}
