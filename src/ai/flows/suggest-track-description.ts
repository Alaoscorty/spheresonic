'use server';
/**
 * @fileOverview An AI agent that suggests relevant tags and keywords for audio tracks.
 *
 * - suggestTrackTags - A function that suggests track tags based on input characteristics.
 * - SuggestTrackTagsInput - The input type for the suggestTrackTags function.
 * - SuggestTrackTagsOutput - The return type for the suggestTrackTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTrackTagsInputSchema = z.object({
  audioCharacteristics: z
    .string()
    .describe(
      'A detailed description of the audio characteristics of the track (e.g., instrumentation, tempo, vocal style). Example: "Upbeat drum machine, ethereal synths, female vocal chops, driving bassline."'
    ),
  genre: z
    .string()
    .describe('The primary genre of the track. Example: "Electronic Dance Music"'),
  mood: z.string().describe('The overall mood or vibe of the track. Example: "Energetic and dreamy"'),
});
export type SuggestTrackTagsInput = z.infer<typeof SuggestTrackTagsInputSchema>;

const SuggestTrackTagsOutputSchema = z.object({
  tags: z
    .array(z.string())
    .describe('A list of relevant tags and keywords for the track.'),
});
export type SuggestTrackTagsOutput = z.infer<typeof SuggestTrackTagsOutputSchema>;

export async function suggestTrackTags(
  input: SuggestTrackTagsInput
): Promise<SuggestTrackTagsOutput> {
  return suggestTrackTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTrackTagsPrompt',
  input: {schema: SuggestTrackTagsInputSchema},
  output: {schema: SuggestTrackTagsOutputSchema},
  prompt: `You are an expert music curator and tag generator.

Based on the following information about an audio track, suggest 5-10 highly relevant and descriptive tags and keywords that would help the track be easily discoverable through search and filtering.

Ensure the tags are concise and accurately reflect the track's content, genre, and mood.

Audio Characteristics: {{{audioCharacteristics}}}
Genre: {{{genre}}}
Mood: {{{mood}}}`,
});

const suggestTrackTagsFlow = ai.defineFlow(
  {
    name: 'suggestTrackTagsFlow',
    inputSchema: SuggestTrackTagsInputSchema,
    outputSchema: SuggestTrackTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
