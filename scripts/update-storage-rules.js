/**
 * Aktualizace Firebase Storage security rules
 * Nastavuje pravidla pro nahrávání obrázků v admin panelu
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !line.startsWith('#')) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

// Initialize Firebase Admin
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!serviceAccountBase64) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_BASE64 not found');
  process.exit(1);
}

const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'weblyx-prod-38054.firebasestorage.app'
});

console.log('\n🔐 Nastavuji Firebase Storage security rules...\n');

// Storage rules se nastavují přes Firebase Console nebo REST API
// Admin SDK nemá přímou metodu pro update rules
// Použijeme REST API

const https = require('https');

async function updateStorageRules() {
  try {
    // Get access token from service account
    const accessToken = await admin.credential.cert(serviceAccount).getAccessToken();
    
    const storageRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /portfolio/{imageId=**} {
      allow read: if true;
      allow write, delete: if request.auth != null;
    }
    match /blog/{imageId=**} {
      allow read: if true;
      allow write, delete: if request.auth != null;
    }
    match /{allPaths=**} {
      allow read: if false;
      allow write: if false;
    }
  }
}`;

    const rulesData = JSON.stringify({
      rules: [{
        resource: `projects/_/buckets/${serviceAccount.project_id}.appspot.com`,
        content: storageRules
      }]
    });

    const options = {
      hostname: 'firebaserules.googleapis.com',
      port: 443,
      path: `/v1/projects/${serviceAccount.project_id}/releases`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.access_token}`,
        'Content-Type': 'application/json',
        'Content-Length': rulesData.length
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('✅ Storage rules úspěšně aktualizovány!');
            resolve(data);
          } else {
            console.error('❌ Chyba při aktualizaci rules:', res.statusCode);
            console.error(data);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);
      req.write(rulesData);
      req.end();
    });
  } catch (error) {
    console.error('❌ Chyba:', error.message);
    console.log('\n⚠️  Storage rules se musí nastavit manuálně v Firebase Console:');
    console.log('👉 https://console.firebase.google.com/project/weblyx-prod-38054/storage/rules\n');
    console.log('Použij tato pravidla:\n');
    console.log(`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /portfolio/{imageId=**} {
      allow read: if true;
      allow write, delete: if request.auth != null;
    }
    match /blog/{imageId=**} {
      allow read: if true;
      allow write, delete: if request.auth != null;
    }
    match /{allPaths=**} {
      allow read: if false;
      allow write: if false;
    }
  }
}`);
  }
}

updateStorageRules().then(() => {
  console.log('\n✅ Hotovo!\n');
  process.exit(0);
}).catch(() => {
  process.exit(1);
});
