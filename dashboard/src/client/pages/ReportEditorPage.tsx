import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { createReport, getReport, updateReport as updateReportApi, type Report } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { SchedulePicker } from '../components/reports/SchedulePicker';
import { DeliveryConfig } from '../components/reports/DeliveryConfig';
import { DataConfigEditor } from '../components/reports/DataConfigEditor';
import { useEnabledPlatforms } from '../hooks/useEnabledPlatforms';

export function ReportEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { addToast } = useToast();
  const { enabledSlugs, loading: epLoading } = useEnabledPlatforms();

  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('');
  const [schedule, setSchedule] = useState('');
  const [promptText, setPromptText] = useState('');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [dataConfig, setDataConfig] = useState({ date_range: 'last_30d', metrics: '', dimensions: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!platform && enabledSlugs.length > 0) {
      setPlatform(enabledSlugs[0]);
    }
  }, [enabledSlugs, platform]);

  useEffect(() => {
    if (!id) return;
    getReport(id).then((r: Report) => {
      setName(r.name);
      setPlatform(r.platform);
      setSchedule(r.schedule || '');
      if (r.latest_prompt) setPromptText(r.latest_prompt);
      try {
        const dc = JSON.parse(r.data_config);
        setDataConfig({
          date_range: dc.date_range || 'last_30d',
          metrics: (dc.metrics || []).join(', '),
          dimensions: (dc.dimensions || []).join(', '),
        });
      } catch { /* use defaults */ }
    }).catch((err) => { console.error(err); addToast('Failed to load report', 'error'); }).finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !promptText.trim()) return;
    setSaving(true);

    const dc = {
      date_range: dataConfig.date_range,
      metrics: dataConfig.metrics.split(',').map((s) => s.trim()).filter(Boolean),
      dimensions: dataConfig.dimensions.split(',').map((s) => s.trim()).filter(Boolean),
    };

    const delivery: Record<string, unknown> = {};
    const emails = emailRecipients.split(',').map((s) => s.trim()).filter(Boolean);
    if (emails.length) delivery.email_recipients = emails;
    if (slackWebhookUrl.trim()) delivery.slack_webhook_url = slackWebhookUrl.trim();

    try {
      if (isEdit) {
        await updateReportApi(id!, {
          name: name.trim(),
          data_config: dc,
          schedule: schedule || null,
          ...(Object.keys(delivery).length ? { delivery_config: delivery } : {}),
        });
        addToast('Report updated', 'success');
        navigate(`/reports/${id}`);
      } else {
        const report = await createReport({
          name: name.trim(),
          platform,
          data_config: dc,
          schedule: schedule || undefined,
          prompt_text: promptText.trim(),
          ...(Object.keys(delivery).length ? { delivery_config: delivery as any } : {}),
        });
        addToast('Report created', 'success');
        navigate(`/reports/${report.id}`);
      }
    } catch (err) {
      console.error(err);
      addToast(isEdit ? 'Failed to update report' : 'Failed to create report', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading || epLoading) {
    return <div className="animate-pulse"><div className="h-8 bg-slate-800 rounded w-48 mb-6" /></div>;
  }

  if (!isEdit && enabledSlugs.length === 0) {
    return (
      <div className="max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
          <p className="text-slate-400 mb-2">No platforms enabled</p>
          <a href="/settings" className="text-sm text-blue-400 hover:text-blue-300">Enable platforms in Settings to create reports</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 mb-4">
        <ArrowLeft size={16} /> Back
      </button>

      <h2 className="text-xl font-bold text-white mb-6">{isEdit ? 'Edit Report' : 'New Report'}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            placeholder="Weekly Performance Summary"
          />
        </div>

        {!isEdit && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {enabledSlugs.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}

        <DataConfigEditor value={dataConfig} onChange={setDataConfig} />
        <SchedulePicker value={schedule} onChange={setSchedule} />

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Analysis Prompt</label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            required={!isEdit}
            rows={6}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 font-mono resize-y focus:outline-none focus:border-blue-500"
            placeholder="Analyze campaign performance trends and highlight areas with declining ROAS..."
          />
          {isEdit && <p className="text-xs text-slate-500">Leave empty to keep current prompt. Editing creates a new version.</p>}
        </div>

        <DeliveryConfig
          emailRecipients={emailRecipients}
          slackWebhookUrl={slackWebhookUrl}
          onEmailChange={setEmailRecipients}
          onSlackChange={setSlackWebhookUrl}
        />

        <button
          type="submit"
          disabled={saving || !name.trim() || (!isEdit && !promptText.trim())}
          className="w-full px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : isEdit ? 'Update Report' : 'Create Report'}
        </button>
      </form>
    </div>
  );
}
