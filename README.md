# Resume Screener

A React application to help with screening resumes. This tool allows you to upload a batch of PDF resumes, review them one by one, and create a shortlist of candidates.

## Features

- Upload multiple PDF resumes at once (drag and drop or file picker)
- View resumes one at a time with a built-in PDF viewer
- Add resumes to a shortlist or discard them
- Multi-stage screening process (review shortlisted candidates again)
- Track screening progress and results

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- npm or yarn

### Installation

1. Clone this repository or download the source code
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Running the Application

Start the development server:

```bash
npm run dev
```

Access the application in your browser at [http://localhost:5173](http://localhost:5173)

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory and can be served by any static file server.

## Usage

1. Upload your PDF resumes by dragging and dropping them into the upload area or clicking to browse
2. Review each resume using the built-in PDF viewer
3. Choose to shortlist or discard each resume
4. After the first round of screening, you'll see your shortlisted candidates
5. Optionally, you can conduct a second round of screening with just the shortlisted resumes
6. View your final selection

## Technologies Used

- React
- TypeScript
- Vite
- react-pdf (for PDF rendering)
- CSS (with custom styling)
