"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, User as UserIcon, LogIn, UserPlus } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (data.success) {
        login(data.user);
        onClose();
      } else {
        setError(data.error || 'حدث خطأ غير متوقع');
      }
    } catch (err: any) {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}
        >×</button>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            {isLogin ? <LogIn size={32} color="var(--brand-primary)" /> : <UserPlus size={32} color="var(--brand-primary)" />}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            {isLogin ? 'مرحباً بعودتك! الرجاء إدخال بياناتك.' : 'احفظ ملفاتك وأنشئ مكتبتك الخاصة بسهولة.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>
              <UserIcon size={16} color="var(--brand-primary)" /> اسم المستخدم
            </label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="input-field"
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-surface)' }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>
              <Lock size={16} color="var(--brand-primary)" /> كلمة المرور
            </label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-surface)' }}
            />
          </div>
          
          {error && (
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
            {loading ? 'جاري التحميل...' : (isLogin ? 'دخول' : 'إنشاء حساب')}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isLogin ? 'سجل الآن' : 'سجل الدخول'}
          </button>
        </div>
      </div>
    </div>
  );
}
