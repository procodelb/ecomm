import { getServiceRoleClient } from "./service-role";

export const STORAGE_BUCKETS = {
  PRODUCT_IMAGES: "product-images",
  PRODUCT_VIDEOS: "product-videos",
  PRODUCT_3D_MODELS: "product-3d-models",
  AVATARS: "avatars",
  REVIEW_IMAGES: "review-images",
} as const;

type BucketName = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

function getStorage() {
  return getServiceRoleClient().storage;
}

export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File | Blob | ArrayBuffer,
  contentType?: string,
) {
  const { data, error } = await getStorage()
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) throw error;
  return data;
}

export async function deleteFile(bucket: BucketName, path: string) {
  const { data, error } = await getStorage().from(bucket).remove([path]);
  if (error) throw error;
  return data;
}

export async function listFiles(bucket: BucketName, prefix?: string) {
  const { data, error } = await getStorage()
    .from(bucket)
    .list(prefix ?? "", { limit: 100 });

  if (error) throw error;
  return data;
}

export function getPublicUrl(bucket: BucketName, path: string): string {
  const { data } = getStorage().from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function createBucket(name: BucketName, isPublic = true) {
  const { data, error } = await getStorage().createBucket(name, {
    public: isPublic,
  });

  if (error && !error.message.includes("already exists")) throw error;
  return data;
}

export async function ensureBuckets() {
  const existing = await getStorage().listBuckets();
  const existingNames = new Set(existing.data?.map((b) => b.name) ?? []);

  for (const bucket of Object.values(STORAGE_BUCKETS)) {
    if (!existingNames.has(bucket)) {
      await createBucket(bucket);
    }
  }
}
