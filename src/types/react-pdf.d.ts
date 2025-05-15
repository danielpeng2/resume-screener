declare module 'react-pdf' {
  import { Component, ReactElement } from 'react';
  
  export interface DocumentProps {
    file: string | File | ArrayBuffer | null;
    onLoadSuccess?: (pdf: { numPages: number }) => void;
    onLoadError?: (error: Error) => void;
    loading?: ReactElement;
    error?: ReactElement;
    noData?: ReactElement;
    children?: ReactElement | ReactElement[];
  }
  
  export interface PageProps {
    pageNumber: number;
    width?: number;
    height?: number;
    scale?: number;
    renderTextLayer?: boolean;
    renderAnnotationLayer?: boolean;
    loading?: ReactElement;
    error?: ReactElement;
    noData?: ReactElement;
    customTextRenderer?: (text: string, item: any) => string;
  }
  
  export const Document: Component<DocumentProps>;
  export const Page: Component<PageProps>;
  
  export interface PDFDocumentProxy {
    numPages: number;
  }
  
  export interface GlobalWorkerOptions {
    workerSrc: string;
  }
  
  export const pdfjs: {
    GlobalWorkerOptions: GlobalWorkerOptions;
    version: string;
  };
}