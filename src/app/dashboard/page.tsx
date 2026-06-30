"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Eye, Users, Lock, Plus, RefreshCw, FileText, Trash2, LogIn, LogOut, Heart, Star } from 'lucide-react';
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

interface PopularFile {
  file_key: string;
  filename: string;
  count: number;
}

export default function LibraryPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'public' | 'private' | 'favorites'>('public');
  const [files, setFiles] = useState<SkillFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [popularFiles, setPopularFiles] = useState<PopularFile[]>([]);
  const [myFavorites, setMyFavorites] = useState<Set<string>>(new Set());
  const [favoritedKeys, setFavoritedKeys] = useState<{ file_key: string; filename: string }[]>([]);

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

  const loadPopular = async () => {
    try {
      const res = await fetch('/api/favorites?type=popular');
      const data = await res.json();
      if (data.success) setPopularFiles(data.files || []);
    } catch {}
  };

  const loadMyFavorites = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/favorites?type=mine');
      const data = await res.json();
      if (data.success) {
        setFavoritedKeys(data.files || []);
        setMyFavorites(new Set((data.files || []).map((f: any) => f.file_key)));
      }
    } catch {}
  };

  useEffect(() => {
    loadPopular();
  }, []);

  useEffect(() => {
    if (user) loadMyFavorites();
    else {
      setMyFavorites(new Set());
      setFavoritedKeys([]);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'private') {
      if (!user) { setShowAuthModal(true); setActiveTab('public'); return; }
      loadFiles('private');
    } else if (activeTab === 'public') {
      loadFiles('public');
    } else if (activeTab === 'favorites') {
      if (!user) { setShowAuthModal(true); setActiveTab('public'); return; }
      // favorites tab uses favoritedKeys, no separate loadFiles needed
    }
  }, [activeTab, user]);

  const handleDownload = (key: string, filename: string) => {
    const a = document.createElement('a');
    a.href = `/api/skills/download?key=${encodeURIComponent(key)}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = async (key: string, filename: string) => {
    if (!confirm(`هل أنت متأكد من حذف الملف "${filename}" نهائياً؟`)) return;
    try {
      const res = await fetch(`/api/skills?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUploadMsg(`✅ تم حذف "${filename}" بنجاح.`);
        if (activeTab !== 'favorites') loadFiles(activeTab);
        else loadMyFavorites();
      } else {
        setUploadMsg(`❌ خطأ: ${data.error}`);
      }
    } catch (err: any) {
      setUploadMsg(`❌ فشل الاتصال: ${err.message}`);
    } finally {
      setTimeout(() => setUploadMsg(''), 4000);
    }
  };

  const handleToggleFavorite = async (key: string, filename: string) => {
    if (!user) { setShowAuthModal(true); return; }
    const prev = new Set(myFavorites);
    // Optimistic update
    if (prev.has(key)) prev.delete(key); else prev.add(key);
    setMyFavorites(prev);

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_key: key, filename })
      });
      const data = await res.json();
      if (data.success) {
        loadMyFavorites();
        loadPopular();
      }
    } catch {}
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) { setShowAuthModal(true); return; }
    const file = e.target.files?.[0];
    if (!file) return;
    const folder = activeTab === 'public' ? 'public' : 'private';
    setUploading(true);
    setUploadMsg('جاري الرفع...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      const res = await fetch('/api/skills/upload', { method: 'POST', body: formData });
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
    { id: 'favorites', label: 'المفضلة', icon: Heart },
  ] as const;

  // File card component used in grid
  const FileCard = ({ file }: { file: SkillFile }) => {
    const isFav = myFavorites.has(file.key);
    const canDelete = user && (user.role === 'admin' || user.username === file.owner || (!file.owner && activeTab === 'private'));
    return (
      <div
        style={{
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
        {/* Glow */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'var(--brand-glow)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.5, pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0, background: 'linear-gradient(135deg, var(--brand-primary), #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px var(--brand-glow)' }}>
            <FileText size={22} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '6px', wordBreak: 'break-word', color: 'var(--text-main)', lineHeight: '1.3' }}>{file.filename}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                {formatSize(file.size)}
              </span>
              {file.lastModified && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(file.lastModified).toLocaleDateString('ar-SA')}</span>}
              {file.owner && <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: '600' }}>@{file.owner}</span>}
            </div>
          </div>
          {/* Favorite button */}
          <button
            onClick={() => handleToggleFavorite(file.key, file.filename)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0, transition: 'transform 0.2s' }}
            title={isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
          >
            <Heart size={18} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : 'var(--text-muted)'} />
          </button>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href={`/dashboard/editor?key=${encodeURIComponent(file.key)}`} style={{ textDecoration: 'none', flex: 1 }}>
            <button className="btn-primary" style={{ width: '100%', padding: '9px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Eye size={14} /> عرض وتعديل
            </button>
          </Link>
          <button className="btn-secondary" onClick={() => handleDownload(file.key, file.filename || 'file.md')} style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }} title="تحميل">
            <Download size={14} />
          </button>
          {canDelete && (
            <button className="btn-secondary" onClick={() => handleDelete(file.key, file.filename)} style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }} title="حذف">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    );
  };

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
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--brand-primary)', fontWeight: 'bold' }}>{user.username} {user.role === 'admin' && '(المدير)'}</span>
                <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="تسجيل الخروج">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button className="btn-secondary" onClick={() => setShowAuthModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                <LogIn size={16} /> تسجيل الدخول
              </button>
            )}

            {uploadMsg && (
              <span style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', background: uploadMsg.startsWith('✅') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: uploadMsg.startsWith('✅') ? '#10b981' : '#ef4444', border: `1px solid ${uploadMsg.startsWith('✅') ? '#10b981' : '#ef4444'}` }}>
                {uploadMsg}
              </span>
            )}

            <FolderUpload onChange={handleFileUpload} uploading={uploading} />
            <button className="btn-secondary" onClick={() => activeTab !== 'favorites' ? loadFiles(activeTab) : loadMyFavorites()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px' }} title="تحديث">
              <RefreshCw size={16} />
            </button>
            <Link href="/dashboard/editor" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                <Plus size={16} /> إنشاء مهارة
              </button>
            </Link>
          </div>
        </header>

        {/* Auth Modal */}
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

        {/* Popular Files Section */}
        {popularFiles.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Star size={20} color="var(--brand-primary)" fill="var(--brand-primary)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>الأكثر تفضيلاً</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {popularFiles.map((pf, i) => (
                <div key={pf.file_key} style={{
                  background: 'linear-gradient(135deg, #155e75, #0e7490, #06b6d4)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  color: '#f0f9ff',
                  boxShadow: '0 8px 32px rgba(6,182,212,0.25)',
                }}>
                  {/* Animated blob */}
                  <div style={{
                    position: 'absolute', width: '112px', height: '112px',
                    borderRadius: '50%', border: '8px solid rgba(255,255,255,0.2)',
                    top: '-48px', left: '-16px',
                    transition: 'all 0.7s ease',
                    pointerEvents: 'none',
                  }} />

                  {/* Content */}
                  <div style={{ padding: '20px 20px 0', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '700' }}>#{i + 1}</span>
                      <Heart size={14} fill="#f0f9ff" color="#f0f9ff" />
                      <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{pf.count} {pf.count === 1 ? 'إضافة' : 'إضافة'}</span>
                    </div>
                    <p style={{ fontWeight: '700', fontSize: '1rem', lineHeight: '1.3', marginBottom: '8px', wordBreak: 'break-word' }}>{pf.filename}</p>
                  </div>

                  {/* Action bar */}
                  <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: '16px' }}>
                    <Link href={`/dashboard/editor?key=${encodeURIComponent(pf.file_key)}`} style={{ textDecoration: 'none', flex: 1 }}>
                      <button style={{ width: '100%', padding: '14px', background: 'rgba(240,249,255,0.1)', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: 'background 0.2s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(240,249,255,0.2)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(240,249,255,0.1)'}
                      >
                        <Eye size={20} color="#f0f9ff" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDownload(pf.file_key, pf.filename)}
                      style={{ flex: 1, padding: '14px', background: 'rgba(240,249,255,0.1)', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(240,249,255,0.2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(240,249,255,0.1)'}
                    >
                      <Download size={20} color="#f0f9ff" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '32px', background: 'var(--bg-surface)', borderRadius: '12px', padding: '4px', width: 'fit-content', border: '1px solid var(--border-subtle)' }}>
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

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Heart size={18} color="var(--brand-primary)" fill="var(--brand-primary)" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>ملفاتي المفضلة</h2>
            </div>
            {favoritedKeys.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', borderRadius: '16px', border: '2px dashed var(--border-strong)', color: 'var(--text-muted)' }}>
                <Heart size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>لا توجد مفضلات بعد</p>
                <p style={{ fontSize: '0.9rem' }}>اضغط على أيقونة القلب ❤️ على أي ملف لإضافته للمفضلة</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {favoritedKeys.map(f => {
                  const fileAsSkill: SkillFile = { key: f.file_key, filename: f.filename, size: 0, lastModified: '', folder: f.file_key.split('/')[0], owner: f.file_key.split('/')[1] };
                  return <FileCard key={f.file_key} file={fileAsSkill} />;
                })}
              </div>
            )}
          </section>
        )}

        {/* Public / Private Tab */}
        {(activeTab === 'private' || activeTab === 'public') && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              {activeTab === 'public'
                ? <><Users size={18} color="var(--brand-primary)" /><h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>الملفات العامة</h2></>
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
              <div style={{ textAlign: 'center', padding: '60px', borderRadius: '16px', border: '2px dashed var(--border-strong)', color: 'var(--text-muted)' }}>
                <FileText size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
                <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>لا توجد ملفات بعد</p>
                <p style={{ fontSize: '0.9rem' }}>اضغط "رفع ملف" أو "إنشاء مهارة" لإضافة أول ملف</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {files.map(file => <FileCard key={file.key} file={file} />)}
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
