import MarkdownEditor from '@/components/MarkdownEditor';

export default function EditorPage() {
  return (
    <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
      <MarkdownEditor />
    </div>
  );
}
