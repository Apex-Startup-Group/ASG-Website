'use client';

import React, { useState } from 'react';
import ImageUpload from '@/components/shared/ImageUpload';
import { UPLOAD_CONFIGS } from '@/lib/constants/uploads';

export default function TestUploadPage() {
  const [urls, setUrls] = useState<Record<string, string>>({});

  const handleUploadComplete = (type: string, url: string) => {
    setUrls((prev) => ({
      ...prev,
      [type]: url,
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Standardized Upload Test</h1>
          <p className="text-zinc-400 mt-2">
            Upload images across all 8 configurations to test validation, cropping, WebP compression, and Supabase Storage uploads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(UPLOAD_CONFIGS).map((type) => {
            const config = UPLOAD_CONFIGS[type];
            return (
              <div
                key={type}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-zinc-200">{config.label}</h3>
                    <span className="text-xs text-sky-400 font-mono">
                      Ratio: {config.aspectRatio === 16/9 ? '16:9' : config.aspectRatio === 4/3 ? '4:3' : '1:1'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Max size: {config.maxSize >= 1024 * 1024 ? `${config.maxSize / (1024 * 1024)}MB` : `${config.maxSize / 1024}KB`} • Bucket: <span className="font-mono text-zinc-400">{config.bucket}</span>
                  </p>
                </div>

                <div className="pt-2">
                  <ImageUpload
                    uploadType={type}
                    value={urls[type] || ''}
                    onChange={(url) => handleUploadComplete(type, url)}
                  />
                </div>

                {urls[type] && (
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs space-y-1">
                    <p className="font-medium text-zinc-400">Public URL:</p>
                    <a
                      href={urls[type]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline break-all block"
                    >
                      {urls[type]}
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
