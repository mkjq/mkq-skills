import Link from 'next/link';
import { Download, Eye, Star } from 'lucide-react';

export default function LibraryPage() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '40px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '8px' }}>المكتبة السحابية</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>تصفح وحمل أفضل ملفات الذكاء الاصطناعي المحفوظة.</p>
          </div>
        </header>

        {/* Featured Files Section */}
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Star size={20} color="var(--brand-primary)" />
            الملفات المميزة
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Featured Card 1 */}
            <div className="library-card-featured">
              <div className="card-content">
                <span style={{ fontWeight: '800', fontSize: '1.6rem', display: 'block', marginBottom: '8px' }}>خبير كتابة الإعلانات.md</span>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>مهارة مخصصة لكتابة إعلانات تسويقية احترافية بأسلوب ستيف جوبز.</p>
              </div>
              <div className="card-actions">
                <Link href="/dashboard/editor" title="عرض الملف">
                   <Eye size={22} color="var(--brand-primary)" />
                </Link>
                <a href="#" title="تحميل">
                   <Download size={22} color="var(--text-main)" />
                </a>
              </div>
            </div>
            
            {/* Featured Card 2 */}
            <div className="library-card-featured">
              <div className="card-content">
                <span style={{ fontWeight: '800', fontSize: '1.6rem', display: 'block', marginBottom: '8px' }}>تحليل البيانات المتقدم.md</span>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>موجه (Prompt) ضخم لتحليل جداول البيانات وتوليد إحصائيات دقيقة.</p>
              </div>
              <div className="card-actions">
                <Link href="/dashboard/editor" title="عرض الملف">
                   <Eye size={22} color="var(--brand-primary)" />
                </Link>
                <a href="#" title="تحميل">
                   <Download size={22} color="var(--text-main)" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Regular Files Section */}
        <section>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '24px' }}>جميع الملفات</h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Link href="/dashboard/editor" key={i} style={{ textDecoration: 'none' }}>
                <div className="library-card-normal">
                  <div style={{ position: 'relative' }}>
                    <div className="icon-box">
                      <div className="line" style={{ width: '80%' }}></div>
                      <div className="line" style={{ width: '60%' }}></div>
                      <div className="line" style={{ width: '70%' }}></div>
                    </div>
                    <div className="status-dot" style={{ right: 'auto', left: '16px' }}></div> {/* Logical left in RTL */}
                  </div>

                  <div style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
                    <p style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                      أوامر React
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      12 KB • .md
                    </p>
                  </div>

                  <div className="progress-bar"></div>
                </div>
              </Link>
            ))}

          </div>
        </section>
        
      </div>
    </div>
  );
}
