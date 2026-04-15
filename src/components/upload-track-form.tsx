'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Save } from 'lucide-react';
import { generateDescriptionAction, suggestTagsAction, uploadFileAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  genre: z.string().min(1, 'Please select a genre.'),
  mood: z.string().min(1, 'Please select a mood.'),
  tags: z.array(z.string()).min(1, 'Please add at least one tag.'),
  isExclusive: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;
type SubmissionStatus = 'draft' | 'published';
type UserProfile = {
  plan: string;
  aiUsageCount: number;
};

export function UploadTrackForm() {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<SubmissionStatus | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const userDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 29.99,
      genre: '',
      mood: '',
      tags: [],
      isExclusive: false,
    },
  });

  const watchedGenre = useWatch({ control: form.control, name: 'genre' });
  const watchedMood = useWatch({ control: form.control, name: 'mood' });
  const watchedTags = useWatch({ control: form.control, name: 'tags' });

  const handleGenerateDescription = async () => {
    if (userProfile && userProfile.plan.toLowerCase() !== 'vip' && (userProfile.aiUsageCount || 0) >= 20) {
      setShowUpgradeDialog(true);
      return;
    }

    const { title, genre, mood, tags } = form.getValues();
    if (!genre || !mood) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a genre and mood first.',
      });
      return;
    }
    setIsGeneratingDescription(true);
    const result = await generateDescriptionAction({
      genre,
      mood,
      coreElements: title,
      keywords: tags,
    });
    setIsGeneratingDescription(false);
    if (result.success && result.data) {
      form.setValue('description', result.data.description, { shouldValidate: true });
      toast({
        title: 'Description Generated!',
        description: 'The AI-powered description has been added.',
      });
      if (userDocRef && userProfile?.plan.toLowerCase() !== 'vip') {
        updateDoc(userDocRef, { aiUsageCount: increment(1) });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: result.error,
      });
    }
  };

  const handleSuggestTags = async () => {
    if (userProfile && userProfile.plan.toLowerCase() !== 'vip' && (userProfile.aiUsageCount || 0) >= 20) {
      setShowUpgradeDialog(true);
      return;
    }

    const { title, genre, mood } = form.getValues();
    if (!genre || !mood || !title) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a title, genre, and mood.',
      });
      return;
    }
    setIsSuggestingTags(true);
    const result = await suggestTagsAction({
      audioCharacteristics: title,
      genre,
      mood,
    });
    setIsSuggestingTags(false);
    if (result.success && result.data) {
      const newTags = [...new Set([...form.getValues('tags'), ...result.data.tags])];
      form.setValue('tags', newTags, { shouldValidate: true });
      toast({
        title: 'Tags Suggested!',
        description: 'New tags have been added.',
      });
      if (userDocRef && userProfile?.plan.toLowerCase() !== 'vip') {
        updateDoc(userDocRef, { aiUsageCount: increment(1) });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Suggestion Failed',
        description: result.error,
      });
    }
  };

  const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const newTag = input.value.trim();
      if (newTag && !watchedTags.includes(newTag)) {
        form.setValue('tags', [...watchedTags, newTag], { shouldValidate: true });
      }
      input.value = '';
    }
  };

  const handleTagsBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const newTag = input.value.trim();
    if (newTag && !watchedTags.includes(newTag)) {
      form.setValue('tags', [...watchedTags, newTag], { shouldValidate: true });
    }
    input.value = '';
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue(
      'tags',
      watchedTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const onSubmit = async (values: FormValues, status: SubmissionStatus) => {
    setAudioError(null);
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User not authenticated or database not available.',
      });
      return;
    }
    if (!audioFile) {
      setAudioError('Audio file is required.');
      return;
    }

    setUploadStatus(status);
    setUploadProgress(0);

    try {
      // 1. Upload audio file
      setUploadProgress(10);
      const audioFormData = new FormData();
      audioFormData.append('file', audioFile);
      const audioResult = await uploadFileAction(audioFormData);
      if (!audioResult.success || !audioResult.data?.secure_url) {
        throw new Error(audioResult.error || 'Failed to upload audio file.');
      }
      const audioUrl = audioResult.data.secure_url;
      setUploadProgress(50);

      // 2. Upload cover art file (if provided)
      let coverArtUrl = `https://picsum.photos/seed/${Date.now()}/400/400`;
      let coverArtHint = 'abstract music';

      if (coverArtFile) {
        const coverFormData = new FormData();
        coverFormData.append('file', coverArtFile);
        const coverResult = await uploadFileAction(coverFormData);
        if (coverResult.success && coverResult.data?.secure_url) {
          coverArtUrl = coverResult.data.secure_url;
          coverArtHint = 'user uploaded cover';
        } else {
          toast({
            variant: 'destructive',
            title: 'Cover Art Upload Failed',
            description: 'Using a default cover art instead.',
          });
        }
      }
      setUploadProgress(75);
      
      // 3. Prepare track data for Firestore
      const trackData = {
        ...values,
        ownerId: user.uid,
        status: status === 'draft' ? 'draft' : 'available',
        audioPreviewUrl: audioUrl,
        fullAudioUrl: audioUrl,
        coverArt: {
          url: coverArtUrl,
          hint: coverArtHint,
        },
        likesCount: 0,
        playsCount: 0,
        isFeaturedByAdmin: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // 4. Save to Firestore
      const isPublished = status === 'published';
      const collectionPath = isPublished ? 'tracks' : `users/${user.uid}/draft_tracks`;
      await addDoc(collection(firestore, collectionPath), trackData);
      setUploadProgress(90);

      // 5. Update creator's track count if published
      if (isPublished) {
        const creatorRef = doc(firestore, 'creators', user.uid);
        await updateDoc(creatorRef, { tracksCount: increment(1) });
      }
      setUploadProgress(100);

      toast({
        title: `Track ${status}!`,
        description: `Your track has been saved as a ${status}.`,
      });
      navigate('/dashboard/tracks');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: `Failed to save ${status}`,
        description: error.message,
      });
    } finally {
      setUploadStatus(null);
      setUploadProgress(0);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('TrackTitleLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cosmic Echoes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('GenreLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('SelectGenre')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Hip-Hop">Hip-Hop</SelectItem>
                        <SelectItem value="Electronic">Electronic</SelectItem>
                        <SelectItem value="Pop">Pop</SelectItem>
                        <SelectItem value="Rock">Rock</SelectItem>
                        <SelectItem value="R&B">R&B</SelectItem>
                        <SelectItem value="Lofi">Lofi</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('MoodLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('SelectMood')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Energetic">Energetic</SelectItem>
                        <SelectItem value="Melancholy">Melancholy</SelectItem>
                        <SelectItem value="Uplifting">Uplifting</SelectItem>
                        <SelectItem value="Dark">Dark</SelectItem>
                        <SelectItem value="Relaxed">Relaxed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('DescriptionLabel')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t('DescriptionPlaceholder')} {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>{t('TagsLabel')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('TagsPlaceholder')}
                  onKeyDown={handleTagsKeyDown}
                  onBlur={handleTagsBlur}
                />
              </FormControl>
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedTags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <span className="sr-only">Remove {tag}</span>
                      &times;
                    </button>
                  </Badge>
                ))}
              </div>
              <FormMessage>{form.formState.errors.tags?.message}</FormMessage>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('PriceLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="29.99" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isExclusive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('ExclusiveLabel')}</FormLabel>
                      <FormDescription>{t('ExclusiveDescription')}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormItem>
                  <FormLabel>{t('AudioFileLabel')}</FormLabel>
                  <FormControl>
                      <Input
                          type="file"
                          accept=".mp3,.wav"
                          onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                  setAudioFile(e.target.files[0]);
                                  setAudioError(null);
                              }
                          }}
                      />
                  </FormControl>
                  {audioError && <p className="text-sm font-medium text-destructive">{audioError}</p>}
              </FormItem>
              <FormItem>
                  <FormLabel>{t('CoverArtLabel')}</FormLabel>
                  <FormControl>
                      <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                  setCoverArtFile(e.target.files[0]);
                              }
                          }}
                      />
                  </FormControl>
                  <FormMessage />
              </FormItem>
            </div>
          </div>

          <div className="md:col-span-1">
            <Card className="bg-card/50 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-accent" />
                  {t('AIAssistantTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('AIAssistantDescription')}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDescription || !watchedGenre || !watchedMood}
                >
                  {isGeneratingDescription ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {t('GenerateDescription')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleSuggestTags}
                  disabled={isSuggestingTags || !watchedGenre || !watchedMood}
                >
                  {isSuggestingTags ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {t('SuggestTags')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {uploadStatus && (
          <div className="space-y-2">
            <Label>
              {t('UploadingTrack')} {Math.round(uploadProgress)}%
            </Label>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={form.handleSubmit((v) => onSubmit(v, 'draft'))}
            disabled={!!uploadStatus}
          >
            {uploadStatus === 'draft' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t('SaveAsDraft')}
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={form.handleSubmit((v) => onSubmit(v, 'published'))}
            disabled={!!uploadStatus}
          >
            {uploadStatus === 'published' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t('PublishTrack')}
          </Button>
        </div>
      </form>
      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>AI Usage Limit Reached</AlertDialogTitle>
            <AlertDialogDescription>
              You have used your 20 free AI credits. To continue using our AI assistant, please upgrade to a VIP plan for unlimited access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link to="/dashboard/settings">Upgrade to VIP</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}

