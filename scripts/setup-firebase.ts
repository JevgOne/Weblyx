#!/usr/bin/env tsx

/**
 * Automatický setup Firebase projektu
 * Tento skript vytvoří Firebase projekt a nastaví vše potřebné
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ID = 'weblyx-prod';
const ADMIN_EMAIL = 'admin@weblyx.cz';
const ADMIN_PASSWORD = 'Admin123!'; // Změnit po prvním přihlášení

async function setupFirebase() {
  console.log('🔥 Nastavuji Firebase projekt...\n');

  try {
    // 1. Zkontroluj, jestli je Firebase CLI přihlášený
    console.log('1️⃣ Kontroluji Firebase CLI přihlášení...');
    try {
      execSync('npx firebase projects:list', { stdio: 'pipe' });
      console.log('✅ Firebase CLI je přihlášený\n');
    } catch {
      console.log('❌ Firebase CLI není přihlášený');
      console.log('👉 Prosím spusť: npx firebase login\n');
      process.exit(1);
    }

    // 2. Vytvoř projekt (pokud neexistuje)
    console.log('2️⃣ Vytvářím Firebase projekt...');
    try {
      execSync(`npx firebase projects:create ${PROJECT_ID} --display-name "Weblyx"`, {
        stdio: 'inherit'
      });
      console.log('✅ Projekt vytvořen\n');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Projekt už existuje, pokračuji...\n');
      } else {
        throw error;
      }
    }

    // 3. Inicializuj Firebase v projektu
    console.log('3️⃣ Inicializuji Firebase...');
    try {
      execSync(`npx firebase use ${PROJECT_ID}`, { stdio: 'inherit' });
      console.log('✅ Firebase inicializován\n');
    } catch (error) {
      console.error('❌ Chyba při inicializaci:', error);
      throw error;
    }

    // 4. Deploy Firestore pravidel
    console.log('4️⃣ Nasazuji Firestore pravidla...');
    try {
      execSync('npx firebase deploy --only firestore:rules', { stdio: 'inherit' });
      console.log('✅ Firestore pravidla nasazena\n');
    } catch (error) {
      console.error('❌ Chyba při nasazování pravidel:', error);
      throw error;
    }

    // 5. Deploy Storage pravidel
    console.log('5️⃣ Nasazuji Storage pravidla...');
    try {
      execSync('npx firebase deploy --only storage', { stdio: 'inherit' });
      console.log('✅ Storage pravidla nasazena\n');
    } catch (error) {
      console.error('❌ Chyba při nasazování storage pravidel:', error);
      throw error;
    }

    // 6. Vytvoř .env.local s Firebase config
    console.log('6️⃣ Vytvářím .env.local soubor...');
    const envContent = `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${PROJECT_ID}.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${PROJECT_ID}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${PROJECT_ID}.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Admin Credentials
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
`;

    fs.writeFileSync('.env.local', envContent);
    console.log('✅ .env.local vytvořen\n');

    console.log('🎉 Firebase setup dokončen!\n');
    console.log('📝 Další kroky:');
    console.log('1. Jdi na https://console.firebase.google.com');
    console.log(`2. Vyber projekt "${PROJECT_ID}"`);
    console.log('3. Přejdi na Project Settings > General');
    console.log('4. Zkopíruj Firebase config do .env.local');
    console.log('5. Přejdi na Authentication > Sign-in method');
    console.log('6. Povol Email/Password authentication');
    console.log('7. Přejdi na Authentication > Users');
    console.log(`8. Vytvoř uživatele: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log('9. Zkopíruj UID tohoto uživatele');
    console.log('10. Přejdi na Firestore Database');
    console.log('11. Vytvoř kolekci "admins"');
    console.log('12. Vytvoř dokument s ID = UID uživatele a polem: { email: "admin@weblyx.cz", role: "admin" }');
    console.log('\n🚀 Pak můžeš spustit: npm run dev');

  } catch (error) {
    console.error('\n❌ Chyba při setupu Firebase:', error);
    process.exit(1);
  }
}

setupFirebase();
