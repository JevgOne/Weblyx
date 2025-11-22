#!/usr/bin/env node

/**
 * Automatické nasazení Firebase Storage Rules
 *
 * Tento skript nasadí storage.rules do Firebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const STORAGE_RULES_PATH = path.join(PROJECT_ROOT, 'storage.rules');

console.log('🔥 Firebase Storage Rules Deployment\n');

// Check if storage.rules exists
if (!fs.existsSync(STORAGE_RULES_PATH)) {
  console.error('❌ storage.rules file not found!');
  process.exit(1);
}

console.log('📋 Storage Rules soubor nalezen');
console.log('📍 Cesta:', STORAGE_RULES_PATH);

// Read storage rules content
const rulesContent = fs.readFileSync(STORAGE_RULES_PATH, 'utf8');
console.log('\n📄 Obsah Storage Rules:');
console.log('─'.repeat(60));
console.log(rulesContent);
console.log('─'.repeat(60));

console.log('\n🚀 Nasazování Storage Rules do Firebase...\n');

try {
  // Check if Firebase CLI is installed
  try {
    execSync('npx firebase --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Firebase CLI není nainstalováno!');
    console.log('💡 Spusť: npm install -g firebase-tools');
    process.exit(1);
  }

  // Check if service account credentials are set
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!serviceAccountPath) {
    console.log('⚠️  GOOGLE_APPLICATION_CREDENTIALS není nastaveno');
    console.log('\n📝 MANUÁLNÍ NASAZENÍ:');
    console.log('─'.repeat(60));
    console.log('1. Otevři: https://console.firebase.google.com');
    console.log('2. Vyber projekt: weblyx-prod-38054');
    console.log('3. Klikni na "Storage" v levém menu');
    console.log('4. Klikni na záložku "Rules"');
    console.log('5. Zkopíruj a vlož tento obsah:');
    console.log('\n' + rulesContent);
    console.log('\n6. Klikni "Publish"');
    console.log('─'.repeat(60));
    process.exit(0);
  }

  // Deploy using Firebase CLI
  console.log('🔑 Service account nalezen');
  console.log('📤 Nasazuji Storage Rules...\n');

  execSync('npx firebase deploy --only storage', {
    stdio: 'inherit',
    cwd: PROJECT_ROOT,
  });

  console.log('\n✅ Storage Rules byly úspěšně nasazeny!');

} catch (error) {
  console.error('\n❌ Chyba při nasazování:', error.message);
  console.log('\n📝 ALTERNATIVNÍ ŘEŠENÍ - Manuální nasazení:');
  console.log('─'.repeat(60));
  console.log('1. Otevři: https://console.firebase.google.com');
  console.log('2. Vyber projekt: weblyx-prod-38054');
  console.log('3. Storage → Rules');
  console.log('4. Zkopíruj obsah z: ' + STORAGE_RULES_PATH);
  console.log('5. Vlož do editoru v Firebase Console');
  console.log('6. Klikni "Publish"');
  console.log('─'.repeat(60));
  process.exit(1);
}
