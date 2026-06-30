import { NextResponse } from 'next/server';
import { queryD1 } from '@/lib/cloudflare';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'المحتوى فارغ' }, { status: 400 });
    }

    // Fetch settings from D1
    const sql = `SELECT openRouterApiKey, standardApiKey, aiSystemPrompt FROM global_settings WHERE id = 'global'`;
    const rows = await queryD1(sql);
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'الإعدادات غير موجودة في قاعدة البيانات' }, { status: 500 });
    }

    const settings = rows[0];
    const apiKey = settings.openRouterApiKey || settings.standardApiKey;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'لم يتم إعداد مفتاح API في الإعدادات' }, { status: 400 });
    }

    // Default to OpenRouter if openRouterApiKey is provided
    const isOpenRouter = !!settings.openRouterApiKey;
    const endpoint = isOpenRouter 
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.deepseek.com/chat/completions';

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    if (isOpenRouter) {
      headers['HTTP-Referer'] = 'https://skills.mkq.one';
      headers['X-Title'] = 'MKQ Skills';
    }

    // Anti-hallucination system prompt addition
    const antiHallucinationPrefix = `## CRITICAL OPERATING RULES — READ BEFORE RESPONDING

You MUST follow these rules without exception:

1. **THINK BEFORE WRITING**: Before writing any output, internally plan the full structure of your response. Only start writing when you have a clear plan.
2. **COMPLETE YOUR THOUGHTS**: Never leave a sentence, section, or code block unfinished. If you start something, finish it properly.
3. **NO INVENTION**: Only state facts you are certain about. If unsure, say so explicitly. Never invent commands, parameters, APIs, or capabilities.
4. **STAY ON TASK**: Only do what the user explicitly asked for. Do not add unsolicited features, changes, or commentary.
5. **NO FILLER**: Do not pad your response with unnecessary explanations, apologies, or repetitive text.
6. **VERIFY STRUCTURE**: After mentally completing your response, ensure all Markdown headers, code blocks, and sections are properly closed.

---

`;

    const systemPrompt = antiHallucinationPrefix + (settings.aiSystemPrompt || 'أنت مساعد ذكي ومتخصص في كتابة ملفات المهارات (Prompts) بتنسيق Markdown.');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: isOpenRouter ? 'google/gemini-2.5-pro' : 'deepseek-reasoner',
        stream: true,
        temperature: 0.2,       // Low = less hallucination, more focused
        top_p: 0.85,
        max_tokens: 4000,       // Ensure full responses without cutting off
        presence_penalty: 0.05,
        frequency_penalty: 0.05,
        messages: [
          { role: 'system', content: systemPrompt },
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
    return NextResponse.json({ error: 'Failed to process AI request: ' + error.message }, { status: 500 });
  }
}
