/**
 * 🎭 Mock Firebase Service pro lokální vývoj
 * Funguje bez Java, bez emulátorů, bez skutečného Firebase projektu
 */

// Mock data storage (in-memory)
let mockUsers: any[] = [
  {
    uid: 'admin-mock-uid',
    email: 'admin@weblyx.cz',
    password: 'Admin123!', // V produkci by bylo hashované
  }
];

let mockAdmins: any[] = [
  {
    uid: 'admin-mock-uid',
    email: 'admin@weblyx.cz',
    role: 'admin',
    createdAt: new Date().toISOString(),
  }
];

let mockLeads: any[] = [];
let mockProjects: any[] = [];

// Mock Auth Service
export const mockAuth = {
  currentUser: null as any,

  signInWithEmailAndPassword: async (email: string, password: string) => {
    console.log('🎭 Mock Auth: signInWithEmailAndPassword', email);

    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      throw {
        code: 'auth/invalid-credential',
        message: 'Invalid email or password'
      };
    }

    mockAuth.currentUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
    };

    return { user: mockAuth.currentUser };
  },

  signOut: async () => {
    console.log('🎭 Mock Auth: signOut');
    mockAuth.currentUser = null;
  },

  onAuthStateChanged: (callback: (user: any) => void) => {
    console.log('🎭 Mock Auth: onAuthStateChanged');
    // Simulate auth state
    setTimeout(() => callback(mockAuth.currentUser), 100);

    // Return unsubscribe function
    return () => {};
  }
};

// Debug flag - set to false in production
const DEBUG_LOGS = false;

