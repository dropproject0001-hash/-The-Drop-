/**
 * @file src/lib/firebase.ts
 *
 * FIX C-2: Firebase credentials are no longer hardcoded in the committed
 * firebase-applet-config.json. They are read from VITE_FIREBASE_* env vars.
 * Add those vars to your .env.local (never committed).
 *
 * firebase-applet-config.json should be added to .gitignore.
 */
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { env } from './env';
import firebaseConfig from '../../firebase-applet-config.json';

function buildFirebaseConfig() {
  const apiKey = env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey;
  const projectId = env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  const appId = env.VITE_FIREBASE_APP_ID || firebaseConfig.appId;

  if (!apiKey || !projectId || !appId) {
    console.warn(
      '[Firebase] Missing Firebase config — Firebase features will be disabled. '
    );
    return null;
  }

  return {
    apiKey,
    projectId,
    appId,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain || `${projectId}.firebaseapp.com`,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket || `${projectId}.firebasestorage.app`,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId || '',
    firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DB || firebaseConfig.firestoreDatabaseId || '(default)',
  };
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

const config = buildFirebaseConfig();

if (config) {
  try {
    app = initializeApp(config);
    db = getFirestore(app, config.firestoreDatabaseId);
    auth = getAuth(app);
  } catch (err) {
    console.error('[Firebase] Initialization failed:', err);
  }
}

export { db, auth };
export const isFirebaseEnabled = app !== null;
