"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';

function generateStars(count: number) {
  let shadows = [];
  for (let i = 0; i < count; i++) {
    shadows.push(`${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #fff`);
  }
  return shadows.join(', ');
}

export default function AboutPage() {
  const [css, setCss] = useState('');

  useEffect(() => {
    const s1 = generateStars(700);
    const s2 = generateStars(200);
    const s3 = generateStars(100);

    const style = `
      .stars-container {
        height: 100vh;
        width: 100vw;
        background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
        overflow: hidden;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
      }
      .star-layer {
        position: absolute;
        background: transparent;
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
      #stars3 {
        width: 3px; height: 3px;
        box-shadow: ${s3};
        animation: animStar 150s linear infinite;
      }
      #stars3:after {
        content: " "; position: absolute; top: 2000px; width: 3px; height: 3px; background: transparent;
        box-shadow: ${s3};
      }
      @keyframes animStar {
        from { transform: translateY(0px); }
        to { transform: translateY(-2000px); }
      }
    `;
    setCss(style);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      
      <div className="stars-container">
        <div id="stars" className="star-layer" />
        <div id="stars2" className="star-layer" />
        <div id="stars3" className="star-layer" />
      </div>
      
      <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '3.5rem', fontWeight: 'bold', textShadow: '0 4px 20px rgba(255,255,255,0.3)', letterSpacing: '2px', marginBottom: '10px' }}>
          Hakareo
        </h1>
        <h2 style={{ color: 'var(--brand-primary)', fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>المطور والمهندس وراء MKQ Skills</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', maxWidth: '600px', textAlign: 'center', lineHeight: '1.8' }}>
          منصة إبداعية متكاملة تدمج التكنولوجيا المتطورة بالجمال الفني. صُممت لتلهم وتُبهج كل من يستخدمها، وتم بناؤها بأحدث التقنيات السحابية.
        </p>

        {/* Hidden Settings Button */}
        <Link href="/about/settings" style={{ 
          position: 'absolute', 
          bottom: '24px', 
          left: '24px', 
          color: 'rgba(255,255,255,0.2)', 
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          textDecoration: 'none'
        }} 
        onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
        onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <Settings size={18} />
        </Link>
      </div>
    </div>
  );
}
