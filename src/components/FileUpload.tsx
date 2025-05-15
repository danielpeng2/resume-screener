import { useState, useRef, ChangeEvent } from 'react';

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
}

const FileUpload = ({ onFilesUploaded }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const pdfFiles = Array.from(files).filter(file => 
      file.type === 'application/pdf'
    );

    if (pdfFiles.length === 0) {
      alert('Please upload PDF files only');
      return;
    }

    onFilesUploaded(pdfFiles);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div
      className={`upload-container ${dragActive ? 'drag-active' : ''}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <div className="upload-content">
        <h2>Upload Resumes</h2>
        <p>Drag and drop PDF resumes here or click to browse</p>
        <button className="upload-button" onClick={handleButtonClick}>
          Select PDF Files
        </button>
      </div>
    </div>
  );
};

export default FileUpload;