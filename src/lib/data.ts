
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  return PlaceHolderImages.find((img) => img.id === id) || PlaceHolderImages[0];
};

export type Track = {
  id: string;
  title: string;
  ownerId: string;
  price: number;
  status: 'available' | 'sold' | 'draft';
  isExclusive: boolean;
  featured: boolean;
  coverArt?: {
    url: string;
    hint: string;
  };
  audioPreviewUrl: string;
  isFeaturedByAdmin: boolean;
  genre: string;
  mood: string;
  description: string;
  tags: string[];
};

export type UserProfile = {
  id: string;
  username: string;
  role: 'Artist' | 'Beatmaker' | 'Admin';
  tracksCount?: number;
};

export type Creator = {
  id: string;
  name: string;
  role: 'Artist' | 'Beatmaker';
  avatar: {
    url: string;
    hint: string;
  };
  tracksCount: number;
};

export type Sale = {
    id: string;
    trackTitle: string;
    date: string;
    buyer: string;
    amount: number;
    commission: number;
    type: 'Exclusive' | 'Non-Exclusive';
}

// Note: static data is kept for reference but the app is moving to Firestore.
export const tracks: Track[] = [
  { id: '1', title: 'Cosmic Echoes', ownerId: '1', price: 29.99, status: 'available', isExclusive: false, featured: true, isFeaturedByAdmin: true, audioPreviewUrl: '', coverArt: { url: getImage('track-1').imageUrl, hint: getImage('track-1').imageHint }, genre: 'Electronic', mood: 'Ethereal', description: 'A journey through space and time.', tags: ['ambient', 'synthwave', 'chill'] },
  { id: '2', title: 'City Lights', ownerId: '2', price: 49.99, status: 'available', isExclusive: true, featured: true, isFeaturedByAdmin: true, audioPreviewUrl: '', coverArt: { url: getImage('track-2').imageUrl, hint: getImage('track-2').imageHint }, genre: 'Hip-Hop', mood: 'Energetic', description: 'The perfect beat for a night drive.', tags: ['trap', 'urban', 'night'] },
  { id: '3', title: 'Sunday Morning', ownerId: '3', price: 19.99, status: 'sold', isExclusive: true, featured: false, isFeaturedByAdmin: false, audioPreviewUrl: '', coverArt: { url: getImage('track-3').imageUrl, hint: getImage('track-3').imageHint }, genre: 'Lofi', mood: 'Relaxed', description: 'Chill vibes for a lazy day.', tags: ['lofi', 'study', 'relax'] },
  { id: '4', title: 'Vinyl Groove', ownerId: '4', price: 39.99, status: 'available', isExclusive: false, featured: true, isFeaturedByAdmin: true, audioPreviewUrl: '', coverArt: { url: getImage('track-4').imageUrl, hint: getImage('track-4').imageHint }, genre: 'Funk', mood: 'Upbeat', description: 'A classic funk track with a modern twist.', tags: ['funk', 'retro', 'dance'] },
  { id: '5', title: 'Deep Focus', ownerId: '1', price: 24.99, status: 'available', isExclusive: false, featured: false, isFeaturedByAdmin: false, audioPreviewUrl: '', coverArt: { url: getImage('track-5').imageUrl, hint: getImage('track-5').imageHint }, genre: 'Ambient', mood: 'Calm', description: 'Music for concentration and focus.', tags: ['focus', 'instrumental', 'background'] },
  { id: '6', title: 'Geometric Dance', ownerId: '2', price: 59.99, status: 'available', isExclusive: true, featured: false, isFeaturedByAdmin: false, audioPreviewUrl: '', coverArt: { url: getImage('track-6').imageUrl, hint: getImage('track-6').imageHint }, genre: 'EDM', mood: 'Driving', description: 'A high-energy track for the dance floor.', tags: ['edm', 'house', 'club'] },
  { id: '7', title: 'Stardust', ownerId: '3', price: 22.99, status: 'available', isExclusive: false, featured: true, isFeaturedByAdmin: true, audioPreviewUrl: '', coverArt: { url: getImage('track-7').imageUrl, hint: getImage('track-7').imageHint }, genre: 'Lofi', mood: 'Dreamy', description: 'Get lost in the stars with this dreamy beat.', tags: ['lofi', 'space', 'dreamy'] },
  { id: '8', title: 'Ocean Drive', ownerId: '4', price: 34.99, status: 'sold', isExclusive: false, featured: false, isFeaturedByAdmin: false, audioPreviewUrl: '', coverArt: { url: getImage('track-8').imageUrl, hint: getImage('track-8').imageHint }, genre: 'Synthwave', mood: 'Nostalgic', description: 'A retro-futuristic driving anthem.', tags: ['synthwave', '80s', 'retro'] },
];

export const creators: Creator[] = [
    { id: '1', name: 'Starlight', role: 'Artist', avatar: { url: getImage('creator-1').imageUrl, hint: getImage('creator-1').imageHint }, tracksCount: 12 },
    { id: '2', name: 'Neon Dreams', role: 'Beatmaker', avatar: { url: getImage('creator-2').imageUrl, hint: getImage('creator-2').imageHint }, tracksCount: 45 },
    { id: '3', name: 'Lo-Fi Cafe', role: 'Beatmaker', avatar: { url: getImage('creator-3').imageUrl, hint: getImage('creator-3').imageHint }, tracksCount: 89 },
    { id: '4', name: 'Old School', role: 'Artist', avatar: { url: getImage('creator-4').imageUrl, hint: getImage('creator-4').imageHint }, tracksCount: 23 },
    { id: '5', name: 'Synthwave Kid', role: 'Beatmaker', avatar: { url: getImage('creator-5').imageUrl, hint: getImage('creator-5').imageHint }, tracksCount: 50 },
    { id: '6', name: 'Vocal Harmony', role: 'Artist', avatar: { url: getImage('creator-6').imageUrl, hint: getImage('creator-6').imageHint }, tracksCount: 8 },
];

export const sales: Sale[] = [
    { id: '1', trackTitle: 'Ocean Drive', date: '2024-05-01', buyer: 'MusicSync Inc.', amount: 34.99, commission: 3.50, type: 'Non-Exclusive' },
    { id: '2', trackTitle: 'Sunday Morning', date: '2024-04-28', buyer: 'Indie Film Pro', amount: 22.99, commission: 0, type: 'Exclusive' },
    { id: '3', trackTitle: 'Retro Vibes', date: '2024-04-25', buyer: 'Ad Agency', amount: 39.99, commission: 4.00, type: 'Non-Exclusive' },
    { id: '4', trackTitle: 'Future Funk', date: '2024-04-15', buyer: 'Game Dev LLC', amount: 59.99, commission: 0, type: 'Exclusive' },
    { id: '5', trackTitle: 'Lofi Dreams', date: '2024-04-10', buyer: 'YouTuber', amount: 19.99, commission: 2.00, type: 'Non-Exclusive' },
];
