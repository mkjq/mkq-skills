import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/cloudflare';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Fetch settings from D1
    const sql = `SELECT openRouterApiKey, standardApiKey, aiSystemPrompt FROM global_settings WHERE id = 'global'`;
    const rows = await queryD1(sql);
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 500 });
    }

    const settings = rows[0];
    const apiKey = settings.openRouterApiKey || settings.standardApiKey;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'AI API Key is not configured in settings' }, { status: 400 });
    }

    // Default to OpenRouter if openRouterApiKey is provided
    const isOpenRouter = !!settings.openRouterApiKey;
    const endpoint = isOpenRouter 
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.deepseek.com/chat/completions'; // Fallback to DeepSeek

    const headers: any = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    if (isOpenRouter) {
      headers['HTTP-Referer'] = 'https://skills.mkq.one';
      headers['X-Title'] = 'MKQ Skills';
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: isOpenRouter ? 'google/gemini-2.5-pro' : 'deepseek-chat', // Use deepseek-chat as default fallback
        stream: true,
        messages: [
          { role: 'system', content: settings.aiSystemPrompt || 'You are an AI assistant.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'AI API Error: ' + errorText }, { status: response.status });
    }

    // Return the readable stream directly to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('AI Route Error:', error);
    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 });
  }
}
