import { Suspense } from 'react';
import MarkdownEditor from '@/components/MarkdownEditor';

export default function EditorPage() {
  return (
    <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
      <Suspense fallback={
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--brand-primary)' }}>جاري تحميل المحرر...</span>
        </div>
      }>
        <MarkdownEditor />
      </Suspense>
    </div>
  );
}
