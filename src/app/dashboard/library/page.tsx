'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminLibraryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  
  const fetchBooks = async () => {
    try {
      const res = await fetch('/api/books');
      const data = await res.json();
      if (data.success) {
        setBooks(data.books);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setCategory('');
    setDescription('');
    setCoverImage('');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (book: any) => {
    setTitle(book.title);
    setAuthor(book.author || '');
    setCategory(book.category || '');
    setDescription(book.description || '');
    setCoverImage(book.coverImage || '');
    setEditingId(book.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكتاب؟')) return;
    
    try {
      const res = await fetch(`/api/books?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('تم حذف الكتاب بنجاح');
        fetchBooks();
      } else {
        toast.error(data.error || 'فشل الحذف');
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = '/api/books';
      const method = editingId ? 'PUT' : 'POST';
      const body = {
        id: editingId || crypto.randomUUID(),
        title,
        author,
        category,
        description,
        coverImage,
        fileKey: editingId ? undefined : `books/${Date.now()}.pdf` // For new books, file upload logic should be handled via R2 signed URLs. For now, editing works.
      };

      if (!editingId) {
        toast.error('إضافة كتاب جديد تتطلب رفع ملف PDF. ميزة الرفع من المتصفح قيد التطوير. يمكنك فقط التعديل أو الحذف حالياً.');
        return;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح');
        resetForm();
        fetchBooks();
      } else {
        toast.error(data.error || 'حدث خطأ');
      }
    } catch (err) {
      toast.error('حدث خطأ غير متوقع');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>جاري التحميل...</div>;

  return (
    <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>إدارة المكتبة</h1>
        {/* <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
          <Plus size={18} style={{ marginInlineEnd: '8px' }} /> إضافة كتاب
        </button> */}
      </div>

      {isFormOpen && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{editingId ? 'تعديل كتاب' : 'إضافة كتاب'}</h2>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X /></button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>عنوان الكتاب</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>المؤلف</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>القسم</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>رابط الغلاف (URL)</label>
              <input type="url" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>الوصف</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="form-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }} />
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>
                <Save size={18} style={{ marginInlineEnd: '8px' }} /> حفظ التغييرات
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '12px' }}>الغلاف</th>
              <th style={{ padding: '12px' }}>العنوان</th>
              <th style={{ padding: '12px' }}>المؤلف</th>
              <th style={{ padding: '12px' }}>القسم</th>
              <th style={{ padding: '12px' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px' }}>
                  <img src={book.coverImage || '/placeholder.png'} alt={book.title} style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                </td>
                <td style={{ padding: '12px', fontWeight: 600 }}>{book.title}</td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{book.author}</td>
                <td style={{ padding: '12px' }}><span style={{ padding: '4px 8px', background: 'var(--bg-surface-hover)', borderRadius: '12px', fontSize: '0.8rem' }}>{book.category}</span></td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => handleEdit(book)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-primary)', marginInlineEnd: '12px' }}><Edit size={18} /></button>
                  <button onClick={() => handleDelete(book.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>لا توجد كتب في المكتبة</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
