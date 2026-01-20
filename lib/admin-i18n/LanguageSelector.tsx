'use client';

import { useAdminLanguage } from './provider';
import { AdminLocale } from './translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

const LANGUAGE_OPTIONS: { value: AdminLocale; label: string; flag: string }[] = [
  { value: 'cs', label: 'Čeština', flag: '🇨🇿' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
];

interface LanguageSelectorProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function LanguageSelector({ variant = 'default', className }: LanguageSelectorProps) {
  const { locale, setLocale, t } = useAdminLanguage();

  const currentLanguage = LANGUAGE_OPTIONS.find((opt) => opt.value === locale);

  if (variant === 'compact') {
    return (
      <Select value={locale} onValueChange={(value) => setLocale(value as AdminLocale)}>
        <SelectTrigger className={`w-[70px] ${className}`}>
          <SelectValue>
            <span className="text-lg">{currentLanguage?.flag}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {LANGUAGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{option.flag}</span>
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as AdminLocale)}>
      <SelectTrigger className={`w-[160px] ${className}`}>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{currentLanguage?.flag}</span>
              <span>{currentLanguage?.label}</span>
            </div>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {LANGUAGE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{option.flag}</span>
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
