import { DurableObject } from 'cloudflare:workers';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export class ChatSessionDO extends DurableObject {
  private messages: ChatMessage[] | null = null;

  private async loadMessages(): Promise<ChatMessage[]> {
    if (this.messages === null) {
      this.messages = (await this.ctx.storage.get<ChatMessage[]>('messages')) ?? [];
    }
    return this.messages;
  }

  private async saveMessages(): Promise<void> {
    await this.ctx.storage.put('messages', this.messages!);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/history') {
      const messages = await this.loadMessages();
      return Response.json(messages.filter(m => m.role !== 'system'));
    }

    if (url.pathname === '/clear') {
      this.messages = [];
      await this.saveMessages();
      return Response.json({ cleared: true });
    }

    if (url.pathname === '/delete') {
      this.messages = [];
      await this.ctx.storage.deleteAll();
      return Response.json({ deleted: true });
    }

    if (url.pathname === '/chat' && request.method === 'POST') {
      const messages = await this.loadMessages();
      const { message, systemPrompt, agentName, apiKey } = await request.json() as {
        message: string;
        systemPrompt: string;
        agentName: string;
        apiKey?: string;
      };

      // Add system prompt if first message
      if (messages.length === 0 && systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt, timestamp: Date.now() });
      }

      // Add user message
      messages.push({ role: 'user', content: message, timestamp: Date.now() });

      if (!apiKey) {
        // No API key - return error as stream
        const errorText = `I'm sorry, the chat service is not configured yet. Please set the ANTHROPIC_API_KEY environment variable to enable AI responses.`;
        messages.push({ role: 'assistant', content: errorText, timestamp: Date.now() });
        await this.saveMessages();
        return this.streamText(errorText);
      }

      // Build Anthropic API messages (exclude system - it goes in the system param)
      const apiMessages = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));

      const systemContent = messages.find(m => m.role === 'system')?.content || '';

      try {
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: systemContent,
            messages: apiMessages,
            stream: true,
          }),
        });

        if (!anthropicRes.ok) {
          const errBody = await anthropicRes.text();
          const errorText = `I encountered an error connecting to the AI service (${anthropicRes.status}). Please try again later.`;
          messages.push({ role: 'assistant', content: errorText, timestamp: Date.now() });
          await this.saveMessages();
          return this.streamText(errorText);
        }

        // Stream the Anthropic response and re-emit as our SSE format
        const reader = anthropicRes.body!.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let fullResponse = '';
        let buffer = '';
        const messagesRef = messages;
        const saveRef = () => this.saveMessages();

        const stream = new ReadableStream({
          async pull(controller) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                // Save complete response
                messagesRef.push({ role: 'assistant', content: fullResponse, timestamp: Date.now() });
                await saveRef();
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
                return;
              }

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const data = line.slice(6).trim();
                if (!data || data === '[DONE]') continue;

                try {
                  const event = JSON.parse(data);
                  if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                    const text = event.delta.text;
                    fullResponse += text;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
                  }
                  if (event.type === 'message_stop') {
                    messagesRef.push({ role: 'assistant', content: fullResponse, timestamp: Date.now() });
                    await saveRef();
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                    return;
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (err) {
        const errorText = `I encountered an unexpected error. Please try again.`;
        messages.push({ role: 'assistant', content: errorText, timestamp: Date.now() });
        await this.saveMessages();
        return this.streamText(errorText);
      }
    }

    return new Response('Not found', { status: 404 });
  }

  private streamText(text: string): Response {
    const encoder = new TextEncoder();
    const words = text.split(' ');

    const stream = new ReadableStream({
      async start(controller) {
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? '' : ' ') + words[i];
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          await new Promise(r => setTimeout(r, 30 + Math.random() * 40));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}
