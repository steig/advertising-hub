import type { Env } from '../types/bindings';
import type { Report, DeliveryConfig } from '../types/reports';
import {
  getLatestPromptVersion,
  createExecution,
  updateExecutionStatus,
  getReportDeliveryConfig,
} from './d1-reports';
import { getCredential } from './d1-credentials';

interface ExecutionContext {
  env: Env;
  report: Report;
  teamId: string;
  triggerType: 'manual' | 'scheduled';
}

export async function executeReport(ctx: ExecutionContext): Promise<string> {
  const { env, report, teamId, triggerType } = ctx;

  // Get latest prompt version
  const prompt = await getLatestPromptVersion(env.DB, report.id);
  if (!prompt) throw new Error('No prompt version found');

  // Create execution record
  const execution = await createExecution(env.DB, report.id, prompt.id, triggerType);
  const executionId = execution.id;

  try {
    // Step 1: Fetch platform data
    await updateExecutionStatus(env.DB, executionId, 'fetching_data');
    const platformData = await fetchPlatformData(env, teamId, report);

    // Step 2: Analyze with Claude
    await updateExecutionStatus(env.DB, executionId, 'analyzing');
    const analysis = await analyzeWithClaude(env, prompt.prompt_text, platformData, report);

    // Step 3: Store output to R2
    const outputKey = `${teamId}/${report.id}/${executionId}.json`;
    const output = JSON.stringify({
      report_id: report.id,
      execution_id: executionId,
      prompt_version: prompt.version,
      platform: report.platform,
      data: platformData,
      analysis: analysis.content,
      generated_at: new Date().toISOString(),
    });
    await env.REPORTS_BUCKET.put(outputKey, output, {
      httpMetadata: { contentType: 'application/json' },
    });

    // Step 4: Deliver
    await updateExecutionStatus(env.DB, executionId, 'delivering');
    const deliveryStatus = await deliver(env, teamId, report, analysis.summary);

    // Step 5: Complete
    await updateExecutionStatus(env.DB, executionId, 'completed', {
      output_key: outputKey,
      summary_text: analysis.summary,
      delivery_status: JSON.stringify(deliveryStatus),
    });

    return executionId;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    await updateExecutionStatus(env.DB, executionId, 'failed', { error: errorMsg });
    throw err;
  }
}

async function fetchPlatformData(
  env: Env,
  teamId: string,
  report: Report
): Promise<Record<string, unknown>> {
  const creds = await getCredential(env.DB, env.ENCRYPTION_KEY, teamId, report.platform);
  if (!creds) {
    throw new Error(`No credentials configured for platform: ${report.platform}`);
  }

  const dataConfig = JSON.parse(report.data_config);

  // Platform-specific data fetching would go here
  // For now, return a structured placeholder that indicates what was requested
  return {
    platform: report.platform,
    credentials_configured: true,
    data_config: dataConfig,
    fetched_at: new Date().toISOString(),
    note: 'Platform API integration pending - credentials verified',
  };
}

async function analyzeWithClaude(
  env: Env,
  promptText: string,
  platformData: Record<string, unknown>,
  report: Report
): Promise<{ content: string; summary: string }> {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const systemPrompt = `You are an advertising analytics expert. Analyze the provided ad platform data and generate insights based on the user's prompt. Always include a brief summary at the start (2-3 sentences) followed by detailed analysis.`;

  const userMessage = `## Report: ${report.name}
## Platform: ${report.platform}

### Prompt
${promptText}

### Platform Data
\`\`\`json
${JSON.stringify(platformData, null, 2)}
\`\`\``;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${err}`);
  }

  const result = await response.json() as { content: { type: string; text: string }[] };
  const content = result.content.map((c) => c.text).join('\n');

  // Extract first paragraph as summary
  const summary = content.split('\n\n')[0]?.slice(0, 500) || content.slice(0, 500);

  return { content, summary };
}

async function deliver(
  env: Env,
  teamId: string,
  report: Report,
  summary: string
): Promise<Record<string, string>> {
  const status: Record<string, string> = {};

  const deliveryConfig = await getReportDeliveryConfig(env.DB, env.ENCRYPTION_KEY, teamId, report.id) as DeliveryConfig | null;
  if (!deliveryConfig) return status;

  // Email via Resend
  if (deliveryConfig.email_recipients?.length && env.RESEND_API_KEY) {
    try {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Ad Hub Reports <reports@adhub.dev>',
          to: deliveryConfig.email_recipients,
          subject: `Report: ${report.name}`,
          text: summary,
        }),
      });
      status.email = emailRes.ok ? 'sent' : 'failed';
    } catch {
      status.email = 'failed';
    }
  }

  // Slack webhook
  if (deliveryConfig.slack_webhook_url) {
    try {
      const slackRes = await fetch(deliveryConfig.slack_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `*Report: ${report.name}*\n${summary}`,
        }),
      });
      status.slack = slackRes.ok ? 'sent' : 'failed';
    } catch {
      status.slack = 'failed';
    }
  }

  return status;
}
