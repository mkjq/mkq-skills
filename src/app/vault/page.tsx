"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Lock, Unlock, KeyRound, Upload, Download, Trash2, Shield, Folder, File, FileText, FileArchive, Image, Film, Music, RefreshCw, Key, ShieldAlert, ArrowRight, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [activeToken, setActiveToken] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const [lockSeconds, setLockSeconds] = useState(0);
  const [submittingAuth, setSubmittingAuth] = useState(false);

  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'doc' | 'image' | 'archive' | 'media'>('all');

  // Drag and drop state + counter to prevent flickering
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  // Upload progress state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentUploadingFile, setCurrentUploadingFile] = useState<string>('');
  const [uploadMsg, setUploadMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Passcode Change Modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');
  const [updatingPasscode, setUpdatingPasscode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved token from localStorage if available
  useEffect(() => {
    const savedToken = localStorage.getItem('mkq_vault_token') || '';
    if (savedToken) setActiveToken(savedToken);
    checkAuth(savedToken);
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

  const getHeaders = (customToken?: string) => {
    const token = customToken !== undefined ? customToken : activeToken;
    const headers: Record<string, string> = {};
    if (token) headers['x-vault-token'] = token;
    return headers;
  };

  const checkAuth = async (token?: string) => {
    try {
      const res = await fetch('/api/vault/files', { headers: getHeaders(token) });
      if (res.ok) {
        setAuthenticated(true);
        loadFiles(token);
      } else {
        setAuthenticated(false);
      }
    } catch {
      setAuthenticated(false);
    }
  };

  const loadFiles = async (token?: string) => {
    setLoadingFiles(true);
    try {
      const res = await fetch('/api/vault/files', { headers: getHeaders(token) });
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch {}

      if (res.ok && data.success) {
        setFiles(data.files || []);
      } else {
        setFiles([]);
        if (res.status === 401) setAuthenticated(false);
      }
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

      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch {}

      if (res.status === 429 || data.locked) {
        setIsLocked(true);
        setLockMessage(data.message || 'على مهلك حبيبي جرب بعدين ✋🐢');
        setLockSeconds(data.remainingSeconds || 180);
      } else if (res.ok && data.success) {
        const token = passcode.trim();
        setActiveToken(token);
        localStorage.setItem('mkq_vault_token', token);
        setAuthenticated(true);
        loadFiles(token);
      } else {
        setAuthError(data.error || 'كلمة السر غير صحيحة');
      }
    } catch (err: any) {
      setAuthError('حدث خطأ بالاتصال، يرجى المحاولة لاحقاً');
    } finally {
      setSubmittingAuth(false);
    }
  };

  const processFilesUpload = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadMsg({ text: 'جاري بدء رفع الملفات والمجلدات...', type: 'info' });

    const totalFiles = fileList.length;
    let successCount = 0;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = fileList[i];
        setCurrentUploadingFile(file.name);

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/vault/files', {
          method: 'POST',
          headers: getHeaders(),
          body: formData
        });

        const resText = await res.text();
        let data: any = {};
        try {
          data = JSON.parse(resText);
        } catch {
          throw new Error(`تعذر رفع الملف "${file.name}".`);
        }

        if (!res.ok || !data.success) {
          throw new Error(data.error || `فشل رفع الملف ${file.name}`);
        }

        successCount++;
        const currentPercent = Math.round(((i + 1) / totalFiles) * 100);
        setUploadProgress(currentPercent);
      }

      setUploadMsg({ text: `✅ تم رفع ${successCount} ملف بنجاح إلى مكتبتك المحمية!`, type: 'success' });
      loadFiles();
    } catch (err: any) {
      const isFetchFail = err?.message === 'Failed to fetch' || err?.name === 'TypeError';
      const msg = isFetchFail
        ? `انقطع الاتصال أو تجاوز حجم الملف استيعاب طلب الرفع المباشر. أعد المحاولة أو اختبر رفع الملف بشكل منفرد.`
        : err.message;
      setUploadMsg({ text: `❌ ${msg}`, type: 'error' });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setCurrentUploadingFile('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setUploadMsg(null), 5000);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFilesUpload(e.target.files);
  };

  // Helper to extract all files from dropped DataTransfer items (including recursive folder directories)
  const getFilesFromDataTransfer = async (dataTransfer: DataTransfer): Promise<File[]> => {
    const extractedFiles: File[] = [];
    const items = dataTransfer.items;

    if (!items || items.length === 0) {
      return Array.from(dataTransfer.files || []);
    }

    const traverseEntry = async (entry: any, path = ''): Promise<void> => {
      if (entry.isFile) {
        return new Promise((resolve) => {
          entry.file((file: File) => {
            const relativeName = path ? `${path}/${file.name}` : file.name;
            const FileCtor = (globalThis as any).File;
            const renamedFile = new FileCtor([file], relativeName, {
              type: file.type,
              lastModified: file.lastModified
            });
            extractedFiles.push(renamedFile);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        return new Promise((resolve) => {
          const readNextBatch = () => {
            dirReader.readEntries(async (entries: any[]) => {
              if (!entries || entries.length === 0) {
                resolve();
              } else {
                const subPromises = entries.map(e => traverseEntry(e, path ? `${path}/${entry.name}` : entry.name));
                await Promise.all(subPromises);
                readNextBatch();
              }
            });
          };
          readNextBatch();
        });
      }
    };

    const topPromises: Promise<void>[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
        if (entry) {
          topPromises.push(traverseEntry(entry));
        } else {
          const f = item.getAsFile();
          if (f) extractedFiles.push(f);
        }
      }
    }

    await Promise.all(topPromises);
    return extractedFiles.length > 0 ? extractedFiles : Array.from(dataTransfer.files || []);
  };

  // Smooth Flick-Free Drag and Drop Event Handlers using dragCounter ref
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    if (e.dataTransfer) {
      const droppedFiles = await getFilesFromDataTransfer(e.dataTransfer);
      if (droppedFiles.length > 0) {
        processFilesUpload(droppedFiles);
      }
    }
  };

  const handleDelete = async (key: string, filename: string) => {
    if (!confirm(`هل أنت متأكد من حذف الملف "${filename}" نهائياً من المكتبة الخاصة؟`)) return;
    try {
      const res = await fetch(`/api/vault/files?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const resText = await res.text();
      let data: any = {};
      try { data = JSON.parse(resText); } catch {}

      if (res.ok && data.success) {
        setUploadMsg({ text: `✅ تم حذف "${filename}" بنجاح.`, type: 'success' });
        loadFiles();
      } else {
        setUploadMsg({ text: `❌ خطأ: ${data.error || 'تعذر الحذف'}`, type: 'error' });
      }
    } catch (err: any) {
      setUploadMsg({ text: `❌ فشل الاتصال: ${err.message}`, type: 'error' });
    } finally {
      setTimeout(() => setUploadMsg(null), 4000);
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
        headers: {
          'Content-Type': 'application/json',
          ...getHeaders()
        },
        body: JSON.stringify({ newPasscode: newPasscode.trim() })
      });

      const resText = await res.text();
      let data: any = {};
      try { data = JSON.parse(resText); } catch {}

      if (res.ok && data.success) {
        const token = newPasscode.trim();
        setActiveToken(token);
        localStorage.setItem('mkq_vault_token', token);
        setSettingsMsg('✅ تم تغيير كلمة السر بنجاح وتحديث الجلسة!');
        setTimeout(() => {
          setShowSettingsModal(false);
          setNewPasscode('');
          setSettingsMsg('');
        }, 1500);
      } else {
        throw new Error(data.error || 'فشل التغيير');
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

  const filterByCategory = (file: VaultFile) => {
    const ext = file.extension;
    if (categoryFilter === 'image') return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext);
    if (categoryFilter === 'doc') return ['pdf', 'docx', 'doc', 'txt', 'md'].includes(ext);
    if (categoryFilter === 'archive') return ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext);
    if (categoryFilter === 'media') return ['mp4', 'mov', 'avi', 'mp3', 'wav'].includes(ext);
    return true;
  };

  const filteredFiles = files
    .filter(filterByCategory)
    .filter(f => f.filename.toLowerCase().includes(searchTerm.toLowerCase()));

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
      <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', color: 'var(--text-main)', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', width: '100%', padding: '40px', textAlign: 'center', borderRadius: '24px', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 20px 50px rgba(239, 68, 68, 0.2)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', border: '2px solid #ef4444' }}>
            <span style={{ fontSize: '42px' }}>🐢</span>
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px', color: '#f87171' }}>
            على مهلك حبيبي جرب بعدين ✋🐢
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px' }}>
            لقد قمت بإدخال كلمة سر خاطئة 5 مرات متتالية. تم حظر المحاولات مؤقتاً لحماية مكتبتك الخاصة.
          </p>

          <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>يرجى الانتظار حتى انتهاء العد التنازلي:</span>
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
      <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', color: 'var(--text-main)', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
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
                placeholder="أدخل كلمة السر الخاصة..."
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
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', color: 'var(--text-main)', overflow: 'hidden', position: 'relative' }}
    >
      {/* Drag and drop overlay target - pointerEvents: 'none' prevents flicker loop */}
      {isDragging && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(11, 15, 25, 0.88)',
          backdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          pointerEvents: 'none'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '700px',
            height: '400px',
            borderRadius: '24px',
            border: '3px dashed var(--brand-primary)',
            background: 'rgba(59, 130, 246, 0.14)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            boxShadow: '0 0 60px var(--brand-glow)',
            pointerEvents: 'none'
          }}>
            <div style={{ padding: '24px', background: 'var(--brand-primary)', borderRadius: '50%', boxShadow: '0 8px 30px var(--brand-glow)' }}>
              <Upload size={48} color="#fff" />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
              أفلت الملفات أو المجلدات هنا للرفع الفوري 📥
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              سيتم استخراج ورفع جميع ملفاتك ومجلداتك تلقائياً وبأقصى سرعة
            </p>
          </div>
        </div>
      )}

      <Sidebar />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
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
              onChange={handleFileInputChange}
            />
          </div>
        </header>

        {/* Content Container */}
        <div style={{ padding: '32px 32px 40px 32px', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--brand-primary)', boxShadow: '0 8px 30px var(--brand-glow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <RefreshCw className="animate-spin" size={18} color="var(--brand-primary)" />
                  <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                    جاري رفع: {currentUploadingFile || 'الملفات...'}
                  </span>
                </div>
                <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--brand-primary)' }}>
                  {uploadProgress}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div style={{ width: '100%', height: '10px', borderRadius: '100px', background: 'var(--bg-surface)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10b981, #3b82f6)',
                  borderRadius: '100px',
                  transition: 'width 0.3s ease-in-out'
                }} />
              </div>
            </div>
          )}

          {/* Alert / Notification Message */}
          {uploadMsg && (
            <div style={{
              padding: '14px 20px',
              borderRadius: '12px',
              background: uploadMsg.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: uploadMsg.type === 'error' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--text-main)',
              marginBottom: '24px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {uploadMsg.type === 'error' ? <AlertCircle size={20} color="#ef4444" /> : <CheckCircle2 size={20} color="#10b981" />}
              {uploadMsg.text}
            </div>
          )}

          {/* Stats Bar & Drag Target Showcase */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Folder size={24} color="var(--brand-primary)" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>إجمالي الملفات</span>
                <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>{files.length} ملفات</span>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <ShieldAlert size={24} color="#10b981" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>الحماية والحالة</span>
                <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#10b981' }}>مكتملة ومحمية بكلمة السر</span>
              </div>
            </div>

            {/* Quick Filter Categories */}
            <div className="glass-panel" style={{ padding: '12px 16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'الكل', icon: Folder },
                { id: 'doc', label: 'مستندات', icon: FileText },
                { id: 'image', label: 'صور', icon: Image },
                { id: 'archive', label: 'أرشيف', icon: FileArchive },
                { id: 'media', label: 'وسائط', icon: Film },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as any)}
                  className={categoryFilter === cat.id ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Drag and Drop Target Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '24px',
              borderRadius: '16px',
              border: '2px dashed var(--border-subtle)',
              background: 'var(--bg-surface)',
              textAlign: 'center',
              marginBottom: '32px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
            onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          >
            <Upload size={32} color="var(--brand-primary)" style={{ margin: '0 auto 10px auto' }} />
            <span style={{ fontWeight: '700', fontSize: '1rem', display: 'block' }}>
              اضغط هنا أو أفلت أي ملف/مجلد للرفع الفوري 📥
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              يدعم جميع أنواع وصيغ المستندات والصور والأرشيفات الفائقة السرعة
            </span>
          </div>

          {/* Search Input */}
          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              placeholder="ابحث في اسم الملف..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 18px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.95rem' }}
            />
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
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
