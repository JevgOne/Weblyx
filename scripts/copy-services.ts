#!/usr/bin/env tsx
import { createClient } from '@libsql/client';

const titanboxing = createClient({
  url: 'libsql://titanboxing-jevgone.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjM4MjQzNzUsImlkIjoiNThmNWYxYmItZjFiYS00YmYwLWIwOTItODExNDdjOTRmZTQ5IiwicmlkIjoiYzMwMWFkY2ItYjI0NS00MjY1LTg0YmQtODgyYmUyNjU4NmY0In0.WTtZVte4NmQ360ChSs5DJa2VeC2sMBhEKuP93SuyG3z69thMEBFbNV4udtnc79LbYW-YX9feJ9DLIwD70yiFAA',
});

const weblyx = createClient({
  url: 'libsql://weblyx-jevgone.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjM4OTY1NjksImlkIjoiNjQ0NDNiODktZTBmOC00NTUxLWFiNTItNDhkYTg4ZDIwMTcwIiwicmlkIjoiNTgyYjlkM2QtYjUxYS00NGE0LTgyZGYtMmEwY2I2OTM5N2NkIn0.U_aC0zZdrsTf3y3vz34C880xN_jVM3Mzo6qkKtmdZWqBb8Hsfho_O52rCVyTLZrHJQ2nxnuwWSZoxy7Am7poBw',
});

async function main() {
  const result = await titanboxing.execute('SELECT * FROM services');
  console.log(`📋 Copying ${result.rows.length} services...`);

  for (const row of result.rows) {
    try {
      await weblyx.execute({
        sql: 'INSERT OR REPLACE INTO services (id, title, description, icon, features, "order", image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [row.id, row.title, row.description, row.icon, row.features, row.order, row.image_url, row.created_at, row.updated_at],
      });
      console.log(`  ✅ ${row.title}`);
    } catch (e: any) {
      console.error(`  ❌ Error: ${e.message}`);
    }
  }

  console.log('✅ All services copied!');
}

main();
