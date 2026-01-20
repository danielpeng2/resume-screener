# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Development Server
```bash
npm run dev
```
Starts the Vite development server on http://localhost:5173

### Building
```bash
npm run build
```
Compiles TypeScript and builds for production. Output goes to `dist/` directory.

### Linting
```bash
npm run lint
```
Runs ESLint with TypeScript support and React-specific rules.

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally for testing.

## Architecture Overview

### Application Structure
The app is a React TypeScript application built with Vite that provides a multi-stage resume screening workflow:

- **Upload Phase**: Drag-and-drop or file picker for PDF resumes
- **Screening Phase**: One-by-one resume review with shortlisting decisions
- **Results Phase**: View shortlisted candidates with option for additional screening rounds

### Key Components

#### App.tsx (Main State Container)
- Manages global application state with `AppState` enum (UPLOAD, SCREENING, RESULTS)
- Orchestrates the workflow between file upload, screening, and results
- Tracks screening rounds and maintains shortlist state across multiple rounds

#### ResumeScreener.tsx (Core Screening Logic)
- Handles the main screening workflow with keyboard shortcuts
- Manages current resume index and shortlist state
- Implements keyboard navigation: S/s (shortlist), D/d (discard), ←/→ (PDF pages)
- Provides real-time progress tracking and shortlisted resume list

#### PDFViewer.tsx (PDF Rendering)
- Uses react-pdf library with local pdf.worker.min.js (in public/)
- Implements forwardRef pattern to expose page navigation methods
- Handles PDF loading, rendering, and page controls
- Fixed width rendering at 850px for consistent display

#### FileUpload.tsx (File Handling)
- Drag-and-drop interface with visual feedback
- Filters for PDF files only
- Handles multiple file selection

### State Management
- All state is managed through React useState hooks in App.tsx
- No external state management library - uses prop drilling pattern
- Key state includes: current app phase, resume files, shortlist, screening round

### PDF Processing
- Uses react-pdf for rendering with local worker to avoid CORS issues
- Files are converted to object URLs for display
- Proper cleanup of object URLs to prevent memory leaks

### Styling Architecture
- Component-scoped CSS classes with BEM-like naming
- Responsive layout with flexbox for screening interface
- Keyboard shortcut indicators with `<kbd>` elements

### TypeScript Configuration
- Project uses TypeScript 5.8.3 with strict mode
- Separate tsconfig files for app and build tooling
- Custom type definitions for react-pdf in `src/types/`

## Key Dependencies
- **react-pdf**: PDF rendering (requires pdf.worker.min.js in public/)
- **pdf-lib**: PDF manipulation utilities
- **vite**: Build tool and dev server
- **typescript-eslint**: TypeScript-aware linting