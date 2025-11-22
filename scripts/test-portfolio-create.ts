#!/usr/bin/env tsx
import { createPortfolio } from '../lib/turso/portfolio';

async function test() {
  console.log('🧪 Testing Turso portfolio creation...');

  try {
    const result = await createPortfolio({
      title: 'Test Project ' + Date.now(),
      description: 'Test description for Turso migration',
      imageUrl: 'https://placehold.co/600x400/png',
      technologies: ['React', 'Next.js', 'Turso'],
      category: 'Web Development',
      published: true,
      featured: false,
    });

    console.log('✅ Portfolio item created successfully!');
    console.log('ID:', result.id);
    console.log('Title:', result.title);
    console.log('Order:', result.order);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

test();
