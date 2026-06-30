"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Save, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { useTheme } from './ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function MarkdownEditor() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const fileKey = searchParams.get('key');

  const [value, setValue] = useState('');
  const [filename, setFilename] = useState('مهارة جديدة.md');
  const [isClient, setIsClient] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load file from R2 if key param is present
  useEffect(() => {
    if (!fileKey) {
      setValue('# مهارة جديدة\n\nاكتب المحتوى الخاص بك هنا...');
      return;
    }
    setLoadingFile(true);
    const fname = fileKey.split('/').pop() || 'file.md';
    setFilename(fname);
    fetch(`/api/skills/download?key=${encodeURIComponent(fileKey)}`)
      .then(r => r.text())
      .then(text => setValue(text))
      .catch(() => setValue('# فشل تحميل الملف'))
      .finally(() => setLoadingFile(false));
  }, [fileKey]);

  const handleSave = async () => {
    if (!user) {
      setSaveStatus('يجب تسجيل الدخول لحفظ الملفات.');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    setSaving(true);
    setSaveStatus('جاري الرفع للسحابة...');
    try {
      // Determine folder from the key (if editing existing file) or default to private
      const folder = fileKey ? fileKey.split('/')[0] : 'private';
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content: value, folder, existingKey: fileKey })
      });
      const data = await response.json();
      if (data.success) {
        setSaveStatus('تم الحفظ في Cloudflare R2!');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setSaveStatus('فشل الحفظ: ' + err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleGenerate = async () => {
    if (!value.trim()) return;
    
    setIsGenerating(true);
    setValue('⏳ جاري التفكير وبناء المهارة...\n\n');
    
    // Detect if user wrote a description/request or an existing partial skill
    const isExistingSkill = value.trim().startsWith('#');
    
    const aiPrompt = isExistingSkill
      ? `You are given an existing AI Skill file in Markdown format. Your task is to IMPROVE and COMPLETE it to become a world-class, production-ready Skill file.

EXISTING SKILL:
\`\`\`markdown
${value}
\`\`\`

INSTRUCTIONS:
1. Keep the original intent and purpose of the skill
2. Rewrite vague or incomplete instructions with crystal-clear precision
3. Add missing sections (Role, Constraints, Examples, Edge Cases, Output Format, Tone & Style)
4. Strengthen the role definition — make the AI identity unmistakable
5. Add explicit constraints (what NOT to do)
6. Add at least 2 concrete input/output examples
7. Ensure the output format is explicitly defined
8. Fix any Markdown formatting issues

OUTPUT: Return ONLY the complete improved Markdown file, nothing else. Start directly with the # heading.`
      : `You are given a user request or description for a new AI Skill. Your task is to generate a complete, world-class, production-ready AI Skill file in Markdown format.

USER REQUEST:
"${value}"

INSTRUCTIONS:
Generate a complete Skill file with ALL of the following sections, in this exact order:
1. # [Skill Name] — Clear, descriptive title
2. ## Overview — 2-3 sentences describing what this skill does
3. ## Role & Identity — Who the AI IS and its persona
4. ## Core Responsibilities — Numbered list of primary tasks
5. ## Behavioral Guidelines — How the AI should behave and respond
6. ## Constraints — Explicit list of what the AI must NEVER do
7. ## Input Format — What the user provides
8. ## Output Format — Exact structure of every response
9. ## Tone & Style — Communication style
10. ## Examples — At least 2-3 realistic input/output pairs
11. ## Edge Cases — How to handle ambiguous or difficult inputs

RULES:
- Write EVERY section fully — no placeholders, no "to be filled" text
- Make the skill immediately usable in GPT-4, Claude, DeepSeek, Gemini
- Be specific, not generic — avoid vague instructions like "be helpful"
- Use proper Markdown formatting with headers, bullet lists, bold text, code blocks where needed

OUTPUT: Return ONLY the complete Markdown file. Start directly with # heading. No preamble, no explanation.`;

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let generatedText = '';

      setValue(''); // Clear loading message before streaming starts

      while (!done) {
        const { value: chunk, done: readerDone } = await reader.read();
        done = readerDone;
        if (chunk) {
          const text = decoder.decode(chunk, { stream: true });
          
          // Parse SSE stream format
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices[0]?.delta?.content || '';
                generatedText += content;
                setValue(generatedText);
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setValue(prev => prev + '\n\n❌ حدث خطأ أثناء التوليد: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isClient || loadingFile) return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <div className="spinner-container">
        <div className="spinner"><div className="spinner"><div className="spinner" /></div></div>
      </div>
      <span style={{ marginTop: '20px', fontSize: '1rem', fontWeight: '600', color: 'var(--brand-primary)' }}>
        {loadingFile ? 'جاري تحميل الملف من السحابة...' : 'جاري تحميل المحرر...'}
      </span>
    </div>
  );

  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)', margin: '20px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '24px 32px', 
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface-solid)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontWeight: '600', textDecoration: 'none' }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--brand-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            المكتبة
          </Link>
          <ChevronLeft size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={filename}
            onChange={e => setFilename(e.target.value)}
            className="input-field"
            style={{ background: 'transparent', border: '1px solid transparent', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '700', boxShadow: 'none', maxWidth: '320px', padding: '8px 10px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            className="btn-magic" 
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{ opacity: isGenerating ? 0.7 : 1, cursor: isGenerating ? 'not-allowed' : 'pointer' }}
          >
            <div className="dots_border" />
            {!isGenerating && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="sparkle">
                <path className="path" strokeLinejoin="round" strokeLinecap="round" stroke="black" fill="black" d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z" />
                <path className="path" strokeLinejoin="round" strokeLinecap="round" stroke="black" fill="black" d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z" />
                <path className="path" strokeLinejoin="round" strokeLinecap="round" stroke="black" fill="black" d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z" />
              </svg>
            )}
            <span className="text_button">{isGenerating ? 'جاري التوليد...' : 'توليد'}</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: saveStatus.includes('فشل') ? '#ef4444' : '#10b981', fontWeight: 'bold', fontSize: '0.9rem', opacity: saveStatus ? 1 : 0, transition: 'opacity 0.3s' }}>
              {saveStatus}
            </span>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={18} />
              {saving ? 'جاري الرفع...' : 'حفظ التغييرات'}
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div data-color-mode={theme} style={{ flex: 1, overflow: 'hidden' }} dir="ltr" className="md-editor-rtl-fix">
        <MDEditor
          value={value}
          onChange={(val) => setValue(val || '')}
          height="100%"
          visibleDragbar={false}
          style={{ border: 'none', borderRadius: 0 }}
          previewOptions={{ 
             style: { backgroundColor: 'transparent' }
          }}
        />
      </div>
    </div>
  );
}
