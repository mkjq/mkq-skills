import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, apiType, apiKey, model, baseUrl } = await req.json();

    let endpoint = baseUrl || 'https://openrouter.ai/api/v1/chat/completions';
    let headers: any = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    if (apiType === 'openrouter') {
      headers['HTTP-Referer'] = 'http://localhost:3000';
      headers['X-Title'] = 'Skills Manager';
      endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || 'meta-llama/llama-3-8b-instruct',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch AI response' }, { status: 500 });
  }
}
