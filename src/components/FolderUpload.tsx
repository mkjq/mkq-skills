"use client";

import React, { useRef } from 'react';

interface FolderUploadProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading?: boolean;
  accept?: string;
}

export default function FolderUpload({ onChange, uploading, accept = ".md,.txt,.markdown" }: FolderUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .folder-upload-container {
          --transition: 350ms;
          --folder-W: 120px;
          --folder-H: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding: 10px;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.08);
          height: calc(var(--folder-H) * 1.9);
          width: 180px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .folder-upload-container:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: var(--brand-primary);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 20px var(--brand-glow), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .folder-upload-folder {
          position: absolute;
          top: -18px;
          left: calc(50% - 60px);
          animation: folder-float 2.5s infinite ease-in-out;
          transition: transform var(--transition) ease;
        }

        .folder-upload-container:hover .folder-upload-folder {
          transform: scale(1.05);
        }

        .folder-upload-front,
        .folder-upload-back {
          position: absolute;
          transition: transform var(--transition);
          transform-origin: bottom center;
        }

        .folder-upload-back::before,
        .folder-upload-back::after {
          content: "";
          display: block;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.15);
          z-index: 0;
          width: var(--folder-W);
          height: var(--folder-H);
          position: absolute;
          transform-origin: bottom center;
          border-radius: 12px;
          transition: transform 350ms;
        }

        .folder-upload-container:hover .folder-upload-back::before {
          transform: rotateX(-5deg) skewX(5deg);
        }

        .folder-upload-container:hover .folder-upload-back::after {
          transform: rotateX(-15deg) skewX(12deg);
        }

        .folder-upload-front {
          z-index: 1;
        }

        .folder-upload-container:hover .folder-upload-front {
          transform: rotateX(-40deg) skewX(15deg);
        }

        .folder-upload-tip {
          background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary-hover));
          width: 80px;
          height: 20px;
          border-radius: 10px 10px 0 0;
          box-shadow: 0 0 15px var(--brand-glow);
          position: absolute;
          top: -10px;
          z-index: 2;
        }

        .folder-upload-cover {
          background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.07));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.2);
          width: var(--folder-W);
          height: var(--folder-H);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
          border-radius: 10px;
        }

        .folder-upload-label {
          font-size: 0.9rem;
          color: var(--text-main);
          text-align: center;
          background: rgba(255, 255, 255, 0.06);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background var(--transition) ease;
          display: inline-block;
          width: 100%;
          padding: 10px 12px;
          position: relative;
          font-family: inherit;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .folder-upload-container:hover .folder-upload-label {
          background: rgba(255, 255, 255, 0.12);
          color: var(--brand-primary);
        }

        @keyframes folder-float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-16px); }
          100% { transform: translateY(0px); }
        }
      `}} />

      <div
        className="folder-upload-container"
        onClick={() => !uploading && inputRef.current?.click()}
        role="button"
        aria-label="رفع ملف"
      >
        <div className="folder-upload-folder">
          <div className="folder-upload-front">
            <div className="folder-upload-tip" />
            <div className="folder-upload-cover" />
          </div>
          <div className="folder-upload-back folder-upload-cover" />
        </div>
        <span className="folder-upload-label">
          {uploading ? '⏳ جاري الرفع...' : '📁 ارفع ملفاً'}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onChange}
          style={{ display: 'none' }}
        />
      </div>
    </>
  );
}
