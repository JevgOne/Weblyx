/**
 * Author Management System for Weblyx Blog
 *
 * E-E-A-T Optimization (Experience, Expertise, Authoritativeness, Trust)
 * Research shows: +30% chance for top 3 rankings with proper author bios
 *
 * Each author must have:
 * - Full name
 * - Role/title
 * - Professional bio (150-250 chars)
 * - High-quality photo
 * - Social media profiles (LinkedIn, GitHub)
 * - Areas of expertise
 * - Certifications (optional but recommended)
 */

export interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  social: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  expertise: string[];
  certifications?: string[];
  yearsOfExperience?: number;
}

/**
 * Authors Database
 * Add new authors here
 */
export const authors: Record<string, Author> = {
  // Example author - replace with real team member
  'jan-novak': {
    id: 'jan-novak',
    name: 'Jan Novák',
    role: 'Senior Full-Stack Developer & Co-Founder',
    bio: 'Specialista na Next.js a React s 8+ lety zkušeností ve vývoji moderních webových aplikací. Vytvořil 150+ webů pro klienty v České republice. Absolvent FIT ČVUT Praha.',
    image: '/team/jan-novak.jpg', // Add actual image to /public/team/
    social: {
      linkedin: 'https://linkedin.com/in/jan-novak',
      github: 'https://github.com/jannovak',
      twitter: 'https://twitter.com/jannovak',
    },
    expertise: [
      'Next.js',
      'React',
      'TypeScript',
      'Web Performance Optimization',
      'SEO',
      'Node.js',
      'Database Design',
    ],
    certifications: [
      'Google Analytics Certified',
      'Meta Blueprint Certified',
      'AWS Certified Developer',
    ],
    yearsOfExperience: 8,
  },

  // Example author 2 - replace with real team member
  'petra-svobodova': {
    id: 'petra-svobodova',
    name: 'Petra Svobodová',
    role: 'Lead UI/UX Designer',
    bio: 'Designérka se specializací na uživatelské rozhraní a design systémy. 6 let zkušeností s web designem a branding. Navrhla přes 100 moderních webů.',
    image: '/team/petra-svobodova.jpg',
    social: {
      linkedin: 'https://linkedin.com/in/petra-svobodova',
      website: 'https://petrasdesigns.cz',
    },
    expertise: [
      'UI/UX Design',
      'Figma',
      'Adobe Creative Suite',
      'Design Systems',
      'Responsive Design',
      'Branding',
    ],
    certifications: [
      'Google UX Design Certificate',
      'Nielsen Norman Group UX Certification',
    ],
    yearsOfExperience: 6,
  },

  // Example author 3 - Technical SEO specialist
  'martin-cerny': {
    id: 'martin-cerny',
    name: 'Martin Černý',
    role: 'Technical SEO Specialist',
    bio: 'Expert na technické SEO a Core Web Vitals optimalizaci. Pomohl 50+ firmám dosáhnout top 3 pozic ve vyhledávačích. Pravidelný přispěvatel na SEO konferencích.',
    image: '/team/martin-cerny.jpg',
    social: {
      linkedin: 'https://linkedin.com/in/martin-cerny-seo',
      twitter: 'https://twitter.com/martincerny',
    },
    expertise: [
      'Technical SEO',
      'Core Web Vitals',
      'Structured Data',
      'Google Search Console',
      'Google Analytics',
      'Local SEO',
    ],
    certifications: [
      'Google Analytics 4 Certified',
      'Google Ads Certified',
      'SEMrush SEO Certification',
    ],
    yearsOfExperience: 5,
  },
};

/**
 * Get author by ID
 * Returns undefined if author not found
 */
export function getAuthor(authorId: string): Author | undefined {
  return authors[authorId];
}

/**
 * Get all authors
 */
export function getAllAuthors(): Author[] {
  return Object.values(authors);
}

/**
 * Generate Person Schema for author (for structured data)
 */
export function generateAuthorSchema(author: Author) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    image: author.image,
    url: `https://weblyx.cz/o-nas#${author.id}`,
    knowsAbout: author.expertise,
    sameAs: Object.values(author.social).filter(Boolean),
    worksFor: {
      '@type': 'Organization',
      name: 'Weblyx',
      url: 'https://weblyx.cz',
    },
    ...(author.yearsOfExperience && {
      hasOccupation: {
        '@type': 'Occupation',
        name: author.role,
        yearsInOccupation: author.yearsOfExperience,
      },
    }),
  };
}

/**
 * Get author display name with credentials
 * Example: "Jan Novák, Senior Developer (8 let zkušeností)"
 */
export function getAuthorDisplayName(author: Author): string {
  const experience = author.yearsOfExperience
    ? ` (${author.yearsOfExperience} let zkušeností)`
    : '';
  return `${author.name}${experience}`;
}

/**
 * Get top expertise tags (first 5)
 */
export function getTopExpertise(author: Author): string[] {
  return author.expertise.slice(0, 5);
}

/**
 * Check if author has LinkedIn
 */
export function hasLinkedIn(author: Author): boolean {
  return !!author.social.linkedin;
}

/**
 * Check if author has GitHub
 */
export function hasGitHub(author: Author): boolean {
  return !!author.social.github;
}

/**
 * Get initials for avatar fallback
 * Example: "Jan Novák" → "JN"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// ============================================================================
// EXAMPLE USAGE IN BLOG POST
// ============================================================================

/*
// In /app/blog/[slug]/page.tsx:

import { getAuthor, generateAuthorSchema } from '@/lib/authors';

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  const author = getAuthor(post.author_id);

  if (!author) {
    throw new Error(`Author not found: ${post.author_id}`);
  }

  const authorSchema = generateAuthorSchema(author);

  return (
    <>
      {injectSchema(authorSchema)}

      <article>
        <header>
          <h1>{post.title}</h1>
          <div className="author-meta">
            <img src={author.image} alt={author.name} />
            <div>
              <span>{author.name}</span>
              <span>{author.role}</span>
            </div>
          </div>
        </header>

        <main>{post.content}</main>

        {/* Author card at the end */}
        <AuthorCard author={author} />
      </article>
    </>
  );
}
*/
