import Link from 'next/link';
import { books } from '@/data/books';
import { BookOpen, Download, ArrowRight, Library, Search } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المكتبة | MKQ Skills',
  description: 'اكتشف واقرأ مجموعة منتقاة من أفضل الكتب في البرمجة والتصميم والتقنية والعلوم والتاريخ.',
};

// Get unique categories
const categories = [...new Set(books.map((b) => b.category))];

// Pick a color for each category
const categoryColors: Record<string, string> = {
  Philosophy: '#8b5cf6',
  Literature: '#3b82f6',
  Novel: '#10b981',
  History: '#f59e0b',
};

export default function LibraryPage() {
  return (
    <main style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1rem',
      minHeight: '100vh',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        maxWidth: '800px',
        marginBottom: '3rem',
        animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          borderRadius: '100px',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--brand-primary)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <Library size={16} />
          مكتبة الكتب الرقمية
        </div>
        <h1 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
          fontWeight: 800,
          letterSpacing: '-1px',
          marginBottom: '1rem',
          lineHeight: 1.3,
          color: 'var(--text-main)',
        }}>
          اكتشف عالم{' '}
          <span style={{
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>المعرفة</span>
        </h1>
        <p style={{
          fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)',
          color: 'var(--text-muted)',
          lineHeight: 1.7,
          fontWeight: 500,
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          مجموعة منتقاة بعناية من أفضل الكتب العالمية في البرمجة، التصميم، التقنية، العلوم، والتاريخ. اقرأها مباشرة من المتصفح أو حمّلها لقراءتها لاحقاً.
        </p>
      </div>

      {/* Back to Home */}
      <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '2rem' }}>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 600,
          transition: 'color 0.2s',
        }}>
          <ArrowRight size={16} />
          العودة للرئيسية
        </Link>
      </div>

      {/* Books by Category */}
      {categories.map((category) => {
        const categoryBooks = books.filter((b) => b.category === category);
        const color = categoryColors[category] || 'var(--brand-primary)';

        return (
          <section key={category} style={{
            width: '100%',
            maxWidth: '1200px',
            marginBottom: '3rem',
          }}>
            {/* Category Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '1.5rem',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                width: '8px',
                height: '32px',
                borderRadius: '4px',
                background: color,
              }} />
              <h2 style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                margin: 0,
              }}>
                {category === 'Philosophy' && '📖 الفلسفة والفكر'}
                {category === 'Literature' && '🏛️ الأدب الكلاسيكي'}
                {category === 'Novel' && '📚 الروايات'}
                {category === 'History' && '📜 التاريخ'}
              </h2>
              <span style={{
                padding: '4px 12px',
                borderRadius: '100px',
                backgroundColor: `${color}15`,
                color: color,
                fontSize: '0.8rem',
                fontWeight: 700,
              }}>
                {categoryBooks.length} كتاب
              </span>
            </div>

            {/* Books Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}>
              {categoryBooks.map((book) => (
                <div
                  key={book.id}
                  className="glass-panel"
                  style={{
                    padding: '0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {/* Book Cover */}
                  <div style={{
                    height: '240px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid var(--border-subtle)',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: '#111',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.9,
                        transition: 'transform 0.3s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  </div>

                  {/* Book Info */}
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      marginBottom: '6px',
                      lineHeight: 1.4,
                    }}>
                      {book.title}
                    </h3>
                    <p style={{
                      fontSize: '0.8rem',
                      color: color,
                      fontWeight: 600,
                      marginBottom: '10px',
                    }}>
                      {book.author}
                    </p>
                    <p style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {book.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    borderTop: '1px solid var(--border-subtle)',
                  }}>
                    <Link
                      href={`/library/${book.id}`}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '14px',
                        color: 'var(--brand-primary)',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        transition: 'background 0.2s',
                        borderRight: '1px solid var(--border-subtle)',
                      }}
                    >
                      <BookOpen size={16} />
                      اقرأ الآن
                    </Link>
                    <a
                      href={`/api/books/download?id=${book.id}`}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '14px',
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                      }}
                    >
                      <Download size={16} />
                      تحميل
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem 0',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        borderTop: '1px solid var(--border-subtle)',
        width: '100%',
        maxWidth: '1200px',
        marginTop: '2rem',
      }}>
        <p>مكتبة MKQ — {books.length} كتاب متاح للقراءة والتحميل</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </main>
  );
}
