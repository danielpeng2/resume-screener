import { useState, useEffect, useRef, useCallback } from 'react';
import PDFViewer from './PDFViewer';

interface ResumeScreenerProps {
  resumes: File[];
  initialIndex?: number;
  initialShortlist?: File[];
  onComplete: (shortlisted: File[]) => void;
  onIndexChange?: (index: number) => void;
  onShortlistChange?: (shortlisted: File[]) => void;
}

const ResumeScreener = ({
  resumes,
  initialIndex = 0,
  initialShortlist = [],
  onComplete,
  onIndexChange,
  onShortlistChange,
}: ResumeScreenerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [shortlisted, setShortlisted] = useState<File[]>(initialShortlist);
  const pdfViewerRef = useRef<{ previousPage: () => void; nextPage: () => void } | null>(null);
  
  const currentResume = resumes[currentIndex];
  const isLastResume = currentIndex === resumes.length - 1;
  
  const handleShortlist = useCallback(() => {
    const newShortlisted = [...shortlisted, currentResume];
    setShortlisted(newShortlisted);
    onShortlistChange?.(newShortlisted);

    if (isLastResume) {
      onComplete(newShortlisted);
    } else {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
    }
  }, [currentResume, currentIndex, isLastResume, onComplete, onIndexChange, onShortlistChange, shortlisted]);

  const handleDiscard = useCallback(() => {
    if (isLastResume) {
      onComplete(shortlisted);
    } else {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
    }
  }, [currentIndex, isLastResume, onComplete, onIndexChange, shortlisted]);
  
  // Add keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle keys when typing in input fields
      }
      
      switch (e.key) {
        case 's':
        case 'S':
          handleShortlist();
          break;
        case 'd':
        case 'D':
          handleDiscard();
          break;
        case 'ArrowLeft':
          if (pdfViewerRef.current) pdfViewerRef.current.previousPage();
          break;
        case 'ArrowRight':
          if (pdfViewerRef.current) pdfViewerRef.current.nextPage();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleShortlist, handleDiscard]);
  
  return (
    <div className="resume-screener">
      <div className="screening-header">
        <h2>Resume Screening</h2>
        <div className="progress">
          {currentIndex + 1} of {resumes.length} • {shortlisted.length} shortlisted
        </div>
      </div>
      
      <div className="screening-layout">
        <div className="shortlisted-resumes">
          <h3>Shortlisted Resumes</h3>
          {shortlisted.length > 0 ? (
            <ul className="file-list">
              {shortlisted.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          ) : (
            <p className="no-shortlisted">No resumes shortlisted yet</p>
          )}
        </div>
        
        <div className="resume-view-container">
          <div className="resume-viewer">
            <PDFViewer ref={pdfViewerRef} file={currentResume} />
          </div>
          
          <div className="action-buttons">
            <button 
              className="discard-button" 
              onClick={handleDiscard}
            >
              {isLastResume ? 'Discard & Finish' : 'Discard'} (D)
            </button>
            <button 
              className="shortlist-button" 
              onClick={handleShortlist}
            >
              {isLastResume ? 'Shortlist & Finish' : 'Shortlist'} (S)
            </button>
          </div>
          
          <div className="filename-display">
            Current file: {currentResume.name}
          </div>
          
          <div className="shortcut-legend">
            <h4>Keyboard Shortcuts</h4>
            <ul>
              <li><kbd>←</kbd> Previous page</li>
              <li><kbd>→</kbd> Next page</li>
              <li><kbd>S</kbd> Shortlist resume</li>
              <li><kbd>D</kbd> Discard resume</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeScreener;