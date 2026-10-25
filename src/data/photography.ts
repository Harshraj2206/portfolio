export interface CaptionEntry {
  title?: string;
  caption?: string;
  year?: string | number;
  location?: string;
}

export interface GalleryItem {
  id: string;
  index: number;
  filename: string;
  url: string;
  type: 'image' | 'video';
  title: string;
  caption?: string;
  year?: string | number;
  location?: string;
  isDemo: boolean;
}

const TOTAL_PHOTOS = 16;

export function getGalleryItems(): GalleryItem[] {
  return Array.from({ length: TOTAL_PHOTOS }, (_, i) => {
    const frameNum = String(i + 1).padStart(2, '0');
    return {
      id: `photo-${frameNum}`,
      index: i + 1,
      filename: `photo_${frameNum}.webp`,
      url: `/images/photography/photo_${frameNum}.webp`,
      type: 'image',
      title: `Frame ${frameNum}`,
      isDemo: false,
    };
  });
}
