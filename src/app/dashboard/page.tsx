"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Download, Eye, Users, Lock, Plus, RefreshCw, FileText, Trash2, LogIn, LogOut } from 'lucide-react';
import FolderUpload from '@/components/FolderUpload';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

interface SkillFile {
  key: string;
  filename: string;
  size: number;
  lastModified: string;
  folder: string;
  owner?: string;
}

export default function LibraryPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'private' | 'public'>('public');
  const [files, setFiles] = useState<SkillFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const loadFiles = async (folder: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/skills?folder=${folder}`);
      const data = await res.json();
      if (data.success) setFiles(data.files || []);
      else setFiles([]);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'private') {
      if (!user) {
        setShowAuthModal(true);
        setActiveTab('public');
        return;
      }
      loadFiles('private');
    } else if (activeTab === 'public') {
      loadFiles('public');
    } else {
      loadFiles('featured');
    }
  }, [activeTab, user]);

  const handleDownload = (key: string, filename: string) => {
    const url = `/api/skills/download?key=${encodeURIComponent(key)}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = async (key: string, filename: string) => {
    if (!confirm(`هل أنت متأكد من حذف الملف "${filename}" نهائياً؟`)) return;
    
    try {
      const res = await fetch(`/api/skills?key=${encodeURIComponent(key)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setUploadMsg(`✅ تم حذف "${filename}" بنجاح.`);
        loadFiles(activeTab);
      } else {
        setUploadMsg(`❌ خطأ: ${data.error}`);
      }
    } catch (err: any) {
      setUploadMsg(`❌ فشل الاتصال: ${err.message}`);
    } finally {
      setTimeout(() => setUploadMsg(''), 4000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    const file = e.target.files?.[0];
    if (!file) return;

    const folder = activeTab === 'public' ? 'public' : 'private';
    setUploading(true);
    setUploadMsg('جاري الرفع...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/skills/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setUploadMsg(`✅ تم رفع "${data.filename}" بنجاح!`);
        loadFiles(folder);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setUploadMsg(`❌ فشل الرفع: ${err.message}`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadMsg(''), 4000);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const tabs = [
    { id: 'public', label: 'المكتبة العامة', icon: Users },
    { id: 'private', label: 'ملفاتي الخاصة', icon: Lock },
  ] as const;

  return (
    <div style={{ flex: 1, padding: '32px', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: '800', letterSpacing: '-1px', marginBottom: '6px' }}>المكتبة السحابية</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>تصفح، ارفع، وحمّل ملفات المهارات والـ Prompts.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* User Auth Section */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--brand-primary)', fontWeight: 'bold' }}>{user.username} {user.role === 'admin' && '(المدير)'}</span>
                <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="تسجيل الخروج">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button className="btn-secondary" onClick={() => setShowAuthModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                <LogIn size={16} />
                تسجيل الدخول
              </button>
            )}

            {uploadMsg && (
              <span style={{
                padding: '8px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600',
                background: uploadMsg.startsWith('✅') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: uploadMsg.startsWith('✅') ? '#10b981' : '#ef4444',
                border: `1px solid ${uploadMsg.startsWith('✅') ? '#10b981' : '#ef4444'}`,
              }}>
                {uploadMsg}
              </span>
            )}
            <FolderUpload onChange={handleFileUpload} uploading={uploading} />
            <button
              className="btn-secondary"
              onClick={() => loadFiles(activeTab)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px' }}
              title="تحديث"
            >
              <RefreshCw size={16} />
            </button>
            <Link href="/dashboard/editor" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                <Plus size={16} />
                إنشاء مهارة
              </button>
            </Link>
          </div>
        </header>

        {/* Auth Modal */}
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '32px',
          background: 'var(--bg-surface)', borderRadius: '12px', padding: '4px',
          width: 'fit-content', border: '1px solid var(--border-subtle)'
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: '600', fontSize: '0.95rem',
                  background: isActive ? 'var(--brand-primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab: Private or Public – live from R2 */}
        {(activeTab === 'private' || activeTab === 'public') && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              {activeTab === 'public'
                ? <><Users size={18} color="var(--brand-primary)" /><h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>الملفات العامة — مفتوحة للجميع</h2></>
                : <><Lock size={18} color="var(--brand-primary)" /><h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>ملفاتي الخاصة</h2></>
              }
            </div>



            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <div className="spinner-container" style={{ width: '60px', height: '60px', margin: '0 auto 16px' }}>
                  <div className="spinner" />
                </div>
                <p>جاري التحميل من السحابة...</p>
              </div>
            ) : files.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px', borderRadius: '16px',
                border: '2px dashed var(--border-strong)', color: 'var(--text-muted)'
              }}>
                <FileText size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
                <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>لا توجد ملفات بعد</p>
                <p style={{ fontSize: '0.9rem' }}>اضغط "رفع ملف" أو "إنشاء مهارة" لإضافة أول ملف</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {files.map(file => (
                  <div key={file.key} style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '18px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'default',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand-primary)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.4), 0 0 20px var(--brand-glow), inset 0 1px 0 rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                  >
                    {/* Glow accent top-right */}
                    <div style={{
                      position: 'absolute', top: 0, right: 0,
                      width: '80px', height: '80px',
                      background: 'var(--brand-glow)',
                      borderRadius: '50%',
                      filter: 'blur(40px)',
                      opacity: 0.5,
                      pointerEvents: 'none',
                    }} />

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
                      <div style={{
                        width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--brand-primary), color-mix(in srgb, var(--brand-primary) 50%, #6366f1))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px var(--brand-glow)',
                      }}>
                        <FileText size={22} color="#fff" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontWeight: '700', fontSize: '1rem', marginBottom: '6px',
                          wordBreak: 'break-word', color: 'var(--text-main)',
                          lineHeight: '1.3',
                        }}>{file.filename}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '0.75rem', color: 'var(--text-muted)',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '2px 8px', borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.08)'
                          }}>
                            {formatSize(file.size)}
                          </span>
                          {file.lastModified && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(file.lastModified).toLocaleDateString('ar-SA')}
                            </span>
                          )}
                          {file.owner && (
                            <span style={{
                              fontSize: '0.75rem', color: 'var(--brand-primary)',
                              fontWeight: '600',
                            }}>@{file.owner}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link href={`/dashboard/editor?key=${encodeURIComponent(file.key)}`} style={{ textDecoration: 'none', flex: 1 }}>
                        <button className="btn-primary" style={{
                          width: '100%', padding: '9px 12px', fontSize: '0.85rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}>
                          <Eye size={14} /> عرض وتعديل
                        </button>
                      </Link>
                      <button
                        className="btn-secondary"
                        onClick={() => handleDownload(file.key, file.filename || 'file.md')}
                        style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                        title="تحميل"
                      >
                        <Download size={14} />
                      </button>
                      {user && (user.role === 'admin' || user.username === file.owner || (!file.owner && activeTab === 'private')) && (
                        <button
                          className="btn-secondary"
                          onClick={() => handleDelete(file.key, file.filename)}
                          style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
