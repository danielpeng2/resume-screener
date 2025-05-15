import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker for pdf.js locally to avoid CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File | null;
}

export interface PDFViewerHandle {
  previousPage: () => void;
  nextPage: () => void;
}

const PDFViewer = forwardRef<PDFViewerHandle, PDFViewerProps>(({ file }, ref) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      // Create URL for the file
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setPageNumber(1);
      
      // Clean up URL when component unmounts or file changes
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    previousPage,
    nextPage
  }));

  if (!fileUrl) {
    return <div className="pdf-placeholder">No resume selected</div>;
  }

  return (
    <div className="pdf-viewer">
      <div className="document-container">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          error={<div>Failed to load PDF file.</div>}
          loading={<div>Loading PDF...</div>}
        >
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={true}
            renderAnnotationLayer={true}
            width={850}
          />
        </Document>
      </div>
      
      {numPages && numPages > 1 && (
        <div className="pdf-controls">
          <button 
            onClick={previousPage} 
            disabled={pageNumber <= 1}
          >
            Previous
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button 
            onClick={nextPage} 
            disabled={pageNumber >= numPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
});

export default PDFViewer;