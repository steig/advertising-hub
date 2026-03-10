const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-slate-600 text-slate-200' },
  fetching_data: { label: 'Fetching Data', className: 'bg-blue-600 text-blue-100 animate-pulse' },
  analyzing: { label: 'Analyzing', className: 'bg-purple-600 text-purple-100 animate-pulse' },
  delivering: { label: 'Delivering', className: 'bg-amber-600 text-amber-100 animate-pulse' },
  completed: { label: 'Completed', className: 'bg-green-600 text-green-100' },
  failed: { label: 'Failed', className: 'bg-red-600 text-red-100' },
};

export function ExecutionStatusBadge({ status }: { status: string | null | undefined }) {
  const config = statusConfig[status || ''] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
