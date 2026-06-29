"use client";

import { useState } from 'react';
import { Settings2, X, Palette, Layout, Type, Circle } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, direction, themeColor, shape, size, toggleTheme, setDirection, setThemeColor, setShape, setSize } = useTheme();

  return (
    <>
      {/* Floating Circle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{ 
          position: 'fixed', 
          bottom: '24px', 
          left: '24px',
          width: '42px', 
          height: '42px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--bg-surface)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: 'var(--text-muted)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          zIndex: 9998,
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <Settings2 size={20} />
      </button>

      {/* Sliding Panel */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: isOpen ? 0 : '-350px', 
        width: '320px', 
        height: '100vh', 
        backgroundColor: 'var(--bg-surface-solid)',
        borderRight: '1px solid var(--border-subtle)',
        boxShadow: isOpen ? '10px 0 30px rgba(0,0,0,0.5)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 9999,
        padding: '24px',
        overflowY: 'auto',
        direction: direction === 'rtl' ? 'rtl' : 'ltr'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={20} /> تخصيص المظهر
          </h3>
          <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* 1. Mode */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>الوضع (Mode)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={toggleTheme} className={theme === 'dark' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>داكن</button>
            <button onClick={toggleTheme} className={theme === 'light' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>فاتح</button>
          </div>
        </div>

        {/* 2. Direction */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>الاتجاه (Direction)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setDirection('rtl')} className={direction === 'rtl' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>RTL (عربي)</button>
            <button onClick={() => setDirection('ltr')} className={direction === 'ltr' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>LTR (English)</button>
          </div>
        </div>

        {/* 3. Colors */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>الألوان (Colors)</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['emerald', 'blue', 'purple', 'rose'] as const).map(c => (
              <button 
                key={c} 
                onClick={() => setThemeColor(c)}
                style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  backgroundColor: c === 'emerald' ? '#10b981' : c === 'blue' ? '#3b82f6' : c === 'purple' ? '#a855f7' : '#f43f5e',
                  border: themeColor === c ? '2px solid white' : 'none',
                  outline: themeColor === c ? `2px solid ${c === 'emerald' ? '#10b981' : c === 'blue' ? '#3b82f6' : c === 'purple' ? '#a855f7' : '#f43f5e'}` : 'none',
                  outlineOffset: '2px',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>

        {/* 4. Shapes */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>الأشكال (Shapes)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShape('sharp')} className={shape === 'sharp' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, padding: '8px', fontSize: '0.85rem', borderRadius: '0px' }}>حادة</button>
            <button onClick={() => setShape('rounded')} className={shape === 'rounded' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, padding: '8px', fontSize: '0.85rem', borderRadius: '8px' }}>ناعمة</button>
            <button onClick={() => setShape('pill')} className={shape === 'pill' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, padding: '8px', fontSize: '0.85rem', borderRadius: '20px' }}>دائرية</button>
          </div>
        </div>

        {/* 5. Size */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>الحجم (Size)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setSize('small')} className={size === 'small' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>صغير</button>
            <button onClick={() => setSize('medium')} className={size === 'medium' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>متوسط</button>
            <button onClick={() => setSize('large')} className={size === 'large' ? 'btn-primary' : 'btn-secondary'} style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>كبير</button>
          </div>
        </div>
      </div>
      
      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
        />
      )}
    </>
  );
}
