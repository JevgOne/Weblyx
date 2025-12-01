'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { trackLeadEvent } from '@/components/analytics/FacebookPixel';
import { ArrowRight } from 'lucide-react';
import { ComponentProps } from 'react';

interface LeadButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: ComponentProps<typeof Button>['variant'];
  size?: ComponentProps<typeof Button>['size'];
  className?: string;
  showArrow?: boolean;
}

/**
 * Button component that tracks Facebook Pixel 'Lead' event onClick
 * Use this for CTA buttons that lead to contact forms, quote requests, etc.
 */
export function LeadButton({
  href,
  children,
  variant = 'default',
  size = 'lg',
  className = '',
  showArrow = true
}: LeadButtonProps) {
  const handleClick = () => {
    // Track Facebook Pixel Lead event
    trackLeadEvent();
  };

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      <Link href={href} className="group">
        {children}
        {showArrow && (
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        )}
      </Link>
    </Button>
  );
}
