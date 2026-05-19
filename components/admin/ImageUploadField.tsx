'use client';

import { useId, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { uploadImage, type StorageBucket } from '@/lib/storage/upload-image';

interface ImageUploadFieldProps {
  /** Visible label above the field. */
  label: string;
  /** Optional helper text shown below the label. */
  hint?: string;
  /** Current public URL stored in the DB (or null/empty). */
  value: string | null | undefined;
  /** Called with the new URL (or `''` when cleared). */
  onChange: (url: string) => void;
  /** Target Supabase Storage bucket. */
  bucket: StorageBucket;
  /** Folder prefix inside the bucket — e.g. `cms/hero`, `categories`. */
  pathPrefix?: string;
  /**
   * Show a small "or paste a URL" row under the drop zone so editors
   * who already have a hosted image (e.g. an Unsplash link) can use
   * it. Defaults to `false` — every field is upload-first.
   */
  allowUrlFallback?: boolean;
  /** Override the dashed-card aspect ratio. Defaults to `aspect-[4/3]`. */
  aspectClassName?: string;
  /** Disable interaction (e.g. while the parent form is saving). */
  disabled?: boolean;
  /** Max file size in megabytes. Defaults to 8. */
  maxSizeMb?: number;
  /**
   * Accept attribute on the underlying input (e.g. `image/png,image/jpeg`).
   * Defaults to `image/*`.
   */
  accept?: string;
  /** Fired whenever the upload state changes — useful to disable save. */
  onUploadingChange?: (uploading: boolean) => void;
  /** Optional id for tests / aria. */
  id?: string;
}

/**
 * ImageUploadField
 *
 * The single shared upload control for every admin form. Renders a
 * dashed drop zone with click + drag-and-drop, a preview card with
 * Replace/Remove actions once an image is set, and (optionally) a
 * paste-URL fallback row.
 *
 * Uploads to Supabase Storage via `lib/storage/upload-image.ts` so
 * filename sanitization, MIME/size validation, and public-URL lookup
 * are centralized.
 */
export default function ImageUploadField({
  label,
  hint,
  value,
  onChange,
  bucket,
  pathPrefix,
  allowUrlFallback = false,
  aspectClassName = 'aspect-[4/3]',
  disabled = false,
  maxSizeMb = 8,
  accept = 'image/*',
  onUploadingChange,
  id,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const fieldId = id ?? inputId;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setBusy = (next: boolean) => {
    setUploading(next);
    onUploadingChange?.(next);
  };

  async function processFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const { url } = await uploadImage({
        file,
        bucket,
        pathPrefix,
        maxBytes: maxSizeMb * 1024 * 1024,
      });
      onChange(url);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  const onDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || uploading) return;
    setDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const clear = () => {
    setError(null);
    onChange('');
  };

  const hasImage = !!value;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={fieldId}
          className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-ink-700"
        >
          {label}
        </label>
        {hasImage && !disabled && (
          <button
            type="button"
            onClick={clear}
            className="text-[10px] font-semibold tracking-[0.18em] uppercase text-ink-400 hover:text-sienna-500 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
      {hint && <p className="text-[12px] text-ink-500 -mt-1">{hint}</p>}

      {hasImage ? (
        <div className={`relative ${aspectClassName} w-full overflow-hidden bg-cream-100 border border-cream-200 group`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview, no Next/Image needed */}
          <img
            src={value || ''}
            alt="Selected"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Hover overlay with replace button. Always visible on small
              screens so admins on iPad don't have to hover. */}
          <div className="absolute inset-0 bg-ink-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
              className="inline-flex items-center gap-2 bg-cream-50 hover:bg-sienna-500 hover:text-cream-50 text-ink-900 px-4 py-2 text-[11px] tracking-[0.22em] uppercase font-semibold transition-colors disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <i className="ri-loader-4-line animate-spin" aria-hidden></i>
                  Uploading
                </>
              ) : (
                <>
                  <i className="ri-image-edit-line" aria-hidden></i>
                  Replace
                </>
              )}
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={disabled || uploading}
              className="inline-flex items-center gap-2 bg-ink-900 hover:bg-sienna-500 text-cream-50 px-4 py-2 text-[11px] tracking-[0.22em] uppercase font-semibold transition-colors disabled:opacity-60"
            >
              <i className="ri-delete-bin-line" aria-hidden></i>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={fieldId}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`relative ${aspectClassName} w-full flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed transition-colors ${
            disabled || uploading
              ? 'border-cream-200 bg-cream-100/40 cursor-not-allowed opacity-60'
              : dragging
              ? 'border-sienna-500 bg-sienna-50/60'
              : 'border-cream-300 bg-cream-50 hover:border-sienna-400 hover:bg-cream-100/60'
          }`}
        >
          <div className="flex flex-col items-center gap-3 px-4">
            <span className="inline-flex w-10 h-10 items-center justify-center bg-sienna-500/10 text-sienna-500 rounded-full">
              {uploading ? (
                <i className="ri-loader-4-line text-xl animate-spin" aria-hidden></i>
              ) : (
                <i className="ri-upload-cloud-2-line text-xl" aria-hidden></i>
              )}
            </span>
            <div>
              <p className="text-[13px] font-semibold text-ink-900">
                {uploading ? 'Uploading…' : 'Click to upload or drop a file'}
              </p>
              <p className="text-[11px] text-ink-500 mt-1">
                PNG, JPG, WebP up to {maxSizeMb} MB
              </p>
            </div>
          </div>
        </label>
      )}

      <input
        ref={inputRef}
        id={fieldId}
        type="file"
        accept={accept}
        onChange={onFileInput}
        disabled={disabled || uploading}
        className="hidden"
      />

      {error && (
        <p className="text-[11px] text-red-600 flex items-center gap-1.5">
          <i className="ri-error-warning-line" aria-hidden></i>
          {error}
        </p>
      )}

      {allowUrlFallback && (
        <div className="pt-1">
          <p className="text-[10px] tracking-[0.18em] uppercase font-semibold text-ink-400 mb-1.5">
            Or paste an image URL
          </p>
          <input
            type="url"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
            disabled={disabled || uploading}
            className="w-full bg-white border border-cream-200 focus:border-sienna-500 focus:ring-0 px-3 py-2 text-[13px] text-ink-900 placeholder:text-ink-300 disabled:opacity-60"
          />
        </div>
      )}
    </div>
  );
}
