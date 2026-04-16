'use server';

import {
  generateTrackDescription,
  type GenerateTrackDescriptionInput,
} from '@/ai/flows/generate-track-description';
import {
  suggestTrackTags,
  type SuggestTrackTagsInput,
} from '@/ai/flows/suggest-track-description';
import { v2 as cloudinary } from 'cloudinary';

export async function generateDescriptionAction(
  input: GenerateTrackDescriptionInput
) {
  try {
    const result = await generateTrackDescription(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI Description Generation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to generate description. ${errorMessage}` };
  }
}

export async function suggestTagsAction(input: SuggestTrackTagsInput) {
  try {
    const result = await suggestTrackTags(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI Tag Suggestion Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to suggest tags. ${errorMessage}` };
  }
}

export async function processPayoutAction(transactionId: string) {
  'use server';

  console.log(`[Payout Action] Received request for transactionId: ${transactionId}`);

  // IMPORTANT: This is a placeholder for backend logic.
  // In a real-world scenario, this logic would run on a secure server (e.g., a Firebase Function)
  // and would use the FedaPay SECRET key to initiate transfers.

  // The secret key should be stored as an environment variable, not in the code.
  const fedaPaySecretKey = process.env.FEDAPAY_SECRET_KEY;
  const commissionReceiver = process.env.COMMISSION_MOBILE_MONEY_NUMBER;

  if (!fedaPaySecretKey || fedaPaySecretKey.includes('REPLACE_WITH')) {
    console.error('[Payout Action] CRITICAL: FEDAPAY_SECRET_KEY environment variable is not set correctly. Cannot process payout.');
    // In a real app, you would return an error or have more robust monitoring.
    return { success: false, error: 'Server configuration error: Missing or placeholder secret key.' };
  }

  try {
    // In a real implementation, you would:
    // 1. Initialize the Firebase Admin SDK to securely access Firestore from the backend
    //    and fetch the transaction and creator payout details.
    console.log('[Payout Action] Simulating fetch of transaction and user data from Firestore...');
    const mockTransaction = {
      sellerId: 'creator-user-id-123',
      sellerEarnings: 26.99,
      commissionAmount: 3.00
    };
    const mockCreatorPayoutInfo = {
      mobileMoney: {
        provider: 'MTN',
        phoneNumber: '+229987654321'
      }
    };
    console.log(`[Payout Action] Data fetched. Seller gets ${mockTransaction.sellerEarnings}, commission is ${mockTransaction.commissionAmount}.`);

    // 2. Use the FedaPay Node.js library or `fetch` to call the FedaPay Transfers API.
    //    This requires your SECRET key.
    console.log(`[Payout Action] SIMULATING FEDAPAY API CALL:`);
    console.log(` > Using Secret Key: sk_live_... (from environment variable)`);
    console.log(` > ACTION: Create Transfer of ${mockTransaction.sellerEarnings} XOF to creator's account (${mockCreatorPayoutInfo.mobileMoney.provider} - ${mockCreatorPayoutInfo.mobileMoney.phoneNumber})`);
    console.log(` > ACTION: Create Transfer of ${mockTransaction.commissionAmount} XOF to commission account ${commissionReceiver}`);

    // 3. Update the transaction status in Firestore to 'payout_processed' or similar.
    console.log(`[Payout Action] Simulating update of transaction ${transactionId} status to 'payout_initiated'.`);


    console.log(`[Payout Action] Payout process simulation for ${transactionId} completed.`);
    return { success: true };
    
  } catch (error) {
    console.error(`[Payout Action] Failed to process payout for transaction ${transactionId}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred during payout.' };
  }
}

export async function uploadFileAction(formData: FormData) {
  'use server';

  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, error: 'No file provided.' };
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: file.type.startsWith('audio/') ? 'video' : 'image', // Cloudinary uses 'video' for audio files
          folder: 'sonicsphere',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return { success: true, data: result as any };
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error);
    return { success: false, error: error.message || 'Failed to upload to Cloudinary.' };
  }
}
