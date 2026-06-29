"use client";

import React, { useState, useEffect } from 'react';
import { Lock, Save, Key, Bot, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [settings, setSettings] = useState({
    adminPassword: '1010',
    standardApiKey: '',
    openRouterApiKey: '',
    aiSystemPrompt: 'أنت مساعد ذكي ومبدع يقدم إجابات دقيقة واحترافية.'
  });

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setMessage("تنبيه: لم يتم الاتصال بقاعدة بيانات Cloudflare بعد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === settings.adminPassword) {
      setIsAuthenticated(true);
      setMessage('');
    } else {
      setMessage('كلمة المرور غير صحيحة!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (data.success) {
        setMessage('تم حفظ الإعدادات السحابية في Cloudflare بنجاح!');
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      setMessage("فشل الحفظ، تأكد من إعدادات وصلاحيات Cloudflare.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--brand-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>جاري المزامنة السحابية...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: 'calc(100vh - 80px)', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, var(--bg-surface), var(--bg-app))' }}>
        <form onSubmit={handleLogin} className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '350px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={32} color="var(--brand-primary)" />
          </div>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem' }}>بوابة المدير</h2>
          
          <input 
            type="password" 
            placeholder="كلمة المرور..." 
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={{ 
              width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-solid)', color: 'var(--text-main)', outline: 'none',
              textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem'
            }}
            autoFocus
          />
          
          {message && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{message}</span>}
          
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
            دخول
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldAlert size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '2rem' }}>الإعدادات السحابية</h1>
          <span style={{ color: 'var(--text-muted)' }}>التغييرات هنا تنعكس عالمياً لجميع المستخدمين</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Passwords */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: '600' }}>
            <Lock size={18} color="var(--brand-primary)" /> كلمة مرور المدير
          </label>
          <input 
            type="text" 
            value={settings.adminPassword}
            onChange={(e) => setSettings({...settings, adminPassword: e.target.value})}
            className="input-field"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
          />
        </div>

        <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

        {/* APIs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: '600' }}>
              <Key size={18} color="var(--brand-primary)" /> Standard AI API Key
            </label>
            <input 
              type="password" 
              value={settings.standardApiKey}
              onChange={(e) => setSettings({...settings, standardApiKey: e.target.value})}
              className="input-field"
              placeholder="sk-..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: '600' }}>
              <Key size={18} color="var(--brand-primary)" /> OpenRouter API Key
            </label>
            <input 
              type="password" 
              value={settings.openRouterApiKey}
              onChange={(e) => setSettings({...settings, openRouterApiKey: e.target.value})}
              className="input-field"
              placeholder="sk-or-v1-..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
            />
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

        {/* System Prompt */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: '600' }}>
            <Bot size={18} color="var(--brand-primary)" /> تعريف الهوية ووظيفة الذكاء الاصطناعي (System Prompt)
          </label>
          <textarea 
            value={settings.aiSystemPrompt}
            onChange={(e) => setSettings({...settings, aiSystemPrompt: e.target.value})}
            className="input-field"
            rows={6}
            style={{ 
              width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', 
              background: 'var(--bg-surface)', resize: 'vertical', lineHeight: '1.6'
            }}
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>هذه الأوامر ستُعطى للذكاء الاصطناعي قبل كل طلب ليتصرف بناءً عليها.</span>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
          <span style={{ color: message.includes('نجاح') ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{message}</span>
          <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '12px 32px' }}>
            <Save size={18} />
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </form>
    </div>
  );
}
