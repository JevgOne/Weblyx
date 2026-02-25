'use client';

import { useEffect, useState } from 'react';

interface CalculatorStepProps {
  direction: 'forward' | 'backward';
  children: React.ReactNode;
}

export function CalculatorStep({ direction, children }: CalculatorStepProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        mounted
          ? 'opacity-100 translate-x-0'
          : direction === 'forward'
          ? 'opacity-0 translate-x-8'
          : 'opacity-0 -translate-x-8'
      }`}
    >
      {children}
    </div>
  );
}
