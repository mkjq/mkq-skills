"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Save, ChevronLeft, Globe, Lock } from 'lucide-react';
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
  // visibility: 'private' | 'public'
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  // isFork: true when editing a public file that belongs to someone else
  const [isFork, setIsFork] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load file from R2 if key param is present
  useEffect(() => {
    if (!fileKey) {
      setValue('# مهارة جديدة\n\nاكتب المحتوى الخاص بك هنا...');
      setVisibility('private');
      setIsFork(false);
      return;
    }
    setLoadingFile(true);
    const parts = fileKey.split('/');
    const fileFolder = parts[0]; // 'public' or 'private'
    const fileOwner = parts.length >= 3 ? parts[1] : '';
    const fname = parts[parts.length - 1] || 'file.md';
    setFilename(fname);

    // Detect fork: user is editing a public file that doesn't belong to them
    const isOtherPublic = fileFolder === 'public' && user && fileOwner !== user.username;
    const isNoOwner = fileFolder === 'public' && !fileOwner;
    if (isOtherPublic || isNoOwner) {
      setIsFork(true);
      setVisibility('private'); // default fork to private
    } else {
      setIsFork(false);
      setVisibility(fileFolder === 'public' ? 'public' : 'private');
    }

    fetch(`/api/skills/download?key=${encodeURIComponent(fileKey)}`)
      .then(r => r.text())
      .then(text => setValue(text))
      .catch(() => setValue('# فشل تحميل الملف'))
      .finally(() => setLoadingFile(false));
  }, [fileKey, user]);

  const handleSave = async () => {
    if (!user) {
      setSaveStatus('يجب تسجيل الدخول لحفظ الملفات.');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    setSaving(true);
    setSaveStatus('جاري الرفع للسحابة...');
    try {
      // If fork mode: always save as a NEW file in user's own folder (no existingKey)
      // If owner or admin editing own file: overwrite existingKey
      const parts = fileKey ? fileKey.split('/') : [];
      const fileOwner = parts.length >= 3 ? parts[1] : '';
      const isOwner = user && (user.role === 'admin' || fileOwner === user.username);
      const useExistingKey = fileKey && isOwner && !isFork ? fileKey : undefined;

      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          content: value,
          folder: visibility,
          existingKey: useExistingKey
        })
      });
      const data = await response.json();
      if (data.success) {
        setSaveStatus(isFork ? '✅ تم حفظ نسخة في مكتبتك!' : '✅ تم الحفظ في السحابة!');
        setIsFork(false); // After fork save, it's now the user's own file
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setSaveStatus('❌ فشل الحفظ: ' + err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(''), 4000);
    }
  };

  const handleGenerate = async () => {
    if (!value.trim()) return;
    
    setIsGenerating(true);
    setValue('⏳ جاري التفكير وبناء المهارة...\n\n');
    
    // Detect if user wrote a description/request or an existing partial skill
    const isExistingSkill = value.trim().startsWith('#');
    
    const RICH_MARKDOWN_RULES = `
## 🎨 MANDATORY VISUAL FORMATTING RULES — FOLLOW STRICTLY

You MUST produce visually stunning, GitHub-quality Markdown. Plain text is UNACCEPTABLE. Every section must use rich visual elements:

### Required Visual Elements:
1. **Emoji in every H1, H2, H3 heading** — choose contextually relevant emojis
2. **Shields.io badges** in the header area for metadata (e.g. version, language, model compatibility):
   \`![GPT-4](https://img.shields.io/badge/GPT--4-Compatible-brightgreen?style=flat-square)\`
   \`![Claude](https://img.shields.io/badge/Claude-Compatible-blue?style=flat-square)\`
   \`![DeepSeek](https://img.shields.io/badge/DeepSeek-Compatible-orange?style=flat-square)\`
3. **Horizontal rules** (\`---\`) between major sections
4. **Tables** for comparisons, examples, or structured data — use ✅ ❌ 🟡 in table cells
5. **Code blocks** with language tags for any examples: \`\`\`markdown, \`\`\`json, \`\`\`text
6. **Blockquotes** (\`> \`) for important notes, warnings, or tips
7. **Bold + italic emphasis** — \`**bold**\`, \`*italic*\`, \`***bold italic***\` — use them liberally
8. **Numbered + nested bullet lists** for all procedures and rules
9. **Callout-style sections** using blockquote with emoji: \`> 💡 **Tip:** ...\` \`> ⚠️ **Warning:** ...\`
10. **HTML-style centered banners** for the title area if needed

### Example of how a GREAT header looks:
\`\`\`markdown
# 🧠 University Project Proofreading Expert

> *A precision AI editor for academic documents — powered by scholarly rigor and linguistic mastery*

![Version](https://img.shields.io/badge/Version-2.0-brightgreen?style=flat-square)
![Arabic](https://img.shields.io/badge/Language-Arabic%20%2F%20English-blue?style=flat-square)
![GPT-4](https://img.shields.io/badge/GPT--4-✓-green?style=flat-square)
![Claude](https://img.shields.io/badge/Claude-✓-blue?style=flat-square)
![DeepSeek](https://img.shields.io/badge/DeepSeek-✓-orange?style=flat-square)

---
\`\`\`

### Example of a GREAT comparison table:
| Feature | This AI | Standard Checker |
|---------|---------|-----------------|
| Grammar ✅ | Contextual | Surface-level |
| Academic tone ✅ | Specialized | Generic |
| Arabic support 🌍 | Native | Limited |

### Example of a GREAT example section:
\`\`\`text
📥 INPUT:
"ان الطلاب يجب عليهم المذاكرة بشكل يومي"

📤 OUTPUT:
✅ Corrected: "يجب على الطلاب المذاكرة يومياً"
📝 Changes: Restructured sentence, removed redundancy, improved formality
\`\`\`

DO NOT PRODUCE plain text paragraphs without visual structure. EVERY section needs visual richness.
`;

    const aiPrompt = isExistingSkill
      ? `You are given an existing AI Skill file. Your task is to TRANSFORM it into a visually stunning, world-class, production-ready Skill file.

EXISTING SKILL:
\`\`\`markdown
${value}
\`\`\`

${RICH_MARKDOWN_RULES}

## YOUR TASK:
1. Keep the original intent and purpose
2. Rewrite ALL sections with crystal-clear precision
3. Add ALL missing sections: Role & Identity, Core Responsibilities, Behavioral Guidelines, Constraints, Input Format, Output Format, Tone & Style, Examples, Edge Cases
4. Add emoji to every heading
5. Add shields.io compatibility badges after the title
6. Add tables wherever comparisons or structured data appear
7. Add code blocks for all examples (use proper language tags)
8. Add blockquote callouts for tips and warnings
9. Strengthen constraints — make them explicit and numbered
10. Add at least 3 realistic input/output examples in formatted code blocks

OUTPUT: Return ONLY the complete transformed Markdown. Start directly with # emoji heading. No preamble.`
      : `You are given a user request for a new AI Skill. Generate a VISUALLY STUNNING, world-class, production-ready AI Skill file in Markdown format.

USER REQUEST: "${value}"

${RICH_MARKDOWN_RULES}

## REQUIRED SECTIONS IN ORDER:
1. \`# 🎯 [Skill Name]\` — with emoji, then tagline in italic blockquote
2. Shields.io badges (version, language, model compatibility)
3. \`---\`
4. \`## 📋 Overview\` — 2-3 sentences, then a quick-reference table
5. \`## 🎭 Role & Identity\` — vivid persona description
6. \`## ✅ Core Responsibilities\` — numbered list with sub-bullets
7. \`## 🧭 Behavioral Guidelines\` — numbered rules with examples
8. \`## 🚫 Constraints\` — table with DO / DON'T columns
9. \`## 📥 Input Format\` — structured with code block example
10. \`## 📤 Output Format\` — exact template in code block
11. \`## 🎨 Tone & Style\` — descriptive with examples
12. \`## 💬 Examples\` — 3 full input/output pairs in formatted code blocks
13. \`## ⚡ Edge Cases\` — table with Scenario / How to Handle columns
14. \`---\` + footer badge line

OUTPUT: Return ONLY the complete Markdown file. Start with # emoji heading. No preamble, no explanation.`;

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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Fork notice */}
          {isFork && (
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', padding: '4px 10px', borderRadius: '6px' }}>
              ✂️ نسخة مُعدَّلة — ستُحفظ في مكتبتك
            </span>
          )}

          {/* Visibility toggle */}
          <button
            onClick={() => setVisibility(v => v === 'private' ? 'public' : 'private')}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem',
              color: visibility === 'public' ? 'var(--brand-primary)' : 'var(--text-muted)',
              borderColor: visibility === 'public' ? 'var(--brand-primary)' : undefined
            }}
            title={visibility === 'private' ? 'الملف خاص — اضغط لجعله عاماً' : 'الملف عام — اضغط لجعله خاصاً'}
          >
            {visibility === 'public' ? <Globe size={15} /> : <Lock size={15} />}
            {visibility === 'public' ? 'عام' : 'خاص'}
          </button>

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
            <span style={{ color: saveStatus.includes('❌') ? '#ef4444' : '#10b981', fontWeight: 'bold', fontSize: '0.85rem', opacity: saveStatus ? 1 : 0, transition: 'opacity 0.3s', whiteSpace: 'nowrap' }}>
              {saveStatus}
            </span>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={18} />
              {saving ? 'جاري الرفع...' : (isFork ? 'حفظ نسخة' : 'حفظ')}
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
