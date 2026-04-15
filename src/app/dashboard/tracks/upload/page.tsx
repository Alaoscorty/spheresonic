'use client';

import { UploadTrackForm } from '@/components/upload-track-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

export default function UploadTrackPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('UploadTrackTitle')}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('TrackDetails')}</CardTitle>
          <CardDescription>{t('TrackDetailsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
            <UploadTrackForm />
        </CardContent>
      </Card>
    </div>
  );
}
