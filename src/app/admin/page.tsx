"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Shield, HardDrive, FileCode, Lock, Globe, Trash2, Download, RefreshCw, Key, Users, CheckCircle2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

interface AdminFile {
  key: string;
  size: number;
  lastModified: string;
  folder: string;
}

interface AdminStats {
  totalFiles: number;
  totalSizeBytes: number;
  publicSkillsCount: number;
  privateSkillsCount: number;
  vaultFilesCount: number;
}

export default function SiteAdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [files, setFiles] = useState<AdminFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [filterFolder, setFilterFolder] = useState<string>('all');

  const [resetPasscode, setResetPasscode] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin', {
        headers: { 'x-vault-token': localStorage.getItem('mkq_vault_token') || '' }
      });
      if (res.status === 401) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      setAuthenticated(true);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setFiles(data.files || []);
      } else {
        setMsg(`❌ خطأ: ${data.error}`);
      }
    } catch (err: any) {
      setMsg(`❌ فشل الاتصال: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteFile = async (key: string) => {
    if (!confirm(`هل أنت متأكد إدارياً من حذف الملف "${key}" نهائياً من النظام؟`)) return;
    try {
      const res = await fetch(`/api/admin?key=${encodeURIComponent(key)}`, { 
        method: 'DELETE',
        headers: { 'x-vault-token': localStorage.getItem('mkq_vault_token') || '' }
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`✅ تم حذف الملف "${key}" بنجاح.`);
        loadAdminData();
      } else {
        setMsg(`❌ خطأ: ${data.error}`);
      }
    } catch (err: any) {
      setMsg(`❌ فشل حذف الملف: ${err.message}`);
    } finally {
      setTimeout(() => setMsg(''), 4000);
    }
  };

  const handleResetPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasscode.trim()) return;

    try {
      const res = await fetch('/api/vault/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-vault-token': localStorage.getItem('mkq_vault_token') || ''
        },
        body: JSON.stringify({ newPasscode: resetPasscode.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setResetMsg(`✅ تم إعادة تعيين كلمة السر الخاصة إلى: ${resetPasscode.trim()}`);
        setResetPasscode('');
      } else {
        setResetMsg(`❌ خطأ: ${data.error}`);
      }
    } catch (err: any) {
      setResetMsg(`❌ فشل الاتصال: ${err.message}`);
    } finally {
      setTimeout(() => setResetMsg(''), 4000);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredFiles = filterFolder === 'all'
    ? files
    : files.filter(f => f.folder === filterFolder);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError('');
    try {
      const res = await fetch('/api/vault/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: adminPasscode })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('mkq_vault_token', adminPasscode);
        setAuthenticated(true);
        loadAdminData();
      } else {
        setAdminAuthError(data.error || 'رمز المرور غير صحيح');
      }
    } catch (err) {
      setAdminAuthError('فشل الاتصال بالخادم');
    }
  };

  if (authenticated === null) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-main)', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw className="animate-spin" size={32} color="var(--brand-primary)" />
      </div>
    );
  }

  if (authenticated === false) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '40px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
          <Lock size={48} color="var(--brand-primary)" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>لوحة الإدارة مقفلة</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>يرجى إدخال كلمة السر الخاصة للوصول</p>
          
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="password"
              placeholder="كلمة السر..."
              value={adminPasscode}
              onChange={e => setAdminPasscode(e.target.value)}
              className="input-field"
              autoFocus
            />
            {adminAuthError && <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>{adminAuthError}</p>}
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', overflow: 'hidden' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        {/* Header */}
        <header className="glass-panel" style={{ padding: '20px 32px', borderRadius: '0', borderInlineStart: 'none', borderInlineEnd: 'none', borderTop: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings color="var(--brand-primary)" size={24} />
              لوحة التحكم الإدارية الشاملة
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              إدارة ملفات النظام بالكامل، التخزين السحابي، وإعدادات الحماية والأمان
            </p>
          </div>

          <button className="btn-secondary" onClick={loadAdminData} style={{ padding: '10px 16px', borderRadius: '10px' }}>
            <RefreshCw size={16} /> تحديث البيانات
          </button>
        </header>

        <div style={{ padding: '32px', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {msg && (
            <div style={{ padding: '14px 20px', borderRadius: '12px', background: msg.includes('❌') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: msg.includes('❌') ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--text-main)', marginBottom: '24px', fontWeight: '600' }}>
              {msg}
            </div>
          )}

          {/* Site Statistics Overview */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>إجمالي الملفات بالسحابة</span>
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--brand-primary)' }}>{stats.totalFiles}</span>
              </div>

              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>حجم التخزين الإجمالي</span>
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10b981' }}>{formatSize(stats.totalSizeBytes)}</span>
              </div>

              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>المهارات العامة</span>
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#3b82f6' }}>{stats.publicSkillsCount}</span>
              </div>

              <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>ملفات المكتبة المحمية</span>
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#f59e0b' }}>{stats.vaultFilesCount}</span>
              </div>
            </div>
          )}

          {/* Quick Admin Actions */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} color="var(--brand-primary)" /> إعادة تعيين كلمة سر المكتبة الخاصة إدارياً
            </h3>

            <form onSubmit={handleResetPasscode} style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
              <input
                type="text"
                placeholder="كلمة السر الجديدة للمكتبة المحمية..."
                value={resetPasscode}
                onChange={e => setResetPasscode(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '10px 20px', borderRadius: '10px' }}>
                تعيين الآن
              </button>
            </form>

            {resetMsg && (
              <p style={{ marginTop: '12px', fontSize: '0.88rem', color: resetMsg.includes('❌') ? '#ef4444' : '#10b981', fontWeight: '600' }}>
                {resetMsg}
              </p>
            )}
          </div>

          {/* Global Files Table */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>إدارة كافة ملفات السحابة والموقع</h3>

              <div style={{ display: 'flex', gap: '8px' }}>
                {['all', 'public', 'private', 'vault'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterFolder(f)}
                    className={filterFolder === f ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '8px' }}
                  >
                    {f === 'all' ? 'الكل' : f === 'public' ? 'العامة' : f === 'private' ? 'الخاصة' : 'المكتبة المحمية'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <RefreshCw className="animate-spin" size={28} color="var(--brand-primary)" style={{ margin: '0 auto 12px auto' }} />
                <p style={{ color: 'var(--text-muted)' }}>جاري جلب الملفات الإدارية...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>لا توجد ملفات مطابقة</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '12px', textAlign: 'start' }}>مسار الملف / Key</th>
                      <th style={{ padding: '12px', textAlign: 'start' }}>القسم</th>
                      <th style={{ padding: '12px', textAlign: 'start' }}>الحجم</th>
                      <th style={{ padding: '12px', textAlign: 'start' }}>تاريخ التعديل</th>
                      <th style={{ padding: '12px', textAlign: 'end' }}>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map(f => (
                      <tr key={f.key} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '12px', fontWeight: '600', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.key}>
                          {f.key}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', background: f.folder === 'public' ? 'rgba(59, 130, 246, 0.15)' : f.folder === 'vault' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: f.folder === 'public' ? '#3b82f6' : f.folder === 'vault' ? '#f59e0b' : '#10b981', fontWeight: '700' }}>
                            {f.folder}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{formatSize(f.size)}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                          {f.lastModified ? new Date(f.lastModified).toLocaleDateString('ar-EG') : '—'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'end' }}>
                          <button
                            onClick={() => handleDeleteFile(f.key)}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          >
                            <Trash2 size={14} /> حذف إداري
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
