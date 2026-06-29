import Link from 'next/link';
import { ArrowLeft, Sparkles, Code2, Cloud } from 'lucide-react';

export default function Home() {
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
      zIndex: 10
    }}>
      
      {/* Hero Content */}
      <div style={{ 
        textAlign: 'center', 
        maxWidth: '900px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div style={{ 
          padding: '8px 20px', 
          borderRadius: '100px', 
          backgroundColor: 'var(--bg-surface)', 
          color: 'var(--brand-primary)',
          fontSize: '0.9rem',
          fontWeight: '700',
          marginBottom: '2rem',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <Sparkles size={16} />
          تجربة كتابة مهارات بصرية مذهلة
        </div>
        
        <h1 style={{ 
          fontSize: 'clamp(2rem, 5vw, 3.2rem)', 
          fontWeight: '800', 
          letterSpacing: '-1px', 
          marginBottom: '1rem', 
          lineHeight: '1.2',
          color: 'var(--text-main)'
        }}>
          أدر مهارات <span style={{ 
            background: 'linear-gradient(135deg, #10b981, #3b82f6)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent'
          }}>الذكاء الاصطناعي</span> <br/>بكل احترافية.
        </h1>
        
        <p style={{ 
          fontSize: 'clamp(1rem, 2vw, 1.15rem)', 
          color: 'var(--text-muted)', 
          marginBottom: '3.5rem', 
          lineHeight: '1.6',
          maxWidth: '700px',
          fontWeight: '500'
        }}>
          منصتك المتكاملة لكتابة، وحفظ، وتعديل ملفات الـ Prompts. مدعومة بخيارات متعددة من واجهات الذكاء الاصطناعي وبمزامنة سحابية فورية ومظهر يفوق التوقعات.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '18px 40px', fontSize: '1.2rem', borderRadius: '12px' }}>
              ابدأ الاستخدام الآن
              <ArrowLeft size={20} />
            </button>
          </Link>
          <button className="btn-secondary" style={{ padding: '18px 40px', fontSize: '1.2rem', borderRadius: '12px' }}>
             استكشف المميزات
          </button>
        </div>
      </div>

      {/* Feature Cards Showcase */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px', 
        marginTop: '6rem',
        width: '100%',
        maxWidth: '1100px'
      }}>
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
           <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', marginBottom: '20px' }}>
             <Code2 size={32} color="var(--brand-primary)" />
           </div>
           <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>محرر Markdown فائق</h3>
           <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5' }}>تجربة كتابة سلسلة مع تمييز نحوي وأدوات متقدمة تتكيف مع وضعك المفضل.</p>
        </div>
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transform: 'translateY(-20px)' }}>
           <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', marginBottom: '20px' }}>
             <Sparkles size={32} color="#3b82f6" />
           </div>
           <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>ذكاء اصطناعي مدمج</h3>
           <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5' }}>تحدث مع Claude أو DeepSeek أو OpenRouter لتصحيح وتوليد الأوامر البرمجية بدقة.</p>
        </div>
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
           <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '50%', marginBottom: '20px' }}>
             <Cloud size={32} color="#8b5cf6" />
           </div>
           <h3 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>مزامنة سحابية لحظية</h3>
           <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5' }}>احفظ ملفاتك محلياً أو سحابياً باستخدام Firebase مع أعلى معايير الأمان والخصوصية.</p>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </main>
  );
}
