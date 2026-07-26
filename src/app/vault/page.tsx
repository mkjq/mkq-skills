"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Lock, Unlock, KeyRound, Upload, Download, Trash2, Shield, Folder, File, FileText, FileArchive, Image, Film, Music, RefreshCw, Key, ShieldAlert, ArrowRight } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

interface VaultFile {
  key: string;
  filename: string;
  size: number;
  lastModified: string;
  extension: string;
}

export default function PrivateVaultPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const [lockSeconds, setLockSeconds] = useState(0);
  const [submittingAuth, setSubmittingAuth] = useState(false);

  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Passcode Change Modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');
  const [updatingPasscode, setUpdatingPasscode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check initial auth status
  useEffect(() => {
    fetch('/api/vault/auth')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setAuthenticated(true);
          loadFiles();
        } else {
          setAuthenticated(false);
        }
      })
      .catch(() => setAuthenticated(false));
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockSeconds(prev => {
        if (prev <= 1) {
          setIsLocked(false);
          setLockMessage('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockSeconds]);

  const loadFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch('/api/vault/files');
      const data = await res.json();
      if (data.success) setFiles(data.files || []);
      else setFiles([]);
    } catch {
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setSubmittingAuth(true);
    setAuthError('');

    try {
      const res = await fetch('/api/vault/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() })
      });

      const data = await res.json();
      if (res.status === 429 || data.locked) {
        setIsLocked(true);
        setLockMessage(data.message || 'على مهلك حبيبي جرب بعدين ✋🐢');
        setLockSeconds(data.remainingSeconds || 180);
      } else if (data.success) {
        setAuthenticated(true);
        loadFiles();
      } else {
        setAuthError(data.error || 'كلمة السر غير صحيحة');
      }
    } catch (err: any) {
      setAuthError('حدث خطأ بالاتصال، يرجى المحاولة لاحقاً');
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setUploadMsg('جاري الرفع وحفظ الملفات في مكتبتك المحمية...');

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/vault/files', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || `فشل رفع ${file.name}`);
      }

      setUploadMsg(`✅ تم رفع ${selectedFiles.length} ملف بنجاح في المكتبة الخاصة!`);
      loadFiles();
    } catch (err: any) {
      setUploadMsg(`❌ خطأ أثناء الرفع: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setUploadMsg(''), 4000);
    }
  };

  const handleDelete = async (key: string, filename: string) => {
    if (!confirm(`هل أنت متأكد من حذف الملف "${filename}" نهائياً من المكتبة الخاصة؟`)) return;
    try {
      const res = await fetch(`/api/vault/files?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUploadMsg(`✅ تم حذف "${filename}" بنجاح.`);
        loadFiles();
      } else {
        setUploadMsg(`❌ خطأ: ${data.error}`);
      }
    } catch (err: any) {
      setUploadMsg(`❌ فشل الاتصال: ${err.message}`);
    } finally {
      setTimeout(() => setUploadMsg(''), 4000);
    }
  };

  const handleDownload = (key: string, filename: string) => {
    const a = document.createElement('a');
    a.href = `/api/skills/download?key=${encodeURIComponent(key)}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode.trim()) return;

    setUpdatingPasscode(true);
    setSettingsMsg('جاري حفظ كلمة السر الجديدة...');

    try {
      const res = await fetch('/api/vault/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPasscode: newPasscode.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setSettingsMsg('✅ تم تغيير كلمة السر بنجاح!');
        setTimeout(() => {
          setShowSettingsModal(false);
          setNewPasscode('');
          setSettingsMsg('');
        }, 1500);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setSettingsMsg(`❌ خطأ: ${err.message}`);
    } finally {
      setUpdatingPasscode(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (ext: string) => {
    switch (ext) {
      case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': case 'webp':
        return <Image size={24} color="#ec4899" />;
      case 'mp4': case 'mov': case 'avi': case 'mkv':
        return <Film size={24} color="#8b5cf6" />;
      case 'mp3': case 'wav': case 'aac':
        return <Music size={24} color="#06b6d4" />;
      case 'zip': case 'rar': case '7z': case 'tar': case 'gz':
        return <FileArchive size={24} color="#f59e0b" />;
      case 'pdf': case 'docx': case 'doc': case 'txt': case 'md':
        return <FileText size={24} color="#10b981" />;
      default:
        return <File size={24} color="#3b82f6" />;
    }
  };

  const filteredFiles = files.filter(f => f.filename.toLowerCase().includes(searchTerm.toLowerCase()));

  // 1. Loading State
  if (authenticated === null) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw className="animate-spin" size={32} color="var(--brand-primary)" />
      </div>
    );
  }

  // 2. Lockout View (5 wrong attempts)
  if (isLocked) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#fff', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '40px', textAlign: 'center', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 20px 50px rgba(239, 68, 68, 0.2)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', border: '2px solid #ef4444' }}>
            <span style={{ fontSize: '42px' }}>🐢</span>
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px', color: '#f87171' }}>
            على مهلك حبيبي جرب بعدين ✋🐢
          </h2>

          <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px' }}>
            لقد قمت بإدخال كلمة سر خاطئة 5 مرات متتالية. تم حظر المحاولات مؤقتاً لحماية مكتبتك الخاصة.
          </p>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>يرجى الانتظار حتى انتهاء العد التنازلي:</span>
            <span style={{ fontSize: '2rem', fontWeight: '900', color: '#fbbf24', letterSpacing: '2px' }}>
              {Math.floor(lockSeconds / 60)}:{(lockSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
              <ArrowRight size={18} /> العودة للمكتبة العامة
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Passcode Gate Modal (Unauthenticated)
  if (!authenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: 'linear-gradient(135deg, #0b0f19 0%, #111827 100%)', color: 'var(--text-main)', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '420px', width: '100%', padding: '36px', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--brand-primary), #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 8px 20px var(--brand-glow)' }}>
            <Lock size={32} color="#fff" />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>
            المكتبة المحمية الخاصة 🔒
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px', lineHeight: '1.5' }}>
            أدخل كلمة السر الخاصة للوصول لمكتبة ملفاتك الشخصية الحصينة
          </p>

          <form onSubmit={handlePasscodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="أدخل كلمة السر (الافتراضية: 1010)"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: authError ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  letterSpacing: '3px',
                  outline: 'none'
                }}
                autoFocus
              />
            </div>

            {authError && (
              <div style={{ color: '#ef4444', fontSize: '0.88rem', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                ⚠️ {authError}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={submittingAuth || !passcode.trim()}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1rem', justifyContent: 'center' }}
            >
              {submittingAuth ? 'جاري التحقق...' : 'فتح المكتبة الخاصة 🔓'}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowRight size={14} /> العودة للمكتبة العامة
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authenticated Private Vault Dashboard View
  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', overflow: 'hidden' }}>
      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        {/* Header */}
        <header className="glass-panel" style={{ padding: '20px 32px', borderRadius: '0', borderInlineStart: 'none', borderInlineEnd: 'none', borderTop: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield color="var(--brand-primary)" size={24} />
              مكتبة ملفاتي الخاصة المحمية
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              مساحتك الشخصية الفائقة الأمان لرفع جميع أنواع الملفات والمجلدات
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              className="btn-secondary"
              onClick={() => setShowSettingsModal(true)}
              style={{ padding: '10px 16px', borderRadius: '10px', fontSize: '0.9rem' }}
            >
              <Key size={16} /> تغيير كلمة السر
            </button>

            <button
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '0.9rem' }}
            >
              <Upload size={18} />
              {uploading ? 'جاري الرفع...' : 'رفع ملفات جديدة'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
        </header>

        {/* Content Container */}
        <div style={{ padding: '32px', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {/* Notifications */}
          {uploadMsg && (
            <div style={{ padding: '14px 20px', borderRadius: '12px', background: uploadMsg.includes('❌') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: uploadMsg.includes('❌') ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--text-main)', marginBottom: '24px', fontWeight: '600' }}>
              {uploadMsg}
            </div>
          )}

          {/* Stats Bar & Filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Folder size={20} color="var(--brand-primary)" />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>إجمالي الملفات</span>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{files.length} ملفات</span>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldAlert size={20} color="#10b981" />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>الحماية والحالة</span>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#10b981' }}>مكتبة مشفرة مخصصة</span>
                </div>
              </div>
            </div>

            <div style={{ minWidth: '300px' }}>
              <input
                type="text"
                placeholder="ابحث في ملفاتك الخاصة..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          {/* Files Grid */}
          {loadingFiles ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <RefreshCw className="animate-spin" size={32} color="var(--brand-primary)" style={{ margin: '0 auto 16px auto' }} />
              <p style={{ color: 'var(--text-muted)' }}>جاري تحميل ملفاتك المحمية...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Unlock size={28} color="var(--text-muted)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>لا توجد ملفات في المكتبة الخاصة بعد</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>يمكنك رفع أي ملف أو مستند (.pdf, .zip, .png, .docx) لحفظه بحماية كاملة.</p>
              <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} /> رفع أول ملف الآن
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {filteredFiles.map(file => (
                <div key={file.key} className="magic-card" style={{ padding: '20px', borderRadius: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ padding: '10px', background: 'var(--bg-main)', borderRadius: '12px' }}>
                      {getFileIcon(file.extension)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontWeight: '700', fontSize: '0.98rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={file.filename}>
                        {file.filename}
                      </h4>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>{formatSize(file.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.lastModified).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', justifyContent: 'flex-end' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => handleDownload(file.key, file.filename)}
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      title="تحميل"
                    >
                      <Download size={14} /> تحميل
                    </button>

                    <button
                      className="btn-secondary"
                      onClick={() => handleDelete(file.key, file.filename)}
                      style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      title="حذف"
                    >
                      <Trash2 size={14} /> حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Passcode Settings Modal */}
      {showSettingsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '28px', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <KeyRound size={20} color="var(--brand-primary)" /> تغيير كلمة سر المكتبة
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
              أدخل كلمة السر الجديدة للوصول للمكتبة الخاصة في المرات القادمة
            </p>

            <form onSubmit={handleChangePasscode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="password"
                placeholder="كلمة السر الجديدة (مثال: 2026)"
                value={newPasscode}
                onChange={e => setNewPasscode(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-main)', textAlign: 'center', fontSize: '1.1rem' }}
                autoFocus
              />

              {settingsMsg && (
                <div style={{ fontSize: '0.88rem', textAlign: 'center', color: settingsMsg.includes('❌') ? '#ef4444' : '#10b981' }}>
                  {settingsMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowSettingsModal(false)}
                  style={{ flex: 1, padding: '10px' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={updatingPasscode || !newPasscode.trim()}
                  style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
                >
                  {updatingPasscode ? 'جاري الحفظ...' : 'حفظ كلمة السر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
