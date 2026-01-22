import { useState, useEffect, useCallback } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import ResumeScreener from './components/ResumeScreener';
import {
  saveFiles,
  loadFiles,
  saveSession,
  loadSession,
  clearSession,
  hasSavedSession,
} from './utils/storage';

const AppState = {
  UPLOAD: 0,
  SCREENING: 1,
  RESULTS: 2,
} as const;

type AppStateType = (typeof AppState)[keyof typeof AppState];

function App() {
  const [appState, setAppState] = useState<AppStateType>(AppState.UPLOAD);
  const [allResumes, setAllResumes] = useState<File[]>([]);
  const [currentShortlist, setCurrentShortlist] = useState<File[]>([]);
  const [screeningRound, setScreeningRound] = useState(1);
  const [totalOriginalCount, setTotalOriginalCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved session on mount
  useEffect(() => {
    const checkSavedSession = async () => {
      const hasSession = await hasSavedSession();
      if (hasSession) {
        setShowRestorePrompt(true);
      }
      setIsLoading(false);
    };
    checkSavedSession();
  }, []);

  // Save state whenever it changes (during active screening)
  const persistState = useCallback(async () => {
    if (appState === AppState.UPLOAD || allResumes.length === 0) return;

    try {
      await saveFiles(allResumes);
      await saveSession({
        appState,
        shortlistedNames: currentShortlist.map((f) => f.name),
        screeningRound,
        currentIndex,
      });
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  }, [appState, allResumes, currentShortlist, screeningRound, currentIndex]);

  useEffect(() => {
    persistState();
  }, [persistState]);

  const restoreSession = async () => {
    try {
      const [files, session] = await Promise.all([loadFiles(), loadSession()]);
      if (files.length > 0 && session) {
        setAllResumes(files);
        setTotalOriginalCount(files.length);
        setScreeningRound(session.screeningRound);
        setCurrentIndex(session.currentIndex);
        setAppState(session.appState as AppStateType);

        // Reconstruct shortlist from file names
        const shortlisted = files.filter((f) =>
          session.shortlistedNames.includes(f.name)
        );
        setCurrentShortlist(shortlisted);
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
    }
    setShowRestorePrompt(false);
  };

  const startFresh = async () => {
    await clearSession();
    setShowRestorePrompt(false);
  };

  const handleFilesUploaded = (files: File[]) => {
    setAllResumes(files);
    setTotalOriginalCount(files.length);
    setCurrentIndex(0);
    setCurrentShortlist([]);
    setAppState(AppState.SCREENING);
  };

  const handleScreeningComplete = (shortlisted: File[]) => {
    setCurrentShortlist(shortlisted);
    setAppState(AppState.RESULTS);
  };

  const handleIndexChange = (index: number) => {
    setCurrentIndex(index);
  };

  const handleShortlistChange = (shortlisted: File[]) => {
    setCurrentShortlist(shortlisted);
  };

  const startNextScreeningRound = () => {
    setAllResumes(currentShortlist);
    setCurrentShortlist([]);
    setScreeningRound((prev) => prev + 1);
    setCurrentIndex(0);
    setAppState(AppState.SCREENING);
  };

  const resetApp = async () => {
    await clearSession();
    setAllResumes([]);
    setCurrentShortlist([]);
    setScreeningRound(1);
    setTotalOriginalCount(0);
    setCurrentIndex(0);
    setAppState(AppState.UPLOAD);
  };

  if (isLoading) {
    return (
      <div className="app">
        <header>
          <h1>Resume Screener</h1>
        </header>
        <main>
          <div className="loading">Loading...</div>
        </main>
      </div>
    );
  }

  if (showRestorePrompt) {
    return (
      <div className="app">
        <header>
          <h1>Resume Screener</h1>
        </header>
        <main>
          <div className="restore-prompt">
            <h2>Resume Previous Session?</h2>
            <p>You have a saved screening session. Would you like to continue where you left off?</p>
            <div className="restore-buttons">
              <button className="restore-button" onClick={restoreSession}>
                Restore Session
              </button>
              <button className="start-fresh-button" onClick={startFresh}>
                Start Fresh
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
            initialIndex={currentIndex}
            initialShortlist={currentShortlist}
            onComplete={handleScreeningComplete}
            onIndexChange={handleIndexChange}
            onShortlistChange={handleShortlistChange}
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
