// Firebase REMOVED - Stub file for backward compatibility
// All auth moved to cookie-based auth (/api/auth)
// All data moved to Turso database

// Stub auth object
export const auth = {
  currentUser: null,
  signOut: async () => {
    // Redirect to logout API
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  },
} as any;

// Stub db object
export const db = {} as any;

// Stub storage
export const storage = {} as any;

// Stub functions
export const ref: any = () => ({});
export const uploadBytes: any = async () => ({});
export const getDownloadURL: any = async () => '';
export const deleteObject: any = async () => {};

const firebaseStub = { auth, db, storage };
export default firebaseStub;
