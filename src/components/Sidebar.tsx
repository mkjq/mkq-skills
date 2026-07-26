"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Settings, Plus, LayoutDashboard, Sun, Moon, Lock, Menu, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'المكتبة السحابية العامة', icon: LayoutDashboard, color: 'var(--text-muted)' },
    { href: '/vault', label: 'المكتبة الخاصة المحمية', icon: Lock, color: 'var(--brand-primary)' },
    { href: '/admin', label: 'لوحة التحكم الشاملة', icon: Settings, color: 'var(--brand-primary)' },
  ];

  const renderNav = () => (
    <>
      {/* Logo & Brand */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" onClick={() => setIsMobileOpen(false)} style={{ textDecoration: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-primary-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px var(--brand-glow)', flexShrink: 0 }}>
             <span style={{ color: 'var(--bg-base)', fontWeight: 'bold', fontSize: '16px' }}>M</span>
          </div>
          <span style={{ fontWeight: '700', fontSize: '1.15rem', letterSpacing: '-0.5px' }}>MKQ Skills</span>
        </Link>
        {isMobileOpen && (
          <button onClick={() => setIsMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        <Link href="/dashboard/editor" onClick={() => setIsMobileOpen(false)} style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ width: '100%', padding: '11px 14px', marginBottom: '16px', fontSize: '0.95rem' }}>
            <Plus size={18} />
            إنشاء مهارة جديدة
          </button>
        </Link>

        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)} style={{ textDecoration: 'none' }}>
              <div style={{
                fontSize: '0.88rem',
                color: isActive ? 'var(--text-main)' : item.color,
                fontWeight: isActive ? '700' : '600',
                padding: '10px 12px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: isActive ? 'var(--bg-surface-hover)' : 'transparent',
                border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
              }}>
                <item.icon size={16} color={isActive ? 'var(--brand-primary)' : item.color} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={toggleTheme}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '10px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: '600',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-main)'; }}
          onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'الوضع النهاري ☀️' : 'الوضع الليلي 🌙'}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="desktop-sidebar glass-panel" style={{ 
        width: '260px', 
        height: '100vh', 
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        borderRadius: '0',
        borderInlineEnd: '1px solid var(--border-subtle)',
        display: 'flex', 
        flexDirection: 'column',
        zIndex: 20
      }}>
        {renderNav()}
      </aside>

      {/* Mobile Top Header */}
      <header className="mobile-header glass-panel" style={{
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-subtle)',
        borderRadius: '0',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        width: '100%'
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-primary-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--bg-base)', fontWeight: 'bold', fontSize: '14px' }}>M</span>
          </div>
          <span style={{ fontWeight: '700', fontSize: '1rem' }}>MKQ Skills</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(true)}
          style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', padding: '6px', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' }}
          aria-label="القائمة"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }}>
          <div
            onClick={() => setIsMobileOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          />
          <aside className="glass-panel" style={{
            position: 'relative',
            width: '280px',
            height: '100%',
            background: 'var(--bg-surface-solid)',
            display: 'flex',
            flexDirection: 'column',
            borderInlineEnd: '1px solid var(--border-subtle)',
            zIndex: 1
          }}>
            {renderNav()}
          </aside>
        </div>
      )}
    </>
  );
}
