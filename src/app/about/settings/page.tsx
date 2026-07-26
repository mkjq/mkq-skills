"use client";

import React, { useState, useEffect } from 'react';
import { Lock, Save, Key, Bot, ShieldAlert, RefreshCw, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [settings, setSettings] = useState({
    adminPassword: '',
    standardApiKey: '',
    openRouterApiKey: '',
    aiSystemPrompt: 'أنت مساعد ذكي ومبدع يقدم إجابات دقيقة وااحترافية.'
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
    if (user && user.role === 'admin') {
      loadSettings();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

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

  if (authLoading || (loading && user?.role === 'admin')) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', color: 'var(--text-main)' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw className="animate-spin" size={32} color="var(--brand-primary)" style={{ margin: '0 auto 16px auto' }} />
          <p style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, var(--bg-surface), var(--bg-app))', color: 'var(--text-main)' }}>
        <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '350px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={32} color="#ef4444" />
          </div>
          <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.5rem' }}>غير مصرح</h2>
          <p style={{ color: 'var(--text-muted)' }}>عذراً، هذه الصفحة مخصصة لمدير النظام فقط.</p>
          <Link href="/dashboard" style={{ width: '100%' }}>
            <button className="btn-primary" style={{ width: '100%', padding: '12px' }}>العودة للمكتبة</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      <header className="glass-panel" style={{ padding: '16px 32px', borderRadius: '0', borderTop: 'none', borderInlineStart: 'none', borderInlineEnd: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.88rem' }}>
            <ArrowRight size={16} className="rtl:rotate-180" /> العودة للمكتبة
          </button>
        </Link>
        <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>إعدادات النظام</span>
      </header>

      <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', flex: 1 }}>
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
    </div>
  );
}
