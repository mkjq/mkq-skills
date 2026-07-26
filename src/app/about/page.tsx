"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, ArrowRight, LayoutDashboard } from 'lucide-react';

function generateStars(count: number) {
  let shadows = [];
  for (let i = 0; i < count; i++) {
    shadows.push(`${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px var(--text-main)`);
  }
  return shadows.join(', ');
}

export default function AboutPage() {
  const [css, setCss] = useState('');

  useEffect(() => {
    const s1 = generateStars(500);
    const s2 = generateStars(150);

    const style = `
      .stars-container {
        height: 100%;
        width: 100%;
        background: radial-gradient(ellipse at bottom, var(--bg-surface-solid) 0%, var(--bg-base) 100%);
        overflow: hidden;
        position: absolute;
        top: 0;
        inset-inline-start: 0;
        z-index: 0;
      }
      .star-layer {
        position: absolute;
        background: transparent;
        opacity: 0.5;
      }
      #stars {
        width: 1px; height: 1px;
        box-shadow: ${s1};
        animation: animStar 50s linear infinite;
      }
      #stars:after {
        content: " "; position: absolute; top: 2000px; width: 1px; height: 1px; background: transparent;
        box-shadow: ${s1};
      }
      #stars2 {
        width: 2px; height: 2px;
        box-shadow: ${s2};
        animation: animStar 100s linear infinite;
      }
      #stars2:after {
        content: " "; position: absolute; top: 2000px; width: 2px; height: 2px; background: transparent;
        box-shadow: ${s2};
      }
      @keyframes animStar {
        from { transform: translateY(0px); }
        to { transform: translateY(-2000px); }
      }
    `;
    setCss(style);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      
      {/* Navigation Header */}
      <header className="glass-panel" style={{ padding: '16px 32px', borderRadius: '0', borderTop: 'none', borderInlineStart: 'none', borderInlineEnd: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.88rem' }}>
            <ArrowRight size={16} className="rtl:rotate-180" /> العودة للمكتبة
          </button>
        </Link>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '700', fontSize: '1.1rem' }}>
          MKQ Skills
        </Link>
      </header>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="stars-container">
          <div id="stars" className="star-layer" />
          <div id="stars2" className="star-layer" />
        </div>
        
        <div style={{ position: 'relative', zIndex: 10, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h1 style={{ color: 'var(--text-main)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 'bold', textShadow: '0 4px 20px var(--brand-glow)', letterSpacing: '2px', marginBottom: '10px' }}>
            Hakareo
          </h1>
          <h2 style={{ color: 'var(--brand-primary)', fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>المطور والمهندس وراء MKQ Skills</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', textAlign: 'center', lineHeight: '1.8', marginBottom: '32px' }}>
            منصة إبداعية متكاملة تدمج التكنولوجيا المتطورة بالجمال الفني. صُممت لتلهم وتُبهج كل من يستخدمها، وتم بناؤها بأحدث التقنيات السحابية.
          </p>

          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
              <LayoutDashboard size={18} /> الدخول إلى المكتبة
            </button>
          </Link>

          {/* Settings Link */}
          <Link href="/about/settings" className="hidden-settings-btn" style={{ 
            position: 'absolute', 
            bottom: '24px', 
            insetInlineStart: '24px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            textDecoration: 'none'
          }}>
            <Settings size={18} />
          </Link>
          <style dangerouslySetInnerHTML={{__html: `
            .hidden-settings-btn {
              color: var(--text-muted);
              opacity: 0.2;
              transition: all 0.3s ease;
              background-color: transparent;
            }
            .hidden-settings-btn:hover {
              color: var(--brand-primary);
              opacity: 1;
              background-color: var(--bg-surface-hover);
            }
          `}} />
        </div>
      </div>
    </div>
  );
}
