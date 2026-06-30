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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {files.map(file => (
                  <div key={file.key} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                        background: 'var(--brand-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <FileText size={20} color="var(--brand-primary)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px', wordBreak: 'break-word' }}>{file.filename}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {formatSize(file.size)} • {file.lastModified ? new Date(file.lastModified).toLocaleDateString('ar-SA') : '—'}
                          {file.owner && <span style={{ marginLeft: '8px', color: 'var(--brand-primary)' }}>@{file.owner}</span>}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <Link href={`/dashboard/editor?key=${encodeURIComponent(file.key)}`} style={{ textDecoration: 'none', flex: 1 }}>
                        <button className="btn-secondary" style={{ width: '100%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}>
                          <Eye size={14} /> عرض وتعديل
                        </button>
                      </Link>
                      <button
                        className="btn-secondary"
                        onClick={() => handleDownload(file.key, file.filename || 'file.md')}
                        style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                        title="تحميل"
                      >
                        <Download size={14} />
                      </button>
                      
                      {user && (user.role === 'admin' || user.username === file.owner || (!file.owner && activeTab === 'private')) && (
                        <button
                          className="btn-secondary"
                          onClick={() => handleDelete(file.key, file.filename)}
                          style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
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
