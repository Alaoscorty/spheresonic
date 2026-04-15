'use server';
/**
 * @fileOverview An AI agent that generates compelling marketing descriptions for audio tracks.
 *
 * - generateTrackDescription - A function that generates a track description based on its characteristics.
 * - GenerateTrackDescriptionInput - The input type for the generateTrackDescription function.
 * - GenerateTrackDescriptionOutput - The return type for the generateTrackDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTrackDescriptionInputSchema = z.object({
  genre: z
    .string()
    .describe('The primary genre of the track (e.g., "Electronic Dance Music").'),
  mood: z
    .string()
    .describe('The overall mood or vibe of the track (e.g., "Energetic and dreamy").'),
  coreElements: z
    .string()
    .describe(
      'The core elements or title of the track (e.g., "Uptempo beat with ethereal synths").'
    ),
  keywords: z
    .array(z.string())
    .describe('A list of keywords or tags associated with the track.'),
});
export type GenerateTrackDescriptionInput = z.infer<
  typeof GenerateTrackDescriptionInputSchema
>;

const GenerateTrackDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe(
      'A compelling, 1-2 sentence marketing description for the track.'
    ),
});
export type GenerateTrackDescriptionOutput = z.infer<
  typeof GenerateTrackDescriptionOutputSchema
>;

export async function generateTrackDescription(
  input: GenerateTrackDescriptionInput
): Promise<GenerateTrackDescriptionOutput> {
  return generateTrackDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrackDescriptionPrompt',
  input: {schema: GenerateTrackDescriptionInputSchema},
  output: {schema: GenerateTrackDescriptionOutputSchema},
  prompt: `You are an expert music marketer and copywriter.

Based on the following information about an audio track, write a compelling, 1-2 sentence marketing description that would entice a potential buyer.

Focus on the feeling and potential use cases for the track.

Genre: {{{genre}}}
Mood: {{{mood}}}
Core Elements/Title: {{{coreElements}}}
Keywords: {{#each keywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}`,
});

const generateTrackDescriptionFlow = ai.defineFlow(
  {
    name: 'generateTrackDescriptionFlow',
    inputSchema: GenerateTrackDescriptionInputSchema,
    outputSchema: GenerateTrackDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
