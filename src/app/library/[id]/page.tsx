import { queryD1 } from '@/lib/cloudflare';
import PdfReader from '@/components/PdfReader';
import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const sql = `SELECT * FROM library_books WHERE id = ?`;
  const books = await queryD1(sql, [params.id]);
  const book = books[0];
  
  if (!book) return { title: 'كتاب غير موجود' };
  return { title: `${book.title} | المكتبة` };
}

export default async function BookReaderPage({ params }: { params: { id: string } }) {
  const sql = `SELECT * FROM library_books WHERE id = ?`;
  const books = await queryD1(sql, [params.id]);
  const book = books[0];

  if (!book) {
    return (
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            margin: '0 auto 24px',
          }}>
            📖
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '12px',
          }}>
            الكتاب غير موجود
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            marginBottom: '24px',
            lineHeight: 1.6,
          }}>
            لم نتمكن من العثور على الكتاب المطلوب. قد يكون الرابط غير صحيح.
          </p>
          <Link href="/library" className="btn-primary" style={{
            padding: '12px 28px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <ArrowRight size={18} />
            العودة للمكتبة
          </Link>
        </div>
      </main>
    );
  }

  const pdfUrl = `/api/books/read?id=${book.id}`;

  return (
    <main style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <Link href="/library" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '0.85rem',
          fontWeight: 600,
          transition: 'color 0.2s',
        }}>
          <ArrowRight size={16} />
          العودة للمكتبة
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}>
            {book.author}
          </span>
        </div>

        <a
          href={`/api/books/download?id=${book.id}`}
          className="btn-primary"
          style={{
            padding: '8px 18px',
            textDecoration: 'none',
            fontSize: '0.85rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Download size={14} />
          تحميل الكتاب
        </a>
      </div>

      {/* PDF Reader */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <PdfReader url={pdfUrl} title={book.title} />
      </div>

      {/* Responsive Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .mobile-bottom-nav {
          display: none !important;
        }
        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: flex !important;
          }
        }
      `}} />
    </main>
  );
}
