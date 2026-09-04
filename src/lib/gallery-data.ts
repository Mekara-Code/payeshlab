import { getPrisma } from "@/lib/prisma";

export type GalleryMediaData = {
  altText: string;
  createdAt: string;
  description: string | null;
  id: string;
  isActive?: boolean;
  mediaUrl: string;
  posterUrl: string | null;
  sortOrder: number;
  title: string;
  type: "IMAGE" | "VIDEO";
  updatedAt?: string;
};

export async function getPublishedGalleryMedia(): Promise<GalleryMediaData[]> {
  try {
    const media = await getPrisma().galleryMedia.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        altText: true,
        createdAt: true,
        description: true,
        id: true,
        mediaUrl: true,
        posterUrl: true,
        sortOrder: true,
        title: true,
        type: true,
      },
      where: { isActive: true },
    });

    return media.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    }));
  } catch {
    // Keep the public route available while its migration is being deployed.
    return [];
  }
}
