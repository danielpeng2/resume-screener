const DB_NAME = 'resume-screener-db';
const DB_VERSION = 1;
const FILES_STORE = 'files';
const SESSION_STORE = 'session';

interface StoredFile {
  name: string;
  type: string;
  lastModified: number;
  data: ArrayBuffer;
}

export interface SessionState {
  id: string; // Always 'current' for single session
  appState: number;
  shortlistedNames: string[];
  screeningRound: number;
  currentIndex: number;
  savedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(FILES_STORE)) {
        db.createObjectStore(FILES_STORE, { keyPath: 'name' });
      }

      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function saveFiles(files: File[]): Promise<void> {
  // Read all file data BEFORE starting the transaction
  // (IndexedDB transactions auto-commit when there's no pending work)
  const fileData: StoredFile[] = await Promise.all(
    files.map(async (file) => ({
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
      data: await file.arrayBuffer(),
    }))
  );

  const db = await openDB();
  const transaction = db.transaction(FILES_STORE, 'readwrite');
  const store = transaction.objectStore(FILES_STORE);

  // Clear existing files first
  store.clear();

  // Now store all files synchronously within the transaction
  for (const storedFile of fileData) {
    store.put(storedFile);
  }

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function loadFiles(): Promise<File[]> {
  const db = await openDB();
  const transaction = db.transaction(FILES_STORE, 'readonly');
  const store = transaction.objectStore(FILES_STORE);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const storedFiles: StoredFile[] = request.result;
      const files = storedFiles.map(
        (sf) =>
          new File([sf.data], sf.name, {
            type: sf.type,
            lastModified: sf.lastModified,
          })
      );
      db.close();
      resolve(files);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function saveSession(state: Omit<SessionState, 'id' | 'savedAt'>): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(SESSION_STORE, 'readwrite');
  const store = transaction.objectStore(SESSION_STORE);

  const session: SessionState = {
    ...state,
    id: 'current',
    savedAt: Date.now(),
  };

  store.put(session);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function loadSession(): Promise<SessionState | null> {
  const db = await openDB();
  const transaction = db.transaction(SESSION_STORE, 'readonly');
  const store = transaction.objectStore(SESSION_STORE);
  const request = store.get('current');

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      db.close();
      resolve(request.result || null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function clearSession(): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction([FILES_STORE, SESSION_STORE], 'readwrite');

  transaction.objectStore(FILES_STORE).clear();
  transaction.objectStore(SESSION_STORE).clear();

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function hasSavedSession(): Promise<boolean> {
  try {
    const session = await loadSession();
    return session !== null;
  } catch {
    return false;
  }
}
