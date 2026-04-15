'use client';

import { Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Music className="h-6 w-6 text-primary" />
          <p className="text-center text-sm leading-loose md:text-left" suppressHydrationWarning>
            {t('Copyright', { year: currentYear })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="#" className="text-sm text-muted-foreground hover:text-primary" suppressHydrationWarning>
            {t('PrivacyPolicy')}
          </Link>
          <Link to="#" className="text-sm text-muted-foreground hover:text-primary" suppressHydrationWarning>
            {t('TermsOfService')}
          </Link>
        </div>
      </div>
    </footer>
  );
}

