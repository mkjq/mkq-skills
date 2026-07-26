"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Settings, Plus, LayoutDashboard, Sun, Moon, Lock, Shield } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'المكتبة السحابية العامة', icon: LayoutDashboard, color: 'var(--text-muted)' },
    { href: '/vault', label: 'المكتبة الخاصة المحمية', icon: Lock, color: '#f59e0b' },
    { href: '/admin', label: 'لوحة التحكم الشاملة', icon: Settings, color: 'var(--brand-primary)' },
  ];

  return (
    <aside className="glass-panel" style={{ 
      width: '260px', 
      height: '100vh', 
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      borderRadius: '0',
      borderTop: 'none', borderBottom: 'none', borderRight: 'none',
      borderInlineEnd: '1px solid var(--border-subtle)',
      display: 'flex', 
      flexDirection: 'column',
      zIndex: 20
    }}>
      {/* Logo & Brand */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--brand-primary), #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px var(--brand-glow)', flexShrink: 0 }}>
             <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>M</span>
          </div>
          <span style={{ fontWeight: '700', fontSize: '1.15rem', letterSpacing: '-0.5px' }}>MKQ Skills</span>
        </Link>
      </div>

      {/* Navigation */}
      <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        <Link href="/dashboard/editor" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ width: '100%', padding: '11px 14px', marginBottom: '16px', fontSize: '0.95rem' }}>
            <Plus size={18} />
            إنشاء مهارة جديدة
          </button>
        </Link>

        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
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
    </aside>
  );
}
