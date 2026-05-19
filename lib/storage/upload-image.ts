'use client';

import { supabase } from '@/lib/supabase';

/**
 * Buckets that the application is allowed to upload into. Mirror the
 * five Storage buckets defined in the schema migration. Admin upload
 * code MUST use one of these — we don't want one-off bucket names
 * scattered through the codebase.
 */
export type StorageBucket = 'products' | 'blog' | 'media' | 'avatars' | 'reviews';

export interface UploadImageOptions {
  /** File the user selected. */
  file: File;
  /** Target bucket. */
  bucket: StorageBucket;
  /**
   * Folder prefix inside the bucket, e.g. `cms/hero`, `categories`,
   * `site/logo`. No leading or trailing slash — we'll handle it.
   */
  pathPrefix?: string;
  /**
   * Max allowed file size in bytes. Defaults to 8 MB which is plenty
   * for a hero/category/og image without abusing the bucket.
   */
  maxBytes?: number;
  /**
   * Acceptable MIME types. Defaults to common web image formats.
   * Pass `null` to skip the MIME check (e.g. for SVG-only fields).
   */
  acceptMimePrefix?: string | null;
}

export interface UploadImageResult {
  /** Public URL of the uploaded file. */
  url: string;
  /** Bucket-relative path of the uploaded file. */
  path: string;
}

const DEFAULT_MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Make a filename safe for Supabase Storage: lowercase, ascii-only,
 * dashes for spaces, drop anything weird.
 */
function safeStorageName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

/**
 * Build a unique storage path inside the bucket. The leading prefix
 * (if any) is sanitized too so callers can't accidentally `../` out
 * of their folder.
 */
function buildPath(prefix: string | undefined, file: File): string {
  const cleanPrefix = (prefix ?? '')
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean)
    .map((seg) => safeStorageName(seg) || 'misc')
    .join('/');

  const ext = (file.name.split('.').pop() ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const base = safeStorageName(file.name.replace(/\.[^.]+$/, '')) || 'image';
  const ts = Date.now();
  // Random component prevents collisions when the same image is
  // uploaded twice in the same millisecond (e.g. bulk paste).
  const rand = Math.random().toString(36).slice(2, 8);

  const filename = `${base}-${ts}-${rand}.${ext || 'bin'}`;
  return cleanPrefix ? `${cleanPrefix}/${filename}` : filename;
}

/**
 * Upload an image to Supabase Storage and return its public URL.
 *
 * Centralizes filename sanitization, size + MIME validation, and the
 * `getPublicUrl` lookup so every admin field uploads the same way.
 */
export async function uploadImage({
  file,
  bucket,
  pathPrefix,
  maxBytes = DEFAULT_MAX_BYTES,
  acceptMimePrefix = 'image/',
}: UploadImageOptions): Promise<UploadImageResult> {
  if (!file) throw new Error('No file provided.');

  if (acceptMimePrefix && !file.type.startsWith(acceptMimePrefix)) {
    throw new Error(`Unsupported file type: ${file.type || 'unknown'}.`);
  }

  if (file.size > maxBytes) {
    const mb = (maxBytes / (1024 * 1024)).toFixed(1);
    throw new Error(`File is too large. Max ${mb} MB.`);
  }

  const path = buildPath(pathPrefix, file);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Upload failed.');
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('Uploaded file but could not resolve a public URL.');
  }

  return { url: data.publicUrl, path };
}
