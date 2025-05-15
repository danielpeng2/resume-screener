import { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import ResumeScreener from './components/ResumeScreener';

enum AppState {
  UPLOAD,
  SCREENING,
  RESULTS,
  RESCREENING
}

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [allResumes, setAllResumes] = useState<File[]>([]);
  const [shortlistedResumes, setShortlistedResumes] = useState<File[]>([]);
  const [finalShortlist, setFinalShortlist] = useState<File[]>([]);

  const handleFilesUploaded = (files: File[]) => {
    setAllResumes(files);
    setAppState(AppState.SCREENING);
  };

  const handleScreeningComplete = (shortlisted: File[]) => {
    setShortlistedResumes(shortlisted);
    setAppState(AppState.RESULTS);
  };

  const handleRescreeningComplete = (finalList: File[]) => {
    setFinalShortlist(finalList);
    setAppState(AppState.RESULTS);
  };

  const startRescreening = () => {
    setAppState(AppState.RESCREENING);
  };

  const resetApp = () => {
    setAllResumes([]);
    setShortlistedResumes([]);
    setFinalShortlist([]);
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

        {appState === AppState.RESCREENING && (
          <ResumeScreener 
            resumes={shortlistedResumes} 
            onComplete={handleRescreeningComplete} 
          />
        )}

        {appState === AppState.RESULTS && (
          <div className="results-screen">
            <h2>Screening Results</h2>
            {finalShortlist.length > 0 ? (
              <>
                <p>Final shortlist: {finalShortlist.length} resumes</p>
                <ul className="file-list">
                  {finalShortlist.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p>First round shortlist: {shortlistedResumes.length} of {allResumes.length} resumes</p>
                {shortlistedResumes.length > 0 && (
                  <>
                    <ul className="file-list">
                      {shortlistedResumes.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                    <button className="rescreen-button" onClick={startRescreening}>
                      Screen Shortlisted Resumes Again
                    </button>
                  </>
                )}
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
