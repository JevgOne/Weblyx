// German route for Services page (/leistungen)
// Re-exports the Czech version (/sluzby) for SEO-friendly German URLs
export { default } from '../sluzby/page';
export { metadata, dynamic, revalidate } from '../sluzby/page';
