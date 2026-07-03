'use client';

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronRight, ChevronLeft, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';

// Set the worker source for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfReaderProps {
  url: string;
  title: string;
}

export default function PdfReader({ url, title }: PdfReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    setError(err.message);
    setLoading(false);
  }, []);

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: isFullscreen ? '100vh' : '100%',
      width: '100%',
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? 0 : 'auto',
      left: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 99999 : 'auto',
      backgroundColor: 'var(--bg-base)',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-surface-solid)',
        borderBottom: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        {/* Title */}
        <h3 style={{
          fontSize: 'clamp(0.75rem, 2vw, 1rem)',
          fontWeight: 700,
          color: 'var(--text-main)',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '40%',
        }}>
          {title}
        </h3>

        {/* Page Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={goToPrevPage} disabled={pageNumber <= 1} className="btn-secondary"
            style={{ padding: '6px 10px', opacity: pageNumber <= 1 ? 0.3 : 1 }}>
            <ChevronRight size={18} />
          </button>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            minWidth: '80px',
            textAlign: 'center',
          }}>
            {pageNumber} / {numPages || '...'}
          </span>
          <button onClick={goToNextPage} disabled={pageNumber >= numPages} className="btn-secondary"
            style={{ padding: '6px 10px', opacity: pageNumber >= numPages ? 0.3 : 1 }}>
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Zoom & Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={zoomOut} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={zoomIn} className="btn-secondary" style={{ padding: '6px 10px' }}>
            <ZoomIn size={16} />
          </button>
          <button onClick={toggleFullscreen} className="btn-secondary" style={{ padding: '6px 10px' }}>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'var(--bg-base)',
      }}>
        {error ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            padding: '40px',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
            }}>
              ⚠️
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>حدث خطأ في تحميل الكتاب</p>
            <p style={{ fontSize: '0.85rem' }}>{error}</p>
          </div>
        ) : (
          <>
            {loading && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                padding: '60px',
              }}>
                <div className="spinner-container" style={{ width: '80px', height: '80px' }}>
                  <div className="spinner"></div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>جارٍ تحميل الكتاب...</p>
              </div>
            )}
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={null}
              />
            </Document>
          </>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div style={{
        display: 'none',
        padding: '12px 16px',
        backgroundColor: 'var(--bg-surface-solid)',
        borderTop: '1px solid var(--border-subtle)',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
        className="mobile-bottom-nav"
      >
        <button onClick={goToPrevPage} disabled={pageNumber <= 1} className="btn-primary"
          style={{ padding: '10px 20px', opacity: pageNumber <= 1 ? 0.3 : 1 }}>
          الصفحة السابقة
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
          {pageNumber} / {numPages}
        </span>
        <button onClick={goToNextPage} disabled={pageNumber >= numPages} className="btn-primary"
          style={{ padding: '10px 20px', opacity: pageNumber >= numPages ? 0.3 : 1 }}>
          الصفحة التالية
        </button>
      </div>
    </div>
  );
}
