/**
 * Author Card Component
 *
 * Displays author information at the end of blog posts
 * Improves E-E-A-T signals for SEO
 * Research shows: +30% chance for top 3 rankings with proper author bios
 */

import Image from 'next/image';
import { Author } from '@/lib/authors';
import { LinkedinIcon, GithubIcon, TwitterIcon, GlobeIcon } from 'lucide-react';

interface AuthorCardProps {
  author: Author;
  showFullBio?: boolean;
}

export function AuthorCard({ author, showFullBio = true }: AuthorCardProps) {
  return (
    <div className="mt-12 p-6 border rounded-xl bg-muted/30">
      <div className="flex gap-4">
        {/* Author Image */}
        <div className="flex-shrink-0">
          <Image
            src={author.image}
            alt={author.name}
            width={80}
            height={80}
            className="rounded-full object-cover"
          />
        </div>

        {/* Author Info */}
        <div className="flex-1">
          <h3 className="font-bold text-lg">{author.name}</h3>
          <p className="text-sm text-muted-foreground">{author.role}</p>

          {showFullBio && (
            <p className="mt-2 text-sm leading-relaxed">{author.bio}</p>
          )}

          {/* Expertise Badges */}
          {author.expertise.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {author.expertise.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium"
                >
                  {skill}
                </span>
              ))}
              {author.expertise.length > 5 && (
                <span className="text-xs px-2 py-1 text-muted-foreground">
                  +{author.expertise.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Certifications */}
          {author.certifications && author.certifications.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              <strong>Certifikace:</strong> {author.certifications.join(', ')}
            </div>
          )}

          {/* Social Links */}
          <div className="mt-3 flex gap-3">
            {author.social.linkedin && (
              <a
                href={author.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={`${author.name} na LinkedIn`}
              >
                <LinkedinIcon className="w-5 h-5" />
              </a>
            )}
            {author.social.github && (
              <a
                href={author.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={`${author.name} na GitHub`}
              >
                <GithubIcon className="w-5 h-5" />
              </a>
            )}
            {author.social.twitter && (
              <a
                href={author.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={`${author.name} na Twitter`}
              >
                <TwitterIcon className="w-5 h-5" />
              </a>
            )}
            {author.social.website && (
              <a
                href={author.social.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Website ${author.name}`}
              >
                <GlobeIcon className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Author Byline Component
 * Use in blog post header
 */
export function AuthorByline({ author }: { author: Author }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src={author.image}
        alt={author.name}
        width={40}
        height={40}
        className="rounded-full object-cover"
      />
      <div>
        <div className="font-medium text-sm">{author.name}</div>
        <div className="text-xs text-muted-foreground">{author.role}</div>
      </div>
    </div>
  );
}

/**
 * Author Avatar Component
 * Small avatar with initials fallback
 */
export function AuthorAvatar({
  author,
  size = 40
}: {
  author: Author;
  size?: number
}) {
  const initials = author.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative inline-block">
      <Image
        src={author.image}
        alt={author.name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      {/* Fallback initials */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-primary text-primary-foreground font-bold rounded-full"
        style={{ display: 'none' }}
      >
        {initials}
      </div>
    </div>
  );
}
