// 🔥 Firebase Configuration
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Import mock services
import { mockAuth, mockFirestore, mockStorage } from './mock-firebase';

// Use mock services in development, real Firebase in production
const USE_MOCK = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_USE_REAL_FIREBASE;

// Firebase config - using demo project for development
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-weblyx",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-weblyx.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:demo",
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp | null = null;
let realAuth: Auth | null = null;
let realDb: Firestore | null = null;
let realStorage: FirebaseStorage | null = null;

if (!USE_MOCK) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  realAuth = getAuth(app);
  realDb = getFirestore(app);
  realStorage = getStorage(app);
}

// Export services (mock or real based on environment)
export const auth: any = USE_MOCK ? mockAuth : realAuth;
export const db: any = USE_MOCK ? mockFirestore : realDb;
export const storage: any = USE_MOCK ? mockStorage : realStorage;

if (USE_MOCK) {
  console.log('🎭 Using MOCK Firebase services (no real Firebase needed)');
  console.log('📧 Demo admin: admin@weblyx.cz / Admin123!');
} else {
  console.log('🔥 Using REAL Firebase services');
}

export default app;