// Mock Firestore Service
export const mockFirestore = {
  collection: (collectionName: string) => {
    if (DEBUG_LOGS) console.log('🎭 Mock Firestore: collection', collectionName);

    return {
      doc: (docId: string) => ({
        get: async () => {
          if (DEBUG_LOGS) console.log('🎭 Mock Firestore: get doc', collectionName, docId);

          let data = null;

          if (collectionName === 'admins') {
            data = mockAdmins.find(a => a.uid === docId);
          }

          return {
            exists: () => !!data,
            data: () => data,
            id: docId,
          };
        },

        set: async (data: any) => {
          if (DEBUG_LOGS) console.log('🎭 Mock Firestore: set doc', collectionName, docId, data);

          if (collectionName === 'admins') {
            const existingIndex = mockAdmins.findIndex(a => a.uid === docId);
            if (existingIndex >= 0) {
              mockAdmins[existingIndex] = { ...data, uid: docId };
            } else {
              mockAdmins.push({ ...data, uid: docId });
            }
          } else if (collectionName === 'leads') {
            const existingIndex = mockLeads.findIndex(l => l.id === docId);
            if (existingIndex >= 0) {
              mockLeads[existingIndex] = { ...data, id: docId };
            } else {
              mockLeads.push({ ...data, id: docId });
            }
          } else if (collectionName === 'projects') {
            const existingIndex = mockProjects.findIndex(p => p.id === docId);
            if (existingIndex >= 0) {
              mockProjects[existingIndex] = { ...data, id: docId };
            } else {
              mockProjects.push({ ...data, id: docId });
            }
          }
        },

        update: async (data: any) => {
          if (DEBUG_LOGS) console.log('🎭 Mock Firestore: update doc', collectionName, docId, data);
          // Similar to set but merges data
        },

        delete: async () => {
          if (DEBUG_LOGS) console.log('🎭 Mock Firestore: delete doc', collectionName, docId);

          if (collectionName === 'leads') {
            mockLeads = mockLeads.filter(l => l.id !== docId);
          } else if (collectionName === 'projects') {
            mockProjects = mockProjects.filter(p => p.id !== docId);
          }
        }
      }),

      add: async (data: any) => {
        if (DEBUG_LOGS) console.log('🎭 Mock Firestore: add doc', collectionName, data);

        const id = `${collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        if (collectionName === 'leads') {
          mockLeads.push({ ...data, id });
        } else if (collectionName === 'projects') {
          mockProjects.push({ ...data, id });
        }

        return { id };
      },

      get: async () => {
        if (DEBUG_LOGS) console.log('🎭 Mock Firestore: get collection', collectionName);

        let docs: any[] = [];

        if (collectionName === 'leads') {
          docs = mockLeads;
        } else if (collectionName === 'projects') {
          docs = mockProjects;
        } else if (collectionName === 'admins') {
          docs = mockAdmins;
        }

        return {
          docs: docs.map(doc => ({
            id: doc.id || doc.uid,
            data: () => doc,
            exists: () => true,
          })),
          empty: docs.length === 0,
          size: docs.length,
        };
      },

      where: (field: string, operator: string, value: any) => {
        console.log('🎭 Mock Firestore: where', field, operator, value);

        // Helper to filter documents
        const filterDocs = () => {
          let docs: any[] = [];

          if (collectionName === 'leads') {
            docs = mockLeads.filter(l => {
              if (operator === '==') return l[field] === value;
              if (operator === '!=') return l[field] !== value;
              if (operator === '>') return l[field] > value;
              if (operator === '<') return l[field] < value;
              return false;
            });
          } else if (collectionName === 'projects') {
            docs = mockProjects.filter(p => {
              if (operator === '==') return p[field] === value;
              if (operator === '!=') return p[field] !== value;
              if (operator === '>') return p[field] > value;
              if (operator === '<') return p[field] < value;
              return false;
            });
          } else if (collectionName === 'page_content') {
            // Add page_content filtering support
            const allPages = [
              { pageId: 'homepage-services', category: 'homepage' },
              { pageId: 'homepage-portfolio', category: 'homepage' },
              { pageId: 'homepage-pricing', category: 'homepage' },
            ];
            docs = allPages.filter(p => {
              if (operator === '==') return (p as any)[field] === value;
              if (operator === '!=') return (p as any)[field] !== value;
              return false;
            });
          }

          return docs;
        };

        return {
          orderBy: (orderField: string) => ({
            get: async () => {
              const docs = filterDocs();
              // Simple sorting by field
              docs.sort((a, b) => {
                const aVal = a[orderField];
                const bVal = b[orderField];
                if (aVal < bVal) return -1;
                if (aVal > bVal) return 1;
                return 0;
              });

              return {
                docs: docs.map(doc => ({
                  id: doc.id || doc.pageId,
                  data: () => doc,
                  exists: () => true,
                })),
                empty: docs.length === 0,
                size: docs.length,
              };
            }
          }),
          get: async () => {
            const docs = filterDocs();

            return {
              docs: docs.map(doc => ({
                id: doc.id,
                data: () => doc,
                exists: () => true,
              })),
              empty: docs.length === 0,
              size: docs.length,
            };
          }
        };
      }
    };
  }
};

// Mock Storage Service
// Mock Firebase Storage (compatible with Firebase Storage API)
export const mockStorage = {
  _bucket: 'mock-storage.com',
  _type: 'mock'
};

// Mock Storage functions to match Firebase Storage API
export const mockStorageRef = (storage: any, path: string) => {
  if (DEBUG_LOGS) console.log('🎭 Mock Storage: ref', path);

  return {
    bucket: 'mock-storage.com',
    fullPath: path,
    name: path.split('/').pop() || '',
    storage,
    toString: () => `gs://mock-storage.com/${path}`
  };
};

export const mockUploadBytes = async (ref: any, data: Blob | Uint8Array | ArrayBuffer) => {
  if (DEBUG_LOGS) console.log('🎭 Mock Storage: uploadBytes', ref.fullPath);

  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    metadata: {
      bucket: 'mock-storage.com',
      fullPath: ref.fullPath,
      name: ref.name,
      size: data instanceof Blob ? data.size : (data as any).byteLength || 0,
      timeCreated: new Date().toISOString(),
      updated: new Date().toISOString()
    },
    ref
  };
};

export const mockGetDownloadURL = async (ref: any) => {
  if (DEBUG_LOGS) console.log('🎭 Mock Storage: getDownloadURL', ref.fullPath);

  // Return mock URL
  return `https://mock-storage.com/${ref.fullPath}`;
};

export const mockDeleteObject = async (ref: any) => {
  if (DEBUG_LOGS) console.log('🎭 Mock Storage: deleteObject', ref.fullPath);
};

// Export helper functions
export function addMockLead(lead: any) {
  mockLeads.push(lead);
  if (DEBUG_LOGS) console.log('🎭 Mock: Added lead', lead);
}

export function addMockProject(project: any) {
  mockProjects.push(project);
  if (DEBUG_LOGS) console.log('🎭 Mock: Added project', project);
}

export function getMockLeads() {
  return [...mockLeads];
}

export function getMockProjects() {
  return [...mockProjects];
}

export function clearMockData() {
  mockLeads = [];
  mockProjects = [];
  console.log('🎭 Mock: Cleared all data');
}

// Singleton pattern - seed data only once
let _mockDataInitialized = false;
function initializeMockData() {
  if (_mockDataInitialized) return;
  _mockDataInitialized = true;

  // Seed demo data
  addMockLead({
    id: 'lead-1',
    projectType: 'eshop',
    companyName: 'Test Company s.r.o.',
    businessDescription: 'Prodej outdoorového vybavení',
    features: ['product-catalog', 'shopping-cart', 'payment-gateway'],
    budget: '50000-100000',
    timeline: '3-6',
    name: 'Jan Novák',
    email: 'jan.novak@example.com',
    phone: '+420 123 456 789',
    status: 'new',
    createdAt: new Date().toISOString(),
  });

  addMockLead({
    id: 'lead-2',
    projectType: 'presentation',
    companyName: 'Stavební firma ABC',
    businessDescription: 'Výstavba rodinných domů',
    features: ['contact-form', 'gallery', 'references'],
    budget: '20000-50000',
    timeline: '1-3',
    name: 'Marie Svobodová',
    email: 'marie.svobodova@example.com',
    phone: '+420 987 654 321',
    status: 'contacted',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  });

  addMockLead({
    id: 'lead-3',
    projectType: 'Web',
    company: 'Fitness Studio Pro',
    name: 'Petr Dvořák',
    email: 'petr@fitness.cz',
    phone: '+420 777 999 888',
    message: 'Potřebujeme nový web pro fitness studio',
    budget: '30000-50000',
    status: 'approved',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  });

  addMockProject({
    id: 'project-1',
    projectNumber: 'WBX-2025-0001',
    name: 'E-shop Outdoor',
    clientName: 'Test Company s.r.o.',
    status: 'in_progress',
    priority: 'high',
    priceTotal: 85000,
    pricePaid: 42500,
    progress: 65,
    startDate: '2025-01-15',
    deadline: '2025-04-15',
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('🎭 Mock Firebase Service loaded (initialized once)');
    console.log('📧 Demo admin: admin@weblyx.cz / Admin123!');
  }
}

// Initialize on first import
initializeMockData();
