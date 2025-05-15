import { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import ResumeScreener from './components/ResumeScreener';

enum AppState {
  UPLOAD,
  SCREENING,
  RESULTS
}

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [allResumes, setAllResumes] = useState<File[]>([]);
  const [currentShortlist, setCurrentShortlist] = useState<File[]>([]);
  const [screeningRound, setScreeningRound] = useState(1);
  const [totalOriginalCount, setTotalOriginalCount] = useState(0);

  const handleFilesUploaded = (files: File[]) => {
    setAllResumes(files);
    setTotalOriginalCount(files.length);
    setAppState(AppState.SCREENING);
  };

  const handleScreeningComplete = (shortlisted: File[]) => {
    setCurrentShortlist(shortlisted);
    setAppState(AppState.RESULTS);
  };

  const startNextScreeningRound = () => {
    setAllResumes(currentShortlist);
    setScreeningRound(prev => prev + 1);
    setAppState(AppState.SCREENING);
  };

  const resetApp = () => {
    setAllResumes([]);
    setCurrentShortlist([]);
    setScreeningRound(1);
    setTotalOriginalCount(0);
    setAppState(AppState.UPLOAD);
  };

  return (
    <div className="app">
      <header>
        <h1>Resume Screener</h1>
      </header>

      <main>
        {appState === AppState.UPLOAD && (
          <FileUpload onFilesUploaded={handleFilesUploaded} />
        )}

        {appState === AppState.SCREENING && (
          <ResumeScreener 
            resumes={allResumes} 
            onComplete={handleScreeningComplete} 
          />
        )}

        {appState === AppState.RESULTS && (
          <div className="results-screen">
            <h2>Screening Results</h2>
            <p>
              {screeningRound > 1 
                ? `Round ${screeningRound} shortlist: ${currentShortlist.length} of ${allResumes.length} resumes` 
                : `First round shortlist: ${currentShortlist.length} of ${totalOriginalCount} resumes`}
            </p>
            
            {currentShortlist.length > 0 && (
              <>
                <ul className="file-list">
                  {currentShortlist.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
                <button className="rescreen-button" onClick={startNextScreeningRound}>
                  Screen Shortlisted Resumes Again
                </button>
              </>
            )}
            
            <button className="reset-button" onClick={resetApp}>
              Start Over with New Resumes
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
