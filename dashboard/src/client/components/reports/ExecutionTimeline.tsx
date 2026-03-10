import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';

const steps = [
  { key: 'pending', label: 'Queued' },
  { key: 'fetching_data', label: 'Fetching Data' },
  { key: 'analyzing', label: 'Analyzing' },
  { key: 'delivering', label: 'Delivering' },
  { key: 'completed', label: 'Completed' },
];

const stepOrder = steps.map((s) => s.key);

export function ExecutionTimeline({ status }: { status: string }) {
  const currentIdx = stepOrder.indexOf(status);
  const failed = status === 'failed';

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => {
        const isComplete = !failed && currentIdx > i;
        const isCurrent = !failed && currentIdx === i;
        const isFailed = failed && i === currentIdx;

        let Icon = Circle;
        let color = 'text-slate-600';
        if (isComplete) { Icon = CheckCircle2; color = 'text-green-500'; }
        else if (isCurrent) { Icon = Loader2; color = 'text-blue-400'; }
        else if (isFailed) { Icon = XCircle; color = 'text-red-500'; }

        return (
          <div key={step.key} className="flex items-center gap-1">
            {i > 0 && <div className={`w-6 h-px ${isComplete ? 'bg-green-600' : 'bg-slate-700'}`} />}
            <div className="flex items-center gap-1">
              <Icon size={14} className={`${color} ${isCurrent ? 'animate-spin' : ''}`} />
              <span className={`text-xs ${isCurrent || isComplete ? 'text-slate-300' : 'text-slate-600'}`}>
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
