import { apiFetch } from '@/lib/api/client';
import { uploadCustomOrderFile } from '@/lib/firebase/uploadCustomOrderFile';

export async function addCustomQuoteToCart(userId, file, quoteData) {
  const { fileUrl, storagePath, fileSize, fileName } = await uploadCustomOrderFile(userId, file);

  await apiFetch('/cart/custom-items', {
    method: 'POST',
    body: JSON.stringify({
      fileName,
      fileUrl,
      storagePath,
      fileSize,
      fileType: quoteData.fileType,
      material: quoteData.material,
      volumeCm3: quoteData.volumeCm3,
      estimatedWeight: quoteData.weight,
      pricePerGram: quoteData.pricePerGram,
      totalCost: quoteData.total,
      quantity: 1,
    }),
  });

  return fileName;
}
