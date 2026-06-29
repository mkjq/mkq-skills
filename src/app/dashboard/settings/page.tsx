import { Shield, Zap, KeyRound, Globe, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '40px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '12px' }}>الإعدادات المتقدمة</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>تحكم كامل في واجهات الذكاء الاصطناعي، الخصوصية، وتخصيص تجربتك.</p>
        </header>

        {/* AI Settings Card */}
        <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))', border: '1px solid var(--brand-glow)' }}>
              <Zap size={24} color="var(--brand-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '4px' }}>مزود الذكاء الاصطناعي (AI API)</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>اختر المزود المفضل لديك لمهام توليد النصوص وتصحيحها.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <label className="label">مزود الخدمة النشط</label>
              <select className="input-field" style={{ cursor: 'pointer', fontSize: '1.1rem', padding: '14px' }}>
                <option value="standard">Standard API (Claude, DeepSeek, OpenAI...)</option>
                <option value="openrouter">OpenRouter API (الموصى به للنماذج المتعددة)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', backgroundColor: 'var(--bg-surface-hover)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <KeyRound size={18} color="var(--text-muted)" />
                  بيانات الاعتماد للـ API المختار
                </h3>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Base URL (اختياري لـ OpenRouter)</label>
                <input type="text" className="input-field" placeholder="https://api.anthropic.com/v1" />
              </div>
              <div>
                <label className="label">API Key (مفتاح سري)</label>
                <input type="password" className="input-field" placeholder="sk-..." />
              </div>
              <div>
                <label className="label">اسم النموذج (Model Name)</label>
                <input type="text" className="input-field" placeholder="مثال: claude-3-opus-20240229" />
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Card */}
        <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Shield size={24} color="#3b82f6" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '4px' }}>الخصوصية والمشاركة</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>تحكم في من يمكنه رؤية مهاراتك المحفوظة سحابياً.</p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">حالة المكتبة</label>
              <select className="input-field" style={{ cursor: 'pointer' }}>
                <option value="private">🔒 مكتبة خاصة (تتطلب كلمة مرور للوصول)</option>
                <option value="public">🌐 مكتبة عامة (رابط مفتوح للقراءة فقط)</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">كلمة المرور للحماية (Master Password)</label>
              <input type="password" className="input-field" placeholder="••••••••" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '40px', paddingBottom: '80px' }}>
          <button className="btn-secondary" style={{ padding: '14px 28px' }}>إلغاء التغييرات</button>
          <button className="btn-primary" style={{ padding: '14px 32px' }}>
             حفظ الإعدادات بنجاح
          </button>
        </div>
        
      </div>
    </div>
  );
}
