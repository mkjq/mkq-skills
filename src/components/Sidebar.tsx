"use client";

import Link from 'next/link';
import { FileText, Settings, Plus, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="glass-panel" style={{ 
      width: '280px', 
      height: '100%', 
      borderRadius: '0',
      borderTop: 'none', borderBottom: 'none', borderRight: 'none',
      borderInlineEnd: '1px solid var(--border-subtle)',
      display: 'flex', 
      flexDirection: 'column',
      zIndex: 20
    }}>
      {/* Logo & Brand */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--brand-primary), #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px var(--brand-glow)' }}>
             <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>M</span>
          </div>
          <span style={{ fontWeight: '700', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>MKQ Skills</span>
        </Link>
      </div>

      {/* Navigation */}
      <div style={{ padding: '24px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        <Link href="/dashboard/editor" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ width: '100%', padding: '12px', marginBottom: '16px', fontSize: '1rem' }}>
            <Plus size={20} />
            إنشاء مهارة جديدة
          </button>
        </Link>

        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', marginTop: '10px', marginBottom: '8px', paddingInlineStart: '8px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <LayoutDashboard size={14} /> المكتبة السحابية
          </span>
        </Link>
        
        <Link href="/dashboard/editor" style={{ 
          textDecoration: 'none', 
          color: 'var(--brand-primary)', 
          padding: '10px 14px',
          borderRadius: '8px',
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          backgroundColor: 'var(--bg-surface-hover)',
          fontSize: '0.95rem',
          fontWeight: '600',
          border: '1px solid var(--border-subtle)'
        }}>
          <FileText size={18} />
          مهارة التحليل المالي.md
        </Link>
        
        <Link href="/dashboard/editor" style={{ 
          textDecoration: 'none', 
          color: 'var(--text-muted)', 
          padding: '10px 14px',
          borderRadius: '8px',
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          fontSize: '0.95rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }} onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
          <FileText size={18} />
          أوامر React متقدمة.md
        </Link>
      </div>

      {/* Bottom Actions */}
      <div style={{ padding: '20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        
        <button onClick={toggleTheme} className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', border: 'none', backgroundColor: 'transparent' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
        </button>
      </div>
    </div>
  );
}
