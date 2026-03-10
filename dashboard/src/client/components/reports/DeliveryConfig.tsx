interface Props {
  emailRecipients: string;
  slackWebhookUrl: string;
  onEmailChange: (val: string) => void;
  onSlackChange: (val: string) => void;
}

export function DeliveryConfig({ emailRecipients, slackWebhookUrl, onEmailChange, onSlackChange }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-slate-300">Delivery (optional)</h3>

      <div className="space-y-2">
        <label className="text-xs text-slate-400">Email recipients (comma-separated)</label>
        <input
          type="text"
          value={emailRecipients}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="team@company.com, lead@company.com"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-400">Slack webhook URL</label>
        <input
          type="url"
          value={slackWebhookUrl}
          onChange={(e) => onSlackChange(e.target.value)}
          placeholder="https://hooks.slack.com/services/..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}
