"use client";

import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface FolderUploadProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading?: boolean;
  accept?: string;
}

export default function FolderUpload({ onChange, uploading, accept = ".md,.txt,.markdown" }: FolderUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        id="file-upload"
        style={{ display: 'none' }}
        onChange={(e) => {
          onChange(e);
          if (inputRef.current) inputRef.current.value = ''; // Reset for consecutive uploads
        }}
        accept={accept}
      />
      <button 
        className="btn-secondary"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '10px 14px',
          opacity: uploading ? 0.7 : 1,
          cursor: uploading ? 'not-allowed' : 'pointer'
        }}
      >
        <Upload size={16} />
        {uploading ? 'جاري الرفع...' : 'رفع ملف'}
      </button>
    </>
  );
}
