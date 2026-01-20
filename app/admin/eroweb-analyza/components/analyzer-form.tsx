'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useAdminTranslation } from '@/lib/admin-i18n';
import type { BusinessType, AnalysisFormData } from '@/types/eroweb';

interface AnalyzerFormProps {
  onAnalyze: (data: AnalysisFormData) => Promise<void>;
  isLoading: boolean;
}

export function AnalyzerForm({ onAnalyze, isLoading }: AnalyzerFormProps) {
  const { t, locale } = useAdminTranslation();
  const [formData, setFormData] = useState<AnalysisFormData>({
    url: '',
    businessType: 'massage',
  });
  const [showContactFields, setShowContactFields] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) return;

    await onAnalyze({
      ...formData,
      contactName: contactName || undefined,
      contactEmail: contactEmail || undefined,
    });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let url = e.target.value;
    // Auto-add https:// if missing
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('.')) {
        url = `https://${url}`;
      }
    }
    setFormData({ ...formData, url });
  };

  // Localized labels
  const contactLabel = locale === 'cs' ? 'Přidat kontaktní údaje (volitelné)' :
                       locale === 'ru' ? 'Добавить контактные данные (опционально)' :
                       'Add contact details (optional)';
  const contactNameLabel = locale === 'cs' ? 'Jméno kontaktu' :
                           locale === 'ru' ? 'Имя контакта' : 'Contact Name';
  const contactNamePlaceholder = locale === 'cs' ? 'Jan Novák' :
                                 locale === 'ru' ? 'Иван Иванов' : 'John Doe';

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-white">{t.eroweb.newAnalysis}</CardTitle>
        <CardDescription className="text-[#A1A1AA]">
          {t.eroweb.urlLabel}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-white">{t.eroweb.urlLabel} *</Label>
            <Input
              id="url"
              type="url"
              placeholder={t.eroweb.urlPlaceholder}
              value={formData.url}
              onChange={handleUrlChange}
              className="bg-[#252525] border-[#2A2A2A] text-white placeholder:text-[#71717A]"
              required
            />
          </div>

          {/* Business Type */}
          <div className="space-y-2">
            <Label className="text-white">{t.eroweb.businessTypeLabel} *</Label>
            <Select
              value={formData.businessType}
              onValueChange={(v) => setFormData({ ...formData, businessType: v as BusinessType })}
            >
              <SelectTrigger className="bg-[#252525] border-[#2A2A2A] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <SelectItem value="massage">🧖‍♀️ {t.eroweb.businessTypes.massage}</SelectItem>
                <SelectItem value="privat">🏠 {t.eroweb.businessTypes.privat}</SelectItem>
                <SelectItem value="escort">💎 {t.eroweb.businessTypes.escort}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optional Contact Fields */}
          <div>
            <button
              type="button"
              onClick={() => setShowContactFields(!showContactFields)}
              className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white transition-colors"
            >
              {showContactFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {contactLabel}
            </button>

            {showContactFields && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-white">{contactNameLabel}</Label>
                  <Input
                    id="contactName"
                    placeholder={contactNamePlaceholder}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="bg-[#252525] border-[#2A2A2A] text-white placeholder:text-[#71717A]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-white">{t.common.email}</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="jan@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="bg-[#252525] border-[#2A2A2A] text-white placeholder:text-[#71717A]"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={!formData.url || isLoading}
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.eroweb.analyzing}
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                {t.eroweb.analyzeButton}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
